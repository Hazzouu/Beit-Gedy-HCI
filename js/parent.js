/* Parent view (phone, bonus). Features 25–29, HTD 5. Only teacher-released results are shown. */
(function () {
  const R = window.Routes; const A = window.Actions;
  const P = s => t(s, store.get().parentLang);   // parent's own display language (feature 26)
  const child = () => (session.get() || {}).child || 'omar';
  const rtl = () => store.get().parentLang === 'ar' ? ' dir="rtl"' : '';

  function shell(title, body, back) {
    return `<div class="parent"${rtl()}><div class="phone">
      <header class="topbar">${back ? `<a class="btn ghost small" href="${back}">← ${P('Back')}</a>` : '<b class="logo">🦉 Beit Gedy</b>'}<b class="grow">${title}</b>${langToggle()}</header>
      <div class="p-content">${body}</div></div></div>`;
  }
  R['parent/signin'] = () => `<div class="parent"><div class="phone"><header class="topbar"><a class="btn ghost small" href="#/">← ${P('Back')}</a><b class="grow">${P('Sign in')}</b>${langToggle()}</header>
    <form class="p-content" data-act="psignin"><h1>Welcome, Omar’s and Lina’s parent</h1><p class="muted">See what your children’s teachers have checked and released, and help them practise at home.</p>
      <div class="seg"><a href="#/teacher/signin">Teacher</a><a class="on" href="#/parent/signin">Parent</a></div>
      <label>Email or phone<input class="input" value="omar.parent@mail.com"></label><label>Password<input class="input" type="password" value="demo-password"></label>
      <button class="btn primary" type="submit">${P('Sign in')}</button>
      <p class="hint">Your account was linked to your children by the teacher’s invite. Children never sign in here – they use their secret pictures.</p></form></div></div>`;
  A.psignin = (el, e) => { e.preventDefault(); session.set({ role: 'parent', child: 'omar' }); location.hash = '#/parent/home'; };
  A.child = el => { session.set({ role: 'parent', child: el.dataset.c }); render(); };

  R['parent/home'] = () => {
    const st = store.get(); const c = child(); const L = { en: 'English', de: 'Deutsch', ar: 'العربية' }[st.parentLang];
    const sw = `<p class="muted small">${P('Your children')}</p><div class="row">${['omar', 'lina'].map(k => `<button class="pill ${c === k ? 'on' : ''}" data-act="child" data-c="${k}">${k === 'omar' ? 'Omar · 4B' : 'Lina · 2A'}</button>`).join('')}</div>
      <a class="card row lang-row" href="#/parent/language"><span>🌐</span><div class="grow"><b>${P('App language')}: ${L}</b><small class="muted">${P('Exams stay in their own language (English or German).')}</small></div><span class="link">Change</span></a>`;
    if (c === 'lina') return shell(P('Home'), sw + `
      <section class="card"><div class="row"><small class="muted grow">${P('Latest result')}</small>${chip('Checked by her teacher', 'green')}</div><b>Shapes · Math · exam in English</b><div class="stars small">⭐⭐⭐<span class="dim">⭐</span></div><small class="muted">3 of 4 stars – Lina sees stars instead of a mark (Grade 2).</small></section>
      <div class="ok">✅ ${P('No flags – nothing needs your attention.')}</div>
      <section class="card"><div class="row"><small class="muted grow">Take-home exam</small>${chip('Waiting for you', 'yellow')}</div><p>Lina is in Grade 2, so you take the photos with her on the home tablet.</p><button class="btn primary" data-act="helplina">Help Lina send it</button></section>
      <section class="card"><div class="row"><small class="muted grow">${P('Practice at home')}</small>${chip(P('Done'), 'green')}</div><p>Play: tap the triangle (Shapes) · finished with 3 stars</p></section>
      <button class="btn secondary" data-act="psignout">${P('Sign out')}</button>`);
    if (!st.released) return shell(P('Home'), sw + `<section class="card"><div class="row"><small class="muted grow">${P('Latest result')}</small>${chip(P('Not released yet'), 'yellow')}</div><b>${DATA.exam.title} · Science</b><p class="muted">${P('The teacher is still checking this exam.')}</p></section>
      ${progress(false)}<p class="hint">${P('You only see results after the teacher has checked and released them.')}</p><button class="btn secondary" data-act="psignout">${P('Sign out')}</button>`);
    const flag = st.flag.status === 'confirmed';
    return shell(P('Home'), sw + `
      <section class="card"><div class="row"><small class="muted grow">${P('Latest result')}</small>${chip('Checked by Ms. Sara', 'green')}</div><b>${DATA.exam.title} · Science · exam in English</b><div class="score" dir="ltr">${fmt(totalScore())} / 10</div><small class="muted">+1 since the last Science quiz</small></section>
      ${progress(true)}
      ${flag ? `<section class="card flagcard">${chip(P('Needs support') + ' · confirmed by Ms. Sara', 'red')}<h3>Food chains</h3><p class="muted">Same mistake in two quizzes, also after office hours and a worksheet.</p><a class="btn primary" href="#/parent/note">${P('Teacher’s note and why')}</a></section>` : `<div class="ok">✅ ${P('No flags – nothing needs your attention.')}</div>`}
      <section class="card"><div class="row"><small class="muted grow">${P('Practice at home')}</small>${st.practice.done ? chip(P('Done'), 'green') : chip(P('Not done yet'), 'yellow')}</div><b>Food chains · 2 picture questions · due Friday</b><a class="btn secondary" href="#/parent/practice">${P('See the practice')}</a></section>
      <p class="hint">${P('You only see results after the teacher has checked and released them.')}</p><button class="btn secondary" data-act="psignout">${P('Sign out')}</button>`);
  };
  function progress(withNew) {
    const rows = [['Weather · Sep', 6], ['Plants · Oct', 7]].concat(withNew ? [['Animals · Nov', totalScore()]] : []);
    return `<section class="card"><small class="muted">${P('Progress')} · Science</small>${rows.map(([l, v]) => `<div class="pbar"><span>${l}</span><i><b style="width:${v * 10}%"></b></i><span>${fmt(v)}/10</span></div>`).join('')}</section>`;
  }
  A.helplina = () => { session.set({ role: 'student', id: 'lina' }); location.hash = '#/student/upload/grownup'; toast('Switched to Lina’s tablet view.'); };
  A.psignout = () => { session.set(null); location.hash = '#/'; };

  R['parent/note'] = () => { const st = store.get(); if (!st.released || st.flag.status !== 'confirmed') { location.hash = '#/parent/home'; return ''; }
    return shell('Food chains', `<section class="card"><b>👩🏻‍🏫 Note from Ms. Sara · Science</b><p>Omar made the same food-chain mistake in two quizzes, also after office hours and a worksheet. I have set a short practice. Please help him at home: “A food chain always starts with a plant.”</p><small class="muted">${st.flag.emailed ? 'Also sent to you by email' : ''}</small></section>
      <section class="card"><div class="row"><b class="grow">Why Ms. Sara confirmed it</b>${chip('Strong evidence', 'red')}</div>
        <div class="paper"><small>Plants quiz · 20 Oct · Q4</small><p class="pq">What comes first in a food chain?</p><p class="hand">fox</p></div>
        <div class="paper"><small>Animals quiz · Q2</small><p class="pq">Put the food chain in order.</p><p class="hand">fox → rabbit → grass</p></div>
        <small class="muted">Extra help already given: ${st.flag.help.map(h => esc(h.what) + ' (' + esc(h.when) + ')').join(' · ')}</small></section>
      <div class="tip">💡 At home: ask Omar what a rabbit eats, then what eats the rabbit. Start every chain with a plant.</div>
      <a class="btn primary" href="#/parent/practice">${P('See the practice')}</a>`, '#/parent/home'); };
  R['parent/practice'] = () => { const st = store.get(); const done = st.practice.done;
    return shell(P('Practice at home'), `<section class="card"><div class="row"><b class="grow">Food chains</b>${done ? chip(P('Done'), 'green') : chip(P('Not done yet'), 'yellow')}</div><small class="muted">Set by Ms. Sara · 2 picture questions · about 5 minutes · due Friday</small>
      ${DATA.practice.map((q, i) => { const a = st.practice.answers[i]; return `<div class="row qrow"><span class="grow">Question ${i + 1} · ${esc(q.q)}</span><small>${a && a.pick === q.answer ? (a.tries > 1 ? 'Right after a hint' : 'Right') : a ? 'Trying' : 'Not started'}</small></div>`; }).join('')}</section>
      <div class="tip"><b>How to help</b><br>Let Omar answer on his own first. If he gets a hint, ask him to explain why the plant comes first.</div>
      <button class="btn primary" data-act="openomar">Open Omar’s practice (his screen)</button>`, '#/parent/home'); };
  A.openomar = () => { session.set({ role: 'student', id: 'omar' }); location.hash = '#/student/practice'; };
  R['parent/language'] = () => { const cur = store.get().parentLang;
    return shell(P('App language'), `<h2>Choose the language of the app</h2><p class="muted">This only changes the words in the parent view. Your children’s exams stay in the language they were written in (English or German), and their own screens follow their EN/DE switch.</p>
      ${[['en', 'English'], ['de', 'Deutsch · German'], ['ar', 'العربية · Arabic']].map(([k, l]) => `<button class="card row option-row ${cur === k ? 'on' : ''}" data-act="plang" data-v="${k}"><b class="grow">${l}</b>${cur === k ? '✓' : ''}</button>`).join('')}`, '#/parent/home'); };
  A.plang = el => { store.set({ parentLang: el.dataset.v }); location.hash = '#/parent/home'; };
})();
