/**
 * The one clearly-marked module that talks to the backend API. All HTTP
 * calls live here - nothing else in `src/` should call `fetch` directly.
 * Request/response shapes come from `@edds-wallet/shared`
 * (`api-types.ts`/`schemas.ts`), matching `packages/api/API.md` (the
 * backend's documented contract, `fm/edw-backend`).
 *
 * Same-origin in production (`npm start` serves the SPA + API from one
 * origin/port); in dev, `vite.config.ts` proxies `/api` to the API's own
 * dev port so this can stay relative paths + `credentials: 'include'`
 * either way (httpOnly session cookie, per the mock-auth design in
 * `data/edw-tech-research/report.md` Section 4).
 */
import type {
  AllowanceRuleCreateRequest,
  AllowanceRuleResponse,
  AllowanceRulesResponse,
  AllowanceRuleUpdateRequest,
  ApiErrorBody,
  AuthProfilesResponse,
  BalanceResponse,
  LoginRequest,
  LoginResponse,
  MoneyActionRequest,
  NextAllowanceResponse,
  SessionResponse,
  TransactionsResponse,
} from '@edds-wallet/shared';

const API_BASE = '/api';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
    ...init,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as ApiErrorBody;
      message = body.message || body.error || message;
    } catch {
      // response had no JSON body - fall back to the generic message
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  auth: {
    profiles: () => request<AuthProfilesResponse>('/auth/profiles'),
    /** 401s (as `ApiError`) when there is no active session - callers treat that as "anonymous". */
    session: () => request<SessionResponse>('/auth/session'),
    login: (body: LoginRequest) =>
      request<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    logout: () => request<void>('/auth/logout', { method: 'POST' }),
  },
  account: {
    balance: () => request<BalanceResponse>('/account/balance'),
    transactions: (params?: { limit?: number; before?: number }) => {
      const query = new URLSearchParams();
      if (params?.limit) query.set('limit', String(params.limit));
      if (params?.before) query.set('before', String(params.before));
      const qs = query.toString();
      return request<TransactionsResponse>(`/account/transactions${qs ? `?${qs}` : ''}`);
    },
    nextAllowance: () => request<NextAllowanceResponse>('/account/allowance/next'),
  },
  money: {
    /** The single combined "add or remove money" action (deposit or withdrawal picked by `type`). */
    act: (body: MoneyActionRequest) =>
      request<{ pocketId: number; balanceCents: number }>('/money/actions', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },
  allowanceRules: {
    list: () => request<AllowanceRulesResponse>('/account/allowance-rules'),
    create: (body: AllowanceRuleCreateRequest) =>
      request<{ rule: AllowanceRuleResponse }>('/account/allowance-rules', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    update: (id: number, body: AllowanceRuleUpdateRequest) =>
      request<{ rule: AllowanceRuleResponse }>(`/account/allowance-rules/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    pause: (id: number) =>
      request<{ rule: AllowanceRuleResponse }>(`/account/allowance-rules/${id}/pause`, {
        method: 'POST',
      }),
    resume: (id: number) =>
      request<{ rule: AllowanceRuleResponse }>(`/account/allowance-rules/${id}/resume`, {
        method: 'POST',
      }),
  },
};
