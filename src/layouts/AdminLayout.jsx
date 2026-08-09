import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tags, ClipboardList, Users, Bell, LogOut, Store, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import logo from '../img/logo.png';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell }
];

export default function AdminLayout() {
  const { user, unread, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();

  async function handleLogout() {
    await logout();
    toast.success('Signed out.');
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="shrink-0 border-b border-divider bg-base-2 lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block">
          <NavLink to="/admin" className="flex items-center gap-2 text-lg font-bold">
            <img src={logo} alt="GodwinShop" className="h-9 w-auto rounded-full" />
            <span className="text-white">Godwin<span className="text-accent">Shop</span></span>
          </NavLink>
          <div className="flex items-center gap-2 lg:mt-3">
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="rounded-lg p-2 text-muted transition-colors hover:text-white"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <span className="rounded-full border border-accent/50 px-2.5 py-0.5 text-xs font-bold text-accent">
              ADMIN
            </span>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:flex-col lg:gap-1 lg:overflow-visible" aria-label="Admin navigation">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'border-l-2 border-accent bg-surface text-accent font-semibold'
                    : 'border-l-2 border-transparent text-muted hover:bg-surface-2 hover:text-white'
                }`
              }
            >
              <Icon size={17} />
              {label}
              {label === 'Notifications' && unread > 0 && (
                <span className="hidden rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-black lg:inline">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </NavLink>
          ))}
          <div className="mx-1 my-2 hidden border-t border-divider lg:block" />
          <NavLink to="/" className="flex shrink-0 items-center gap-3 rounded-lg border-l-2 border-transparent px-3 py-2.5 text-sm text-muted hover:bg-surface-2 hover:text-white">
            <LayoutDashboard size={17} />
            Back to Store
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex shrink-0 items-center gap-3 rounded-lg border-l-2 border-transparent px-3 py-2.5 text-left text-sm text-red-500 transition-colors hover:bg-surface-2 dark:text-red-400"
          >
            <LogOut size={17} />
            Logout
          </button>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 bg-base">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div key={pathname} className="animate-page">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}