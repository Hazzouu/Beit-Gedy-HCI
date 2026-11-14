/* Router and event wiring. Routes are '#/<view>/<page>/<param>'. */
(function () {
  const R = window.Routes; const A = window.Actions;

  R[''] = () => {
    const s = store.get().submission.status;
    return `<div class="landing"><div class="corner-r">${langToggle()}</div>
      <header><div class="logo-big">🦉</div><h1>Beit Gedy</h1><p>AI-assisted exam assessment for Grades 1–5 – the AI reads and suggests, the teacher checks, decides and releases.</p></header>
      <div class="roles">
        <a class="role" href="#/student/signin"><span>🧒</span><b>Student</b><small>Tablet · send an exam, see results, practise</small></a>
        <a class="role" href="#/teacher/signin"><span>👩🏻‍🏫</span><b>Teacher</b><small>Desktop · check the text, review AI grades and flags, release</small></a>
        <a class="role" href="#/parent/signin"><span>👪</span><b>Parent</b><small>Phone · results, teacher notes, practice at home (bonus)</small></a>
      </div>
      <section class="card how"><h2>Try the whole story</h2><ol>
        <li><b>Student</b> – Omar (pictures 🐱 ☀️ 🍎 🚗) sends the Animals quiz: photos are checked for light and sharpness, then “Is this page 1?”.</li>
        <li><b>Teacher</b> – Ms. Sara checks the 3 spotlight answers, approves the text, decides the AI marks, approves feedback, confirms the red flag and releases.</li>
        <li><b>Student</b> – Omar sees his result, his mistakes (with read-aloud) and practises food chains.</li>
        <li><b>Parent</b> – sees only what was released: result, red flag with evidence, practice status.</li></ol>
        <p class="muted">Tip: open the student and teacher views in two tabs – they update each other live. Current state: <b>${esc(s)}</b>.</p>
        <button class="btn secondary small" data-act="reset">Reset the demo</button></section>
      <footer class="muted">CSEN 909 Human Computer Interaction · Team Beit Gedy · mock OCR and AI (allowed by the brief)</footer></div>`;
  };
  A.reset = () => modal({ title: 'Reset the demo?', body: '<p>All views go back to the start (Omar has not sent his quiz yet).</p>', buttons: [{ label: t('Cancel') }, { label: 'Reset', kind: 'primary', act: () => { store.reset(); session.set(null); location.hash = '#/'; render(); toast('Demo reset.'); } }] });
  A.lang = el => { store.set({ lang: el.dataset.v }); document.documentElement.lang = el.dataset.v; };

  const open = ['', 'student/signin', 'student/pictures', 'teacher/signin', 'parent/signin'];
  function resolve() {
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    for (let n = parts.length; n >= 0; n--) {
      const key = parts.slice(0, n).join('/');
      if (R[key]) return { key, fn: R[key], args: parts.slice(n) };
    }
    return { key: '', fn: R[''], args: [] };
  }
  window.render = function () {
    const { key, fn, args } = resolve(); const u = session.get(); const role = key.split('/')[0];
    if (!open.includes(key) && role && (!u || u.role !== role)) {
      if (!(role === 'student' && key === 'student/pictures')) { location.hash = '#/' + role + '/signin'; return; }
    }
    const html = fn(...args);
    if (html === '' || html == null) return; // route redirected
    const app = document.getElementById('app');
    app.innerHTML = html;
    app.className = 'view-' + (role || 'home');
    document.title = 'Beit Gedy · ' + (role ? role[0].toUpperCase() + role.slice(1) : 'Home');
  };

  let queued = false;
  store.subscribe(() => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; const a = document.activeElement; if (a && (a.tagName === 'TEXTAREA' || (a.tagName === 'INPUT' && a.type !== 'checkbox' && a.type !== 'radio' && a.type !== 'file'))) return; render(); }); });
  window.addEventListener('hashchange', () => { window.scrollTo(0, 0); render(); });

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (!el || el.tagName === 'FORM' || el.tagName === 'INPUT') return;
    const f = A[el.dataset.act]; if (f) f(el, e);
  });
  document.addEventListener('change', e => { const el = e.target.closest('input[data-act]'); if (el && A[el.dataset.act]) A[el.dataset.act](el, e); });
  document.addEventListener('submit', e => { const el = e.target.closest('form[data-act]'); if (el && A[el.dataset.act]) A[el.dataset.act](el, e); });
  document.documentElement.lang = store.get().lang;
  render();
})();
