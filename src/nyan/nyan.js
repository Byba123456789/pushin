import { W, H, scale, register, go } from '../core/engine.js';
import { createCat } from '../cat/cat.js';
import * as state from '../state/state.js';
import { sfx, music } from '../audio/audio.js';
import { sprite, blit, PASTEL } from './sprites.js';
import { createBackdrop, createRainbow, createParticles } from './world.js';
import { createHud } from './hud.js';

const CAT_X = 50;
const BASE_SPEED = 70;
const SPEED_STEP = 1.05;
const STEP_SECONDS = 15;
const MAX_SPEED_MUL = 2;
const CLIMB = 480;
const FALL = 400;
const MAX_V = 120;
const INVULN = 1.5;
const STAR_SECONDS = 5;
const COMBO_WINDOW = 3;
const MAX_LIVES = 3;
const HUD_HEIGHT_CSS = 80;
const CAT_WIDTH = 54;
const RAINBOW_LIFT = 3;
const POINTS = { coin: 10, cookie: 15, heart: 5, star: 25 };
const SIZE = {
  coin: [10, 10], cookie: [11, 11], heart: [10, 9], star: [12, 12],
  cucH: [20, 8], cucV: [8, 20], cloud: [26, 20], vac: [24, 18],
};
const HARMFUL = new Set(['cucH', 'cucV', 'cloud', 'vac']);

const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const tg = window.Telegram && window.Telegram.WebApp;
const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function haptic(kind) {
  const h = tg && tg.HapticFeedback;
  if (!h) return;
  if (kind === 'hit') h.notificationOccurred('error');
  else h.impactOccurred('light');
}

function loadCss() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL('./nyan.css', import.meta.url).href;
  document.head.appendChild(link);
}

export function registerNyan() {
  loadCss();

  let hud = null;
  let cat = null;
  let backdrop = null;
  let rainbow = null;
  let fx = null;
  let mode = 'ready';
  let holding = false;
  let holdId = null;
  let r = null;

  const top = () => Math.ceil(HUD_HEIGHT_CSS / (scale / (window.devicePixelRatio || 1)));
  const speedMul = () => Math.min(MAX_SPEED_MUL, Math.pow(SPEED_STEP, r.t / STEP_SECONDS));
  const speed = () => BASE_SPEED * speedMul();
  const catScale = () => CAT_WIDTH / (cat.width || CAT_WIDTH);
  const catH = () => (cat.height || 40) * catScale();
  const catW = () => CAT_WIDTH;
  const minY = () => top() + catH() / 2 + 2;
  const maxY = () => H - catH() / 2 - 6;
  const trailY = () => r.cy - RAINBOW_LIFT;
  const restY = () => clamp(H * 0.45, minY(), maxY());

  function fresh() {
    return {
      t: 0, score: 0, coins: 0, lives: MAX_LIVES, cy: restY(), vy: 0, items: [],
      waves: 0, nextWave: 40, sinceHeart: 0, nextStar: rnd(25, 40),
      invuln: 0, star: 0, combo: 0, comboT: 0, mult: 1, shake: 0, dying: 0,
      best: state.get().best || 0, label: '', labelT: 0,
    };
  }

  function setMode(m) {
    mode = m;
    hud.mode(m);
  }

  function startRun() {
    cat.outfit = { ...state.get().equipped };
    cat.play('fly', { loop: true });
    r = fresh();
    rainbow.reset(trailY());
    fx.clear();
    holding = false;
    setMode('play');
    music('nyan');
    sfx('whoosh');
  }

  function finish() {
    if (mode === 'over' || mode === 'ready') return;
    const { score, coins } = r;
    const isRecord = Math.floor(score) > r.best;
    r.score = Math.floor(score);
    if (coins > 0) state.addCoins(coins);
    state.recordRun({ score: r.score, coins });
    state.play(15);
    hud.showResult({ score: r.score, coins, best: Math.max(r.score, r.best), isRecord });
    setMode('over');
    music(null);
    if (isRecord) {
      sfx('levelup');
      if (!calm) fx.rain(70, PASTEL);
    }
  }

  function pause() {
    if (mode !== 'play') return;
    holding = false;
    setMode('paused');
    music(null);
    sfx('tap');
  }

  function resume() {
    if (mode !== 'paused') return;
    setMode('play');
    music('nyan');
    sfx('tap');
  }

  function add(k, x, y, extra) {
    const [w, h] = SIZE[k];
    r.items.push({ k, x, y, w, h, ph: Math.random() * 6.28, ...extra });
  }

  function coinPattern(x0, yc) {
    const shape = Math.random();
    const n = Math.round(rnd(4, 6));
    const gap = 11;
    for (let i = 0; i < n; i++) {
      let y = yc;
      if (shape < 0.35) y = yc - Math.sin((i / (n - 1)) * Math.PI) * 26;
      else if (shape < 0.55) y = yc + Math.sin(i * 1.1) * 18;
      const cookie = i === n >> 1 && Math.random() < 0.25;
      add(cookie ? 'cookie' : 'coin', x0 + i * gap, y);
    }
    return n * gap;
  }

  function obstacle(x) {
    const aimed = Math.random() < 0.55;
    const y = clamp(aimed ? r.cy + rnd(-45, 45) : rnd(minY(), maxY()), top() + 12, H - 14);
    const roll = Math.random();
    if (roll < 0.08 && r.t > 15) add('vac', x, y, { vx: 1.25 });
    else if (roll < 0.45) add('cloud', x, y, { bob: rnd(0, 6.28) });
    else add(Math.random() < 0.5 ? 'cucH' : 'cucV', x, y);
  }

  function spawnWave() {
    r.waves++;
    const x0 = W + 14;
    let end = x0;
    if (r.waves < 3 || Math.random() < 0.7) end += coinPattern(x0, rnd(minY() + 20, maxY() - 20));
    if (r.waves >= 3 && Math.random() < Math.min(0.9, 0.4 + r.t / 150)) {
      end += 40;
      obstacle(end);
      if (Math.random() < Math.min(0.5, r.t / 200)) {
        end += rnd(50, 70);
        obstacle(end);
      }
    }
    if (r.lives < MAX_LIVES && r.sinceHeart > 20 && Math.random() < 0.5) {
      add('heart', end + 20, rnd(minY(), maxY()));
      r.sinceHeart = 0;
    }
    if (r.t > r.nextStar && r.star <= 0) {
      add('star', end + 30, rnd(minY(), maxY()));
      r.nextStar = r.t + rnd(35, 55);
    }
    r.nextWave = end - x0 + Math.max(30, 70 - r.t * 0.3) + rnd(0, 30);
  }

  function award(k) {
    const x2 = r.star > 0 ? 2 : 1;
    r.score += POINTS[k] * x2 * r.mult;
    if (k !== 'coin' && k !== 'cookie') return;
    r.coins += x2;
    r.combo++;
    r.comboT = COMBO_WINDOW;
    const m = Math.min(4, 1 + Math.floor(r.combo / 5));
    if (m > r.mult) {
      r.label = `Комбо ×${m}!`;
      r.labelT = 1.2;
      sfx('pop');
    }
    r.mult = m;
  }

  function collect(it) {
    if (it.k === 'coin') {
      sfx('coin');
      fx.burst(it.x, it.y, 4, ['#ffd54a', '#fff4b0'], { speed: 30, life: 0.3, size: 1.1 });
    } else if (it.k === 'cookie') {
      sfx('pop');
      cat.emit('sparkle');
      fx.burst(it.x, it.y, 7, ['#e9b873', '#fff4b0', '#ffffff'], { speed: 45, life: 0.4, size: 1.1 });
    } else if (it.k === 'heart') {
      if (r.lives < MAX_LIVES) r.lives++;
      sfx('meow');
      cat.emit('heart');
      haptic('soft');
      fx.burst(it.x, it.y, 8, ['#f2608f', '#ffc2d6'], { speed: 40, life: 0.5, size: 1.6 });
    } else {
      r.star = STAR_SECONDS;
      sfx('levelup');
      cat.emit('sparkle');
      haptic('soft');
      fx.burst(it.x, it.y, 14, ['#ffe45e', '#ffffff', '#ffa94d'], { speed: 60, life: 0.6, size: 1.6 });
    }
    award(it.k);
  }

  function hurt(it) {
    it.dead = true;
    r.lives--;
    r.invuln = INVULN;
    r.combo = 0;
    r.mult = 1;
    r.comboT = 0;
    r.label = '';
    r.shake = calm ? 0 : 0.3;
    sfx('hit');
    haptic('hit');
    fx.burst(CAT_X, r.cy, 10, ['#ffffff', '#ffe45e', '#ff6b6b'], { speed: 70, life: 0.45, size: 1.6 });
    if (r.lives <= 0) {
      holding = false;
      cat.play('sad', { loop: true });
      setMode('dying');
    }
  }

  function touches(it) {
    const pickup = !HARMFUL.has(it.k);
    const pad = pickup ? 3 : -2;
    return (
      Math.abs(it.x - CAT_X) < catW() * 0.26 + it.w / 2 + pad &&
      Math.abs(it.y - r.cy) < catH() * 0.22 + it.h / 2 + pad
    );
  }

  function updateItems(dt, sp) {
    for (const it of r.items) {
      it.x -= sp * (it.vx || 1) * dt;
      if (it.bob !== undefined) it.bob += dt * 3;
      if (it.x < -30) it.dead = true;
      else if (mode === 'play' && !it.dead && touches(it)) {
        if (!HARMFUL.has(it.k)) {
          it.dead = true;
          collect(it);
        } else if (r.invuln <= 0) {
          hurt(it);
        }
      }
    }
    r.items = r.items.filter((it) => !it.dead);
  }

  function moveCat(dt) {
    r.vy = clamp(r.vy + (holding ? -CLIMB : FALL) * dt, -MAX_V, MAX_V);
    r.cy += r.vy * dt;
    const lo = minY();
    const hi = maxY();
    if (r.cy < lo) {
      r.cy = lo;
      r.vy = Math.max(0, r.vy);
    } else if (r.cy > hi) {
      r.cy = hi;
      r.vy = Math.min(0, r.vy);
    }
  }

  function updatePlay(dt) {
    const sp = speed();
    r.t += dt;
    r.sinceHeart += dt;
    r.score += (sp / BASE_SPEED) * 5 * dt * r.mult;
    r.nextWave -= sp * dt;
    if (r.nextWave <= 0) spawnWave();
    r.invuln = Math.max(0, r.invuln - dt);
    r.star = Math.max(0, r.star - dt);
    r.shake = Math.max(0, r.shake - dt);
    if (r.comboT > 0) {
      r.comboT -= dt;
      if (r.comboT <= 0) {
        r.combo = 0;
        r.mult = 1;
      }
    }
    if (r.labelT > 0) {
      r.labelT -= dt;
      if (r.labelT <= 0) r.label = '';
    }
    moveCat(dt);
    updateItems(dt, sp);
  }

  function updateDying(dt) {
    r.dying += dt;
    r.vy = Math.min(MAX_V, r.vy + FALL * dt);
    r.cy = Math.min(maxY(), r.cy + r.vy * dt);
    r.shake = Math.max(0, r.shake - dt);
    updateItems(dt, speed() * Math.max(0.2, 1 - r.dying));
    if (r.dying > 1.1) finish();
  }

  function refreshHud() {
    const score = Math.floor(r.score);
    const comboLabel = r.label || (r.combo >= 3 ? `Комбо ${r.combo}${r.mult > 1 ? ` · ×${r.mult}` : ''}` : '');
    hud.update({
      lives: r.lives, score, best: Math.max(r.best, score), coins: r.coins,
      comboLabel, star: r.star > 0 ? r.star / STAR_SECONDS : 0,
    });
  }

  function drawItem(ctx, it) {
    if (it.k === 'coin') {
      blit(ctx, sprite('coin'), it.x, it.y, Math.max(0.18, Math.abs(Math.cos(r.t * 6 + it.ph))));
    } else if (it.k === 'cloud') {
      const bolt = Math.floor(r.t * 5 + it.ph) % 3 === 0;
      blit(ctx, sprite(bolt ? 'cloud' : 'cloudOff'), it.x, it.y + Math.sin(it.bob) * 3 + 3);
    } else {
      blit(ctx, sprite(it.k === 'vac' ? 'vacuum' : it.k), it.x, it.y);
    }
  }

  function onKey(e) {
    if (e.repeat) return;
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      if (document.activeElement && document.activeElement.tagName === 'BUTTON') return;
      e.preventDefault();
      if (mode === 'ready') startRun();
      if (mode === 'play') holding = true;
    } else if (e.code === 'Escape' || e.code === 'KeyP') {
      if (mode === 'play') pause();
      else if (mode === 'paused') resume();
    }
  }

  function onKeyUp(e) {
    if (e.code === 'Space' || e.code === 'ArrowUp') holding = false;
  }

  function onVisibility() {
    if (document.hidden) pause();
  }

  const scene = {
    enter() {
      hud = createHud({ pause, resume, finish, again: startRun, home: () => go('living', { coins: r.coins }) });
      cat = createCat();
      cat.outfit = { ...state.get().equipped };
      cat.play('fly', { loop: true });
      cat.facing = 1;
      backdrop = createBackdrop(calm);
      rainbow = createRainbow(CAT_X - 8, calm);
      fx = createParticles();
      r = fresh();
      rainbow.reset(trailY());
      holding = false;
      setMode('ready');
      refreshHud();
      music('nyan');
      window.addEventListener('keydown', onKey);
      window.addEventListener('keyup', onKeyUp);
      document.addEventListener('visibilitychange', onVisibility);
    },

    exit() {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('visibilitychange', onVisibility);
      hud.destroy();
      music('home');
    },

    update(dt) {
      if (mode === 'paused') return;
      const sp = { play: speed(), dying: speed() * Math.max(0.2, 1 - r.dying), ready: 25, over: 20 }[mode];
      backdrop.update(dt, sp);
      if (mode === 'play') updatePlay(dt);
      else if (mode === 'dying') updateDying(dt);
      else if (mode === 'ready') {
        r.t += dt;
        r.cy = restY() + Math.sin(r.t * 2.2) * 6;
      }
      rainbow.update(dt, sp, trailY());
      cat.update(dt);
      fx.update(dt);
      refreshHud();
    },

    draw(ctx) {
      const shaking = r.shake > 0;
      ctx.save();
      if (shaking) ctx.translate(Math.round(rnd(-2, 2)), Math.round(rnd(-2, 2)));
      backdrop.draw(ctx);
      rainbow.draw(ctx, r.star > 0);
      for (const it of r.items) drawItem(ctx, it);
      if (!(r.invuln > 0 && Math.floor(r.invuln * 12) % 2 === 0)) {
        const bob = mode === 'play' ? Math.sin(r.t * 9) : 0;
        cat.draw(ctx, CAT_X, r.cy + catH() / 2 + bob, { scale: catScale() });
      }
      fx.draw(ctx);
      ctx.restore();
    },

    pointer(type, p) {
      if (type === 'down') {
        if (mode === 'ready') startRun();
        if (mode === 'play') {
          holding = true;
          holdId = p.id;
        }
      } else if ((type === 'up' || type === 'cancel') && p.id === holdId) {
        holding = false;
      }
    },
  };

  register('nyan', scene);
}
