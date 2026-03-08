/**
 * Application state and constants
 */

const MAX_NOTES = 50;
const DAILY_LIMIT = 2000;
const LARGE_PAYMENT = 5000;
const LONG_PRESS_MS = 700;
const REGRET_THRESHOLD = 300;

const DENOMINATIONS = [500, 200, 100, 50, 20, 10, 5, 2, 1];

/** Wallet decomposition for visual depletion (sums to DAILY_LIMIT) */
const WALLET_NOTES = [
  { d: 500, count: 2 },
  { d: 200, count: 2 },
  { d: 100, count: 4 },
  { d: 50, count: 2 },
  { d: 20, count: 5 },
  { d: 10, count: 0 }
];

const state = {
  mode: 'cash',
  notes: {},
  total: 0,
  keypadValue: '',
  message: '',
  prevTrayKeys: new Set()
};
