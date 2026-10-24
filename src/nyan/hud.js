import { iconUrl } from './sprites.js';

const img = (name, cls) => `<img class="ny-ico ny-ico-${cls}" src="${iconUrl(name)}" alt="">`;

const TEMPLATE = `
<div class="ny-top">
  <div class="ny-hearts" role="img" aria-label="Жизни"></div>
  <div class="ny-score-box">
    <div class="ny-score">0</div>
    <div class="ny-best">Рекорд <span>0</span></div>
  </div>
  <div class="ny-right">
    <div class="ny-coins" role="img" aria-label="Монетки">${img('coin', 'coin')}<span>0</span></div>
    <button class="ny-btn-pause" type="button" aria-label="Пауза" hidden><i></i><i></i></button>
  </div>
</div>
<div class="ny-combo" aria-live="polite"></div>
<div class="ny-star" hidden>${img('star', 'star')}<div class="ny-star-bar"><div></div></div><b>×2</b></div>
<div class="ny-start">
  <h1 class="ny-title">Тапни, чтобы лететь</h1>
  <p class="ny-hint">Держи палец: котик летит вверх. Отпусти: опускается.</p>
  <p class="ny-legend">${img('coin', 'sm')}${img('cookie', 'sm')}${img('heart', 'sm')}${img('star', 'sm')}<span>Собирай</span></p>
  <p class="ny-legend ny-legend-bad">${img('cucH', 'sm')}${img('cloud', 'sm')}${img('vacuum', 'sm')}<span>Не задевай</span></p>
</div>
<div class="ny-panel ny-pause" role="dialog" aria-modal="true" aria-labelledby="ny-pause-t" hidden>
  <h2 id="ny-pause-t">Пауза</h2>
  <button class="ny-btn ny-btn-main" type="button" data-act="resume">Продолжить</button>
  <button class="ny-btn" type="button" data-act="finish">Закончить забег</button>
</div>
<div class="ny-panel ny-result" role="dialog" aria-modal="true" aria-labelledby="ny-result-t" hidden>
  <h2 id="ny-result-t">Забег окончен</h2>
  <p class="ny-record">Новый рекорд!</p>
  <dl>
    <div><dt>Очки</dt><dd class="ny-r-score">0</dd></div>
    <div><dt>Монетки</dt><dd class="ny-r-coins">0</dd></div>
    <div><dt>Рекорд</dt><dd class="ny-r-best">0</dd></div>
  </dl>
  <button class="ny-btn ny-btn-main" type="button" data-act="again">Ещё раз</button>
  <button class="ny-btn" type="button" data-act="home">Домой</button>
</div>`;

export function createHud(actions) {
  const root = document.createElement('div');
  root.className = 'ny-root';
  root.style.pointerEvents = 'none';
  root.innerHTML = TEMPLATE;
  document.getElementById('ui').appendChild(root);

  const q = (s) => root.querySelector(s);
  const el = {
    hearts: q('.ny-hearts'),
    score: q('.ny-score'),
    best: q('.ny-best span'),
    coins: q('.ny-coins span'),
    pause: q('.ny-btn-pause'),
    combo: q('.ny-combo'),
    star: q('.ny-star'),
    starBar: q('.ny-star-bar div'),
    start: q('.ny-start'),
    pausePanel: q('.ny-pause'),
    result: q('.ny-result'),
  };
  const shown = { lives: -1, score: -1, best: -1, coins: -1, combo: '', star: false };

  el.pause.addEventListener('click', actions.pause);
  root.addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]');
    if (act) actions[act.dataset.act]();
  });

  function setLives(n) {
    if (n === shown.lives) return;
    shown.lives = n;
    el.hearts.innerHTML = [0, 1, 2].map((i) => `<img class="ny-ico ny-ico-heart${i < n ? '' : ' ny-off'}" src="${iconUrl('heart')}" alt="">`).join('');
    el.hearts.setAttribute('aria-label', `Жизни: ${n} из 3`);
  }

  return {
    update({ lives, score, best, coins, combo, comboLabel, star }) {
      setLives(lives);
      if (score !== shown.score) el.score.textContent = shown.score = score;
      if (best !== shown.best) el.best.textContent = shown.best = best;
      if (coins !== shown.coins) el.coins.textContent = shown.coins = coins;
      if (comboLabel !== shown.combo) {
        shown.combo = comboLabel;
        el.combo.textContent = comboLabel;
        el.combo.classList.remove('ny-pop');
        if (comboLabel) {
          void el.combo.offsetWidth;
          el.combo.classList.add('ny-pop');
        }
      }
      const starOn = star > 0;
      if (starOn !== shown.star) {
        shown.star = starOn;
        el.star.hidden = !starOn;
      }
      if (starOn) el.starBar.style.transform = `scaleX(${star})`;
    },
    mode(m) {
      el.start.hidden = m !== 'ready';
      el.pause.hidden = m !== 'play';
      el.pausePanel.hidden = m !== 'paused';
      el.result.hidden = m !== 'over';
      const target = m === 'paused' ? el.pausePanel : m === 'over' ? el.result : null;
      if (target) target.querySelector('.ny-btn-main').focus({ preventScroll: true });
    },
    showResult({ score, coins, best, isRecord }) {
      q('.ny-r-score').textContent = score;
      q('.ny-r-coins').textContent = coins;
      q('.ny-r-best').textContent = best;
      el.result.classList.toggle('ny-is-record', isRecord);
      q('.ny-record').hidden = !isRecord;
    },
    destroy() {
      root.remove();
    },
  };
}
