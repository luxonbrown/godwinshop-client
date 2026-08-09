import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import client, { setUnauthorizedHandler } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [unread, setUnread] = useState(0);
  const [status, setStatus] = useState('loading'); // loading | authenticated | unauthenticated
  const checkedRef = useRef(false);

  const refreshSession = useCallback(async () => {
    try {
      const { data } = await client.get('/auth/session');
      if (data.authenticated) {
        setUser(data.user);
        setUnread(data.unread || 0);
        setStatus('authenticated');
      } else {
        setUser(null);
        setUnread(0);
        setStatus('unauthenticated');
      }
      checkedRef.current = true;
      return data.authenticated;
    } catch {
      setUser(null);
      setUnread(0);
      setStatus('unauthenticated');
      checkedRef.current = true;
      return false;
    }
  }, []);

  useEffect(() => {
    refreshSession();
    setUnauthorizedHandler(() => {
      setUser(null);
      setUnread(0);
      setStatus('unauthenticated');
      checkedRef.current = true;
    });
  }, [refreshSession]);

  const login = useCallback(async (email, password) => {
    const { data } = await client.post('/auth/login', { email, password });
    setUser(data.user);
    setStatus('authenticated');
    refreshSession();
    return data;
  }, [refreshSession]);

  const register = useCallback(async (payload) => {
    const { data } = await client.post('/auth/register', payload);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await client.post('/auth/logout');
    } catch {
      /* session may already be gone */
    }
    setUser(null);
    setUnread(0);
    setStatus('unauthenticated');
  }, []);

  const refreshUnread = useCallback(async () => {
    try {
      const { data } = await client.get('/notifications/unread-count');
      setUnread(data.unread);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      unread,
      status,
      isAdmin: user?.role === 'admin',
      isVerified: Boolean(user?.is_verified),
      login,
      register,
      logout,
      refreshSession,
      refreshUnread,
      setUser
    }),
    [user, unread, status, login, register, logout, refreshSession, refreshUnread]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}