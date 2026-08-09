import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('404 — Page Not Found');

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-black tracking-tight text-accent sm:text-8xl">404</p>
      <h1 className="mt-4 text-2xl font-bold text-white sm:text-3xl">Looks like this page doesn't exist.</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        The page may have been moved, renamed or removed. Let's get you back to
        the store.
      </p>
      <Link to="/" className="btn-accent mt-8">
        <Compass size={17} /> Back to GodwinShop
      </Link>
    </div>
  );
}