// Seed data for the click-through. Amounts are cents, matching the real ledger.
window.WalletSeed = {
  household: { childName: 'Edd', parentHasPin: true, parentPin: '1234' },
  balanceCents: 4250,
  rules: [
    { id: 'r1', amountCents: 500, frequency: 'every Monday', nextDate: 'next Monday', paused: false },
    { id: 'r2', amountCents: 200, frequency: 'monthly on the 1st', nextDate: '1 May', paused: true },
  ],
  ledger: [
    { id: 't1', kind: 'allowance', amountCents: 500, memo: 'Weekly allowance', when: 'Mon 14 Apr', kidTitle: 'Your allowance showed up', emoji: '📅' },
    { id: 't2', kind: 'withdraw', amountCents: 200, memo: 'New Lego minifig', when: 'Sat 12 Apr', kidTitle: '$2 left your wallet', emoji: '🛍️' },
    { id: 't3', kind: 'deposit', amountCents: 1000, memo: 'Washing the car', when: 'Fri 11 Apr', kidTitle: 'You got $10!', emoji: '🎉' },
    { id: 't4', kind: 'allowance', amountCents: 500, memo: 'Weekly allowance', when: 'Mon 7 Apr', kidTitle: 'Your allowance showed up', emoji: '📅' },
    { id: 't5', kind: 'deposit', amountCents: 250, memo: 'Grandma visit', when: 'Sun 6 Apr', kidTitle: 'You got $2.50!', emoji: '🎉' },
  ],
};
window.money = (cents) => '$' + (cents / 100).toFixed(2);
