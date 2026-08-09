import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Forbidden() {
  useDocumentTitle('403 — Access Denied');

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-black tracking-tight text-red-400 sm:text-8xl">403</p>
      <h1 className="mt-4 text-2xl font-bold text-white sm:text-3xl">This area is for administrators only.</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        Your account does not have permission to view the admin dashboard.
        Please contact the store administrator if you believe this is an error.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-accent">
          <Lock size={16} /> Back to GodwinShop
        </Link>
        <Link to="/products" className="btn-outline">Browse products</Link>
      </div>
    </div>
  );
}