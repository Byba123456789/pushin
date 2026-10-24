import { drawCat } from './draw.js';
import { inPoly } from './shape.js';
import { BASE, ANIMS, IDLE, SLEEP, MOOD_FACE, LOOPS, MOODY } from './anims.js';
import { spawn, step, drawParticle, drawFly, drawBubble } from './particles.js';

const BLINKS = { dot: 'closed', half: 'closed', big: 'closed' };
const ICONS = new Set(['food', 'clean', 'energy', 'fun', 'potty']);
const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const rand = (a, b) => a + Math.random() * (b - a);

export function createActor({ pal, size = 1, outfits = true }) {
  let anim = 'idle';
  let frames = null;
  let idx = 0;
  let ft = 0;
  let loop = true;
  let onDone = null;
  let clock = 0;
  let blinkIn = rand(3, 5);
  let blinkT = -1;
  let twitchIn = rand(4, 8);
  let twitchT = -1;
  let zzzIn = 0;
  let stinkIn = 0;
  let sweatIn = rand(2, 4);
  let icon = null;
  let iconT = 0;
  let last = null;
  const parts = [];

  const table = () => {
    if (anim !== 'idle') return frames;
    return a.sleeping ? SLEEP : IDLE[a.mood] || IDLE.neutral;
  };

  function pose() {
    const t = table();
    const fr = t[idx] || t[0];
    const p = Object.assign({}, BASE, (MOODY.has(anim) && !a.sleeping && MOOD_FACE[a.mood]) || {}, fr.p);
    if (blinkT >= 0 && BLINKS[p.eyes]) p.eyes = BLINKS[p.eyes];
    if (twitchT >= 0 && anim === 'idle') p.eb = 12;
    p.food = a.food;
    return p;
  }

  function matrix(x, y, p, g, s) {
    const dir = a.facing * (p.flip || 1);
    return new DOMMatrix().translate(x, y).scale(s * dir, s).translate(0, p.oy || 0).multiply(g.m);
  }

  function anchors() {
    if (!last) return null;
    const { g, p, s } = last;
    const dir = a.facing * (p.flip || 1);
    const m = new DOMMatrix().scale(dir * size, size).translate(0, p.oy || 0).multiply(g.m);
    const at = (x, y) => {
      const q = m.transformPoint({ x, y });
      return [q.x / size, q.y / size];
    };
    const { x: fx, y: ey, es } = g.face;
    const ear = g.ears.length ? g.ears[1].tip : [g.hat.x, g.hat.y];
    return {
      dir, halfW: g.W / 2, s,
      head: at(g.hat.x, g.top(g.hat.x) - 2), eyeF: at(fx + es, ey), eyeB: at(fx - es, ey), mouth: at(fx, ey + 2),
      ear: at(ear[0], ear[1]), center: at(g.cx, g.bot - g.H / 2), top: at(g.cx, g.top(g.cx)),
    };
  }

  function emitNow(kind) {
    const an = anchors();
    if (an) spawn(parts, kind, an, reduced);
  }

  function enterFrame() {
    const f = (table()[idx] || {}).p;
    if (f && f.fx && (!f.fxp || Math.random() < f.fxp)) emitNow(f.fx);
  }

  const a = {
    width: Math.round(100 * size),
    height: Math.round(70 * size),
    mood: 'neutral',
    outfit: { head: null, eyes: null, body: null },
    dirt: 0,
    food: null,
    sleeping: false,
    facing: 1,

    get anim() {
      return anim;
    },

    play(name, opts = {}) {
      const ok = name !== 'idle' && !!ANIMS[name];
      anim = ok ? name : 'idle';
      frames = ok ? ANIMS[name] : null;
      loop = opts.loop !== undefined ? !!opts.loop : LOOPS.has(anim);
      onDone = opts.onDone || null;
      idx = 0;
      ft = 0;
      enterFrame();
    },

    update(dt) {
      clock += dt;
      const t = table();
      if (idx >= t.length) idx = 0;
      ft += dt * 1000;
      while (ft >= t[idx].ms) {
        ft -= t[idx].ms;
        idx++;
        if (idx >= t.length) {
          if (anim !== 'idle' && !loop) {
            const cb = onDone;
            anim = 'idle';
            onDone = null;
            idx = 0;
            ft = 0;
            if (cb) cb();
            break;
          }
          idx = 0;
        }
        enterFrame();
      }
      blinkIn -= dt;
      if (blinkIn <= 0 && blinkT < 0) {
        blinkT = 0;
        blinkIn = rand(3, 5);
      }
      if (blinkT >= 0 && (blinkT += dt) > 0.13) blinkT = -1;
      twitchIn -= dt;
      if (twitchIn <= 0 && twitchT < 0) {
        twitchT = 0;
        twitchIn = rand(4, 8);
      }
      if (twitchT >= 0 && (twitchT += dt) > 0.15) twitchT = -1;
      if (a.sleeping || anim === 'sleep') {
        if ((zzzIn -= dt) <= 0) {
          zzzIn = 2.6;
          emitNow('zzz');
        }
      } else zzzIn = 0.6;
      if (a.dirt > 0.5 && (stinkIn -= dt) <= 0) {
        stinkIn = rand(1.6, 2.4);
        emitNow('stink');
      }
      if (a.mood === 'potty' && anim === 'idle' && !a.sleeping && (sweatIn -= dt) <= 0) {
        sweatIn = rand(2.5, 4);
        emitNow('sweat');
      }
      if (icon) iconT += dt;
      step(parts, dt);
    },

    draw(ctx, x, y, { scale = 1 } = {}) {
      const p = pose();
      const s = scale * size;
      const dir = a.facing * (p.flip || 1);
      const dirt = Math.max(0, Math.min(1, a.dirt || 0));
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(s, s);
      if (!p.air) {
        const lift = Math.min(1, -(p.oy || 0) / 22);
        ctx.fillStyle = 'rgba(75, 46, 30, 0.12)';
        ctx.beginPath();
        ctx.ellipse(p.x * dir, 0.6, 38 * (1 - lift * 0.4), 3.4 * (1 - lift * 0.4), 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.save();
      ctx.scale(dir, 1);
      ctx.translate(0, p.oy || 0);
      const g = drawCat(ctx, p, pal, outfits ? a.outfit : null, dirt);
      ctx.restore();
      last = { g, p, s, x, y, m: matrix(x, y, p, g, s) };
      const an = anchors();
      if (dirt > 0.5) {
        for (let i = 0; i < (dirt > 0.8 ? 3 : 2); i++) {
          const ang = clock * (2.3 + i * 0.6) + i * 2.1;
          drawFly(ctx, an.center[0] + Math.cos(ang) * (26 + i * 7), an.head[1] - 4 + Math.sin(ang * 1.4) * 9, Math.floor(clock * 16 + i) % 2);
        }
      }
      for (const q of parts) if (q.t >= 0) drawParticle(ctx, q);
      if (icon) drawBubble(ctx, an.head[0], an.head[1], a.facing, iconT, reduced ? 0 : Math.sin(clock * 2.2) * 1.2, icon, a.food);
      ctx.restore();
    },

    hit(x, y, px, py) {
      if (!last) return null;
      const { g, m } = last;
      const inv = new DOMMatrix().translate(x - last.x, y - last.y).multiply(m).inverse();
      for (const [dx, dy] of [[0, 0], [2, 0], [-2, 0], [0, 2], [0, -2]]) {
        const q = inv.transformPoint({ x: px + dx, y: py + dy });
        const z = zone(g, q.x, q.y);
        if (z) return z;
      }
      return null;
    },

    emit(kind) {
      emitNow(kind);
    },

    say(name) {
      const next = ICONS.has(name) ? name : null;
      if (next === icon) return;
      icon = next;
      iconT = 0;
    },
  };
  return a;
}

function zone(g, x, y) {
  const { x: fx, y: ey } = g.face;
  if (inPoly(g.pts, x, y)) {
    if (y < g.earY) return 'ears';
    if (Math.hypot(x - fx, y - ey - g.face.my) <= 4.5) return 'nose';
    const h = g.head;
    if (((x - h.x) / h.rx) ** 2 + ((y - h.y) / h.ry) ** 2 <= 1) return 'head';
    return 'belly';
  }
  const t = g.tail.pts;
  for (let i = 0; i < t.length; i++) if (Math.hypot(x - t[i][0], y - t[i][1]) <= g.tail.w / 2 + 2) return 'tail';
  return null;
}
