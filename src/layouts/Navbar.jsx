import { useEffect, useState, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Menu, X, ShoppingCart, LogOut, LayoutDashboard,
  User, Package as PackageIcon, ChevronDown, Bell, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import logo from '../img/logo.png';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/categories', label: 'Categories' },
  { to: '/about', label: 'About' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/contact', label: 'Contact' }
];

export default function Navbar() {
  const { user, status, isAdmin, unread, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const toast = useToast();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const loading = status === 'loading';

  async function handleLogout() {
    setAccountOpen(false);
    setMobileOpen(false);
    await logout();
    toast.info('You have been signed out.');
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-50 border-b border-divider bg-base/95 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between gap-4" aria-label="Main navigation">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <img src={logo} alt="GodwinShop" className="h-9 w-auto rounded-full" />
          <span className="text-white">
            Godwin<span className="text-accent">Shop</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive ? 'font-semibold text-accent' : 'text-muted hover:text-white'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="rounded-lg p-2 text-muted transition-colors hover:text-white"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <Link
            to="/cart"
            aria-label={`Cart, ${count} items`}
            className="relative rounded-lg p-2 text-muted transition-colors hover:text-white"
          >
            <ShoppingCart size={20} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-black">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </Link>

          {user && (
            <Link
              to="/notifications"
              aria-label={`Notifications, ${unread} unread`}
              className="relative rounded-lg p-2 text-muted transition-colors hover:text-white"
            >
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin" className="hidden items-center gap-1.5 rounded-lg border border-accent/50 px-3 py-1.5 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-black sm:flex">
              <LayoutDashboard size={15} />
              Admin
            </Link>
          )}

          {loading ? null : user ? (
            <div className="relative" ref={accountRef}>
              <button
                onClick={() => setAccountOpen((o) => !o)}
                aria-haspopup="true"
                aria-expanded={accountOpen}
                className="flex items-center gap-2 rounded-lg border border-divider bg-surface px-2.5 py-1.5 transition-colors hover:border-accent/50"
              >
                <Link
                  to="/profile"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-black"
                  onClick={(e) => e.preventDefault()}
                >
                  {user.full_name ? user.full_name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() : 'U'}
                </Link>
                <span className="hidden max-w-28 truncate text-sm font-medium text-white md:block">
                  {user.full_name.split(' ')[0]}
                </span>
                <ChevronDown size={14} className={`text-muted transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
              </button>

              {accountOpen && (
                <div className="animate-fade-in absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-divider bg-surface-2 shadow-card">
                  <div className="border-b border-divider bg-surface px-4 py-3">
                    <p className="truncate text-sm font-semibold text-white">{user.full_name}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                    {!user.is_verified && (
                      <Link to="/verify" className="mt-1 inline-block text-xs font-medium text-accent hover:underline">
                        Verify your account
                      </Link>
                    )}
                  </div>
                  <div className="py-1">
                    <Link to="/profile" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-muted hover:bg-surface hover:text-white">
                      <User size={16} /> My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-muted hover:bg-surface hover:text-white">
                      <PackageIcon size={16} /> My Orders
                    </Link>
                    <Link to="/notifications" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-muted hover:bg-surface hover:text-white">
                      Notifications
                      {unread > 0 && (
                        <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-black">{unread}</span>
                      )}
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-accent hover:bg-surface">
                        <LayoutDashboard size={16} /> Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 border-t border-divider px-4 py-2 text-sm text-red-500 hover:bg-surface dark:text-red-400"
                    >
                      <LogOut size={16} /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/login" className="btn-ghost">Login</Link>
              <Link to="/register" className="btn-accent">Register</Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className="rounded-lg p-2 text-muted hover:text-white lg:hidden"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="animate-fade-in border-t border-divider bg-base lg:hidden">
          <div className="container-page flex flex-col gap-1 py-4">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm ${isActive ? 'bg-surface-2 font-semibold text-accent' : 'text-muted'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="my-2 border-t border-divider" />
            {!user && (
              <div className="flex gap-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-outline flex-1">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-accent flex-1">Register</Link>
              </div>
            )}
            {user && isAdmin && (
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="btn-outline">
                <LayoutDashboard size={15} /> Admin Dashboard
              </Link>
            )}
            <Link to="/contact" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-muted">
              Contact Support
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}