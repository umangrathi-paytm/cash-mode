# Smart Spending Mode — Refactor Summary

## What Changed

### 1. File structure
- **index.html** — Structure only; order of sections updated; links to external CSS and JS.
- **styles.css** — All styles in one file (base, layout, components, modes). Note colours slightly desaturated; wallet spent animation; badge position and halo; note minus button; ripple; tray scroll and swipe; entry cue; `#cashOnly` for mode visibility.
- **scripts/state.js** — Single state object, constants (`MAX_NOTES`, `DAILY_LIMIT`, `LARGE_PAYMENT`, `LONG_PRESS_MS`, `REGRET_THRESHOLD`), `DENOMINATIONS`, `WALLET_NOTES`.
- **scripts/utils.js** — `formatAmount`, `decomposeAmount`, `getRegretEquivalents` (threshold-based, top 2–3, correct pluralisation).
- **scripts/storage.js** — `persistState()`, `restoreState()` for `cashNotes`, `activeMode`, `keypadValue`, `message`.
- **scripts/render.js** — `updateAmountDisplay`, `renderWalletSection`, `renderRegretPreview`, `renderTray`, `updateNoteBadges`, `setModeVisibility`, `updateUI()`.
- **scripts/interactions.js** — `addNote` / `removeNote`, `showRipple`, note card tap / minus / long-press (700 ms), tray delegation and swipe, keypad, message tags, tray clear.
- **scripts/app.js** — Init, restore state, mode switch (Amount ↔ Cash), CTA and confirm modal.
- **manifest.json** — PWA manifest (name, theme_color, start_url, display standalone).

### 2. Information architecture (Cash Mode)
- **Order:** Top bar → Payee → Smart Spending Mode card → Amount display → Remaining wallet (wallet + streak) → Denomination grid → Regret preview → Payment tray → Message → CTA.
- **Wallet:** Label “Today’s cash wallet” → “Today’s spending allowance”; microcopy “Daily spending allowance ₹2,000”.
- **Amount Mode:** Only top bar, payee, mode toggle, amount, keypad, CTA. Wallet, streak, denom grid, regret, tray, and message are inside `#cashOnly` and hidden (no blank space).

### 3. Behaviour and copy
- Amount helper: “You’re counting this payment like cash” → “Paying like cash”.
- Below amount (Cash Mode only): “₹X left today” (live).
- Streak: “3 Day Streak” → “3 Day Smart Spending Streak”; “You spent ₹850 less than usual” → “You stayed under your daily budget”.
- Regret: Shown only from ₹300; title “THIS EQUALS” → “This payment could buy”; threshold bands (₹300–999: auto rides, lunches, movie tickets; ₹1000+: groceries, fuel, dinner, OTT month); top 2–3 items; correct pluralisation.
- Wallet depletion: Spent notes use `opacity: 0.15`, `transform: translateY(4px) scale(0.9)` with transition.

### 4. Note interactions
- **Tap note:** Add one; soft ripple at tap location.
- **Inline minus:** When count > 0, a minus control appears near the count badge; tap to remove one (primary removal).
- **Long-press:** 700 ms on note removes one (secondary); optional short vibration.
- **Badge:** Moved in (top/right 8px), halo (`box-shadow` with `var(--bg)`), smaller for ₹5/₹2/₹1.

### 5. Payment tray
- Tray items list: `max-height: 160px`, internal vertical scroll; total row fixed below.
- Swipe-left on a tray row reveals remove; swipe past threshold removes one of that denomination.

### 6. Technical
- **localStorage:** Persists `cashNotes`, `activeMode`, `keypadValue`, `message`. Restored on load.
- **PWA:** `<link rel="manifest">`, `<meta name="theme-color">`, `manifest.json` (no service worker).

### 7. Discovery and India UX
- Entry cue on mode card: “Want to control daily spending? Try spending like cash for a week.”
- Regret equivalents and copy tuned for Indian context (auto, lunch, groceries, fuel, OTT, dinner).
- Plain language; no jargon.

### 8. Design
- Note tints desaturated ~15%; same denomination identity, calmer look.
- No nudge bar; “left today” and regret preview carry the behavioural context.

---

## Testing checklist

- [ ] **Cash Mode – add note:** Tap a note; count and amount increase; badge and tray update.
- [ ] **Cash Mode – remove via inline minus:** With count > 0, tap minus on note; count and amount decrease.
- [ ] **Cash Mode – long-press remove:** Long-press (~700 ms) on a note with count > 0; one removed.
- [ ] **Tray scroll:** Add many notes so tray has more than a few rows; tray list scrolls, total stays fixed at bottom.
- [ ] **Tray swipe to remove:** Swipe a tray row left; “Remove” appears; swipe far enough to remove one of that denomination.
- [ ] **Amount Mode – minimal layout:** Switch to Amount Mode; only top bar, payee, mode card, amount, keypad, CTA visible; no wallet, streak, grid, regret, tray, message.
- [ ] **localStorage:** Add notes or set amount/mode/message; refresh; state (notes, mode, keypad value, message) restored.
- [ ] **Regret thresholds:** In Cash Mode, set amount &lt; ₹300 → no regret block; ₹300–999 → e.g. auto/lunch/movie; ₹1000+ → e.g. groceries/fuel/dinner/OTT; only 2–3 items; pluralisation correct (e.g. “2 lunches”).
- [ ] **PWA:** In supported browser, manifest and theme-color present; install/add-to-home available if applicable.
