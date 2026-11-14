/* Shared state for all three views, kept in localStorage so the student, teacher and
   parent views (even in different tabs) see the same exam moving through the pipeline. */
(function () {
  const KEY = 'beitgedy-v1';
  const fresh = () => ({
    lang: 'en',
    parentLang: 'en',
    user: null,                  // { role, id }
    // Omar's Animals quiz moves through: todo -> sent -> verified -> graded -> released
    submission: { status: 'todo', pages: [], sample: false, sentAt: null, requestedPage: null },
    verify: {},                  // q -> { text, checked, how }
    markScheme: {},              // q -> extra accepted answers added by the teacher
    grades: {},                  // q -> { mark, reason, decided }
    feedback: {
      note: 'Great work on animals! Let’s practise food chains.',
      notes: { 1: 'Rabbits eat plants. Look at their flat teeth!', 2: 'A food chain always starts with a plant.' },
      approved: false
    },
    flag: { status: 'suggested', help: [{ what: 'Office hours · 20 min', when: 'Tue 3 Nov' }, { what: 'Worksheet “Food chains 1” · 2 / 5', when: 'Thu 5 Nov' }], emailed: false },
    gaps: { lifecycles: 'watching', vertebrates: 'dismissed' },
    practice: { approved: false, comment: 'You can do it, Omar! Start with the plant.', answers: {}, done: false },
    released: false,
    messages: [],                // for the student: { text, kind }
    reminders: {}
  });
  let state;
  try { state = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { state = fresh(); }
  const subs = [];
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { // photos too big for storage: keep the flow working without them
      state.submission.pages = state.submission.pages.map(() => null);
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e2) { /* ignore */ }
    }
  }
  window.store = {
    get: () => state,
    set(patch) { Object.assign(state, typeof patch === 'function' ? patch(state) || {} : patch); save(); subs.forEach(f => f()); },
    update(fn) { fn(state); save(); subs.forEach(f => f()); },
    subscribe(f) { subs.push(f); },
    reset() { const keep = { lang: state.lang }; state = Object.assign(fresh(), keep); save(); subs.forEach(f => f()); }
  };
  // Live sync between tabs (student in one tab, teacher in another)
  window.addEventListener('storage', e => {
    if (e.key !== KEY) return;
    try { const user = state.user; state = Object.assign(fresh(), JSON.parse(e.newValue || '{}')); state.user = user; subs.forEach(f => f()); } catch (err) { /* ignore */ }
  });
})();
