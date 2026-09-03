// The PIN is a "seatbelt," not a security control (report Section 4,
// point 3) - hashed with Node's built-in scrypt purely so a sibling can't
// casually tap into Parent mode, not because it protects real money.
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;

export interface PinHash {
  hash: string;
  salt: string;
}

export function hashPin(pin: string): PinHash {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(pin, salt, KEY_LENGTH).toString('hex');
  return { hash, salt };
}

export function verifyPin(pin: string, stored: PinHash): boolean {
  const candidate = scryptSync(pin, stored.salt, KEY_LENGTH);
  const expected = Buffer.from(stored.hash, 'hex');
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}
