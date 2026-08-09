import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Mail, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import client from '../api/client';
import Spinner from '../components/Spinner';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import logo from '../img/logo.png';

export default function Verify() {
  useDocumentTitle('Verify Your Account');
  const { user, refreshSession, status } = useAuth();
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const token = params.get('token');
  const initialEmail = location.state?.email || '';

  const [email, setEmail] = useState(user?.email || initialEmail);
  const [verifying, setVerifying] = useState(Boolean(token));
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (token) {
      (async () => {
        try {
          const { data } = await client.post('/auth/verify', { token });
          setMessage(data.message);
          await refreshSession();
          toast.success(data.message);
        } catch (err) {
          setError(err.message || 'This verification link is invalid or expired.');
        } finally {
          setVerifying(false);
        }
      })();
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  async function resend() {
    if (!email.trim()) {
      toast.error('Enter the email you registered with.');
      return;
    }
    setSending(true);
    try {
      const { data } = await client.post('/auth/resend-verification', { email });
      setMessage(data.message);
      if (data.devVerificationUrl) {
        toast.success('New link created (development mode).');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  if (status === 'loading') return <Spinner className="min-h-[60vh]" />;
  if (status === 'authenticated' && user?.is_verified) {
    navigate('/profile', { replace: true });
    return null;
  }

  return (
    <div className="container-page flex min-h-[75vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img src={logo} alt="GodwinShop" className="mx-auto h-16 w-auto rounded-full" />
          <h1 className="mt-4 text-2xl font-bold text-white">Account verification</h1>
        </div>

        <div className="card p-6 sm:p-8">
          {verifying ? (
            <Spinner label="Verifying your account…" />
          ) : error ? (
            <div className="text-center">
              <ShieldAlert size={40} className="mx-auto text-red-500 dark:text-red-400" />
              <h2 className="mt-4 font-bold text-white">Verification failed</h2>
              <p className="mt-2 text-sm text-muted">{error}</p>
              <button onClick={() => { setError(null); }} className="btn-accent mt-6 w-full">
                Try again
              </button>
            </div>
          ) : message ? (
            <div className="text-center">
              <ShieldCheck size={40} className="mx-auto text-accent" />
              <h2 className="mt-4 font-bold text-white">{message}</h2>
              <p className="mt-2 text-sm text-muted">
                {user?.is_verified
                  ? 'Your account is verified. You can now browse and place orders.'
                  : 'Sign in to confirm and continue.'}
              </p>
              {user?.is_verified ? (
                <div className="mt-6 flex flex-col gap-2">
                  <Link to="/products" className="btn-accent w-full">Start shopping</Link>
                  <Link to="/profile" className="btn-ghost w-full">Go to profile</Link>
                </div>
              ) : (
                <Link to="/login" className="btn-accent mt-6 w-full">Sign in</Link>
              )}
            </div>
          ) : (
            <div className="text-center">
              <Mail size={40} className="mx-auto text-accent" />
              <h2 className="mt-4 font-bold text-white">Check your inbox</h2>
              <p className="mt-2 text-sm text-muted">
                We sent a verification link to your email. Open it to activate your account.
              </p>
              <div className="mt-6 text-left">
                <label htmlFor="verify-email" className="label">Registered email</label>
                <input
                  id="verify-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@example.com"
                />
              </div>
              <button onClick={resend} disabled={sending} className="btn-accent mt-4 w-full">
                <Send size={15} /> {sending ? 'Sending…' : 'Resend verification link'}
              </button>
              <p className="mt-4 text-xs text-muted">
                In development mode the link is shown right after registration instead of being emailed.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}