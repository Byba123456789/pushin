import { t } from '../rooms/strings.js';
import { SORT } from '../state/catalog.js';

const STAR_PATH = 'M12 2.5l2.9 6.2 6.8.8-5 4.7 1.3 6.7L12 17.5l-6 3.4 1.3-6.7-5-4.7 6.8-.8z';
const LOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5" fill="none"/></svg>';

const star = (on) => `<svg class="sr-star${on ? ' sr-on' : ''}" viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR_PATH}"/></svg>`;
const stars = (n) => [1, 2, 3].map((i) => star(i <= n)).join('');

const TEMPLATE = `
<div class="sr-top">
  <button class="sr-btn sr-btn-small" type="button" data-act="exit">${t('sortExit')}</button>
  <div class="sr-title"><b class="sr-level"></b><span class="sr-moves"></span></div>
  <button class="sr-btn sr-btn-small" type="button" data-act="levels">${t('sortLevels')}</button>
</div>
<div class="sr-hint" role="status" hidden>${t('sortStuck')}</div>
<div class="sr-bar">
  <button class="sr-btn" type="button" data-act="undo">${t('sortUndo')}</button>
  <button class="sr-btn" type="button" data-act="restart">${t('sortRestart')}</button>
  <button class="sr-btn sr-btn-jar" type="button" data-act="jar" aria-label="${t('sortJarPrice', { n: SORT.jarPrice })}">${t('sortAddJar')}<small>${SORT.jarPrice}</small></button>
</div>
<div class="sr-panel sr-levels" role="dialog" aria-modal="true" aria-labelledby="sr-levels-t" hidden>
  <h2 id="sr-levels-t">${t('sortPick')}</h2>
  <div class="sr-grid"></div>
  <button class="sr-btn sr-btn-main" type="button" data-act="closeLevels">${t('sortExit')}</button>
</div>
<div class="sr-panel sr-win" role="dialog" aria-modal="true" aria-labelledby="sr-win-t" hidden>
  <h2 id="sr-win-t"></h2>
  <div class="sr-win-stars"></div>
  <p class="sr-win-moves"></p>
  <p class="sr-win-coins"></p>
  <button class="sr-btn sr-btn-main" type="button" data-act="next">${t('sortNext')}</button>
  <button class="sr-btn" type="button" data-act="levels">${t('sortLevels')}</button>
</div>`;

export function createHud(actions) {
  const root = document.createElement('div');
  root.className = 'sr-root';
  root.style.pointerEvents = 'none';
  root.innerHTML = TEMPLATE;
  document.getElementById('ui').appendChild(root);

  const q = (s) => root.querySelector(s);
  const el = {
    top: q('.sr-top'),
    bar: q('.sr-bar'),
    level: q('.sr-level'),
    moves: q('.sr-moves'),
    hint: q('.sr-hint'),
    levels: q('.sr-levels'),
    grid: q('.sr-grid'),
    win: q('.sr-win'),
    undo: q('[data-act="undo"]'),
    jar: q('[data-act="jar"]'),
    next: q('[data-act="next"]'),
  };

  root.addEventListener('click', (e) => {
    const cell = e.target.closest('[data-level]');
    if (cell) {
      actions.pick(Number(cell.dataset.level));
      return;
    }
    const act = e.target.closest('[data-act]');
    if (act) actions[act.dataset.act]();
  });

  const focusMain = (panel) => panel.querySelector('.sr-btn-main').focus({ preventScroll: true });

  return {
    setLevel(n) {
      el.level.textContent = t('sortLevel', { n });
    },
    setMoves(n) {
      el.moves.textContent = t('sortMoves', { n });
    },
    setButtons({ canUndo, canJar }) {
      el.undo.disabled = !canUndo;
      el.jar.disabled = !canJar;
    },
    setStuck(stuck) {
      el.hint.hidden = !stuck;
    },
    showWin({ level, stars: n, moves, coins, hasNext }) {
      q('#sr-win-t').textContent = t('sortWon', { n: level });
      q('.sr-win-stars').innerHTML = stars(n);
      q('.sr-win-stars').setAttribute('aria-label', t('sortStarsAria', { s: n }));
      q('.sr-win-moves').textContent = t('sortMoves', { n: moves });
      q('.sr-win-coins').textContent = t('coinsWon', { n: coins });
      el.next.hidden = !hasNext;
      el.win.hidden = false;
      focusMain(el.win);
    },
    hideWin() {
      el.win.hidden = true;
    },
    showLevels({ unlocked, done }, current) {
      el.win.hidden = true;
      el.grid.innerHTML = Array.from({ length: SORT.levels }, (_, i) => {
        const n = i + 1;
        const open = n <= unlocked;
        const label = open ? t('sortLevelAria', { n, s: done[n] ?? 0 }) : t('sortLockedAria', { n });
        const body = open ? `<b>${n}</b><span>${stars(done[n] ?? 0)}</span>` : `<b>${n}</b>${LOCK}`;
        return `<button class="sr-cell${n === current ? ' sr-current' : ''}${open ? '' : ' sr-locked'}" type="button" data-level="${n}" aria-label="${label}"${open ? '' : ' disabled'}>${body}</button>`;
      }).join('');
      el.levels.hidden = false;
      const cur = el.grid.querySelector('.sr-current');
      if (cur) el.grid.scrollTop = Math.max(0, cur.offsetTop - el.grid.offsetTop - el.grid.clientHeight / 2 + cur.offsetHeight / 2);
      focusMain(el.levels);
    },
    hideLevels() {
      el.levels.hidden = true;
    },
    bounds() {
      return { top: el.top.getBoundingClientRect().bottom, bottom: el.bar.getBoundingClientRect().top };
    },
    destroy() {
      root.remove();
    },
  };
}
