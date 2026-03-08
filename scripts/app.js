/**
 * App entry: restore state, mode switch, CTA, confirm modal
 */

(function init() {
  restoreState();

  const modeSwitchTrack = document.getElementById('modeSwitchTrack');
  const btnAmountMode = document.getElementById('btnAmountMode');
  const btnCashMode = document.getElementById('btnCashMode');

  const isCash = state.mode === 'cash';
  if (modeSwitchTrack) modeSwitchTrack.classList.toggle('cash-active', isCash);
  if (btnAmountMode) btnAmountMode.classList.toggle('active', !isCash);
  if (btnCashMode) btnCashMode.classList.toggle('active', isCash);
  setModeVisibility();

  if (state.mode === 'amount' && state.keypadValue) {
    const numVal = parseFloat(state.keypadValue) || 0;
    const amountNumber = document.getElementById('amountNumber');
    const ctaBtn = document.getElementById('ctaBtn');
    if (amountNumber) amountNumber.textContent = numVal ? numVal.toLocaleString('en-IN') : '0';
    if (ctaBtn && numVal > 0) {
      ctaBtn.textContent = `Pay ₹${numVal.toLocaleString('en-IN')}`;
      ctaBtn.classList.remove('disabled');
    }
  } else {
    updateUI();
  }

  const messageInput = document.getElementById('messageInput');
  if (messageInput && state.message) messageInput.value = state.message;

  btnCashMode?.addEventListener('click', () => {
    if (state.mode === 'cash') return;
    state.mode = 'cash';
    modeSwitchTrack?.classList.add('cash-active');
    btnCashMode?.classList.add('active');
    btnAmountMode?.classList.remove('active');
    const numVal = parseFloat(state.keypadValue) || 0;
    if (numVal > 0) {
      state.notes = decomposeAmount(numVal, DENOMINATIONS, MAX_NOTES);
      state.keypadValue = '';
    }
    updateUI();
    persistState();
  });

  btnAmountMode?.addEventListener('click', () => {
    if (state.mode === 'amount') return;
    state.mode = 'amount';
    modeSwitchTrack?.classList.remove('cash-active');
    btnAmountMode?.classList.add('active');
    btnCashMode?.classList.remove('active');
    state.keypadValue = '';
    updateUI();
    persistState();
  });

  const ctaBtn = document.getElementById('ctaBtn');
  const confirmOverlay = document.getElementById('confirmOverlay');
  const confirmAmount = document.getElementById('confirmAmount');
  const confirmPayBtn = document.getElementById('confirmPayBtn');
  const confirmCancelBtn = document.getElementById('confirmCancelBtn');

  ctaBtn?.addEventListener('click', () => {
    const total = state.mode === 'cash' ? state.total : (parseFloat(state.keypadValue) || 0);
    if (total <= 0) return;
    if (total > LARGE_PAYMENT) {
      if (confirmAmount) confirmAmount.textContent = `₹${formatAmount(total)}`;
      confirmOverlay?.classList.add('open');
      return;
    }
  });

  confirmCancelBtn?.addEventListener('click', () => confirmOverlay?.classList.remove('open'));
  confirmOverlay?.addEventListener('click', (e) => {
    if (e.target === confirmOverlay) confirmOverlay.classList.remove('open');
  });
  confirmPayBtn?.addEventListener('click', () => {
    confirmOverlay?.classList.remove('open');
  });

  setupNoteCards();
  setupTrayDelegation();
  setupTraySwipe();
  setupTrayClear();
  setupKeypad();
  setupMessageTags();
})();
