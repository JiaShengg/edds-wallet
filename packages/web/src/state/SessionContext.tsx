import type { SessionUser } from '@edds-wallet/shared';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

interface SessionContextValue {
  /** 'loading' while the initial GET /api/auth/session is in flight. */
  status: 'loading' | 'ready';
  user: SessionUser | null;
  login: (userId: number, pin?: string) => Promise<SessionUser>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.auth
      .session()
      .then((res) => {
        if (!cancelled) setUser(res.user);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setStatus('ready');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (userId: number, pin?: string) => {
    const res = await api.auth.login({ userId, pin });
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <SessionContext.Provider value={{ status, user, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}
