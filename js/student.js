/* Student view (tablet). HTD 1 (submit an exam) and HTD 4 (results and feedback). */
(function () {
  const R = window.Routes = window.Routes || {};
  const A = window.Actions = window.Actions || {};
  const me = () => DATA.children.find(c => c.id === (session.get() || {}).id) || DATA.children[0];
  let picked = [];          // picture password being entered
  let pending = null;       // photo waiting for "Is this page N?"
  let problem = null;       // last quality problem

  function shell(active, body, opts = {}) {
    const st = store.get(); const c = me();
    const unread = st.messages.filter(m => !m.read).length;
    const nav = [['home', '🏠', t('Home')], ['exams', '📝', t('My exams')], ['results', '⭐', t('My results')], ['practice', '🎯', t('Practice')], ['messages', '💬', t('Messages')]];
    return `<div class="student ${c.grade <= 2 ? 'early' : ''}">
      <nav class="rail" aria-label="Student">
        <div class="brand">🦉<span>Beit Gedy</span></div>
        ${nav.map(([k, i, l]) => `<a href="#/student/${k}" class="${active === k ? 'on' : ''}" aria-current="${active === k ? 'page' : 'false'}"><span class="ico">${i}</span><span>${l}</span>${k === 'messages' && unread ? `<b class="badge">${unread}</b>` : ''}</a>`).join('')}
        <a href="#" data-act="signout" class="out"><span class="ico">🚪</span><span>${t('Sign out')}</span></a>
      </nav>
      <main class="s-main">
        <header class="topbar">
          ${opts.back ? `<a class="btn ghost small" href="${opts.back}">← ${t('Back')}</a>` : `<div class="hello"><span class="avatar">${c.avatar}</span> ${t('Hi')} ${esc(c.name)}!</div>`}
          <div class="spacer"></div>
          <button class="btn ghost small" data-act="askteacher">🙋 ${t('Ask teacher')}</button>
          ${langToggle()}
        </header>
        <div class="s-content">${body}</div>
      </main></div>`;
  }

  // ---------- sign in (feature 30: names + secret pictures, no typing)
  R['student/signin'] = () => `<div class="center-page student-bg">
      <a class="btn ghost small corner" href="#/">← ${t('Back')}</a><div class="corner-r">${langToggle()}</div>
      <h1>🦉 ${t('Who are you?')}</h1><p class="muted">${esc(DATA.school.className)}</p>
      <div class="names">${DATA.children.map(c => `<button class="name-card" data-act="pickname" data-id="${c.id}"><span class="big">${c.avatar}</span>${esc(c.name)}<small>${c.cls}</small></button>`).join('')}</div></div>`;
  A.pickname = el => { session.set({ role: 'student', id: el.dataset.id }); picked = []; location.hash = '#/student/pictures'; };

  R['student/pictures'] = () => {
    const c = me();
    return `<div class="center-page student-bg">
      <a class="btn ghost small corner" href="#/student/signin">← ${t('Back')}</a><div class="corner-r">${langToggle()}</div>
      <h1><span class="avatar big">${c.avatar}</span> ${esc(c.name)}</h1>
      <p>${t('Tap your 4 secret pictures')} <button class="btn ghost small" data-act="say" data-text="${esc(t('Tap your 4 secret pictures'))}">🔊 ${t('Listen')}</button></p>
      <div class="dots" aria-label="${picked.length} of 4">${[0, 1, 2, 3].map(i => `<span class="${i < picked.length ? 'on' : ''}">${picked[i] || ''}</span>`).join('')}</div>
      <div class="pics">${DATA.pictures.map(p => `<button class="pic" data-act="pic" data-p="${p}" aria-label="picture ${p}">${p}</button>`).join('')}</div>
      <div id="pic-msg" class="err" role="alert"></div>
      <div class="row center"><button class="btn secondary" data-act="clearpics">${t('Clear')}</button><button class="btn primary" data-act="checkpics" ${picked.length < 4 ? 'disabled' : ''}>${t('Sign in')}</button></div>
      <button class="link" data-act="forgot">${t('Forgot your pictures? Ask your teacher.')}</button>
      <p class="hint">Demo: Omar = 🐱 ☀️ 🍎 🚗 · Lina = ⭐ 🍎 🐱 🌳</p></div>`;
  };
  A.pic = el => { if (picked.length < 4) picked.push(el.dataset.p); render(); };
  A.clearpics = () => { picked = []; render(); };
  A.checkpics = () => {
    if (picked.join() === me().password.join()) { picked = []; location.hash = '#/student/home'; }
    else { picked = []; render(); document.getElementById('pic-msg').textContent = t('Wrong pictures – try again!'); }
  };
  A.forgot = () => toast('Ms. Sara got your message and will give you new pictures.');
  A.askteacher = () => toast(me().grade <= 2 ? 'A grown-up is on the way to help you.' : 'Ms. Sara got your message: “Omar needs help”.');
  A.say = el => speak(el.dataset.text);
  A.signout = (el, e) => { e.preventDefault(); modal({ title: 'Sign out?', body: '<p>The next child can then use this tablet.</p>', buttons: [{ label: t('Not yet') }, { label: t('Sign out'), kind: 'primary', act: () => { session.set(null); location.hash = '#/'; } }] }); };

  // ---------- home
  R['student/home'] = () => {
    const st = store.get(); const c = me();
    if (c.grade <= 2) return shell('home', `
      <h1>${t('Hi')} ${esc(c.name)}! 👋</h1>
      <div class="grid2">
        <a class="big-tile" href="#/student/early-results"><span class="emoji">⭐⭐⭐</span><b>My stars</b><small>${DATA.lina.exam} · ${DATA.lina.subject}</small><span class="chip green">New</span></a>
        <a class="big-tile" href="#/student/upload/grownup"><span class="emoji">📷</span><b>Send my exam</b><small>With a grown-up</small></a>
      </div>
      <button class="btn secondary" data-act="say" data-text="Hi ${esc(c.name)}! Tap the stars to see how you did, or the camera to send your exam with a grown-up.">🔊 ${t('Listen')}</button>`);
    const s = st.submission.status;
    return shell('home', `
      <h1>${t('Hi')} ${esc(c.name)}! 👋</h1>
      <section class="card exam-card">
        <div class="row"><div class="icon-sq">🔬</div><div class="grow"><h2>${DATA.exam.title}</h2><p class="muted">${DATA.exam.subject} · ${t('In class')} · ${DATA.exam.pages} ${t('pages')}</p></div>
        ${s === 'todo' ? `<a class="btn primary" href="#/student/upload/check">📷 ${t('Send')}</a>` : s === 'released' ? `<a class="btn primary" href="#/student/results">⭐ ${t('My results')}</a>` : chip(statusLabel(s), 'yellow')}</div>
        ${tracker(s)}
      </section>
      <div class="grid3">
        <a class="tile" href="#/student/results"><span>⭐</span>${t('My results')}</a>
        <a class="tile" href="#/student/practice"><span>🎯</span>${t('Practice')}${st.released && !st.practice.done ? ' ' + chip('New', 'green') : ''}</a>
        <a class="tile" href="#/student/messages"><span>💬</span>${t('Messages')}</a>
      </div>`);
  };
  R['student/exams'] = () => {
    const s = store.get().submission.status;
    return shell('exams', `<h1>${t('My exams')}</h1>
      <div class="list">
        <div class="card row"><div class="icon-sq">🔬</div><div class="grow"><b>${DATA.exam.title}</b><p class="muted">${DATA.exam.subject} · ${t('In class')}</p></div>${s === 'todo' ? `<a class="btn primary" href="#/student/upload/check">${t('Send')}</a>` : chip(statusLabel(s), s === 'released' ? 'green' : 'yellow')}</div>
        <div class="card row"><div class="icon-sq">🔢</div><div class="grow"><b>Shapes</b><p class="muted">Math · ${t('In class')}</p></div>${chip(t('Results ready'), 'green')}</div>
        <div class="card row"><div class="icon-sq">🌦️</div><div class="grow"><b>Jahreszeiten (Seasons)</b><p class="muted">Science · Deutsch · ${t('Take-home')}</p></div>${chip('Due Mon', 'yellow')}</div>
      </div>`);
  };
  R['student/messages'] = () => {
    const st = store.get(); if (st.messages.some(m => !m.read)) setTimeout(() => store.update(s => s.messages.forEach(m => m.read = true)), 1500);
    const msgs = st.messages.length ? st.messages.slice().reverse() : [{ text: 'No messages yet.' }];
    return shell('messages', `<h1>${t('Messages')}</h1><div class="list">${msgs.map(m => `<div class="card row"><span class="icon-sq">${m.icon || '💬'}</span><p class="grow">${esc(m.text)}</p>${m.go ? `<a class="btn primary small" href="${m.go}">${t('Open')}</a>` : ''}<button class="btn ghost small" data-act="say" data-text="${esc(m.text)}">🔊</button></div>`).join('')}</div>`);
  };

  // ---------- upload wizard (HTD 1, feature 1, Gap 2)
  R['student/upload/grownup'] = () => shell('home', `<div class="center-col"><div class="hero-emoji">🧑‍👧</div><h1>Give the tablet to a grown-up</h1>
      <p class="muted">Lina is in Grade 2, so a grown-up takes the photos with her (feature 2). The steps are the same.</p>
      <a class="btn primary" href="#/student/upload/check">I am the grown-up – start</a></div>`, { back: '#/student/home' });
  R['student/upload/check'] = () => {
    const items = [t('My name is on every page'), t('I answered all the questions'), t('My pages are in order')];
    return shell('exams', `<div class="wizard">${steps(1)}<h1>${t('Before you start')}</h1>
      <div class="list">${items.map((s, i) => `<label class="check-row"><input type="checkbox" data-act="chk" data-i="${i}"> <span>${s}</span></label>`).join('')}</div>
      <button class="btn primary" id="go-cam" data-act="startcam" disabled>${t('Next')} →</button></div>`, { back: '#/student/home' });
  };
  A.chk = () => { const all = [...document.querySelectorAll('[data-act=chk]')].every(c => c.checked); document.getElementById('go-cam').disabled = !all; };
  A.startcam = () => { store.update(s => { s.submission.pages = []; }); problem = null; location.hash = '#/student/upload/cam/1'; };

  function steps(n) { return `<ol class="steps">${['📋', '📷', '✅'].map((e, i) => `<li class="${i + 1 < n ? 'done' : ''} ${i + 1 === n ? 'now' : ''}">${e}</li>`).join('')}</ol>`; }

  R['student/upload/cam'] = (page) => {
    page = +page || 1;
    const msg = problem ? { dark: '🌙 This photo is too dark. Find more light and try again.', blurry: '🌫️ This photo is blurry. Hold the tablet still and try again.' }[problem] : '';
    return shell('exams', `<div class="wizard">${steps(2)}
      <h1>${t('Take a photo of page')} ${page}</h1>
      <div class="camera"><div class="frame"><span></span><span></span><span></span><span></span><p>Put page ${page} inside the corners</p></div></div>
      ${msg ? `<div class="problem" role="alert">${msg} <button class="btn ghost small" data-act="say" data-text="${esc(msg)}">🔊</button></div>` : ''}
      <div class="row center wrap">
        <label class="btn primary big">📷 ${t('Take photo')}<input type="file" accept="image/*" capture="environment" data-act="photo" data-page="${page}" hidden></label>
        <button class="btn secondary" data-act="sample" data-page="${page}">🖼️ ${t('Use a sample page (demo)')}</button>
        <button class="btn ghost" data-act="sampleblur" data-page="${page}">${t('Try a blurry photo (demo)')}</button>
      </div>
      <p class="hint center">The app checks every photo for light and sharpness before you continue.</p></div>`, { back: page > 1 ? '#/student/upload/cam/' + (page - 1) : '#/student/upload/check' });
  };
  async function handlePhoto(src, page) {
    const res = await Quality.analyse(src);
    if (!res.ok) { problem = res.problem; render(); return; }
    problem = null; pending = await Quality.shrink(src); location.hash = '#/student/upload/confirm/' + page;
  }
  A.photo = async el => { const f = el.files && el.files[0]; if (!f) return; toast('Checking your photo…'); await handlePhoto(await Quality.fileToDataURL(f), +el.dataset.page); };
  A.sample = async el => { await handlePhoto(await Quality.samplePage(+el.dataset.page, false), +el.dataset.page); };
  A.sampleblur = async el => { await handlePhoto(await Quality.samplePage(+el.dataset.page, true), +el.dataset.page); };

  R['student/upload/confirm'] = (page) => {
    page = +page; if (!pending) { location.hash = '#/student/upload/cam/' + page; return ''; }
    return shell('exams', `<div class="wizard">${steps(2)}
      <div class="confirm"><img src="${pending}" alt="Photo of page ${page}"><div>
        <h1>${t('Is this page')} ${page}?</h1>${chip('✓ We can read it', 'green')}
        <button class="btn ghost small" data-act="say" data-text="${t('Is this page')} ${page}?">🔊 ${t('Listen')}</button>
        <div class="col"><button class="btn primary big" data-act="keeppage" data-page="${page}">👍 ${t('Yes, it is!')}</button>
        <a class="btn secondary" href="#/student/upload/cam/${page}">🔄 ${t('Take it again')}</a></div></div></div></div>`);
  };
  A.keeppage = el => {
    const page = +el.dataset.page; const img = pending; pending = null;
    store.update(s => { s.submission.pages[page - 1] = img; });
    const req = store.get().submission.requestedPage;
    if (req) { location.hash = '#/student/upload/review'; return; }
    location.hash = page < DATA.exam.pages ? '#/student/upload/cam/' + (page + 1) : '#/student/upload/review';
  };
  R['student/upload/review'] = () => {
    const pages = store.get().submission.pages;
    return shell('exams', `<div class="wizard">${steps(3)}<h1>${t('Are these your pages?')}</h1>
      <div class="thumbs">${pages.map((p, i) => `<figure class="thumb"><span class="num">${i + 1}</span>${p ? `<img src="${p}" alt="Page ${i + 1}">` : '<div class="noimg">📄</div>'}
        <figcaption><button class="icon-btn" data-act="movepage" data-i="${i}" data-d="-1" ${i === 0 ? 'disabled' : ''} aria-label="Move left">◀</button>
        <a class="icon-btn" href="#/student/upload/cam/${i + 1}" aria-label="Take again">🔄</a>
        <button class="icon-btn" data-act="delpage" data-i="${i}" aria-label="Remove page">🗑️</button>
        <button class="icon-btn" data-act="movepage" data-i="${i}" data-d="1" ${i === pages.length - 1 ? 'disabled' : ''} aria-label="Move right">▶</button></figcaption></figure>`).join('')}
        <a class="thumb add" href="#/student/upload/cam/${pages.length + 1}">＋<br>${t('Add page')}</a></div>
      ${pages.length < DATA.exam.pages ? `<div class="problem">📄 A page is missing: this exam has ${DATA.exam.pages} pages.</div>` : ''}
      <button class="btn primary big" data-act="submit" ${pages.length < DATA.exam.pages ? 'disabled' : ''}>📤 ${t('Submit')}</button></div>`, { back: '#/student/upload/cam/' + Math.max(1, pages.length) });
  };
  A.movepage = el => { const i = +el.dataset.i, d = +el.dataset.d; store.update(s => { const p = s.submission.pages; [p[i], p[i + d]] = [p[i + d], p[i]]; }); render(); };
  A.delpage = el => { store.update(s => s.submission.pages.splice(+el.dataset.i, 1)); render(); };
  A.submit = () => modal({ title: 'Send your pages to Ms. Sara?', body: `<p>${store.get().submission.pages.length} pages · ${DATA.exam.title}</p>`, buttons: [{ label: t('Not yet') }, { label: t('Send'), kind: 'primary', act: () => {
    location.hash = '#/student/upload/sending';
    setTimeout(() => { store.update(s => { const again = s.submission.requestedPage; s.submission.status = 'sent'; s.submission.sentAt = Date.now(); s.submission.sample = false; s.submission.requestedPage = null; if (again) s.messages.push({ text: 'Your new photo of page ' + again + ' was sent.', icon: '📷', read: true }); }); location.hash = '#/student/upload/done'; }, 1300);
  } }] });
  R['student/upload/sending'] = () => shell('exams', `<div class="center-col"><div class="spinner"></div><h1>${t('Sending…')}</h1></div>`);
  R['student/upload/done'] = () => shell('exams', `<div class="center-col"><div class="hero-emoji">🎉</div><h1>${t('Submitted!')}</h1>
      <p class="muted">Ms. Sara now checks what the app read from your pages.</p>${tracker('sent')}
      <div class="row center"><a class="btn secondary" href="#/student/home">🏠 ${t('Home')}</a><button class="btn primary" data-act="signout">${t('Sign out')}</button></div></div>`);

  // ---------- results (HTD 4, features 5–9, 12)
  R['student/results'] = () => {
    const st = store.get();
    if (!st.released) return shell('results', `<div class="center-col"><div class="hero-emoji">⏳</div><h1>${t('Results not ready yet')}</h1><p class="muted">${t('Your teacher is still checking.')}</p>${tracker(st.submission.status)}</div>`);
    const total = totalScore(); const flag = st.flag.status === 'confirmed';
    return shell('results', `
      <div class="row"><h1 class="grow">${DATA.exam.title}</h1>${chip('✓ Checked by Ms. Sara', 'green')}</div>
      <div class="grid2">
        <section class="card"><p class="muted">Your mark</p><div class="score">${fmt(total)} / 10</div><p class="up">▲ +1 since your last Science quiz</p>
          <div class="note"><p>“${esc(st.feedback.note)}”</p><button class="btn ghost small" data-act="say" data-text="${esc(st.feedback.note)}">🔊 ${t('Listen')}</button></div>
          ${st.practice.comment ? `<div class="note tnote"><b>Ms. Sara:</b> ${esc(st.practice.comment)} <button class="btn ghost small" data-act="say" data-text="${esc(st.practice.comment)}">🔊</button></div>` : ''}</section>
        <section class="card"><p class="muted">Skills</p>
          ${skillBar('Animals and food', 4)}${skillBar('Food chains', 1, flag)}${skillBar('Life cycles', 3)}
          ${flag ? `<div class="flag">🚩 <b>Food chains</b> – same mistake again. ${chip('Confirmed by Ms. Sara', 'red')}</div>` : ''}</section>
      </div>
      <div class="row wrap"><a class="btn primary" href="#/student/mistakes">🔍 ${t('My mistakes')}</a><a class="btn secondary" href="#/student/practice">🎯 ${t('Practise')}</a></div>`);
  };
  function skillBar(name, level, warn) { return `<div class="skill"><span>${name}</span><span class="steps5">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= level ? (warn ? 'warn' : 'on') : ''}"></i>`).join('')}</span></div>`; }
  R['student/mistakes'] = () => {
    const st = store.get(); if (!st.released) { location.hash = '#/student/results'; return ''; }
    const wrong = DATA.exam.questions.filter(q => { const g = st.grades[q.n]; const m = g && g.mark != null ? g.mark : DATA.exam.aiMarks[q.n]; return m < 1; });
    return shell('results', `<h1>${t('My mistakes')} (${wrong.length})</h1><div class="list">${wrong.map(q => {
      const text = (st.verify[q.n] && st.verify[q.n].text) || q.wrote; const note = st.feedback.notes[q.n] || '';
      return `<section class="card mistake"><h3>${q.n}. ${esc(q.q)}</h3><div class="grid2"><div class="ans bad"><small>${t('Your answer')}</small><span class="hand">${esc(text)}</span></div><div class="ans good"><small>${t('Right answer')}</small><span class="hand">${esc(q.scheme)}</span></div></div>
      ${note ? `<p class="why">💡 ${esc(note)} <button class="btn ghost small" data-act="say" data-text="${esc(note)}">🔊 ${t('Listen')}</button></p>` : ''}</section>`; }).join('')}</div>
      <a class="btn primary" href="#/student/practice">🎯 ${t('Practise')}</a>`, { back: '#/student/results' });
  };

  // ---------- practice (feature 10)
  R['student/practice'] = (i) => {
    const st = store.get();
    if (!st.released) return shell('practice', `<div class="center-col"><div class="hero-emoji">🎯</div><h1>No practice yet</h1><p class="muted">Ms. Sara sets practice when she releases your results.</p></div>`);
    if (st.practice.done && i == null) return shell('practice', `<div class="center-col"><div class="hero-emoji">🏆</div><h1>Practice done!</h1><p class="muted">Food chains · 2 of 2 right. Ms. Sara and your parent can see it.</p><a class="btn secondary" href="#/student/practice/0">Do it again</a></div>`);
    const n = +(i || 0); const q = DATA.practice[n]; if (!q) return '';
    const a = st.practice.answers[n];
    return shell('practice', `<p class="muted">Food chains · ${n + 1} / ${DATA.practice.length}</p><h1>${esc(q.q)} <button class="btn ghost small" data-act="say" data-text="${esc(q.q)}">🔊</button></h1>
      <div class="options">${q.options.map((o, k) => `<button class="option ${a && a.pick === k ? (k === q.answer ? 'right' : 'wrong') : ''}" data-act="answer" data-n="${n}" data-k="${k}">${o}</button>`).join('')}</div>
      ${a ? (a.pick === q.answer ? `<div class="feedback right">✅ Correct!</div><button class="btn primary" data-act="nextq" data-n="${n}">${t('Next')} →</button>` : `<div class="feedback wrong">Not quite – ${esc(q.hint)} Try again!</div>`) : ''}`);
  };
  A.answer = el => { const n = +el.dataset.n, k = +el.dataset.k; store.update(s => { s.practice.answers[n] = { pick: k, tries: ((s.practice.answers[n] || {}).tries || 0) + 1 }; }); render(); };
  A.nextq = el => { const n = +el.dataset.n; if (n + 1 < DATA.practice.length) location.hash = '#/student/practice/' + (n + 1); else { store.update(s => { s.practice.done = true; }); location.hash = '#/student/practice'; } };

  // ---------- Grades 1–2 results (Gap 1: stars, pictures, read-aloud)
  R['student/early-results'] = () => shell('results', `<div class="center-col"><h1>My stars ⭐</h1>
      <div class="stars">${'⭐'.repeat(DATA.lina.stars)}<span class="dim">${'⭐'.repeat(DATA.lina.of - DATA.lina.stars)}</span></div>
      <p class="muted">${DATA.lina.exam} · ${DATA.lina.subject}</p>
      <button class="btn primary big" data-act="say" data-text="Well done Lina! You got 3 stars in shapes. Let's play the triangle game!">🔊 ${t('Listen')}</button>
      <a class="btn secondary" href="#/student/early-play">🎮 Play</a></div>`, { back: '#/student/home' });
  R['student/early-play'] = () => shell('practice', `<div class="center-col"><h1>Tap the triangle <button class="btn ghost small" data-act="say" data-text="Tap the triangle">🔊</button></h1>
      <div class="options shapes"><button class="option" data-act="shape" data-ok="0">⚪</button><button class="option" data-act="shape" data-ok="1">🔺</button><button class="option" data-act="shape" data-ok="0">⬛</button></div><div id="shape-msg"></div></div>`, { back: '#/student/early-results' });
  A.shape = el => { const ok = el.dataset.ok === '1'; document.getElementById('shape-msg').innerHTML = ok ? '<div class="feedback right">🎉 Great job!</div>' : '<div class="feedback wrong">Oops – try again!</div>'; speak(ok ? 'Great job!' : 'Oops, try again!'); };
})();
