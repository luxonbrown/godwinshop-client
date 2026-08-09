import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import logo from '../img/logo.png';

export default function Login() {
  useDocumentTitle('Sign In');
  const { login, status, isVerified } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (status === 'authenticated') {
    navigate(isVerified ? '/orders' : '/profile', { replace: true });
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.user.full_name}`);
      const from = location.state?.from;
      if (from && from.startsWith('/admin')) return navigate('/admin');
      if (from) return navigate(from);
      navigate(data.user.is_verified ? '/orders' : '/profile');
    } catch (err) {
      toast.error(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page flex min-h-[80vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img src={logo} alt="GodwinShop" className="mx-auto h-16 w-auto rounded-full" />
          <h1 className="mt-4 text-2xl font-bold text-white">Sign in to GodwinShop</h1>
          <p className="mt-1 text-sm text-muted">Good to see you again.</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5 p-6 sm:p-8" noValidate>
          <div>
            <label htmlFor="login-email" className="label">Email</label>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="input pl-10"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="login-password" className="label">Password</label>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="input pl-10 pr-10"
                placeholder="Your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading || status === 'loading'} className="btn-accent w-full">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="text-center text-sm text-muted">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-accent hover:underline">Create one</Link>
          </p>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          Admin? Sign in with your admin credentials and you will see the dashboard link automatically.
        </p>
      </div>
    </div>
  );
}