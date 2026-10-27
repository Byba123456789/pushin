import { iconImage } from './icons.js';

const INK = '#4b2e1e';
const TAU = Math.PI * 2;
const CREAM = '#fffaf3';
const WOOD = '#e9b47a';
const PINK = '#f6a5b6';
const MINT = '#9fdcc8';
const BUTTER = '#ffd66b';
const SKY = '#a9d4f5';
const TEA = '#d99a5b';
const WATER = '#8fd0f5';
const SPOUT = { x: 164.5, dy: -64.5 };
const COUNTER = { x: 170, dy: -48 };
const SCREEN = { x: 147, dy: -80, w: 24, h: 26 };
const SHELF = { x: 139, dy: -22 };
const CAB = { x: 128, dy: -33, w: 23, h: 36 };
const PLANT = { x: 24, dy: 10 };
const HAND = { x: 36, y: -46 };
let c = null;

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = (k) => 1 - (1 - k) ** 3;
const back = (k) => 1 + 2.70158 * (k - 1) ** 3 + 1.70158 * (k - 1) ** 2;
const prog = (a, key, now, dur) => (a[key] === undefined ? 0 : clamp01((now - a[key]) / dur));

function line(lw = 1.2, col = INK) {
  c.lineWidth = lw;
  c.strokeStyle = col;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  c.stroke();
}

function paint(fill, lw = 1.2) {
  if (fill) {
    c.fillStyle = fill;
    c.fill();
  }
  if (lw) line(lw);
}

function rr(x, y, w, h, rad, fill, lw) {
  c.beginPath();
  c.roundRect(x, y, w, h, rad);
  paint(fill, lw);
}

function el(x, y, rx, ry, fill, lw) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, TAU);
  paint(fill, lw);
}

function ln(lw, col, ...p) {
  c.beginPath();
  c.moveTo(p[0], p[1]);
  for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]);
  line(lw, col);
}

function pth(d, fill, lw = 1.2) {
  const p = new Path2D(d);
  if (fill) {
    c.fillStyle = fill;
    c.fill(p);
  }
  if (lw) {
    c.lineWidth = lw;
    c.strokeStyle = INK;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.stroke(p);
  }
}

function puffs(x, y, now, n, rise, spread, alpha) {
  for (let k = 0; k < n; k++) {
    const ph = (now * 0.55 + k / n) % 1;
    c.globalAlpha = alpha * (1 - ph);
    el(x + Math.sin(ph * 6 + k * 2) * spread, y - ph * rise, 1.4 + ph * 2, 1.4 + ph * 2, '#ffffff', 0.6);
  }
  c.globalAlpha = 1;
}

function cup(x, y, fill) {
  c.save();
  c.translate(x, y);
  c.beginPath();
  c.arc(6.4, -5.4, 2.6, -1.5, 1.5);
  line(3.6);
  c.beginPath();
  c.arc(6.4, -5.4, 2.6, -1.5, 1.5);
  line(1.4, CREAM);
  pth('M-6.5-10h13l-1.4 8a2.5 2.5 0 0 1-2.5 2h-5.2a2.5 2.5 0 0 1-2.5-2z', CREAM, 1.2);
  ln(1.6, PINK, -5.3, -5.4, 5.3, -5.4);
  ln(0.9, 'rgba(255,255,255,0.9)', -4.6, -8.4, -3.8, -3.4);
  el(0, -10, 6.5, 1.8, '#f6e6d2', 1.1);
  if (fill > 0) el(0, -10, 5.4, 1.2 * fill + 0.2, TEA, 0);
  c.restore();
}

function drop(x, y) {
  c.save();
  c.translate(x, y);
  c.scale(1.5, 1.5);
  pth('M0-2.4c-1.6 2.2-1.6 4 0 4s1.6-1.8 0-4z', WATER, 0.5);
  c.restore();
}

function stream(x0, y0, x1, y1, now, col, w) {
  c.beginPath();
  c.moveTo(x0, y0);
  c.quadraticCurveTo(lerp(x0, x1, 0.8), y0 - 2.5, x1, y1);
  c.setLineDash([2.6, 1.4]);
  c.lineDashOffset = -now * 18;
  line(w, col);
  c.setLineDash([]);
}

function teaFront(L, a, now, cat) {
  const F = L.F;
  const boil = prog(a, 'boil', now, 0.5) * (1 - prog(a, 'pourEnd', now, 0.8));
  if (boil > 0) puffs(SPOUT.x, F + SPOUT.dy, now * 2.4, 5, 24, 3, boil);
  const spot = { x: COUNTER.x, y: F + COUNTER.dy };
  const hand = { x: cat.x + cat.dir * HAND.x, y: cat.y + HAND.y };
  const out = ease(prog(a, 'lift', now, 0.5)) * (1 - ease(prog(a, 'drop', now, 0.45)));
  const s = back(prog(a, 'cup', now, 0.35)) * (1 - prog(a, 'gone', now, 0.3));
  const fill = ease(prog(a, 'pour', now, 1.6));
  if (a.cup === undefined || s <= 0) return;
  const x = lerp(spot.x, hand.x, out);
  const y = lerp(spot.y, hand.y, out) - Math.sin(out * Math.PI) * 6;
  const pouring = a.pour !== undefined && a.pourEnd === undefined;
  if (pouring) stream(SPOUT.x, F + SPOUT.dy, x - 1.5, y - 10 * s, now, TEA, 1.7);
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  c.translate(-x, -y);
  cup(x, y, fill);
  c.restore();
  if (fill >= 1 && a.gone === undefined) puffs(x, y - 11, now * 1.4, 3, 12, 2, 0.9);
}

function plate(x, y, s) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  el(0, -1.2, 9.5, 2.6, '#fdf3ea', 1.1);
  el(0, -1.4, 6, 1.4, 'rgba(246,165,182,0.55)', 0);
  c.restore();
}

function treat(item, x, y) {
  const img = iconImage(item);
  if (img.complete) c.drawImage(img, x - 7, y - 7, 14, 14);
}

function snackFront(L, a, now) {
  const k = prog(a, 'fly', now, 0.75);
  if (k <= 0 || k >= 1) return;
  const e = ease(k);
  treat(a.item, lerp(SHELF.x, COUNTER.x, e), lerp(L.F + SHELF.dy, L.F + COUNTER.dy - 7, e) - Math.sin(k * Math.PI) * 14);
}

function snackPlate(L, a, now) {
  const s = back(prog(a, 'plate', now, 0.3)) * (1 - ease(prog(a, 'clear', now, 0.25)));
  if (s <= 0) return;
  const y = L.F + COUNTER.dy;
  plate(COUNTER.x, y, s);
  if (prog(a, 'fly', now, 0.75) >= 1 && a.eat === undefined) treat(a.item, COUNTER.x, y - 7);
}

function cabinet(L, a, now) {
  const F = L.F;
  const k = ease(prog(a, 'open', now, 0.45)) * (1 - ease(prog(a, 'shut', now, 0.4)));
  if (k <= 0) return;
  const x = CAB.x;
  const y = F + CAB.dy;
  rr(x, y, CAB.w, CAB.h, 3, '#e3c39a', 1.1);
  c.fillStyle = 'rgba(75,46,30,0.16)';
  c.fillRect(x + 1, y + 1, CAB.w - 2, 5);
  rr(x + 1.5, y + 17, CAB.w - 3, 2.6, 1, WOOD, 0.9);
  rr(x + 3, y + 5, 6.5, 12, 2.4, CREAM, 0.9);
  rr(x + 2.2, y + 3.4, 8.1, 3, 1.4, MINT, 0.8);
  el(x + 6.2, y + 12, 1.5, 1.5, PINK, 0);
  if (a.fly === undefined) {
    el(x + 16, y + 15.4, 5.6, 1.5, '#fdf3ea', 0.9);
    const img = iconImage(a.item);
    if (img.complete) c.drawImage(img, x + 10.4, y + 4.4, 11.2, 11.2);
  }
  rr(x + 3, y + 22.5, 17, 11, 4, '#f9cad5', 0.9);
  rr(x + 6, y + 21, 11, 3, 1.4, '#f4b4c4', 0.8);
  ln(0.7, 'rgba(255,255,255,0.7)', x + 5.5, y + 27, x + 5.5, y + 31);
  const ang = k * 1.9;
  const w = CAB.w * Math.cos(ang);
  const s = Math.sin(ang) * 3;
  pth(`M${x} ${y}l${w} ${-s}v${CAB.h + 2 * s}l${-w} ${-s}z`, w > 0 ? '#fff1dd' : '#f1dcc0', 1.1);
  if (w > 3) el(x + w - 3, y + CAB.h * 0.45, 1.6, 1.6, WOOD, 0.9);
}

function seaweed(x, y, now, ph) {
  c.beginPath();
  c.moveTo(x, y);
  c.quadraticCurveTo(x + Math.sin(now * 2 + ph) * 2.5, y - 5, x + Math.sin(now * 2 + ph + 1) * 1.5, y - 10);
  line(1.1, MINT);
}

function fish(x, y, dir, col, s) {
  c.save();
  c.translate(x, y);
  c.scale(dir * s, s);
  pth('M-3.4 0L-6.6-2.8v5.6z', col, 0.7);
  el(0, 0, 4, 2.7, col, 0.7);
  el(1.8, -0.5, 0.6, 0.6, INK, 0);
  c.restore();
}

function toon(x, y, now) {
  const g = c.createLinearGradient(0, y, 0, y + SCREEN.h);
  g.addColorStop(0, '#b9e3fb');
  g.addColorStop(1, '#e6f6ff');
  c.fillStyle = g;
  c.fillRect(x, y, SCREEN.w, SCREEN.h);
  for (let i = 0; i < 3; i++) {
    const ph = (now * 0.4 + i / 3) % 1;
    c.globalAlpha = 1 - ph;
    el(x + 6 + i * 6 + Math.sin(ph * 8 + i) * 1.2, y + 20 - ph * 17, 1 + ph * 0.8, 1 + ph * 0.8, '#ffffff', 0.5);
  }
  c.globalAlpha = 1;
  c.beginPath();
  c.moveTo(x, y + 21);
  for (let i = 0; i <= 6; i++) c.quadraticCurveTo(x + i * 4 + 2, y + 19.6 + (i % 2) * 0.4, x + i * 4 + 4, y + 21);
  c.lineTo(x + SCREEN.w, y + SCREEN.h);
  c.lineTo(x, y + SCREEN.h);
  paint('#fde7c4', 0.7);
  seaweed(x + 5, y + 22, now, 0);
  seaweed(x + 19, y + 22, now, 2);
  const t = now * 1.3;
  fish(x + 12 + Math.sin(t) * 6, y + 9 + Math.sin(t * 2) * 1.5, Math.cos(t) >= 0 ? 1 : -1, PINK, 1);
  const u = now * 0.9 + 2;
  fish(x + 12 + Math.sin(u) * 8, y + 15 + Math.cos(u) * 1.2, Math.cos(u) >= 0 ? 1 : -1, BUTTER, 0.7);
  ln(1.2, 'rgba(255,255,255,0.75)', x + 17, y + 6, x + 21, y + 1.5);
}

function screen(L, a, now) {
  const k = ease(prog(a, 'on', now, 0.4)) * (1 - ease(prog(a, 'off', now, 0.35)));
  if (k <= 0) return;
  const x = SCREEN.x;
  const y = L.F + SCREEN.dy;
  const cx = x + SCREEN.w / 2;
  const cy = y + SCREEN.h / 2;
  const g = c.createRadialGradient(cx, cy, 6, cx, cy, 38);
  g.addColorStop(0, `rgba(190,232,255,${0.34 * k})`);
  g.addColorStop(1, 'rgba(190,232,255,0)');
  c.fillStyle = g;
  c.fillRect(cx - 40, cy - 40, 80, 80);
  const open = Math.max(0, (k - 0.2) / 0.8);
  c.save();
  c.beginPath();
  c.roundRect(x, y, SCREEN.w, SCREEN.h, 5);
  c.clip();
  if (open <= 0) {
    c.fillStyle = '#2f2b52';
    c.fillRect(x, y, SCREEN.w, SCREEN.h);
    c.fillStyle = '#ffffff';
    c.fillRect(cx - (SCREEN.w / 2) * (k / 0.2), cy - 0.8, SCREEN.w * (k / 0.2), 1.6);
  } else {
    c.fillStyle = '#ffffff';
    c.fillRect(x, y, SCREEN.w, SCREEN.h);
    c.beginPath();
    c.rect(x, cy - (SCREEN.h / 2) * open, SCREEN.w, SCREEN.h * open);
    c.clip();
    toon(x, y, now);
  }
  c.restore();
  rr(x, y, SCREEN.w, SCREEN.h, 5, null, 1.1);
}

function can(x, y, dir, tilt) {
  c.save();
  c.translate(x, y);
  c.scale(dir, 1);
  c.rotate(tilt);
  c.beginPath();
  c.arc(-6.4, 0, 4.6, 1.6, 4.7);
  line(3.6);
  c.beginPath();
  c.arc(-6.4, 0, 4.6, 1.6, 4.7);
  line(1.4, SKY);
  c.beginPath();
  c.moveTo(5, 2);
  c.lineTo(13, -6);
  line(3.8);
  c.beginPath();
  c.moveTo(5, 2);
  c.lineTo(13, -6);
  line(1.6, SKY);
  rr(-6, -5, 12, 11, 3.4, SKY, 1.2);
  ln(1, 'rgba(255,255,255,0.85)', -3.6, -2.5, -3.6, 2.5);
  ln(0.7, 'rgba(75,46,30,0.35)', -5, 1.5, 5, 1.5);
  c.save();
  c.translate(13, -6);
  c.rotate(-0.6);
  pth('M0-3.4c2.6 1 2.6 5.8 0 6.8z', PINK, 0.9);
  c.restore();
  c.restore();
  return { x: x + dir * (14.2 * Math.cos(tilt) + 6.6 * Math.sin(tilt)), y: y + 14.2 * Math.sin(tilt) - 6.6 * Math.cos(tilt) };
}

function waterFront(a, now, cat, plant) {
  const out = back(prog(a, 'can', now, 0.3)) * (1 - ease(prog(a, 'away', now, 0.3)));
  if (a.can === undefined || out <= 0) return;
  const tilt = 0.55 * ease(prog(a, 'tilt', now, 0.4)) * (1 - ease(prog(a, 'untilt', now, 0.3)));
  const px = cat.x + cat.dir * HAND.x;
  const py = cat.y + HAND.y;
  c.save();
  c.translate(px, py);
  c.scale(out, out);
  c.translate(-px, -py);
  const tip = can(px, py, cat.dir, tilt);
  c.restore();
  if (a.pour === undefined || a.pourEnd !== undefined) return;
  const top = plant.y - 22;
  for (let i = 0; i < 9; i++) {
    const ph = (now * 1.9 + i / 9) % 1;
    drop(lerp(tip.x, plant.x + 1, ph ** 1.3), lerp(tip.y + 2, top, ph * ph * 0.6 + ph * 0.4));
  }
  c.globalAlpha = 0.6;
  el(plant.x + 1, top + 1, 6, 1.6, WATER, 0);
  c.globalAlpha = 1;
}

const LEAVES = [[-66, 13, 0.3], [-36, 17, 0.1], [-6, 19, 0], [26, 17, 0.2], [58, 13, 0.4]];

function flower(x, y, s) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU - Math.PI / 2;
    el(Math.cos(a) * 3.6, Math.sin(a) * 3.6, 2.8, 2.8, '#f9c2d0', 0.9);
  }
  el(0, 0, 2.3, 2.3, BUTTER, 0.9);
  c.restore();
}

export function drawPlant(ctx, plant, now, look) {
  c = ctx;
  const { x, y } = plant;
  el(x, y + 0.5, 14, 2.6, 'rgba(75,46,30,0.13)', 0);
  const wig = Math.sin(now * 16) * 0.1 * look.wiggle;
  const base = y - 11;
  LEAVES.forEach(([deg, len, d], i) => {
    const ang = (lerp(Math.sign(deg) * 108 + deg * 0.3, deg, look.lift) * Math.PI) / 180 + wig * (i % 2 ? 1 : -1);
    const l = len * lerp(0.8, 1, look.lift);
    c.save();
    c.translate(x, base + 1);
    c.rotate(ang);
    pth(`M0 0C${l * 0.3} ${-l * 0.45} ${l * 0.6} ${-l * 0.45} ${l * 0.3} ${-l}C${-l * 0.3} ${-l * 0.55} ${-l * 0.2} ${-l * 0.2} 0 0z`, d > 0.25 ? '#86cfb4' : MINT, 1);
    ln(0.6, '#6fbaa0', 0, -1, l * 0.25, -l * 0.8);
    c.restore();
  });
  if (look.bloom > 0) flower(x + Math.sin(wig * 8) * 1.2, base - lerp(10, 22, look.lift), look.bloom);
  c.save();
  c.translate(x, base);
  pth('M-8 0h16l-2.4 12h-11.2z', PINK, 1.2);
  rr(-9.2, -1, 18.4, 3.6, 1.5, '#f9bccb', 1.1);
  ln(0.8, 'rgba(255,255,255,0.6)', -5, 4.6, -4, 9.5);
  ln(0.6, '#e58aa3', -5.4, 7, 5.4, 7);
  c.restore();
}

export const plantAt = (L, floor) => ({ x: PLANT.x, y: Math.min(L.F + PLANT.dy, floor) });

export const plantLook = (fresh) => ({ lift: fresh ? 1 : 0.1, bloom: fresh ? 1 : 0, wiggle: 0 });

export function plantAnim(a, now) {
  const lift = ease(prog(a, 'perk', now, 0.8));
  const bloom = back(prog(a, 'bloom', now, 0.5));
  return { lift: lerp(0.1, 1, lift), bloom, wiggle: lift > 0 ? Math.max(0, 1 - (now - a.perk) / 1.4) : 0 };
}

export function drawActBack(ctx, L, a, now) {
  c = ctx;
  if (a.id === 'snack') {
    cabinet(L, a, now);
    snackPlate(L, a, now);
  }
  else if (a.id === 'tv') screen(L, a, now);
}

export function drawActFront(ctx, L, a, now, cat, plant) {
  c = ctx;
  if (a.id === 'tea') teaFront(L, a, now, cat);
  else if (a.id === 'snack') snackFront(L, a, now);
  else if (a.id === 'water') waterFront(a, now, cat, plant);
}
