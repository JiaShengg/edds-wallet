import { expect, type Page, test } from '@playwright/test';

/**
 * Required smoke test (launch brief): log in as parent -> add money ->
 * switch to child -> confirm the child view is read-only and shows the
 * correct balance. Exercises a real running `@edds-wallet/api` backend
 * through the dev-server proxy (see `vite.config.ts` /
 * `playwright.config.ts`) - see README.md for how to point this at a
 * backend checked out from `fm/edw-backend`.
 */

// The MVP ships exactly one child, named Edd, per the captain's Phase 0
// decision (data/edw-mvp/brief.md, "Captain decisions" #1) - safe to
// assume in this test rather than discovering it dynamically.
const CHILD_NAME = 'Edd';
// The seeded parent PIN isn't specified by the authoritative reports
// (mock-auth design intentionally leaves the exact value to the backend's
// seed step) - override with E2E_PARENT_PIN if the real backend seeds a
// different one.
const PARENT_PIN = process.env.E2E_PARENT_PIN ?? '1234';

async function readBalanceCents(page: Page, testId: string): Promise<number> {
  const text = await page
    .getByTestId(testId)
    .getByText(/^\$[\d,.]+$/)
    .first()
    .textContent();
  const amount = Number.parseFloat((text ?? '$0').replace(/[$,]/g, ''));
  return Math.round(amount * 100);
}

test('parent adds money, child view shows it read-only', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: "I'm the Parent" }).click();

  // The PIN pad only appears if the parent profile has a PIN set - handle
  // both cases (wireframe UX requirement #2: PIN is optional per profile).
  const pinPrompt = page.getByText(/Enter .+PIN/);
  if (await pinPrompt.isVisible({ timeout: 2000 }).catch(() => false)) {
    for (const digit of PARENT_PIN) {
      await page.getByRole('button', { name: digit, exact: true }).click();
    }
  }

  await expect(page).toHaveURL(/\/parent$/);
  await expect(page.getByTestId('parent-balance')).toBeVisible();

  const balanceBeforeCents = await readBalanceCents(page, 'parent-balance');

  await page.getByRole('button', { name: 'Add or remove money' }).click();
  await page.getByLabel('How much?').fill('12.34');
  await page.getByLabel('What for?').fill('Playwright smoke test');
  await page.getByRole('button', { name: 'Add money' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();

  await expect.poll(() => readBalanceCents(page, 'parent-balance')).toBe(balanceBeforeCents + 1234);
  const balanceAfterCents = balanceBeforeCents + 1234;

  await page.getByRole('button', { name: 'Switch user' }).click();
  await expect(page).toHaveURL('/');

  await page.getByRole('button', { name: `I'm ${CHILD_NAME}` }).click();
  await expect(page).toHaveURL(/\/child$/);

  await expect(page.getByTestId('child-balance')).toBeVisible();
  await expect.poll(() => readBalanceCents(page, 'child-balance')).toBe(balanceAfterCents);

  // Read-only: no mutating control is ever rendered in child mode. Hidden
  // UI isn't the security boundary (the backend enforces it server-side),
  // but the client must never even offer these.
  for (const name of ['Add or remove money', '+ New rule', 'Edit', 'Pause', 'Resume']) {
    await expect(page.getByRole('button', { name })).toHaveCount(0);
  }
  await expect(page.getByText('Only a grown-up can add or take away money.')).toBeVisible();
});
