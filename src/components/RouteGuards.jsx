import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

function FullPageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner label="Checking your session…" />
    </div>
  );
}

/** Requires an authenticated session. */
export function ProtectedRoute({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullPageLoader />;
  if (status !== 'authenticated') {
    return <Navigate to="/login" state={{ from: location.pathname, reason: 'auth' }} replace />;
  }
  return children;
}

/** Requires an authenticated administrator. */
export function AdminRoute({ children }) {
  const { status, isAdmin } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullPageLoader />;
  if (status !== 'authenticated') {
    return <Navigate to="/login" state={{ from: location.pathname, reason: 'auth' }} replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/403" replace />;
  }
  return children;
}

/** Requires a verified account. */
export function VerifiedRoute({ children }) {
  const { status, isVerified } = useAuth();

  if (status === 'loading') return <FullPageLoader />;
  if (status !== 'authenticated') return <Navigate to="/login" replace />;
  if (!isVerified) {
    return <Navigate to="/verify" state={{ reason: 'unverified' }} replace />;
  }
  return children;
}