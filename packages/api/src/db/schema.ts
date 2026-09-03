// Full Drizzle schema for Edd's Wallet, mirroring
// data/edw-tech-research/report.md Section 3 exactly (table/column names,
// types, checks, FKs). Shipped in full on day one even though Phase 0 only
// has live features for a subset of these tables - see packages/api/API.md
// and the report's Section 6 cut line.
//
// STRICT tables, the append-only triggers on cash_entries/credit_entries,
// and WAL mode are not expressible via drizzle-kit's generator, so they
// are hand-added to the generated migration SQL - see
// packages/api/drizzle/0000_init.sql and its header comment.

import {
  ALLOWANCE_FREQUENCIES,
  type AllowanceFrequency,
  CASH_ENTRY_SOURCE_TYPES,
  CASH_ENTRY_TYPES,
  type CashEntrySourceType,
  type CashEntryType,
  CONCEPT_KEYS,
  type ConceptKey,
  CREDIT_ENTRY_TYPES,
  CREDIT_LINE_KINDS,
  CREDIT_LINE_STATUSES,
  type CreditEntryType,
  type CreditLineKind,
  type CreditLineStatus,
  POCKET_KINDS,
  type PocketKind,
  USER_ROLES,
  type UserRole,
} from '@edds-wallet/shared';
import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

/** Renders a SQL `IN (...)` literal list from a shared const array, so
 * every CHECK constraint stays byte-for-byte in sync with the enum arrays
 * that also drive Zod validation - one source of truth, per
 * @edds-wallet/shared/constants. */
const sqlList = (values: readonly string[]) => sql.raw(values.map((v) => `'${v}'`).join(', '));

// ---------------------------------------------------------------------------
// Mock-auth identities and sessions (report Section 4).
// ---------------------------------------------------------------------------

export const users = sqliteTable(
  'users',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    role: text('role').notNull().$type<UserRole>(),
    displayName: text('display_name').notNull(),
    pinHash: text('pin_hash'),
    pinSalt: text('pin_salt'),
    birthYear: integer('birth_year'),
    createdAt: text('created_at').notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
    archivedAt: text('archived_at'),
  },
  (t) => [check('users_role_check', sql`${t.role} in (${sqlList(USER_ROLES)})`)],
);

export const sessions = sqliteTable(
  'sessions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    tokenHash: text('token_hash').notNull(),
    createdAt: text('created_at').notNull(),
    expiresAt: text('expires_at').notNull(),
    revokedAt: text('revoked_at'),
  },
  (t) => [uniqueIndex('sessions_token_hash_unique').on(t.tokenHash)],
);

// ---------------------------------------------------------------------------
// Accounts, pockets, and the append-only cash ledger.
// ---------------------------------------------------------------------------

export const accounts = sqliteTable('accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  childUserId: integer('child_user_id')
    .notNull()
    .unique()
    .references(() => users.id),
  currencyLabel: text('currency_label').notNull().default('USD'),
  createdAt: text('created_at').notNull(),
});

export const pockets = sqliteTable(
  'pockets',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    accountId: integer('account_id')
      .notNull()
      .references(() => accounts.id),
    kind: text('kind').notNull().$type<PocketKind>(),
    name: text('name').notNull(),
    interestRateBps: integer('interest_rate_bps').notNull().default(0),
    goalCents: integer('goal_cents'),
    isDefault: integer('is_default').notNull().default(0),
    archivedAt: text('archived_at'),
    createdAt: text('created_at').notNull(),
  },
  (t) => [
    check('pockets_kind_check', sql`${t.kind} in (${sqlList(POCKET_KINDS)})`),
    uniqueIndex('pockets_account_id_name_unique').on(t.accountId, t.name),
  ],
);

/** APPEND-ONLY. Every cent that ever moved in or out of a pocket. Balance
 * of a pocket = SUM(amount_cents) WHERE pocket_id = ?, never a mutable
 * counter. See drizzle/0000_init.sql for the BEFORE UPDATE/DELETE
 * triggers that enforce this at the database engine level. */
export const cashEntries = sqliteTable(
  'cash_entries',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    pocketId: integer('pocket_id')
      .notNull()
      .references(() => pockets.id),
    amountCents: integer('amount_cents').notNull(),
    entryType: text('entry_type').notNull().$type<CashEntryType>(),
    transferGroupId: text('transfer_group_id'),
    sourceType: text('source_type').$type<CashEntrySourceType | null>(),
    sourceId: integer('source_id'),
    memo: text('memo'),
    createdByUserId: integer('created_by_user_id')
      .notNull()
      .references(() => users.id),
    balanceAfterCents: integer('balance_after_cents').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (t) => [
    check('cash_entries_amount_nonzero', sql`${t.amountCents} != 0`),
    check('cash_entries_entry_type_check', sql`${t.entryType} in (${sqlList(CASH_ENTRY_TYPES)})`),
    check(
      'cash_entries_source_type_check',
      sql`${t.sourceType} is null or ${t.sourceType} in (${sqlList(CASH_ENTRY_SOURCE_TYPES)})`,
    ),
    index('cash_entries_pocket_id_idx').on(t.pocketId, t.id),
  ],
);

// ---------------------------------------------------------------------------
// Credit lines (installment loans + credit cards, unified) - schema only,
// no live Phase 0 features (report Section 6).
// ---------------------------------------------------------------------------

export const creditLines = sqliteTable(
  'credit_lines',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    accountId: integer('account_id')
      .notNull()
      .references(() => accounts.id),
    kind: text('kind').notNull().$type<CreditLineKind>(),
    label: text('label').notNull(),
    principalOrLimitCents: integer('principal_or_limit_cents').notNull(),
    aprBps: integer('apr_bps').notNull().default(0),
    installmentAmountCents: integer('installment_amount_cents'),
    installmentFrequency: text('installment_frequency').$type<AllowanceFrequency | null>(),
    statementDay: integer('statement_day'),
    status: text('status').notNull().default('active').$type<CreditLineStatus>(),
    openedAt: text('opened_at').notNull(),
    closedAt: text('closed_at'),
    createdByUserId: integer('created_by_user_id')
      .notNull()
      .references(() => users.id),
  },
  (t) => [
    check('credit_lines_kind_check', sql`${t.kind} in (${sqlList(CREDIT_LINE_KINDS)})`),
    check(
      'credit_lines_installment_frequency_check',
      sql`${t.installmentFrequency} is null or ${t.installmentFrequency} in (${sqlList(ALLOWANCE_FREQUENCIES)})`,
    ),
    check('credit_lines_status_check', sql`${t.status} in (${sqlList(CREDIT_LINE_STATUSES)})`),
  ],
);

/** APPEND-ONLY, same guarantee as cash_entries. Owed balance of a credit
 * line = SUM(amount_cents) WHERE credit_line_id = ?. */
export const creditEntries = sqliteTable(
  'credit_entries',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    creditLineId: integer('credit_line_id')
      .notNull()
      .references(() => creditLines.id),
    amountCents: integer('amount_cents').notNull(),
    entryType: text('entry_type').notNull().$type<CreditEntryType>(),
    linkedCashEntryId: integer('linked_cash_entry_id').references(() => cashEntries.id),
    memo: text('memo'),
    createdByUserId: integer('created_by_user_id')
      .notNull()
      .references(() => users.id),
    owedAfterCents: integer('owed_after_cents').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (t) => [
    check('credit_entries_amount_nonzero', sql`${t.amountCents} != 0`),
    check(
      'credit_entries_entry_type_check',
      sql`${t.entryType} in (${sqlList(CREDIT_ENTRY_TYPES)})`,
    ),
    index('credit_entries_credit_line_id_idx').on(t.creditLineId, t.id),
  ],
);

// ---------------------------------------------------------------------------
// Allowance rules - live in Phase 0 (report Section 5/6).
// ---------------------------------------------------------------------------

export const allowanceRules = sqliteTable(
  'allowance_rules',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    accountId: integer('account_id')
      .notNull()
      .references(() => accounts.id),
    pocketId: integer('pocket_id')
      .notNull()
      .references(() => pockets.id),
    amountCents: integer('amount_cents').notNull(),
    frequency: text('frequency').notNull().$type<AllowanceFrequency>(),
    anchorDate: text('anchor_date').notNull(),
    memo: text('memo'),
    active: integer('active').notNull().default(1),
    createdByUserId: integer('created_by_user_id')
      .notNull()
      .references(() => users.id),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => [
    check('allowance_rules_amount_positive', sql`${t.amountCents} > 0`),
    check(
      'allowance_rules_frequency_check',
      sql`${t.frequency} in (${sqlList(ALLOWANCE_FREQUENCIES)})`,
    ),
    index('allowance_rules_account_id_idx').on(t.accountId),
  ],
);

// ---------------------------------------------------------------------------
// Concept unlocks (pedagogy gate, not a security boundary - report
// Section 2/5) and the parent-action audit log.
// ---------------------------------------------------------------------------

export const conceptUnlocks = sqliteTable(
  'concept_unlocks',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    accountId: integer('account_id')
      .notNull()
      .references(() => accounts.id),
    conceptKey: text('concept_key').notNull().$type<ConceptKey>(),
    unlockedAt: text('unlocked_at'),
    unlockedByUserId: integer('unlocked_by_user_id').references(() => users.id),
  },
  (t) => [
    check('concept_unlocks_concept_key_check', sql`${t.conceptKey} in (${sqlList(CONCEPT_KEYS)})`),
    uniqueIndex('concept_unlocks_account_id_concept_key_unique').on(t.accountId, t.conceptKey),
  ],
);

export const auditLog = sqliteTable('audit_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  actorUserId: integer('actor_user_id')
    .notNull()
    .references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: integer('entity_id').notNull(),
  detailJson: text('detail_json'),
  createdAt: text('created_at').notNull(),
});
