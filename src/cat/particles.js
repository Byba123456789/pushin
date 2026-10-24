import { drop } from './face.js';
import { foodIcon } from './props.js';

const LINE = '#4b2e1e';
const rnd = (a, b) => a + Math.random() * (b - a);

// a — якоря текущего кадра в единицах кота относительно точки на полу, с учётом направления
const SPAWN = {
  heart: (a) => [0, 0.2, 0.4].map((d) => ({ d, life: 1.5, x: a.head[0] + rnd(-12, 12), y: a.head[1] - 3, vy: -16, ph: rnd(0, 6) })),
  note: (a) => [0, 0.35].map((d, n) => ({ d, life: 1.4, x: a.head[0] + rnd(-6, 14) * a.dir, y: a.head[1] - 4, vy: -14, ph: rnd(0, 6), v: n })),
  tear: (a) => [a.eyeF, a.eyeB].map((e, n) => ({ d: n * 0.35, life: 2, x: e[0], y: e[1] + 3, vy: 8, slide: 0.35 })),
  steam: (a) => [0, 0.12, 0.26, 0.4].map((d, n) => ({ d, life: 1, x: (n % 2 ? a.ear : a.head)[0] + rnd(-3, 3), y: a.head[1] - 2, vx: rnd(-8, 8), vy: -17 })),
  zzz: (a) => [0, 0.5, 1].map((d) => ({ d, life: 1.7, x: a.head[0] + 8 * a.dir, y: a.head[1] - 6, vx: 7 * a.dir, vy: -10, ph: rnd(0, 6) })),
  sweat: (a) => [{ d: 0, life: 1.3, x: a.head[0] - 16 * a.dir, y: a.head[1] + 10, vx: -3 * a.dir, vy: 9, slide: 0.6 }],
  sparkle: (a) => [0, 0.1, 0.22, 0.34].map((d) => ({ d, life: 0.55, x: a.center[0] + rnd(-a.halfW - 8, a.halfW + 8), y: rnd(a.head[1] - 12, a.center[1]) })),
  bubble: (a) => [0, 0.15, 0.3, 0.45].map((d) => ({ d, life: rnd(0.9, 1.4), x: a.center[0] + rnd(-a.halfW, a.halfW), y: a.top[1] + rnd(0, 6), vy: -13, ph: rnd(0, 6) })),
  stink: (a) => [0, 0.4].map((d) => ({ d, life: 1.4, x: a.center[0] + rnd(-a.halfW + 6, a.halfW - 6), y: a.top[1] - 3, vy: -9, ph: rnd(0, 6) })),
  drops: (a) => Array.from({ length: 7 }, () => {
    const s = Math.random() < 0.5 ? -1 : 1;
    return { d: 0, life: 0.7, x: a.center[0] + s * (a.halfW - 3), y: a.center[1] + rnd(-14, 4), vx: s * rnd(40, 80), vy: rnd(-80, -40), g: 240 };
  }),
  crumbs: (a) => Array.from({ length: 4 }, () => ({ d: 0, life: 0.5, x: a.mouth[0] + rnd(-3, 5) * a.dir, y: a.mouth[1] + 2, vx: rnd(-25, 25), vy: rnd(-40, -15), g: 200, crumb: 1 })),
  spray: (a) => Array.from({ length: 6 }, () => ({ d: 0, life: 0.45, x: a.mouth[0] + 3 * a.dir, y: a.mouth[1], vx: a.dir * rnd(45, 90), vy: rnd(-20, 10), g: 80 })),
};

export function spawn(list, kind, a, reduced) {
  const make = SPAWN[kind];
  if (!make) return;
  let items = make(a);
  if (reduced && items.length > 2) items = items.slice(0, 2);
  for (const p of items) list.push({ k: kind, t: -p.d, vx: 0, vy: 0, ...p });
}

export function step(list, dt) {
  for (let i = list.length - 1; i >= 0; i--) {
    const p = list[i];
    p.t += dt;
    if (p.t < 0) continue;
    if (p.t >= p.life) {
      list.splice(i, 1);
      continue;
    }
    if (p.k === 'tear' || p.k === 'sweat') {
      if (p.t > p.slide) {
        p.vy += 170 * dt;
        p.x += p.vx * dt;
      }
      p.y += p.vy * dt;
      if (p.y >= 0 && p.land === undefined) p.land = p.t;
      if (p.land !== undefined) {
        p.y = 0;
        if (p.t - p.land > 0.18) list.splice(i, 1);
      }
      continue;
    }
    if (p.g) p.vy += p.g * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }
}

function heartPath(ctx, x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x, y + 3 * s);
  ctx.bezierCurveTo(x - 4.6 * s, y - 0.2 * s, x - 2.4 * s, y - 4 * s, x, y - 1.7 * s);
  ctx.bezierCurveTo(x + 2.4 * s, y - 4 * s, x + 4.6 * s, y - 0.2 * s, x, y + 3 * s);
}

function stroke(ctx, w = 1.1, col = LINE) {
  ctx.strokeStyle = col;
  ctx.lineWidth = w;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function star(ctx, x, y, r) {
  ctx.beginPath();
  for (let k = 0; k < 8; k++) {
    const rr = k % 2 ? r * 0.32 : r;
    const a = (k * Math.PI) / 4 - Math.PI / 2;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
}

export function drawParticle(ctx, p) {
  const t = p.t;
  const end = p.life - t;
  switch (p.k) {
    case 'heart': {
      const s = t < 0.1 || end < 0.25 ? 0.7 : 1;
      heartPath(ctx, p.x + Math.sin(t * 4 + p.ph) * 3, p.y, s);
      ctx.fillStyle = '#f6a5b6';
      ctx.fill();
      stroke(ctx, 0.9);
      break;
    }
    case 'note': {
      const x = p.x + Math.sin(t * 5 + p.ph) * 2.5;
      const y = p.y;
      ctx.beginPath();
      ctx.moveTo(x + 1.4, y + 2.6);
      ctx.lineTo(x + 1.4, y - 4);
      if (p.v) {
        ctx.lineTo(x + 6, y - 5);
        ctx.lineTo(x + 6, y + 1.6);
      } else ctx.quadraticCurveTo(x + 3.4, y - 2.6, x + 3.6, y - 0.6);
      stroke(ctx, 1);
      ctx.fillStyle = '#f6a5b6';
      for (const dx of p.v ? [0, 4.6] : [0]) {
        ctx.beginPath();
        ctx.ellipse(x + dx, y + 2.8, 1.6, 1.25, -0.4, 0, Math.PI * 2);
        ctx.fill();
        stroke(ctx, 0.8);
      }
      break;
    }
    case 'tear':
    case 'sweat':
      if (p.land !== undefined) {
        ctx.fillStyle = '#a8dcf5';
        for (const dx of [-2.4, 2.4]) {
          ctx.beginPath();
          ctx.arc(p.x + dx, p.y - 1, 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      } else drop(ctx, p.x, p.y, 1, '#a8dcf5');
      break;
    case 'steam': {
      const r = t < 0.2 ? 1.6 : t < 0.55 ? 2.6 : t < 0.85 ? 3.4 : 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      stroke(ctx, 0.8, '#b8aca4');
      break;
    }
    case 'zzz': {
      const s = t < 0.45 ? 1.6 : 2.4;
      const x = p.x + Math.sin(t * 3 + p.ph) * 2;
      ctx.beginPath();
      ctx.moveTo(x - s, p.y - s);
      ctx.lineTo(x + s, p.y - s);
      ctx.lineTo(x - s, p.y + s);
      ctx.lineTo(x + s, p.y + s);
      stroke(ctx, 1.1);
      break;
    }
    case 'sparkle': {
      const r = [1.2, 2.2, 3, 2.2, 1.2][Math.min(4, Math.floor((t / p.life) * 5))];
      star(ctx, p.x, p.y, r);
      ctx.fillStyle = LINE;
      ctx.fill();
      break;
    }
    case 'bubble': {
      const x = p.x + Math.sin(t * 6 + p.ph) * 1.5;
      ctx.beginPath();
      ctx.arc(x, p.y, end < 0.12 ? 3.4 : 2.6, 0, Math.PI * 2);
      if (end >= 0.12) {
        ctx.fillStyle = 'rgba(214, 238, 252, 0.7)';
        ctx.fill();
      }
      ctx.setLineDash(end < 0.12 ? [1, 1.6] : []);
      stroke(ctx, 0.8, '#7fb8e0');
      ctx.setLineDash([]);
      break;
    }
    case 'stink': {
      const x = p.x + Math.sin(t * 2 + p.ph);
      ctx.beginPath();
      ctx.moveTo(x, p.y + 4);
      ctx.bezierCurveTo(x + 2.4, p.y + 2, x - 2.4, p.y, x, p.y - 2);
      ctx.bezierCurveTo(x + 2.4, p.y - 3.4, x - 1, p.y - 4.6, x, p.y - 6);
      stroke(ctx, 1, '#8fb067');
      break;
    }
    default:
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.crumb ? 0.8 : 1, 0, Math.PI * 2);
      ctx.fillStyle = p.crumb ? '#c99a6b' : '#7fc3ec';
      ctx.fill();
  }
}

export function drawFly(ctx, x, y, flap) {
  ctx.fillStyle = 'rgba(214, 238, 247, 0.9)';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(x + s * 1.3, y - (flap ? 1.4 : 0.6), 1.3, 0.8, s * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(x, y, 0.95, 0, Math.PI * 2);
  ctx.fillStyle = LINE;
  ctx.fill();
}

function icon(ctx, name, food) {
  switch (name) {
    case 'food':
      foodIcon(ctx, food || 'fish', 0, 0, 1);
      break;
    case 'clean':
      for (const [x, y, r] of [[-2.6, 1.4, 3.2], [2.8, -1.6, 2.4], [3, 3.4, 1.4]]) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = '#dff1fc';
        ctx.fill();
        stroke(ctx, 0.9, '#7fb8e0');
      }
      break;
    case 'energy':
      ctx.beginPath();
      ctx.arc(0, 0, 4.4, Math.PI * 0.35, Math.PI * 1.65);
      ctx.quadraticCurveTo(-0.6, 0, 2, 3.8);
      ctx.closePath();
      ctx.fillStyle = '#ffd86b';
      ctx.fill();
      stroke(ctx, 1);
      break;
    case 'fun':
      ctx.beginPath();
      ctx.arc(0, 0, 4.4, 0, Math.PI * 2);
      ctx.fillStyle = '#b495e6';
      ctx.fill();
      stroke(ctx, 1);
      ctx.beginPath();
      ctx.moveTo(-3, -3);
      ctx.quadraticCurveTo(2, 0, -2.6, 3.4);
      ctx.moveTo(0, -4.3);
      ctx.quadraticCurveTo(4, 0, 0.6, 4.3);
      stroke(ctx, 0.7, '#8a66cc');
      break;
    case 'potty':
      ctx.beginPath();
      ctx.roundRect(-4.4, -5, 3.6, 5, 0.8);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      stroke(ctx, 0.9);
      ctx.beginPath();
      ctx.moveTo(-4.6, 0);
      ctx.lineTo(4.6, 0);
      ctx.quadraticCurveTo(4.2, 4.4, 0, 4.4);
      ctx.quadraticCurveTo(-4.2, 4.4, -4.6, 0);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      stroke(ctx, 0.9);
      ctx.beginPath();
      ctx.ellipse(0, 0.2, 3.2, 1, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#a8dcf5';
      ctx.fill();
      break;
  }
}

export function drawBubble(ctx, hx, hy, dir, t, bob, name, food) {
  const dots = [[hx + 6 * dir, hy - 4, 1.4], [hx + 10 * dir, hy - 9, 2]];
  dots.forEach(([x, y, r], i) => {
    if (t < i * 0.1) return;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    stroke(ctx, 1);
  });
  if (t < 0.2) return;
  const cx = hx + 18 * dir;
  const cy = hy - 22 + bob;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 11, 8.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  stroke(ctx, 1.3);
  ctx.save();
  ctx.translate(cx, cy);
  icon(ctx, name, food);
  ctx.restore();
}
