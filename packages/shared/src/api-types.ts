// Response DTO shapes returned by @edds-wallet/api, imported by
// @edds-wallet/web so the frontend gets typed responses without reading
// the server source. Keep these in sync with packages/api/API.md.
import type { AllowanceFrequency, CashEntryType, ConceptKey, UserRole } from './constants.ts';

export interface SessionUser {
  id: number;
  role: UserRole;
  displayName: string;
}

/** One tile on the login screen. Public (pre-session) - never includes
 * the PIN itself, only whether one is required. */
export interface AuthProfile {
  id: number;
  role: UserRole;
  displayName: string;
  hasPin: boolean;
}

export interface AuthProfilesResponse {
  profiles: AuthProfile[];
}

export interface LoginResponse {
  user: SessionUser;
}

export interface SessionResponse {
  user: SessionUser;
}

export interface BalanceResponse {
  pocketId: number;
  balanceCents: number;
  currencyLabel: string;
}

export interface TransactionEntry {
  id: number;
  amountCents: number;
  entryType: CashEntryType;
  memo: string | null;
  createdAt: string;
  balanceAfterCents: number;
}

export interface TransactionsResponse {
  entries: TransactionEntry[];
  /** Pass as `?before=` to page further back; null when there is no more
   * history. */
  nextCursor: number | null;
}

export interface AllowanceRuleResponse {
  id: number;
  amountCents: number;
  frequency: AllowanceFrequency;
  anchorDate: string;
  active: boolean;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AllowanceRulesResponse {
  rules: AllowanceRuleResponse[];
}

export interface NextAllowance {
  nextOccurrenceAt: string;
  amountCents: number;
}

/** `nextAllowance` is null when allowance isn't unlocked yet or there is
 * no active rule - the child's "Next allowance" banner should render
 * nothing in that case (data/edw-wireframes/report.md, UX decision #6). */
export interface NextAllowanceResponse {
  nextAllowance: NextAllowance | null;
}

export interface ConceptUnlockResponse {
  conceptKey: ConceptKey;
  unlockedAt: string | null;
}

export interface ConceptUnlocksResponse {
  unlocks: ConceptUnlockResponse[];
}

export interface ApiErrorBody {
  error: string;
  message: string;
}
