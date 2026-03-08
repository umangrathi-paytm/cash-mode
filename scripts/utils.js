/**
 * Formatting and calculation utilities
 */

function formatAmount(n) {
  return Math.floor(n).toLocaleString('en-IN');
}

/**
 * Decompose amount into denominations (greedy). Used when switching from Amount to Cash mode.
 */
function decomposeAmount(amount, denominations, maxNotes) {
  const notes = {};
  let rem = Math.floor(amount);
  denominations.forEach(d => {
    const count = Math.floor(rem / d);
    if (count > 0) {
      notes[d] = Math.min(count, maxNotes);
      rem -= notes[d] * d;
    }
  });
  return notes;
}

/**
 * Regret preview equivalents by amount band.
 * ₹300–999: auto rides, lunches, movie tickets
 * ₹1000+: groceries, fuel, dinner, OTT month
 * Returns top 2–3 items with quantity >= 1, correct pluralization.
 */
const REGRET_EQUIVALENTS_LOW = [
  { unit: 'auto ride', plural: 'auto rides', cost: 30 },
  { unit: 'lunch', plural: 'lunches', cost: 150 },
  { unit: 'movie ticket', plural: 'movie tickets', cost: 250 }
];

const REGRET_EQUIVALENTS_HIGH = [
  { unit: 'week of groceries', plural: 'weeks of groceries', cost: 1500 },
  { unit: 'fuel fill', plural: 'fuel fills', cost: 2500 },
  { unit: 'dinner out', plural: 'dinners out', cost: 400 },
  { unit: 'OTT subscription month', plural: 'OTT months', cost: 500 }
];

function getRegretEquivalents(amount, maxItems = 3) {
  if (amount < 300) return []; /* matches REGRET_THRESHOLD in state.js */
  const candidates = amount < 1000 ? REGRET_EQUIVALENTS_LOW : REGRET_EQUIVALENTS_HIGH;
  const withQty = candidates
    .map(e => {
      const qty = Math.floor(amount / e.cost);
      return { ...e, qty };
    })
    .filter(e => e.qty >= 1)
    .slice(0, maxItems);
  return withQty.map(e => ({
    label: e.qty === 1 ? `1 ${e.unit}` : `${e.qty} ${e.plural}`,
    qty: e.qty,
    unit: e.unit
  }));
}
