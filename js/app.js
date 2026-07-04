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
