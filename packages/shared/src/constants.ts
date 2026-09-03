// Canonical enum-like value lists shared between the API's Drizzle schema
// (CHECK constraints), the API's Zod request validation, and anything the
// frontend needs to render (e.g. a switch over entry types). Single source
// of truth per data/edw-tech-research/report.md Section 3.

export const USER_ROLES = ['parent', 'child', 'system'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const POCKET_KINDS = ['spending', 'savings'] as const;
export type PocketKind = (typeof POCKET_KINDS)[number];

export const CASH_ENTRY_TYPES = [
  'deposit',
  'withdrawal',
  'allowance_payout',
  'transfer_in',
  'transfer_out',
  'loan_disbursement',
  'loan_repayment',
  'credit_card_payment',
  'interest_earned',
  'adjustment',
] as const;
export type CashEntryType = (typeof CASH_ENTRY_TYPES)[number];

export const CASH_ENTRY_SOURCE_TYPES = ['allowance_rule', 'credit_line', 'manual'] as const;
export type CashEntrySourceType = (typeof CASH_ENTRY_SOURCE_TYPES)[number];

export const CREDIT_LINE_KINDS = ['installment_loan', 'credit_card'] as const;
export type CreditLineKind = (typeof CREDIT_LINE_KINDS)[number];

export const CREDIT_LINE_STATUSES = ['active', 'paid_off', 'frozen', 'forgiven'] as const;
export type CreditLineStatus = (typeof CREDIT_LINE_STATUSES)[number];

export const CREDIT_ENTRY_TYPES = [
  'disbursement',
  'purchase',
  'interest_charge',
  'payment',
  'forgiveness',
] as const;
export type CreditEntryType = (typeof CREDIT_ENTRY_TYPES)[number];

export const ALLOWANCE_FREQUENCIES = ['weekly', 'biweekly', 'monthly'] as const;
export type AllowanceFrequency = (typeof ALLOWANCE_FREQUENCIES)[number];

export const CONCEPT_KEYS = [
  'balance',
  'allowance',
  'savings_interest',
  'loans',
  'credit_card',
] as const;
export type ConceptKey = (typeof CONCEPT_KEYS)[number];

export const MONEY_ACTION_TYPES = ['deposit', 'withdrawal'] as const;
export type MoneyActionType = (typeof MONEY_ACTION_TYPES)[number];

/** Reserved well-known user id seeded on first run, used as
 * `created_by_user_id` on every ledger row an automated job creates. */
export const SYSTEM_USER_ID = 1;
