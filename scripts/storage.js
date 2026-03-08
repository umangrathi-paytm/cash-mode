/**
 * localStorage persistence for cash mode state
 */

const STORAGE_KEY = 'smart-spending-mode';

function persistState() {
  try {
    const payload = {
      cashNotes: state.notes,
      activeMode: state.mode,
      keypadValue: state.mode === 'amount' ? state.keypadValue : '',
      message: state.message || undefined
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (_) {}
}

function restoreState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.cashNotes && typeof data.cashNotes === 'object') {
      state.notes = data.cashNotes;
    }
    if (data.activeMode === 'amount' || data.activeMode === 'cash') {
      state.mode = data.activeMode;
    }
    if (typeof data.keypadValue === 'string') {
      state.keypadValue = data.keypadValue;
    }
    if (typeof data.message === 'string') {
      state.message = data.message;
    }
  } catch (_) {}
}
