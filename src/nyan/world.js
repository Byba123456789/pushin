import { W, H } from '../core/engine.js';
import { sprite, blit, OUT, PASTEL } from './sprites.js';

const rnd = (a, b) => a + Math.random() * (b - a);

function sparkle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

export function createBackdrop(still) {
  const dots = Array.from({ length: 34 }, () => ({ x: rnd(0, W), y: Math.random(), r: rnd(0.35, 0.9), speed: rnd(0.04, 0.1) }));
  const twinkles = Array.from({ length: 8 }, () => ({ x: rnd(0, W), y: Math.random(), ph: rnd(0, 6.28), rate: rnd(1.6, 3), size: rnd(2.2, 3.6) }));
  const clouds = [
    { name: 'cloudBig', x: 30, y: 0.2, speed: 0.07 },
    { name: 'cloudSmall', x: 140, y: 0.46, speed: 0.1 },
    { name: 'cloudBig', x: 100, y: 0.74, speed: 0.08 },
    { name: 'cloudSmall', x: 10, y: 0.9, speed: 0.12 },
  ];
  const planets = [
    { name: 'planetPeach', x: 150, y: 0.32, speed: 0.04 },
    { name: 'planetMint', x: 40, y: 0.62, speed: 0.055 },
  ];
  let time = 0;

  const wrap = (list, margin, scroll, dt, respawn) => {
    for (const o of list) {
      o.x -= scroll * o.speed * dt;
      if (o.x < -margin) {
        o.x += W + margin * 2;
        respawn(o);
      }
    }
  };

  return {
    update(dt, scroll) {
      time += dt;
      wrap(dots, 2, scroll, dt, (o) => { o.y = Math.random(); });
      for (const t of twinkles) {
        t.x -= scroll * 0.1 * dt;
        if (t.x < -6) {
          t.x += W + 12;
          t.y = Math.random();
        }
      }
      wrap(planets, 34, scroll, dt, (o) => { o.y = rnd(0.15, 0.85); });
      wrap(clouds, 40, scroll, dt, (o) => { o.y = rnd(0.1, 0.95); });
    },
    draw(ctx) {
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#a99ce8');
      sky.addColorStop(0.55, '#d2b6ee');
      sky.addColorStop(1, '#fbc9dc');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      for (const d of dots) {
        ctx.beginPath();
        ctx.arc(d.x, d.y * H, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      for (const p of planets) blit(ctx, sprite(p.name), p.x, p.y * H);
      for (const c of clouds) blit(ctx, sprite(c.name), c.x, c.y * H);
      ctx.fillStyle = '#fff7cf';
      for (const t of twinkles) {
        const k = still ? 0.7 : 0.55 + 0.45 * Math.sin(time * t.rate + t.ph);
        sparkle(ctx, t.x, t.y * H, t.size * k);
      }
    },
  };
}

export function createRainbow(headX, still) {
  const len = Math.ceil(headX / 2) + 2;
  const ys = new Array(len).fill(0);
  let pushed = 0;
  let acc = 0;
  let time = 0;
  const BAND = 2.2;
  const SMOOTH = 3;
  const TANGENT = 3;
  const clampIndex = (i) => Math.max(0, Math.min(len - 1, i));

  const pts = Array.from({ length: len }, () => ({ x: 0, y: 0, nx: 0, ny: 0 }));

  const layout = () => {
    for (let i = 0; i < len; i++) {
      const p = pts[i];
      let sum = 0;
      for (let k = -SMOOTH; k <= SMOOTH; k++) sum += ys[clampIndex(i + k)];
      p.x = headX - i * 2;
      p.y = sum / (SMOOTH * 2 + 1) + Math.sin((pushed - i) * 0.45) * 2;
    }
    for (let i = 0; i < len; i++) {
      const a = pts[clampIndex(i - TANGENT)];
      const b = pts[clampIndex(i + TANGENT)];
      const tx = b.x - a.x;
      const ty = b.y - a.y;
      const l = Math.hypot(tx, ty) || 1;
      pts[i].nx = ty / l;
      pts[i].ny = -tx / l;
    }
  };

  const path = (ctx, offset) => {
    ctx.beginPath();
    for (let i = 0; i < len; i++) {
      const p = pts[i];
      const x = p.x + p.nx * offset;
      const y = p.y + p.ny * offset;
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    }
  };

  return {
    reset(y) {
      ys.fill(y);
      acc = 0;
    },
    update(dt, scroll, y) {
      time += dt;
      acc += (scroll * dt) / 2;
      while (acc >= 1) {
        acc -= 1;
        ys.pop();
        ys.unshift(y);
        pushed++;
      }
    },
    draw(ctx, boost) {
      const n = PASTEL.length;
      const shift = boost && !still ? Math.floor(time * 10) : 0;
      layout();
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeStyle = OUT;
      ctx.lineWidth = n * BAND + 2.4;
      path(ctx, 0);
      ctx.stroke();
      ctx.lineCap = 'butt';
      ctx.lineWidth = BAND + 0.15;
      for (let k = 0; k < n; k++) {
        ctx.strokeStyle = PASTEL[(k + shift) % n];
        path(ctx, (k - (n - 1) / 2) * BAND);
        ctx.stroke();
      }
    },
  };
}

export function createParticles() {
  let list = [];
  const push = (p) => {
    if (list.length < 160) list.push(p);
  };
  return {
    burst(x, y, n, colors, { speed = 40, life = 0.5, size = 1.4 } = {}) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = rnd(0.4, 1) * speed;
        push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: rnd(0.6, 1) * life, size, color: colors[i % colors.length], rot: 0, spin: 0 });
      }
    },
    rain(n, colors) {
      for (let i = 0; i < n; i++) {
        push({ x: rnd(0, W), y: -4, vx: rnd(-12, 12), vy: rnd(30, 70), t: 0, life: rnd(2, 3.5), size: rnd(1.4, 2.2), color: colors[i % colors.length], rot: rnd(0, 6), spin: rnd(-6, 6), rect: true });
      }
    },
    update(dt) {
      for (const p of list) {
        p.t += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.spin * dt;
      }
      list = list.filter((p) => p.t < p.life);
    },
    draw(ctx) {
      for (const p of list) {
        ctx.globalAlpha = Math.min(1, (p.life - p.t) * 3);
        ctx.fillStyle = p.color;
        if (p.rect) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillRect(-p.size, -p.size * 0.5, p.size * 2, p.size);
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 - (p.t / p.life) * 0.4), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    },
    clear() {
      list = [];
    },
  };
}
