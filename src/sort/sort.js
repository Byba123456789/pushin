import { W, H, scale, register, go } from '../core/engine.js';
import { createCat } from '../cat/cat.js';
import { createParticles } from '../nyan/world.js';
import * as state from '../state/state.js';
import { SORT } from '../state/catalog.js';
import { sfx } from '../audio/audio.js';
import { CAP, canPour, createGame, parseLevel, startLevel } from './logic.js';
import { layoutJars } from './layout.js';
import { pourPose, pourDuration, pourDir } from './pour.js';
import { createHud } from './hud.js';
import { COLORS, drawBackground, drawShelf, drawShadow, drawJar, drawStream, drawRug } from './render.js';

const CAT_X = 44;
const CAT_SCALE = 0.62;
const FLOOR_GAP = 16;
const FEET_BELOW_FLOOR = 10;
const BOARD_PAD = 4;
const LIFT_LAYERS = 0.8;
const LIFT_SPEED = 18;
const SHAKE_SECONDS = 0.35;
const WIN_DELAY = 0.9;
const HIT_ABOVE = 1.3;
const HIT_BELOW = 8;
const STREAM_RAMP = 8;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const tg = window.Telegram && window.Telegram.WebApp;
const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isComplete = (tube) => tube.length === CAP && tube.every((c) => c === tube[0]);

function haptic(kind) {
  const h = tg && tg.HapticFeedback;
  if (!h) return;
  if (kind === 'error') h.notificationOccurred('error');
  else h.impactOccurred('light');
}

function loadCss() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL('./sort.css' + new URL(import.meta.url).search, import.meta.url).href;
  document.head.appendChild(link);
}

let levelsPromise = null;
const loadLevels = () => (levelsPromise ??= fetch(new URL('./levels.json' + new URL(import.meta.url).search, import.meta.url))
  .then((res) => res.json())
  .then((list) => list.map(parseLevel)));

export function registerSort() {
  loadCss();

  let hud = null;
  let cat = null;
  let fx = null;
  let levels = null;
  let level = 1;
  let game = null;
  let layout = null;
  let vis = [];
  let sel = -1;
  let anim = null;
  let mode = 'loading';
  let winAt = 0;
  let reward = null;
  let sessionCoins = 0;
  let floorY = 0;
  let enterId = 0;

  const cssPerLogical = () => scale / (window.devicePixelRatio || 1);
  const catHeight = () => (cat.height || 70) * CAT_SCALE;
  const feetY = () => floorY + FEET_BELOW_FLOOR;
  const min = () => levels[level - 1].min;
  const geometry = () => ({ w: layout.jarW, h: layout.jarH, layerH: layout.layerH });

  function relayout() {
    const css = cssPerLogical();
    const bounds = hud.bounds();
    floorY = bounds.bottom / css - FLOOR_GAP;
    if (!game) return;
    layout = layoutJars(game.tubes.length, {
      width: W,
      top: bounds.top / css + BOARD_PAD,
      bottom: feetY() - catHeight() - BOARD_PAD,
    });
  }

  function syncVis() {
    while (vis.length < game.tubes.length) vis.push({ lift: 0, shake: 0, lid: 0 });
    vis.length = game.tubes.length;
  }

  function refreshHud() {
    hud.setLevel(level);
    hud.setMoves(game.moves);
    hud.setButtons({
      canUndo: mode === 'play' && !anim && game.canUndo,
      canJar: mode === 'play' && !anim && !game.extraUsed && state.canBuySortJar(),
    });
    const stuck = mode === 'play' && !anim && game.stuck;
    hud.setStuck(stuck);
    cat.mood = stuck ? 'sad' : 'neutral';
  }

  function begin(n) {
    level = n;
    game = createGame(levels[n - 1].tubes);
    vis = [];
    sel = -1;
    anim = null;
    reward = null;
    mode = 'play';
    fx.clear();
    syncVis();
    hud.hideWin();
    hud.hideLevels();
    relayout();
    refreshHud();
    cat.play('idle');
  }

  function openLevels() {
    hud.showLevels(state.sortInfo(), level);
  }

  function startWin() {
    mode = 'won';
    winAt = 0;
    sel = -1;
    reward = state.finishSort(level, game.moves, min());
    sessionCoins += reward.coins;
    sfx('levelup');
    haptic('light');
    cat.play('happy', { onDone: () => cat.play('laugh') });
    cat.emit('sparkle');
    if (!calm) fx.rain(60, COLORS);
    refreshHud();
  }

  function finishAnim() {
    const { to } = anim;
    anim = null;
    if (isComplete(game.tubes[to])) {
      const j = layout.jars[to];
      sfx('pop');
      fx.burst(j.x, j.y - layout.jarH, 8, [COLORS[game.tubes[to][0]], '#ffffff'], { speed: 40, life: 0.5, size: 1.3 });
    }
    if (game.solved) startWin();
    else refreshHud();
  }

  function pourJars(from, to) {
    const before = game.tubes;
    const r = game.move(from, to);
    sel = -1;
    anim = { before, from, to, moved: r.moved, color: r.color, dir: pourDir(layout.jars[from].x, layout.jars[to].x, W, layout.jarH), t: 0, flow: 0, pose: null, dur: pourDuration(r.moved) / 1000 };
    sfx('splash');
    haptic('light');
    refreshHud();
  }

  function tapJar(i) {
    if (sel === -1) {
      if (game.tubes[i].length) {
        sel = i;
        sfx('tap');
      }
    } else if (sel === i) {
      sel = -1;
      sfx('tap');
    } else if (canPour(game.tubes, sel, i)) {
      pourJars(sel, i);
    } else {
      vis[i].shake = calm ? 0 : SHAKE_SECONDS;
      haptic('error');
    }
  }

  function undo() {
    if (mode !== 'play' || anim || !game.undo()) return;
    sel = -1;
    sfx('tap');
    refreshHud();
  }

  function addJar() {
    if (mode !== 'play' || anim || game.extraUsed || !state.buySortJar()) return;
    game.addJar();
    syncVis();
    relayout();
    sfx('buy');
    const j = layout.jars[layout.jars.length - 1];
    fx.burst(j.x, j.y - layout.jarH / 2, 8, ['#ffffff', '#cfeee2'], { speed: 35, life: 0.5, size: 1.3 });
    refreshHud();
  }

  function jarAt(px, py) {
    let best = -1;
    let bestDist = Infinity;
    layout.jars.forEach((j, i) => {
      const top = j.y - layout.jarH - layout.layerH * HIT_ABOVE;
      if (Math.abs(px - j.x) > layout.pitch / 2 || py < top || py > j.y + HIT_BELOW) return;
      const dist = Math.abs(py - (j.y - layout.jarH / 2));
      if (dist < bestDist) {
        best = i;
        bestDist = dist;
      }
    });
    return best;
  }

  function displayLayers(i) {
    const tube = (anim ? anim.before : game.tubes)[i];
    const layers = tube.map((color) => ({ color, fill: 1 }));
    if (!anim) return layers;
    const shown = anim.flow * anim.moved;
    if (i === anim.from) {
      for (let k = 0; k < anim.moved; k++) layers[tube.length - 1 - k].fill = clamp(1 - (shown - k), 0, 1);
    } else if (i === anim.to) {
      for (let k = 0; k < anim.moved; k++) layers.push({ color: anim.color, fill: clamp(shown - k, 0, 1) });
    }
    return layers;
  }

  function jarState(i) {
    const rest = layout.jars[i];
    const v = vis[i];
    const shake = v.shake > 0 ? Math.sin(v.shake * 70) * 1.3 * (v.shake / SHAKE_SECONDS) : 0;
    return {
      x: rest.x + shake,
      y: rest.y - v.lift * layout.layerH * LIFT_LAYERS,
      angle: 0,
      layers: displayLayers(i),
      lid: v.lid,
      lidColor: COLORS[game.tubes[i][0] ?? 0],
    };
  }

  function updateAnim(dt) {
    anim.t += dt;
    const k = clamp(anim.t / anim.dur, 0, 1);
    const pose = pourPose(k, layout.jars[anim.from], layout.jars[anim.to], geometry(), anim.dir);
    anim.pose = pose;
    anim.flow = pose.flow;
    if (k >= 1) finishAnim();
  }

  const actions = {
    exit: () => go('living', { coins: sessionCoins }),
    levels: openLevels,
    closeLevels: () => hud.hideLevels(),
    undo,
    restart: () => {
      if (mode === 'play' && !anim) begin(level);
    },
    jar: addJar,
    next: () => begin(level + 1),
    pick: (n) => {
      if (n <= state.sortInfo().unlocked) begin(n);
    },
  };

  const scene = {
    enter() {
      const id = ++enterId;
      hud = createHud(actions);
      cat = createCat();
      cat.outfit = { ...state.get().equipped };
      cat.facing = 1;
      fx = createParticles();
      mode = 'loading';
      game = null;
      sessionCoins = 0;
      relayout();
      document.fonts.ready.then(() => hud && relayout());
      loadLevels().then((list) => {
        if (id !== enterId || !hud) return;
        levels = list;
        begin(startLevel(state.sortInfo()));
      });
    },

    exit() {
      enterId++;
      hud.destroy();
      hud = null;
      game = null;
    },

    resize() {
      relayout();
    },

    update(dt) {
      if (!game) return;
      cat.update(dt);
      fx.update(dt);
      vis.forEach((v, i) => {
        const complete = isComplete(game.tubes[i]) && !(anim && anim.to === i);
        v.lift += ((sel === i ? 1 : 0) - v.lift) * Math.min(1, dt * LIFT_SPEED);
        v.lid += ((complete ? 1 : 0) - v.lid) * Math.min(1, dt * LIFT_SPEED);
        v.shake = Math.max(0, v.shake - dt);
      });
      if (anim) updateAnim(dt);
      if (mode === 'won') {
        winAt += dt;
        if (reward && winAt >= WIN_DELAY) {
          hud.showWin({ level, stars: reward.stars, moves: game.moves, coins: reward.coins, hasNext: level < SORT.levels });
          reward = null;
        }
      }
    },

    draw(ctx) {
      if (!hud) return;
      drawBackground(ctx, W, H, floorY);
      drawRug(ctx, CAT_X, feetY() - 1);
      cat.draw(ctx, CAT_X, feetY(), { scale: CAT_SCALE });
      if (!game) return;
      for (const y of new Set(layout.jars.map((j) => j.y))) drawShelf(ctx, W, y);
      layout.jars.forEach((j, i) => drawShadow(ctx, j.x, j.y, layout.jarW, vis[i].lift));
      const geo = geometry();
      layout.jars.forEach((_, i) => {
        if (!anim || anim.from !== i) drawJar(ctx, jarState(i), geo);
      });
      if (anim?.pose) {
        const { pose } = anim;
        drawJar(ctx, { ...jarState(anim.from), x: pose.x, y: pose.y, angle: pose.angle }, geo);
        if (pose.stream) {
          const target = layout.jars[anim.to];
          const surface = target.y - (anim.before[anim.to].length + anim.flow * anim.moved) * layout.layerH;
          const ramp = Math.min(1, pose.flow * STREAM_RAMP, (1 - pose.flow) * STREAM_RAMP);
          drawStream(ctx, pose.lip, surface, COLORS[anim.color], layout.jarW * 0.14 * ramp);
        }
      }
      fx.draw(ctx);
    },

    pointer(type, p) {
      if (type !== 'down' || mode !== 'play' || anim || !game) return;
      const i = jarAt(p.x, p.y);
      if (i !== -1) tapJar(i);
    },
  };

  register('sort', scene);
}
