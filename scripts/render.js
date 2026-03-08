/**
 * Render functions: amount display, wallet, regret preview, tray, mode visibility
 */

function recalcTotal() {
  let total = 0;
  for (const [denom, count] of Object.entries(state.notes)) {
    total += Number(denom) * count;
  }
  state.total = total;
  return total;
}

function updateAmountDisplay() {
  const total = state.mode === 'cash' ? recalcTotal() : (parseFloat(state.keypadValue) || 0);
  const amountNumber = document.getElementById('amountNumber');
  const amountDisplay = document.getElementById('amountDisplay');
  const amountHelper = document.getElementById('amountHelper');
  const amountRemainingLine = document.getElementById('amountRemainingLine');
  const ctaBtn = document.getElementById('ctaBtn');

  if (amountNumber) amountNumber.textContent = formatAmount(total);
  if (amountDisplay) {
    amountDisplay.classList.add('bump');
    setTimeout(() => amountDisplay.classList.remove('bump'), 150);
  }

  if (state.mode === 'cash') {
    if (amountHelper) {
      amountHelper.textContent = total > 0 ? 'Paying like cash' : '';
      amountHelper.style.display = total > 0 ? '' : 'none';
    }
    if (amountRemainingLine) {
      const remaining = Math.max(0, DAILY_LIMIT - total);
      amountRemainingLine.textContent = `₹${formatAmount(remaining)} left today`;
      amountRemainingLine.style.display = total > 0 ? '' : 'none';
    }
  } else {
    if (amountHelper) amountHelper.style.display = 'none';
    if (amountRemainingLine) amountRemainingLine.style.display = 'none';
  }

  if (ctaBtn) {
    if (total > 0) {
      ctaBtn.textContent = `Pay ₹${formatAmount(total)}`;
      ctaBtn.classList.remove('disabled');
    } else {
      ctaBtn.textContent = 'Select amount';
      ctaBtn.classList.add('disabled');
    }
  }
}

function renderWalletSection() {
  const total = state.mode === 'cash' ? state.total : 0;
  const walletRemaining = document.getElementById('walletRemaining');
  const walletBarFill = document.getElementById('walletBarFill');
  const walletStack = document.getElementById('walletStack');

  const remaining = Math.max(0, DAILY_LIMIT - total);
  if (walletRemaining) walletRemaining.textContent = `₹${formatAmount(remaining)}`;
  if (walletBarFill) {
    const pct = (remaining / DAILY_LIMIT) * 100;
    walletBarFill.style.width = pct + '%';
    walletBarFill.classList.remove('warn', 'danger');
    if (pct <= 25) walletBarFill.classList.add('danger');
    else if (pct <= 50) walletBarFill.classList.add('warn');
  }

  if (walletStack) {
    let budget = remaining;
    const stackHTML = [];
    WALLET_NOTES.forEach(({ d, count }) => {
      for (let i = 0; i < count; i++) {
        const isSpent = budget < d;
        stackHTML.push(
          `<span class="wallet-note w-${d}${isSpent ? ' spent' : ''}" data-value="${d}">₹${d}</span>`
        );
        if (!isSpent) budget -= d;
      }
    });
    walletStack.innerHTML = stackHTML.join('');
  }
}

function renderRegretPreview() {
  const total = state.mode === 'cash' ? state.total : 0;
  const section = document.getElementById('regretSection');
  const itemsEl = document.getElementById('regretItems');
  if (!section || !itemsEl) return;

  if (state.mode !== 'cash' || total < REGRET_THRESHOLD) {
    section.classList.remove('visible');
    section.style.display = 'none';
    return;
  }
  const items = getRegretEquivalents(total, 3);
  if (items.length === 0) {
    section.classList.remove('visible');
    section.style.display = 'none';
    return;
  }
  section.style.display = 'block';
  section.classList.add('visible');
  itemsEl.innerHTML = items
    .map(({ label }) => `<div class="regret-item"><span class="regret-dot"></span>${label}</div>`)
    .join('');
}

function renderTray() {
  const trayCard = document.getElementById('trayCard');
  const trayItems = document.getElementById('trayItems');
  const trayTotalValue = document.getElementById('trayTotalValue');

  const entries = Object.entries(state.notes)
    .filter(([, count]) => count > 0)
    .sort((a, b) => Number(b[0]) - Number(a[0]));
  const newKeys = new Set(entries.map(([d]) => d));

  if (entries.length === 0) {
    if (trayCard) trayCard.classList.remove('has-items');
    if (trayItems) trayItems.innerHTML = '';
    state.prevTrayKeys = newKeys;
    return;
  }

  if (trayCard) trayCard.classList.add('has-items');
  if (trayItems) {
    trayItems.innerHTML = entries
      .map(([denom, count]) => {
        const d = Number(denom);
        const isNew = !state.prevTrayKeys.has(denom);
        return `
        <div class="tray-item${isNew ? ' entering' : ''}" data-denom="${denom}" data-tray-row>
          <div class="tray-item-swipe-wrap">
            <div class="tray-item-color"></div>
            <div class="tray-item-info">
              <span class="tray-item-denom">₹${formatAmount(d)}</span>
              <span class="tray-item-times">× ${count}</span>
            </div>
            <span class="tray-item-subtotal">₹${formatAmount(d * count)}</span>
            <div class="tray-item-controls">
              <button type="button" class="tray-item-btn tray-minus" data-denom="${denom}" aria-label="Remove one ₹${denom} note">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <button type="button" class="tray-item-btn tray-plus" data-denom="${denom}" aria-label="Add one ₹${denom} note">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>
          </div>
          <button type="button" class="tray-remove-btn" data-denom="${denom}" aria-label="Remove all ₹${denom} notes">Remove</button>
        </div>`;
      })
      .join('');
  }
  state.prevTrayKeys = newKeys;
  if (trayTotalValue) trayTotalValue.textContent = `₹${formatAmount(state.total)}`;
}

function updateNoteBadges() {
  DENOMINATIONS.forEach(d => {
    const badge = document.getElementById(`badge-${d}`);
    const card = document.querySelector(`.note-card[data-value="${d}"]`);
    const count = state.notes[d] || 0;
    if (badge) badge.textContent = count;
    if (card) {
      if (count > 0) card.classList.add('has-count');
      else card.classList.remove('has-count');
    }
  });
}

/**
 * Show/hide sections by mode. Amount Mode: only top bar, payee, mode card, amount, keypad, CTA.
 */
function setModeVisibility() {
  const isCash = state.mode === 'cash';
  const cashOnly = document.getElementById('cashOnly');
  const keypadSection = document.getElementById('keypadSection');
  if (cashOnly) cashOnly.style.display = isCash ? '' : 'none';
  if (keypadSection) keypadSection.style.display = isCash ? 'none' : '';
}

function updateUI() {
  updateAmountDisplay();
  updateNoteBadges();
  renderTray();
  if (state.mode === 'cash') {
    renderWalletSection();
    renderRegretPreview();
  }
  setModeVisibility();
}
