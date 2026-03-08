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
 * Regret preview equivalents by amount band. Supports 100+ internally; UI display threshold is 300 (see render.js).
 * Band A (₹100–299): chai, auto, lunch — prefer chai and auto first.
 * Band B (₹300–999): auto, lunch, movie; chai only as optional fill for lower end.
 * Band C (₹1000+): groceries, dinner, OTT, fuel — no chai, no auto.
 * Returns up to maxItems with floor(amount/cost) >= 1, correct pluralisation.
 */
const EQUIVALENTS_BAND_A = [
  { unit: 'cup of chai', plural: 'cups of chai', cost: 15 },
  { unit: 'auto ride', plural: 'auto rides', cost: 30 },
  { unit: 'lunch', plural: 'lunches', cost: 150 }
];

const EQUIVALENTS_BAND_B = [
  { unit: 'auto ride', plural: 'auto rides', cost: 30 },
  { unit: 'lunch', plural: 'lunches', cost: 150 },
  { unit: 'movie ticket', plural: 'movie tickets', cost: 250 }
];

const CHAI_ITEM = { unit: 'cup of chai', plural: 'cups of chai', cost: 15 };

const EQUIVALENTS_BAND_C = [
  { unit: 'week of groceries', plural: 'weeks of groceries', cost: 1500 },
  { unit: 'dinner out', plural: 'dinners out', cost: 400 },
  { unit: 'OTT subscription month', plural: 'OTT months', cost: 500 },
  { unit: 'fuel fill', plural: 'fuel fills', cost: 2500 }
];

function getRegretEquivalents(amount, maxItems = 3) {
  const a = Math.floor(amount);
  if (a < 100) return [];

  let withQty;
  if (a < 300) {
    withQty = EQUIVALENTS_BAND_A.map(e => ({ ...e, qty: Math.floor(a / e.cost) })).filter(e => e.qty >= 1);
  } else if (a < 1000) {
    withQty = EQUIVALENTS_BAND_B.map(e => ({ ...e, qty: Math.floor(a / e.cost) })).filter(e => e.qty >= 1);
    if (withQty.length < maxItems && a < 500) {
      const chaiQty = Math.floor(a / CHAI_ITEM.cost);
      if (chaiQty >= 1) withQty.push({ ...CHAI_ITEM, qty: chaiQty });
    }
  } else {
    withQty = EQUIVALENTS_BAND_C.map(e => ({ ...e, qty: Math.floor(a / e.cost) })).filter(e => e.qty >= 1);
  }

  const taken = withQty.slice(0, maxItems);
  return taken.map(e => ({
    label: e.qty === 1 ? `1 ${e.unit}` : `${e.qty} ${e.plural}`,
    qty: e.qty,
    unit: e.unit
  }));
}
