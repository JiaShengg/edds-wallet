/** Formats integer cents as "$5.00" - the only place amounts get a `$`. */
export function formatMoney(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  return `${sign}$${(Math.abs(cents) / 100).toFixed(2)}`;
}

/** Parses a "$"-less amount input (e.g. "5", "5.5") into integer cents, or null if invalid. */
export function parseMoneyInput(value: string): number | null {
  const amount = Number.parseFloat(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return Math.round(amount * 100);
}
