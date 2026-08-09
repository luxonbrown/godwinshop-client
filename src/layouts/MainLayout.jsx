import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function MainLayout() {
  const { pathname } = useLocation();

  // Scroll to top on route change (keeps premium feel on mobile).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div key={pathname} className="animate-page">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}