import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { ChildWallet } from './screens/ChildWallet';
import { LoginScreen } from './screens/LoginScreen';
import { ParentDashboard } from './screens/ParentDashboard';
import { SessionProvider, useSession } from './state/SessionContext';

/**
 * Route guard: derives destination from the server-issued session, never
 * from anything the client claims. Hidden UI is a nicety here, not the
 * security boundary - the backend enforces role separately (see
 * data/edw-tech-research/report.md Section 2).
 */
function RequireRole({
  requiredRole,
  children,
}: {
  requiredRole: 'parent' | 'child';
  children: ReactNode;
}) {
  const { status, user } = useSession();

  if (status === 'loading') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg)',
          color: 'var(--text-muted)',
        }}
      >
        Loading…
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  if (user.role !== requiredRole) {
    return <Navigate to={user.role === 'parent' ? '/parent' : '/child'} replace />;
  }
  return <>{children}</>;
}

/**
 * App shell: login/profile selector → parent dashboard or child wallet →
 * switch user, matching the three-screen navigation the captain approved
 * in the wireframe report.
 */
export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginScreen />} />
          <Route
            path="/parent"
            element={
              <RequireRole requiredRole="parent">
                <ParentDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/child"
            element={
              <RequireRole requiredRole="child">
                <ChildWallet />
              </RequireRole>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
}
