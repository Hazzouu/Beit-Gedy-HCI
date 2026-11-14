/* Small UI helpers: escaping, session (who is signed in, per tab), toast, modal, read-aloud. */
window.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

window.session = {
  get() { try { return JSON.parse(sessionStorage.getItem('bg-user') || 'null'); } catch (e) { return null; } },
  set(u) { try { sessionStorage.setItem('bg-user', JSON.stringify(u)); } catch (e) { /* private mode */ } }
};

window.toast = function (msg) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.add('show');
  clearTimeout(window.__toastT); window.__toastT = setTimeout(() => el.classList.remove('show'), 2600);
};

// Confirmation pop-up. buttons: [{label, kind, act}] – act is called on click.
window.modal = function ({ title, body, buttons }) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `<div class="modal-back" data-close>
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="m-title">
      <h2 id="m-title">${title}</h2><div class="modal-body">${body || ''}</div>
      <div class="modal-actions">${buttons.map((b, i) => `<button class="btn ${b.kind || 'secondary'}" data-mb="${i}">${b.label}</button>`).join('')}</div>
    </div></div>`;
  const close = () => { root.innerHTML = ''; };
  root.querySelector('[data-close]').addEventListener('click', e => { if (e.target.hasAttribute('data-close')) close(); });
  root.querySelectorAll('[data-mb]').forEach(btn => btn.addEventListener('click', () => {
    const b = buttons[+btn.dataset.mb];
    if (b.act && b.act(root) === false) return; // returning false keeps the modal open
    close();
  }));
  const first = root.querySelector('textarea, input, .btn.primary'); if (first) first.focus();
};

// Read-aloud for young readers (Gap 1, feature 7)
window.speak = function (text) {
  if (!('speechSynthesis' in window)) { toast('Read-aloud is not supported in this browser.'); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = store.get().lang === 'de' ? 'de-DE' : 'en-US'; u.rate = 0.9;
  speechSynthesis.speak(u);
};

window.langToggle = function () {
  const l = store.get().lang;
  return `<div class="lang" role="group" aria-label="Language">
    <button class="${l === 'en' ? 'on' : ''}" data-act="lang" data-v="en" aria-pressed="${l === 'en'}">EN</button>
    <button class="${l === 'de' ? 'on' : ''}" data-act="lang" data-v="de" aria-pressed="${l === 'de'}">DE</button></div>`;
};

window.chip = (label, kind) => `<span class="chip ${kind || ''}">${label}</span>`;

window.statusLabel = function (s) {
  return ({ todo: t('Not sent yet'), sent: t('Teacher is checking'), verified: t('Teacher is checking'), graded: t('Teacher is checking'), released: t('Results ready') })[s];
};

// Student status tracker: Sent → Teacher is checking → Results ready (feature 3)
window.tracker = function (status) {
  const step = { todo: 0, sent: 1, verified: 2, graded: 2, released: 3 }[status];
  const steps = [t('Sent'), t('Teacher is checking'), t('Results ready')];
  return `<ol class="tracker">${steps.map((s, i) => `<li class="${i < step ? 'done' : ''} ${step > 0 && i === step ? 'now' : ''}">${s}</li>`).join('')}</ol>`;
};

// Current total out of 10 using the teacher's decisions where made
window.totalScore = function () {
  const st = store.get(); let sum = 0;
  for (const q of DATA.exam.questions) sum += (st.grades[q.n] && st.grades[q.n].mark != null) ? st.grades[q.n].mark : DATA.exam.aiMarks[q.n];
  return sum;
};
window.fmt = n => (Number.isInteger(n) ? String(n) : (Math.floor(n) ? Math.floor(n) : '') + '½');
