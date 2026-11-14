/* Teacher view (desktop). HTD 2 (verify the text) and HTD 3 (grades, gaps, flags, release).
   Features 12–24: the AI only suggests; nothing reaches the student or parent before release. */
(function () {
  const R = window.Routes; const A = window.Actions;
  const E = DATA.exam;
  const SPOT = [6, 1, 7];
  const st = () => store.get();
  const order = ['todo', 'sent', 'verified', 'graded', 'released'];
  const atLeast = s => order.indexOf(st().submission.status) >= order.indexOf(s);

  function shell(active, crumbs, body) {
    return `<div class="teacher">
      <nav class="sidebar" aria-label="Teacher">
        <div class="brand">🦉<div><b>Beit Gedy</b><small>Teacher</small></div></div>
        <a href="#/teacher/today" class="${active === 'today' ? 'on' : ''}">🏠 ${t('Today')}</a>
        <a href="#/teacher/exam" class="${active === 'exam' ? 'on' : ''}">📝 ${t('Exams')}</a>
        <a href="#/teacher/scheme" class="${active === 'scheme' ? 'on' : ''}">📋 ${t('Mark scheme')}</a>
        <a href="#/teacher/history" class="${active === 'history' ? 'on' : ''}">👥 ${t('Students')}</a>
        <div class="grow"></div>
        <div class="me"><span class="avatar">👩🏻‍🏫</span><div><b>${DATA.teacher.name}</b><small>4B · Science</small></div></div>
        <a href="#" data-act="tsignout">🚪 ${t('Sign out')}</a>
      </nav>
      <main class="t-main">
        <header class="topbar"><button class="btn ghost small" data-act="back">← ${t('Back')}</button>
          <div class="crumbs">${crumbs.map(esc).join(' <span>/</span> ')}</div><div class="spacer"></div>${langToggle()}</header>
        <div class="t-content">${body}</div>
      </main></div>`;
  }
  A.back = () => history.back();
  A.tsignout = (el, e) => { e.preventDefault(); modal({ title: 'Sign out?', body: '<p>Your work is saved. Children’s tablets stay in the class.</p>', buttons: [{ label: 'Stay' }, { label: t('Sign out'), kind: 'primary', act: () => { session.set(null); location.hash = '#/'; } }] }); };

  // ---------- sign in (feature 30)
  R['teacher/signin'] = () => `<div class="center-page teacher-bg"><a class="btn ghost small corner" href="#/">← ${t('Back')}</a><div class="corner-r">${langToggle()}</div>
    <form class="card signin" data-act="tsignin"><h1>🦉 Beit Gedy</h1><p class="muted">Grade faster. Stay in control. The app reads and suggests – you check, decide and release.</p>
      <div class="seg"><a class="on" href="#/teacher/signin">Teacher</a><a href="#/parent/signin">Parent</a></div>
      <label>School email<input type="email" value="${DATA.teacher.email}" required></label>
      <label>Password<input type="password" value="demo-password" required></label>
      <button class="btn primary" type="submit">${t('Sign in')}</button>
      <p class="hint">Children never sign in here: they tap their name and secret pictures on the class tablet.</p></form></div>`;
  A.tsignin = (el, e) => { e.preventDefault(); session.set({ role: 'teacher', id: 'sara' }); location.hash = '#/teacher/today'; };

  // ---------- dashboard (feature 12)
  R['teacher/today'] = () => {
    const s = st().submission.status;
    const need = s === 'sent' ? `<div class="card row alert"><span class="icon-sq">📷</span><div class="grow"><b>Omar sent ${E.title}</b><p class="muted">3 answers to look at in the spotlight</p></div><a class="btn primary" href="#/teacher/verify/6">${t('Check')}</a></div>`
      : s === 'todo' ? `<div class="card row"><span class="icon-sq">⏳</span><div class="grow"><b>Waiting for Omar’s ${E.title}</b><p class="muted">Send it from the student view, or use the demo submission.</p></div><button class="btn secondary" data-act="demosub">Use demo submission</button></div>`
      : `<div class="card row"><span class="icon-sq">✅</span><div class="grow"><b>Nothing urgent</b><p class="muted">Omar’s quiz: ${s === 'released' ? 'released' : 'in review'}.</p></div><a class="btn secondary" href="#/teacher/exam">${t('Open')}</a></div>`;
    return shell('today', [t('Today')], `<h1>Good morning, ${DATA.teacher.name}</h1><p class="muted">${DATA.school.className} · ${DATA.school.size} children · Science</p>
      <h2>Needs you now</h2>${need}
      <h2>All exams</h2><div class="list">
        <div class="card row"><span class="icon-sq">🔬</span><div class="grow"><b>${E.title}</b><p class="muted">Science · paper exam · ${E.date}</p></div>${chip(counts().sent + ' / 28 sent')}<a class="btn primary" href="#/teacher/exam">${t('Open')}</a></div>
        <div class="card row"><span class="icon-sq">🌦️</span><div class="grow"><b>Jahreszeiten (Seasons)</b><p class="muted">Science · Deutsch · take-home · due Mon</p></div>${chip('12 / 28 sent')}<button class="btn secondary" data-act="todo">${t('Open')}</button></div>
      </div>`);
  };
  A.todo = () => toast('Only the Animals quiz is part of this demo.');
  A.demosub = async () => { toast('Making Omar’s demo photos…'); const p1 = await Quality.samplePage(1), p2 = await Quality.samplePage(2);
    store.update(s => { s.submission.pages = [await0(p1), await0(p2)]; s.submission.status = 'sent'; s.submission.sample = true; }); render(); };
  const await0 = x => x;

  function counts() {
    const s = st().submission.status; const i = order.indexOf(s);
    return { sent: 26 + (i >= 1 ? 1 : 0), checked: 24 + (i >= 2 ? 1 : 0), graded: 23 + (i >= 3 && allDecided() ? 1 : 0), released: i >= 4 ? 1 : 0 };
  }
  function omarRow() {
    const s = st().submission.status;
    const map = { todo: [t('Missing'), 'red', 'Not sent yet', `<button class="btn secondary small" data-act="remind" data-n="Omar">${t('Remind')}</button>`],
      sent: [t('Text to check'), 'yellow', '3 answers to look at', `<a class="btn primary small" href="#/teacher/verify/6">${t('Check')}</a>`],
      verified: [t('Text checked'), 'teal', 'AI is grading', ''],
      graded: [allDecided() ? t('Graded') : 'Grades to review', allDecided() ? 'green' : 'yellow', toDecide() + ' marks to decide', `<a class="btn primary small" href="#/teacher/grades">Review</a>`],
      released: [t('Released'), 'green', 'Omar and his parent notified', `<a class="btn secondary small" href="#/teacher/history">${t('History')}</a>`] }[s];
    return `<tr class="me-row"><td>🧒 <b>Omar</b></td><td>${chip(map[0], map[1])}</td><td>${map[2]}</td><td>${map[3]}</td></tr>`;
  }
  R['teacher/exam'] = () => {
    const c = counts(); const rem = st().reminders;
    const rows = DATA.classmates.map(m => {
      const m2 = { sent: [t('Text to check'), 'yellow', m.spot + ' answer' + (m.spot > 1 ? 's' : '') + ' to look at', `<button class="btn secondary small" data-act="todo">${t('Check')}</button>`],
        verified: [t('Text checked'), 'teal', 'Waiting for AI grading', ''], graded: [t('Graded'), 'green', 'All fine', ''],
        missing: [t('Missing'), 'red', rem[m.name] ? 'Reminder sent ' + rem[m.name] : 'Not sent', `<button class="btn secondary small" data-act="remind" data-n="${m.name}">${t('Remind')}</button>`] }[m.status];
      return `<tr><td>${esc(m.name)}</td><td>${chip(m2[0], m2[1])}</td><td>${m2[2]}</td><td>${m2[3]}</td></tr>`; }).join('');
    return shell('exam', [t('Exams'), E.title + ' · 4B'], `<div class="row"><div class="grow"><h1>${E.title} ${chip('Science')} ${chip('English')}</h1><p class="muted">${DATA.school.className} · paper exam, 2 pages · 10 questions</p></div>
      <a class="btn secondary" href="#/teacher/scheme">${t('Mark scheme')}</a>${st().submission.status === 'sent' ? `<a class="btn primary" href="#/teacher/verify/6">${t('Start spotlight check')}</a>` : ''}</div>
      <div class="pipeline">${[[t('Sent'), c.sent + ' / 28'], [t('Text checked'), c.checked], [t('Graded'), c.graded], [t('Released'), c.released]].map(([l, v]) => `<div class="card"><small>${l}</small><b>${v}</b></div>`).join('')}</div>
      <table class="table"><thead><tr><th>Child</th><th>Status</th><th>Spotlight</th><th></th></tr></thead><tbody>${omarRow()}${rows}<tr><td colspan="4" class="muted">+ 22 more children – all graded</td></tr></tbody></table>
      <p class="hint">Status steps: Missing → Sent → Text checked → Graded → Released.</p>`);
  };
  A.remind = el => { const n = el.dataset.n; store.update(s => { s.reminders[n] = 'today'; }); toast('Reminder sent to ' + n + ' and their parent.'); render(); };

  // ---------- mark scheme (feature 14 in M2 list: checked before grading)
  R['teacher/scheme'] = () => shell('scheme', [t('Exams'), E.title, t('Mark scheme')], `<h1>${t('Mark scheme')}</h1><p class="muted">The AI grades with your mark scheme. Add other answers you accept before grading.</p>
    <table class="table"><thead><tr><th>#</th><th>Question</th><th>Answer</th><th>Also accept</th></tr></thead><tbody>
    ${E.questions.map(q => `<tr><td>${q.n}</td><td>${esc(q.q)}</td><td>${esc(q.scheme)}</td><td><input class="inline" data-q="${q.n}" value="${esc(q.also.concat(st().markScheme[q.n] || []).join(', '))}" aria-label="Also accept for question ${q.n}"></td></tr>`).join('')}
    </tbody></table><button class="btn primary" data-act="savescheme">${t('Save')}</button>`);
  A.savescheme = () => { store.update(s => document.querySelectorAll('input.inline').forEach(i => { const q = +i.dataset.q; const base = E.questions.find(x => x.n === q).also; s.markScheme[q] = i.value.split(',').map(v => v.trim()).filter(v => v && !base.includes(v)); })); toast('Mark scheme saved.'); };

  // ---------- verification with spotlight (HTD 2, features 13–16, Gap 3)
  function paper(q, opts = {}) {
    const lines = q.n === 7 ? ['water', 'and food'] : [q.n === 6 ? 'in p<span class="smudge">o</span>nds' : esc(q.wrote)];
    return `<div class="paper"><small>Omar’s paper · page ${q.page}</small><p class="pq">${q.n}. ${esc(q.q)}</p>${lines.map(l => `<p class="hand">${l}</p>`).join('')}</div>`;
  }
  R['teacher/verify'] = (qn) => {
    const s = st(); if (!atLeast('sent')) { location.hash = '#/teacher/today'; return ''; }
    qn = +qn || 6; const q = E.questions.find(x => x.n === qn); const o = E.ocr[qn]; const v = s.verify[qn] || {};
    const done = SPOT.filter(n => s.verify[n] && s.verify[n].checked).length;
    const riskLbl = { hard: ['Hard to read', 'red'], perfect: ['Looks too perfect', 'yellow'], lines: ['Two lines', 'yellow'] };
    const list = SPOT.map(n => { const qq = E.questions.find(x => x.n === n); const vv = s.verify[n]; return `<a class="spot ${n === qn ? 'on' : ''}" href="#/teacher/verify/${n}"><b>Q${n}</b><span>${esc(qq.q)}</span>${vv && vv.checked ? chip(vv.how === 'ask' ? 'Ask Omar' : vv.how === 'photo' ? 'New photo asked' : 'Checked', 'green') : chip(riskLbl[E.ocr[n].risk][0], riskLbl[E.ocr[n].risk][1])}</a>`; }).join('');
    const photo = s.submission.pages[q.page - 1];
    let explain = '', suggestion = v.text != null ? v.text : '', actions = '';
    if (o.risk === 'hard') { explain = `Hard to read · ${o.conf}% sure`; suggestion = suggestion || 'in ponds'; }
    if (o.risk === 'perfect') { explain = 'The app read exactly the mark-scheme answer, but the writing looks like “meat”. The app may have “fixed” Omar’s answer – check the scan before grading.'; suggestion = suggestion || 'meat'; }
    if (o.risk === 'lines') { explain = 'The answer goes on to the next line. The app only read line 1.'; suggestion = suggestion || 'water and food'; }
    actions = `<button class="btn primary" data-act="savecheck" data-q="${qn}">✓ Save and mark checked</button>
      <button class="btn secondary" data-act="askomar" data-q="${qn}">🙋 Ask Omar what it says</button>
      <button class="btn secondary" data-act="newphoto" data-q="${qn}" data-p="${q.page}">📷 New photo of page ${q.page}</button>`;
    return shell('exam', [t('Exams'), E.title, 'Omar', 'Spotlight'], `<div class="row"><h1 class="grow">Omar · ${E.title}</h1>${chip(done + ' of 3 checked', done === 3 ? 'green' : 'yellow')}</div>
      <p class="muted">Check what the app read before the AI grades it.</p>
      <div class="verify"><aside class="spotlist"><p class="muted"><b>Spotlight</b> · riskiest answers first</p>${list}<p class="fine">7 answers look fine · Q2, Q3, Q4, Q5, Q8, Q9, Q10 – read clearly</p></aside>
        <section class="card"><h2>Question ${qn} ${chip(riskLbl[o.risk][0], riskLbl[o.risk][1])}</h2>
          <div class="sbs"><div>${paper(q)}${photo ? `<button class="link" data-act="zoom" data-p="${q.page}">🔍 Open Omar’s photo of page ${q.page}</button>` : ''}</div>
          <div><small class="muted">The app read</small><div class="ocr">${esc(o.read)}</div>${o.risk === 'perfect' ? '<small class="muted">= mark scheme, word for word</small>' : ''}
            <p class="explain">${explain}</p>
            <label class="muted" for="vt">Your text (edit or type it yourself)</label><input id="vt" class="input" value="${esc(suggestion)}"></div></div>
          <div class="row wrap">${actions}</div></section></div>
      <div class="row end">${done === 3 ? `<a class="btn primary" href="#/teacher/checked">${t('Next step')} →</a>` : `<span class="muted">Check all 3 spotlight answers to continue.</span>`}</div>`);
  };
  function nextSpot(qn) { const s = st(); const next = SPOT.find(n => !(s.verify[n] && s.verify[n].checked)); location.hash = next ? '#/teacher/verify/' + next : '#/teacher/checked'; }
  A.savecheck = el => { const qn = +el.dataset.q; const text = document.getElementById('vt').value.trim(); if (!text) { toast('Type what Omar wrote first.'); return; } store.update(s => { s.verify[qn] = { text, checked: true, how: 'fixed' }; }); toast('Q' + qn + ' checked.'); nextSpot(qn); };
  A.askomar = el => { const qn = +el.dataset.q; modal({ title: 'Ask Omar what this word says?', body: '<p>The app marks this answer “ask Omar” and reminds you in the next class. Omar also sees the photo in Messages and can say or type the word.</p>', buttons: [{ label: t('Not yet') }, { label: 'Mark “ask Omar”', kind: 'primary', act: () => {
    store.update(s => { s.verify[qn] = { text: (E.ocr[qn].risk === 'hard' ? 'in ponds' : E.questions.find(x => x.n === qn).wrote), checked: true, how: 'ask' }; s.messages.push({ text: 'Ms. Sara asks: what does your answer to question ' + qn + ' say? Tell her in class.', icon: '🙋' }); });
    toast('Marked “ask Omar”. Omar got a message.'); nextSpot(qn); } }] }); };
  A.newphoto = el => { const qn = +el.dataset.q, p = +el.dataset.p; modal({ title: 'Ask Omar for a new photo of page ' + p + '?', body: `<p>He gets “New photo of page ${p}, please” in Messages and retakes only that page.</p>`, buttons: [{ label: t('Not yet') }, { label: 'Send request', kind: 'primary', act: () => {
    store.update(s => { s.verify[qn] = { text: E.questions.find(x => x.n === qn).wrote, checked: true, how: 'photo' }; s.submission.requestedPage = p; s.messages.push({ text: 'Ms. Sara needs a new photo of page ' + p + ', please.', icon: '📷', go: '#/student/upload/cam/' + p }); });
    toast('Request sent to Omar.'); nextSpot(qn); } }] }); };
  A.zoom = el => { const p = +el.dataset.p; modal({ title: 'Omar’s photo · page ' + p, body: `<img class="zoom" src="${st().submission.pages[p - 1]}" alt="Omar's photo of page ${p}">`, buttons: [{ label: 'Close', kind: 'primary' }] }); };

  R['teacher/checked'] = () => {
    const s = st(); const fixes = SPOT.map(n => ({ n, v: s.verify[n] || {} }));
    return shell('exam', [t('Exams'), E.title, 'Omar'], `<h1>All 10 answers of Omar are checked</h1><p class="muted">3 checked by you, 7 read clearly by the app.</p>
      <table class="table"><thead><tr><th>Q</th><th>The app read</th><th>Your text</th><th></th></tr></thead><tbody>${fixes.map(f => `<tr><td>Q${f.n}</td><td><s>${esc(E.ocr[f.n].read)}</s></td><td class="hand">${esc(f.v.text || '')}</td><td>${chip(f.v.how === 'ask' ? 'Ask Omar' : f.v.how === 'photo' ? 'New photo asked' : 'Checked', 'green')}</td></tr>`).join('')}</tbody></table>
      ${s.submission.status === 'sent' ? `<button class="btn primary" data-act="approvetext">${t('Approve text for grading')}</button>` : `<a class="btn primary" href="#/teacher/grades">${t('AI grades')} →</a>`}
      <p class="hint">After this the AI grades Omar’s paper with your mark scheme. You can still change every mark.</p>`);
  };
  A.approvetext = () => modal({ title: 'Send Omar’s text to AI grading?', body: '<p>All 10 answers are checked. You can still change every mark afterwards.</p>', buttons: [{ label: t('Not yet') }, { label: 'Yes, grade it', kind: 'primary', act: () => {
    store.update(s => { s.submission.status = 'verified'; }); location.hash = '#/teacher/grading';
    setTimeout(() => { store.update(s => { s.submission.status = 'graded'; // the AI uses the teacher-checked text
      if (s.verify[1] && /plant/i.test(s.verify[1].text)) s.grades[1] = { mark: 1, decided: false, ai: true }; }); location.hash = '#/teacher/grades'; }, 1800); } }] });
  R['teacher/grading'] = () => shell('exam', [t('Exams'), E.title, 'Omar'], `<div class="center-col"><div class="spinner"></div><h1>Grading Omar’s paper…</h1><p class="muted">The AI compares each answer with your mark scheme.</p></div>`);

  // ---------- grade review (feature 17, reason required for overrides)
  const NEEDS = [3, 7];
  function toDecide() { const s = st(); return NEEDS.filter(n => !(s.grades[n] && s.grades[n].decided)).length; }
  function allDecided() { return toDecide() === 0; }
  R['teacher/grades'] = () => {
    const s = st(); if (!atLeast('graded')) { location.hash = '#/teacher/checked'; return ''; }
    const rows = E.questions.map(q => {
      const g = s.grades[q.n] || {}; const mark = g.mark != null ? g.mark : E.aiMarks[q.n]; const text = (s.verify[q.n] && s.verify[q.n].text) || q.wrote;
      let decision = chip('Accepted', 'green');
      if (q.n === 3 && !g.decided) decision = `${chip('Accepted outside the mark scheme', 'yellow')} <button class="btn secondary small" data-act="keepadd">Keep and add to mark scheme</button>`;
      else if (q.n === 3) decision = chip('Kept · added to mark scheme', 'green');
      if (q.n === 7 && !g.decided) decision = chip('Half mark – check', 'yellow');
      if (g.reason) decision = chip('Changed · “' + esc(g.reason) + '”', 'teal');
      return `<tr class="${NEEDS.includes(q.n) && !g.decided ? 'hl' : ''}"><td>${q.n}</td><td class="hand">${esc(text)}</td><td>${esc(q.scheme)}</td><td><b>${fmt(mark)}</b> / 1<br><small class="muted">${esc(E.aiReasons[q.n] || '')}</small></td><td>${decision}</td><td><button class="btn ghost small" data-act="changemark" data-q="${q.n}">${t('Change mark')}</button></td></tr>`; }).join('');
    const left = toDecide();
    return shell('exam', [t('Exams'), E.title, 'Omar', t('AI grades')], `<div class="row"><div class="grow"><h1>Omar · ${E.title}</h1><p class="muted">AI suggestion – you decide every mark.</p></div><div class="bigscore">${fmt(totalScore())} / 10</div>${chip(left ? left + ' to decide' : 'All decided', left ? 'yellow' : 'green')}</div>
      ${!s.grades[7] || !s.grades[7].decided ? '<p class="explain">Q7: the AI gave half a mark because it saw one answer. You joined both lines in the spotlight – change the mark.</p>' : ''}
      <table class="table"><thead><tr><th>#</th><th>Omar wrote (checked)</th><th>Mark scheme</th><th>AI mark</th><th>Your decision</th><th></th></tr></thead><tbody>${rows}</tbody></table>
      <div class="row end">${left ? `<span class="muted">Decide the highlighted marks to continue.</span>` : `<a class="btn primary" href="#/teacher/feedback">${t('Feedback')} →</a>`}</div>`);
  };
  A.keepadd = () => { store.update(s => { s.grades[3] = { mark: 1, decided: true }; s.markScheme[3] = (s.markScheme[3] || []).concat('animals with backbones'); }); toast('Kept. The AI will accept it next time.'); render(); };
  A.changemark = el => { const qn = +el.dataset.q; const cur = (st().grades[qn] || {}).mark != null ? st().grades[qn].mark : E.aiMarks[qn];
    modal({ title: 'Change the mark for Q' + qn, body: `<p class="muted">AI: ${fmt(E.aiMarks[qn])} mark. Choose the new mark and say why – the reason is saved with the grade.</p>
      <div class="seg marks">${[0, 0.5, 1].map(m => `<label><input type="radio" name="mk" value="${m}" ${m === (qn === 7 ? 1 : cur) ? 'checked' : ''}> ${fmt(m) || '0'}</label>`).join('')}</div>
      <label class="muted" for="reason">Reason (required)</label><textarea id="reason" class="input" rows="2">${qn === 7 ? 'Both answers there: water and food' : ''}</textarea><p id="r-err" class="err" role="alert"></p>`,
      buttons: [{ label: t('Cancel') }, { label: 'Save mark', kind: 'primary', act: root => { const r = root.querySelector('#reason').value.trim(); if (!r) { root.querySelector('#r-err').textContent = 'Please give a reason.'; return false; }
        const m = +root.querySelector('input[name=mk]:checked').value; store.update(s => { s.grades[qn] = { mark: m, reason: r, decided: true }; }); render(); } }] }); };

  // ---------- feedback review (feature 18)
  R['teacher/feedback'] = () => { const f = st().feedback; const wrong = E.questions.filter(q => { const g = st().grades[q.n]; return (g && g.mark != null ? g.mark : E.aiMarks[q.n]) < 1; });
    return shell('exam', [t('Exams'), E.title, 'Omar', t('Feedback')], `<div class="row"><div class="grow"><h1>Feedback for Omar</h1><p class="muted">Written by the AI for a Grade 4 reader. Edit anything, then approve.</p></div><div class="bigscore">${fmt(totalScore())} / 10</div></div>
      <div class="grid2"><section class="card"><label class="muted" for="fb-note">Your note on the result (read aloud for Omar)</label><textarea id="fb-note" class="input" rows="2">${esc(f.note)}</textarea>
        <h3>A note for each mistake</h3>${wrong.map(q => `<label class="muted" for="fb-${q.n}">Q${q.n} · Omar: ${esc((st().verify[q.n] && st().verify[q.n].text) || q.wrote)} · Right: ${esc(q.scheme)}</label><textarea id="fb-${q.n}" data-q="${q.n}" class="input fbq" rows="2">${esc(f.notes[q.n] || '')}</textarea>`).join('')}</section>
        <section class="card soft"><h3>Where Omar sees it</h3><ul><li>Result: your note + ${fmt(totalScore())}/10</li><li>My mistakes: one note per mistake</li><li>🔊 Listen reads it aloud</li></ul>${f.approved ? chip('Approved', 'green') : ''}</section></div>
      <div class="row end"><button class="btn primary" data-act="approvefb">${t('Approve feedback')}</button></div>`); };
  A.approvefb = () => { store.update(s => { s.feedback.note = document.getElementById('fb-note').value; document.querySelectorAll('.fbq').forEach(x => { s.feedback.notes[x.dataset.q] = x.value; }); s.feedback.approved = true; }); toast('Feedback approved.'); location.hash = '#/teacher/gaps'; };

  // ---------- learning gaps and flags (features 19–21, Gap 4)
  R['teacher/gaps'] = () => { const s = st(); const fs = s.flag.status;
    const fchip = { suggested: chip('Red flag suggested', 'red'), confirmed: chip('Confirmed by you', 'red'), dismissed: chip('Dismissed', '') }[fs];
    const gap = (k, title, why, stt) => `<div class="gap"><div class="row"><b class="grow">${title}</b>${stt === 'watching' ? chip('Watching – 1 exam only', 'yellow') : stt === 'confirmed' ? chip('Confirmed', 'teal') : chip('Dismissed – not a gap', '')}</div><p class="muted">${why}</p>
      ${stt === 'watching' ? `<div class="row"><button class="btn secondary small" data-act="gap" data-k="${k}" data-v="confirmed">Confirm gap</button><button class="btn ghost small" data-act="gap" data-k="${k}" data-v="dismissed">${t('Dismiss')}</button></div>` : ''}</div>`;
    return shell('exam', [t('Exams'), E.title, 'Omar', 'Gaps and flags'], `<h1>${t('Learning gaps and recurring mistakes')}</h1><p class="muted">Found by the AI – nothing is shown to Omar or his parents until you decide.</p>
      <div class="grid2 wide-left"><section class="card"><h3 class="red">NEEDS SUPPORT (RED FLAG)</h3>
        <div class="gap"><div class="row"><b class="grow">Food chains</b>${fchip}</div><p class="muted">Same mistake in 2 exams: Plants quiz Q4 and Animals quiz Q2 – starts the chain with the animal, not the plant.</p><a class="btn primary small" href="#/teacher/why">${t('Why this flag?')}</a></div>
        <h3>LEARNING GAPS</h3>${gap('lifecycles', 'Life cycles (frogs)', 'Hard to read once (Q6), answer right. Only 1 exam – the app keeps watching.', s.gaps.lifecycles)}${gap('vertebrates', 'Vertebrates', 'Right answer in other words (“animals with backbones”). Not a gap.', s.gaps.vertebrates)}</section>
      <section class="card"><h3>Whole class (28)</h3>${DATA.classMistakes.map(m => `<div class="cbar"><span>${esc(m.label)}</span><b>${m.count}</b><i style="width:${m.count / 28 * 100}%"></i></div>`).join('')}<p class="explain">Food chains is a class-wide mistake: plan a short class practice too.</p></section></div>
      <div class="row end">${fs === 'suggested' ? '<span class="muted">Decide the red flag to continue.</span>' : `<a class="btn primary" href="#/teacher/practice">Practice and comment →</a>`}</div>`); };
  A.gap = el => { store.update(s => { s.gaps[el.dataset.k] = el.dataset.v; }); render(); };
  R['teacher/why'] = () => { const s = st();
    return shell('exam', [t('Exams'), E.title, 'Omar', 'Gaps and flags'], `<div class="row"><div class="grow"><h1>${t('Why this flag?')} · Food chains</h1><p class="muted">Hidden from Omar and his parents until you decide.</p></div>${chip('Strong evidence', 'red')}</div>
      <div class="grid2 wide-left"><div class="col"><section class="card"><h3>The questions behind the flag</h3><div class="grid2">
          <div class="paper"><small>Plants quiz · 20 Oct · Q4</small><p class="pq">What comes first in a food chain?</p><p class="hand">fox</p></div>
          <div class="paper"><small>Animals quiz · today · Q2</small><p class="pq">Put the food chain in order.</p><p class="hand">fox → rabbit → grass</p></div></div>
          <p class="explain">Same mistake both times: Omar starts the chain with the animal that eats, not with the plant.</p></section>
        <section class="card"><h3>How strong is the evidence?</h3><ul class="checks"><li>✅ Same mistake in 2 exams</li><li>✅ Same idea (food chains), not a reading problem</li><li>${s.flag.help.length ? '✅' : '⬜'} Still wrong after extra help</li></ul></section></div>
        <div class="col"><section class="card"><h3>Extra help already given</h3>${s.flag.help.map(h => `<div class="row"><span class="grow">${esc(h.what)}</span><small class="muted">${esc(h.when)}</small></div>`).join('')}<button class="btn secondary small" data-act="loghelp">＋ Log extra help</button></section>
          <section class="card"><h3>Your decision</h3>${s.flag.status === 'suggested' ? `<div class="col"><button class="btn danger" data-act="confirmflag">${t('Confirm red flag')}</button><button class="btn secondary" data-act="dismissflag">${t('Dismiss')}</button></div>` : `${chip(s.flag.status === 'confirmed' ? 'Confirmed' : 'Dismissed', s.flag.status === 'confirmed' ? 'red' : '')} <button class="btn ghost small" data-act="undoflag">Change</button><a class="btn primary" href="${s.flag.status === 'confirmed' ? '#/teacher/flagdone' : '#/teacher/practice'}">${t('Next step')} →</a>`}</section></div></div>`); };
  A.loghelp = () => modal({ title: 'Log extra help for Omar', body: `<p class="muted">So a red flag shows if help was already tried.</p><div class="seg marks">${['Office hours', 'Worksheet', 'Small group'].map((k, i) => `<label><input type="radio" name="hk" value="${k}" ${i === 1 ? 'checked' : ''}> ${k}</label>`).join('')}</div><label class="muted" for="hn">Note</label><input id="hn" class="input" value="“Food chains 2” worksheet">`,
    buttons: [{ label: t('Cancel') }, { label: t('Save'), kind: 'primary', act: root => { const k = root.querySelector('input[name=hk]:checked').value; const n = root.querySelector('#hn').value; store.update(s => s.flag.help.push({ what: k + (n ? ' · ' + n : ''), when: 'today' })); toast('Extra help logged.'); render(); } }] });
  A.confirmflag = () => modal({ title: 'Confirm the red flag “food chains”?', body: `<p>Omar and his parent will see it after you release. An email can go to the parent and ${DATA.teacher.supervisor} (supervisor) now.</p><label class="check-row"><input type="checkbox" id="em" checked> Email the parent and the supervisor</label>`,
    buttons: [{ label: t('Not yet') }, { label: 'Confirm flag', kind: 'danger', act: root => { const em = root.querySelector('#em').checked; store.update(s => { s.flag.status = 'confirmed'; s.flag.emailed = em; }); location.hash = '#/teacher/flagdone'; } }] });
  A.dismissflag = () => modal({ title: 'Dismiss this flag?', body: '<p>Omar and his parent won’t see it. The app keeps watching food chains in the next exams.</p>', buttons: [{ label: t('Not yet') }, { label: 'Dismiss flag', kind: 'primary', act: () => { store.update(s => { s.flag.status = 'dismissed'; }); render(); } }] });
  A.undoflag = () => { store.update(s => { s.flag.status = 'suggested'; }); render(); };
  R['teacher/flagdone'] = () => { const s = st();
    return shell('exam', [t('Exams'), E.title, 'Omar', 'Gaps and flags'], `<h1>Red flag confirmed: food chains</h1><p class="muted">Omar and his parents will see it when you release the results.</p>
      <section class="card email"><div class="row"><b class="grow">Email to the parent and the supervisor</b>${s.flag.emailed ? chip('Sent', 'green') : chip('Not sent', '')}</div>
        <p><small>To: Omar’s parent · Cc: ${DATA.teacher.supervisor} (supervisor)</small><br><small>Subject: Omar – extra practice in food chains</small></p>
        <p>Omar made the same food-chain mistake in two quizzes, also after office hours and a worksheet. I have set a short practice. Please help him at home: “A food chain always starts with a plant.” – ${DATA.teacher.name}</p></section>
      <div class="row end"><a class="btn primary" href="#/teacher/practice">Next: practice →</a></div>`); };

  // ---------- practice + comment (feature 22) and release (feature 23)
  R['teacher/practice'] = () => { const p = st().practice;
    return shell('exam', [t('Exams'), E.title, 'Omar', 'Practice'], `<h1>Practice and a comment for Omar</h1><p class="muted">Practice homework for the weak topic, set or approved by you.</p>
      <div class="grid2"><section class="card"><div class="row"><b class="grow">Suggested practice · Food chains</b>${p.approved ? chip('Approved', 'green') : chip('Suggested', 'yellow')}</div><p class="muted">2 picture questions · about 5 min · due Friday</p>
        ${p.approved ? '' : '<button class="btn secondary small" data-act="approveprac">Approve practice</button>'}</section>
        <section class="card"><label class="muted" for="cm">Comment to Omar (he gets it in Messages and can listen to it)</label><textarea id="cm" class="input" rows="3">${esc(p.comment)}</textarea></section></div>
      <div class="row end"><button class="btn primary" data-act="topractice">Next: release →</button></div>`); };
  A.approveprac = () => { store.update(s => { s.practice.approved = true; }); render(); };
  A.topractice = () => { store.update(s => { s.practice.comment = document.getElementById('cm').value; }); location.hash = '#/teacher/release'; };
  R['teacher/release'] = () => { const s = st();
    const items = [[atLeast('verified'), 'Text checked (' + SPOT.length + ' answers looked at)'], [allDecided() && atLeast('graded'), 'Grade confirmed: ' + fmt(totalScore()) + ' / 10'], [s.feedback.approved, 'Feedback approved'], [s.flag.status !== 'suggested', 'Red flag decided: ' + s.flag.status], [s.practice.approved, 'Practice set: food chains'], [!!s.practice.comment, 'Comment written']];
    const ok = items.every(i => i[0]);
    return shell('exam', [t('Exams'), E.title, 'Omar', t('Release')], `<h1>${s.released ? 'Omar’s results are released' : 'Ready to release?'}</h1><p class="muted">One last check. Nothing reaches Omar or his parents before you release.</p>
      <div class="grid2"><section class="card"><h3>Checklist</h3><ul class="checks">${items.map(i => `<li>${i[0] ? '✅' : '⬜'} ${esc(i[1])}</li>`).join('')}</ul></section>
        <section class="card"><h3>Send to</h3><ul class="checks"><li>🧒 Omar (Messages + result)</li><li>👪 Omar’s parent (parent view)</li><li>🏫 School system (grade + weak topic)</li></ul></section></div>
      <div class="row end">${s.released ? chip('Released', 'green') + ` <a class="btn secondary" href="#/teacher/history">Omar’s ${t('History').toLowerCase()}</a>` : `<button class="btn primary" data-act="release" ${ok ? '' : 'disabled'}>${t('Release results')}</button>`}</div>`); };
  A.release = () => modal({ title: 'Release Omar’s results?', body: '<p>Omar, his parent and the school system get them now. A release can’t be taken back – you can only send a correction.</p>', buttons: [{ label: t('Not yet') }, { label: t('Release'), kind: 'primary', act: () => {
    store.update(s => { s.released = true; s.submission.status = 'released'; s.messages.push({ text: 'Your results are here! ' + E.title + ': ' + fmt(totalScore()) + ' / 10.', icon: '⭐', go: '#/student/results' }); if (s.practice.comment) s.messages.push({ text: 'Ms. Sara: ' + s.practice.comment, icon: '💬' }); s.messages.push({ text: 'New practice for you: food chains.', icon: '🎯', go: '#/student/practice' }); });
    toast('Released. Omar and his parent are notified.'); render(); } }] });

  // ---------- student history (feature 24)
  R['teacher/history'] = () => { const s = st();
    const rows = DATA.history.concat(s.released ? [{ subject: 'Science', title: E.title, month: 'Nov', score: totalScore() }] : []);
    return shell('history', [t('Students'), 'Omar'], `<h1>🧒 Omar</h1><p class="muted">${DATA.school.className} · Grade 4 · reads on his own</p>
      <div class="grid2"><section class="card"><h3>Exams</h3><table class="table"><tbody>${rows.map(r => `<tr><td>${r.subject}</td><td>${esc(r.title)}</td><td>${r.month}</td><td><b>${fmt(r.score)} / 10</b></td></tr>`).join('')}</tbody></table></section>
        <section class="card"><h3>Food chains – how the flag grew</h3><ol class="timeline"><li><b>20 Oct</b> First seen: Plants quiz Q4</li>${s.flag.help.map(h => `<li><b>${esc(h.when)}</b> ${esc(h.what)}</li>`).join('')}<li><b>Today</b> Same mistake in Animals quiz Q2 → ${s.flag.status === 'confirmed' ? 'flag confirmed' + (s.flag.emailed ? ', parent + supervisor emailed' : '') : s.flag.status === 'dismissed' ? 'flag dismissed' : 'flag suggested'}</li>${s.practice.done ? '<li><b>Later</b> Practice done: 2 / 2</li>' : ''}</ol></section></div>`); };
})();
