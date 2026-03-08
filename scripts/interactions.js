/**
 * Note add/remove, inline minus, long-press, ripple, tray swipe, keypad, message
 */

function addNote(denomination) {
  if (state.mode !== 'cash') return;
  const d = Number(denomination);
  state.notes[d] = Math.min((state.notes[d] || 0) + 1, MAX_NOTES);
  updateUI();
  persistState();
}

function removeNote(denomination) {
  if (state.mode !== 'cash') return;
  const d = Number(denomination);
  if (!state.notes[d]) return;
  state.notes[d]--;
  if (state.notes[d] <= 0) delete state.notes[d];
  updateUI();
  persistState();
}

/** Soft ripple at tap location on note card */
function showRipple(el, clientX, clientY) {
  const rect = el.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const ripple = document.createElement('span');
  ripple.className = 'note-ripple';
  ripple.style.left = (x - 40) + 'px';
  ripple.style.top = (y - 40) + 'px';
  el.appendChild(ripple);
  requestAnimationFrame(() => ripple.classList.add('active'));
  setTimeout(() => ripple.remove(), 400);
}

function setupNoteCards() {
  const grid = document.querySelector('.denom-section');
  if (!grid) return;

  grid.querySelectorAll('.note-card[data-value]').forEach(card => {
    const value = Number(card.dataset.value);
    let longPressTimer = null;
    let longPressFired = false;

    card.addEventListener('click', (e) => {
      if (state.mode !== 'cash') return;
      const target = e.target;
      if (target.closest('.note-minus-btn')) {
        e.preventDefault();
        e.stopPropagation();
        removeNote(value);
        return;
      }
      if (card.dataset.lock === 'true') return;
      card.dataset.lock = 'true';
      setTimeout(() => { card.dataset.lock = ''; }, 120);
      addNote(value);
      showRipple(card, e.clientX, e.clientY);
      card.style.transform = 'scale(0.96)';
      setTimeout(() => { card.style.transform = ''; }, 120);
    });

    card.addEventListener('touchstart', (e) => {
      if (state.mode !== 'cash') return;
      longPressFired = false;
      longPressTimer = setTimeout(() => {
        longPressFired = true;
        removeNote(value);
        if (window.navigator?.vibrate) window.navigator.vibrate(10);
      }, LONG_PRESS_MS);
    }, { passive: true });

    card.addEventListener('touchend', () => {
      if (longPressTimer) clearTimeout(longPressTimer);
      longPressTimer = null;
    }, { passive: true });

    card.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (state.mode !== 'cash') return;
      removeNote(value);
    });
  });

  grid.addEventListener('keydown', (e) => {
    const card = e.target.closest('.note-card[data-value]');
    if (!card) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });
}

function setupTrayDelegation() {
  const trayItems = document.getElementById('trayItems');
  if (!trayItems) return;
  trayItems.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.tray-remove-btn');
    if (removeBtn) {
      e.preventDefault();
      e.stopPropagation();
      const denom = Number(removeBtn.dataset.denom);
      if (denom != null && !Number.isNaN(denom)) {
        delete state.notes[denom];
        updateUI();
      }
      return;
    }
    const minus = e.target.closest('.tray-minus');
    const plus = e.target.closest('.tray-plus');
    if (minus) {
      e.stopPropagation();
      removeNote(Number(minus.dataset.denom));
    }
    if (plus) {
      e.stopPropagation();
      addNote(Number(plus.dataset.denom));
    }
  });
}

function setupTraySwipe() {
  const trayItems = document.getElementById('trayItems');
  if (!trayItems) return;
  let startX = 0;
  let currentX = 0;

  trayItems.addEventListener('touchstart', (e) => {
    const row = e.target.closest('[data-tray-row]');
    if (!row) return;
    startX = e.touches[0].clientX;
    currentX = startX;
    row.dataset.swipeStart = startX;
  }, { passive: true });

  trayItems.addEventListener('touchmove', (e) => {
    const row = e.target.closest('[data-tray-row]');
    if (!row || row.dataset.swipeStart === undefined) return;
    currentX = e.touches[0].clientX;
    const diff = startX - currentX;
    if (diff > 0) {
      row.style.setProperty('--swipe-x', `-${Math.min(diff, 72)}px`);
    }
  }, { passive: true });

  trayItems.addEventListener('touchend', (e) => {
    const row = e.target.closest('[data-tray-row]');
    if (!row) return;
    const start = Number(row.dataset.swipeStart);
    const diff = start - currentX;
    if (diff > 60) {
      const denom = row.dataset.denom;
      if (denom) removeNote(Number(denom));
    }
    row.style.removeProperty('--swipe-x');
    delete row.dataset.swipeStart;
  });
}

function setupKeypad() {
  document.querySelectorAll('.keypad-key').forEach(key => {
    key.addEventListener('click', () => {
      if (state.mode !== 'amount') return;
      const k = key.dataset.key;
      if (k === 'backspace') {
        state.keypadValue = state.keypadValue.slice(0, -1);
      } else if (k === '.') {
        if (!state.keypadValue.includes('.')) {
          state.keypadValue += state.keypadValue ? '.' : '0.';
        }
      } else {
        if (state.keypadValue.length < 7) state.keypadValue += k;
      }
      const numVal = parseFloat(state.keypadValue) || 0;
      const formatted = numVal ? numVal.toLocaleString('en-IN') : '0';
      const amountNumber = document.getElementById('amountNumber');
      const amountDisplay = document.getElementById('amountDisplay');
      const ctaBtn = document.getElementById('ctaBtn');
      if (amountNumber) amountNumber.textContent = formatted;
      if (amountDisplay) {
        amountDisplay.classList.add('bump');
        setTimeout(() => amountDisplay.classList.remove('bump'), 150);
      }
      if (ctaBtn) {
        if (numVal > 0) {
          ctaBtn.textContent = `Pay ₹${formatted}`;
          ctaBtn.classList.remove('disabled');
        } else {
          ctaBtn.textContent = 'Select amount';
          ctaBtn.classList.add('disabled');
        }
      }
      persistState();
    });
  });
}

function setupMessageTags() {
  const input = document.getElementById('messageInput');
  document.querySelectorAll('.message-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      if (input) {
        input.value = tag.textContent.trim();
        input.focus();
      }
    });
  });
  if (input) {
    input.addEventListener('input', () => {
      state.message = input.value;
      persistState();
    });
  }
}

function setupTrayClear() {
  document.getElementById('trayClearBtn')?.addEventListener('click', () => {
    state.notes = {};
    updateUI();
    persistState();
  });
}
