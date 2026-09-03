// Zod request-body schemas shared between @edds-wallet/api (server-side
// validation) and @edds-wallet/web (client-side form validation), so "what
// a valid deposit looks like" is defined exactly once.
import { z } from 'zod';
import { ALLOWANCE_FREQUENCIES, MONEY_ACTION_TYPES } from './constants.ts';

/** A short numeric PIN - the mock-auth "seatbelt", not a security control.
 * See data/edw-tech-research/report.md Section 4. */
export const pinSchema = z.string().regex(/^\d{4,8}$/, 'PIN must be 4-8 digits');

export const loginRequestSchema = z.object({
  userId: z.number().int().positive(),
  pin: pinSchema.optional(),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

/** The single combined "add or remove money" action from the parent
 * dashboard (data/edw-wireframes/report.md, UX decision #3). */
export const moneyActionRequestSchema = z.object({
  type: z.enum(MONEY_ACTION_TYPES),
  amountCents: z.number().int().positive().max(100_000_00, 'amount too large'),
  memo: z.string().trim().min(1).max(280).optional(),
});
export type MoneyActionRequest = z.infer<typeof moneyActionRequestSchema>;

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'expected an ISO calendar date, e.g. 2026-09-02');

export const allowanceRuleCreateSchema = z.object({
  amountCents: z.number().int().positive().max(100_000_00, 'amount too large'),
  frequency: z.enum(ALLOWANCE_FREQUENCIES),
  anchorDate: dateOnly,
  memo: z.string().trim().max(280).optional(),
});
export type AllowanceRuleCreateRequest = z.infer<typeof allowanceRuleCreateSchema>;

export const allowanceRuleUpdateSchema = z
  .object({
    amountCents: z.number().int().positive().max(100_000_00, 'amount too large').optional(),
    frequency: z.enum(ALLOWANCE_FREQUENCIES).optional(),
    anchorDate: dateOnly.optional(),
    memo: z.string().trim().max(280).optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: 'at least one field must be provided',
  });
export type AllowanceRuleUpdateRequest = z.infer<typeof allowanceRuleUpdateSchema>;

export const transactionsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).optional(),
  before: z.coerce.number().int().positive().optional(),
});
export type TransactionsQuery = z.infer<typeof transactionsQuerySchema>;
