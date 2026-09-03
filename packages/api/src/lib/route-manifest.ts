// The maintained contract for the role-enforcement test suite
// (test/role-enforcement.test.ts). Every route this API registers must
// have exactly one entry here, classified by `requiredRole`:
//
//   - 'parent': gated by `parentOnlyRoutes` (src/auth/parent-only.ts) -
//     the test asserts a valid child session gets 403.
//   - 'session': reachable by any signed-in role (parent or child); read
//     routes and the handful of non-financial actions any signed-in user
//     must be able to do (logout).
//   - 'public': no session required at all (login, the profile list).
//
// The test diffs this list against Fastify's own route registry
// (via the `onRoute` hook) in both directions: a route missing from this
// manifest fails the test (a new mutating route can't silently ship
// without an explicit role decision), and a stale manifest entry with no
// matching live route also fails it.
export type RequiredRole = 'parent' | 'session' | 'public';

export interface RouteManifestEntry {
  method: string;
  url: string;
  requiredRole: RequiredRole;
  /** Why a mutating (POST/PUT/PATCH/DELETE) route is NOT gated
   * `'parent'` - required for every such entry, so the exception is
   * reviewed and explicit rather than silent. */
  mutatingExceptionReason?: string;
}

export const ROUTE_MANIFEST: RouteManifestEntry[] = [
  { method: 'GET', url: '/api/auth/profiles', requiredRole: 'public' },
  {
    method: 'POST',
    url: '/api/auth/login',
    requiredRole: 'public',
    mutatingExceptionReason:
      'This IS the mock-auth front door - there is no session yet to gate it behind ' +
      '(report Section 4).',
  },
  {
    method: 'POST',
    url: '/api/auth/logout',
    requiredRole: 'session',
    mutatingExceptionReason:
      'Any signed-in role must be able to "switch user" - session revocation touches no ' +
      "financial/account state, only the requester's own session row.",
  },
  { method: 'GET', url: '/api/auth/session', requiredRole: 'session' },
  { method: 'GET', url: '/api/account/balance', requiredRole: 'session' },
  { method: 'GET', url: '/api/account/transactions', requiredRole: 'session' },
  { method: 'GET', url: '/api/account/allowance/next', requiredRole: 'session' },
  { method: 'GET', url: '/api/account/concept-unlocks', requiredRole: 'session' },
  { method: 'POST', url: '/api/money/actions', requiredRole: 'parent' },
  { method: 'GET', url: '/api/account/allowance-rules', requiredRole: 'parent' },
  { method: 'POST', url: '/api/account/allowance-rules', requiredRole: 'parent' },
  { method: 'PATCH', url: '/api/account/allowance-rules/:id', requiredRole: 'parent' },
  { method: 'POST', url: '/api/account/allowance-rules/:id/pause', requiredRole: 'parent' },
  { method: 'POST', url: '/api/account/allowance-rules/:id/resume', requiredRole: 'parent' },
];

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function isMutatingMethod(method: string): boolean {
  return MUTATING_METHODS.has(method.toUpperCase());
}
