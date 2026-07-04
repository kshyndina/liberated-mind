/* Shared behavior: accordions, toolkit, done-tracking, nav highlight */

const LS = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
    catch { return fallback; }
  },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
};

/* Accordions */
document.querySelectorAll('.exercise > button').forEach(btn => {
  btn.addEventListener('click', () => btn.parentElement.classList.toggle('open'));
});

/* Toolkit: each .exercise has data-id and data-name */
function toolkit() { return LS.get('toolkit', []); }
function renderToolkitButtons() {
  const kit = toolkit();
  document.querySelectorAll('.btn-toolkit[data-id]').forEach(b => {
    const inKit = kit.some(x => x.id === b.dataset.id);
    b.classList.toggle('in', inKit);
    b.textContent = inKit ? '✓ In my toolkit' : '+ Add to my toolkit';
  });
}
document.querySelectorAll('.btn-toolkit[data-id]').forEach(b => {
  b.addEventListener('click', () => {
    let kit = toolkit();
    const id = b.dataset.id;
    if (kit.some(x => x.id === id)) kit = kit.filter(x => x.id !== id);
    else kit.push({ id, name: b.dataset.name, pivot: b.dataset.pivot, href: b.dataset.href });
    LS.set('toolkit', kit);
    renderToolkitButtons();
  });
});
renderToolkitButtons();

/* Done today tracking (resets daily) */
const todayKey = 'done-' + new Date().toISOString().slice(0, 10);
function renderDone() {
  const done = LS.get(todayKey, []);
  document.querySelectorAll('.done-check input').forEach(cb => {
    cb.checked = done.includes(cb.dataset.id);
  });
}
document.querySelectorAll('.done-check input').forEach(cb => {
  cb.addEventListener('change', () => {
    let done = LS.get(todayKey, []);
    if (cb.checked) { if (!done.includes(cb.dataset.id)) done.push(cb.dataset.id); }
    else done = done.filter(x => x !== cb.dataset.id);
    LS.set(todayKey, done);
  });
});
renderDone();

/* Autosave textareas with data-save */
document.querySelectorAll('textarea[data-save], input[data-save]').forEach(el => {
  const k = 'save-' + el.dataset.save;
  const v = LS.get(k, '');
  if (v) el.value = v;
  el.addEventListener('input', () => LS.set(k, el.value));
});

/* Nav active state */
const here = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('nav a[href]').forEach(a => {
  if (a.getAttribute('href') === here && !a.classList.contains('brand')) a.classList.add('active');
});

/* Timer widget */
document.querySelectorAll('.timer').forEach(t => {
  const mins = parseFloat(t.dataset.minutes || '2');
  const disp = t.querySelector('.t-display');
  const btn = t.querySelector('button');
  let left = mins * 60, iv = null;
  const show = () => {
    const m = Math.floor(left / 60), s = Math.floor(left % 60);
    disp.textContent = m + ':' + String(s).padStart(2, '0');
  };
  show();
  btn.addEventListener('click', () => {
    if (iv) { clearInterval(iv); iv = null; left = mins * 60; show(); btn.textContent = 'Start ' + mins + ' min'; return; }
    btn.textContent = 'Reset';
    iv = setInterval(() => {
      left--;
      if (left <= 0) { clearInterval(iv); iv = null; disp.textContent = 'Done'; btn.textContent = 'Start ' + mins + ' min'; left = mins * 60; }
      else show();
    }, 1000);
  });
});

/* ===== Fun layer: streaks, tried-tracking, confetti ===== */
function confetti(x, y) {
  const colors = ['#7A4BA0','#2589C9','#3E8E5A','#C08A17','#D25B4A','#2E7D74'];
  for (let i = 0; i < 26; i++) {
    const c = document.createElement('div');
    c.className = 'confetto';
    c.style.background = colors[i % colors.length];
    c.style.left = (x + (Math.random() * 120 - 60)) + 'px';
    c.style.top = (y - 10) + 'px';
    c.style.animation = 'confall ' + (0.9 + Math.random() * 1.2) + 's ease-in forwards';
    c.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 2300);
  }
}
function recordPractice(id) {
  const days = LS.get('practice-days', []);
  const today = new Date().toISOString().slice(0, 10);
  if (!days.includes(today)) { days.push(today); LS.set('practice-days', days); }
  const tried = LS.get('tried', []);
  if (!tried.includes(id)) { tried.push(id); LS.set('tried', tried); }
}
function currentStreak() {
  const days = new Set(LS.get('practice-days', []));
  let streak = 0;
  const d = new Date();
  if (!days.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1); // allow "today not yet"
  while (days.has(d.toISOString().slice(0, 10))) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
}
document.querySelectorAll('.done-check input').forEach(cb => {
  cb.addEventListener('change', e => {
    if (cb.checked) {
      recordPractice(cb.dataset.id);
      const r = cb.getBoundingClientRect();
      confetti(r.left, r.top);
    }
  });
});
