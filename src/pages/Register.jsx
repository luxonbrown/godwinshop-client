import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Phone, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import logo from '../img/logo.png';

export default function Register() {
  useDocumentTitle('Create Account');
  const { register, status } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm_password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devVerificationUrl, setDevVerificationUrl] = useState(null);

  if (status === 'authenticated') {
    navigate('/orders', { replace: true });
    return null;
  }

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register(form);
      toast.success('Account created! Please verify your email to start ordering.');
      if (data.devVerificationUrl) {
        setDevVerificationUrl(data.devVerificationUrl);
      } else {
        navigate('/verify', { state: { email: form.email } });
      }
    } catch (err) {
      if (err.errors && err.errors.length > 0) {
        toast.error(err.errors.map((er) => er.message).join('. '));
      } else {
        toast.error(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page flex min-h-[80vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img src={logo} alt="GodwinShop" className="mx-auto h-16 w-auto rounded-full" />
          <h1 className="mt-4 text-2xl font-bold text-white">Create your account</h1>
          <p className="mt-1 text-sm text-muted">Verify once — order forever after.</p>
        </div>

        {devVerificationUrl && (
          <div className="animate-fade-in mb-5 rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm">
            <p className="font-semibold text-accent">Development mode — verify now</p>
            <p className="mt-1 text-white">Email delivery is not configured, so here is your personal verification link:</p>
            <a
              href={devVerificationUrl}
              className="mt-2 block break-all font-mono text-xs text-accent underline"
            >
              {devVerificationUrl}
            </a>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card space-y-5 p-6 sm:p-8" noValidate>
          <div>
            <label htmlFor="reg-name" className="label">Full name</label>
            <div className="relative">
              <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input id="reg-name" name="full_name" value={form.full_name} onChange={handleChange} className="input pl-10" placeholder="e.g. Ada Obi" required minLength={2} />
            </div>
          </div>
          <div>
            <label htmlFor="reg-email" className="label">Email</label>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input id="reg-email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} className="input pl-10" placeholder="you@example.com" required />
            </div>
          </div>
          <div>
            <label htmlFor="reg-phone" className="label">Phone number</label>
            <div className="relative">
              <Phone size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input id="reg-phone" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={handleChange} className="input pl-10" placeholder="+1 555 000 0000" required />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="reg-password" className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  className="input pl-10 pr-9"
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="reg-confirm" className="label">Confirm password</label>
              <input id="reg-confirm" name="confirm_password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.confirm_password} onChange={handleChange} className="input" placeholder="Repeat password" required />
            </div>
          </div>
          <button type="submit" disabled={loading || status === 'loading'} className="btn-accent w-full">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
          <p className="text-center text-sm text-muted">
            Already registered? <Link to="/login" className="font-semibold text-accent hover:underline">Sign in</Link>
          </p>
        </form>

        <p className="mt-6 flex items-start justify-center gap-1.5 text-center text-xs text-muted">
          <ShieldCheck size={14} className="mt-0.5 shrink-0 text-accent" />
          Passwords are hashed before storage and never shared. You will verify your email before placing orders.
        </p>
      </div>
    </div>
  );
}