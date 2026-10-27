import { drawFoam } from './backgrounds.js';

const INK = '#4b2e1e';
const TAU = Math.PI * 2;
const CREAM = '#fffaf3';
const LILAC = '#c9b3ef';
const BUTTER = '#ffd66b';
const PINK = '#f6a5b6';
const MINT = '#9fdcc8';
const CURTAIN = '#cdb9f2';
const DARK = 'rgba(30, 24, 66, 0.62)';
const STAR = new Path2D('M0-4l1.2 2.6 2.8.4-2 2 .5 2.8L0 2.5-2.5 3.8-2 1-4-1l2.8-.4z');
const CLOUD = new Path2D('M0 6a4 4 0 0 1 3-6 6 6 0 0 1 11 0 4 4 0 0 1 2 6z');
let c = null;

export const READ_OFFSET = -42;
export const BOOK_HAND = { x: 14, y: -9 };
export const MOUTH = { x: 18, y: -47 };
export const BRUSH_STAND = 82;

const lerp = (a, b, k) => a + (b - a) * k;

function paint(fill, lw) {
  if (fill) {
    c.fillStyle = fill;
    c.fill();
  }
  if (lw) {
    c.lineWidth = lw;
    c.strokeStyle = INK;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.stroke();
  }
}

function rr(x, y, w, h, rad, fill, lw = 1) {
  c.beginPath();
  c.roundRect(x, y, w, h, rad);
  paint(fill, lw);
}

function el(x, y, rx, ry, fill, lw = 1) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, TAU);
  paint(fill, lw);
}

function ln(lw, col, ...p) {
  c.beginPath();
  c.moveTo(p[0], p[1]);
  for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]);
  c.lineWidth = lw;
  c.strokeStyle = col;
  c.lineCap = 'round';
  c.stroke();
}

function star(x, y, s, fill) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  c.fillStyle = fill;
  c.fill(STAR);
  c.restore();
}

function panel(w, len) {
  const s = (w - 3) / 3;
  return new Path2D(`M0 0H${w}c-1 ${len * 0.35} -7 ${len * 0.58} -3 ${len}c${-s} 2 ${-2 * s} -2 ${-(w - 3)} 0z`);
}

export function drawCurtains(ctx, L, k, dim) {
  c = ctx;
  const w = L.bedroom.win;
  const width = 17 + 25 * k;
  const len = 52 + 8 * k;
  const p = panel(width, len);
  for (const side of [-1, 1]) {
    c.save();
    c.translate(side < 0 ? w.x - 10 : w.x + w.w + 10, w.y - 3);
    c.scale(-side, 1);
    c.fillStyle = CURTAIN;
    c.fill(p);
    c.lineWidth = 1.2;
    c.strokeStyle = INK;
    c.lineJoin = 'round';
    c.stroke(p);
    for (const f of [0.18, 0.42, 0.66]) ln(0.8, INK, width * f, 6, width * f + 1, len * 0.5, width * f - 1, len - 8);
    if (dim) {
      c.fillStyle = DARK;
      c.fill(p);
    }
    c.restore();
  }
}

export function drawWindowDay(ctx, L, t) {
  c = ctx;
  const w = L.bedroom.win;
  const F = L.F;
  c.save();
  c.beginPath();
  c.roundRect(w.x + 5, w.y + 5, w.w - 10, w.h - 10, 4);
  c.clip();
  const g = c.createLinearGradient(0, w.y, 0, w.y + w.h);
  g.addColorStop(0, '#a9dcf7');
  g.addColorStop(1, '#e3f5ff');
  c.fillStyle = g;
  c.fillRect(w.x, w.y, w.w, w.h);
  c.save();
  c.translate(w.x + 36, w.y + 15);
  c.rotate(t * 0.3);
  for (let i = 0; i < 8; i++) ln(1, '#ffd66b', Math.cos((i * TAU) / 8) * 8.5, Math.sin((i * TAU) / 8) * 8.5, Math.cos((i * TAU) / 8) * 11, Math.sin((i * TAU) / 8) * 11);
  c.restore();
  el(w.x + 36, w.y + 15, 6.4, 6.4, '#ffe08a', 0.9);
  el(w.x + 34, w.y + 13.5, 1.2, 1.2, '#fff6cf', 0);
  const cx = w.x + ((t * 3 + 10) % (w.w + 30)) - 16;
  c.save();
  c.translate(cx, w.y + 30);
  c.fillStyle = '#fff';
  c.fill(CLOUD);
  c.lineWidth = 0.9;
  c.strokeStyle = INK;
  c.stroke(CLOUD);
  c.restore();
  c.beginPath();
  c.moveTo(w.x + 5, F - 103);
  c.quadraticCurveTo(w.x + 16, F - 112, w.x + 28, F - 102);
  c.quadraticCurveTo(w.x + 40, F - 109, w.x + w.w - 5, F - 100);
  c.lineTo(w.x + w.w - 5, F - 90);
  c.lineTo(w.x + 5, F - 90);
  paint('#b9e5c4', 0);
  rr(w.x + 36, F - 104, 8, 6, 1, '#fff0e0', 0.8);
  c.save();
  c.translate(w.x + 35, F - 104);
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(5, -4);
  c.lineTo(10, 0);
  c.closePath();
  paint(PINK, 0.8);
  c.restore();
  c.restore();
  const cxm = w.x + w.w / 2;
  rr(cxm - 2, w.y + 5, 4, w.h - 10, 1, CREAM, 0.9);
  rr(w.x + 5, w.y + w.h / 2 - 2, w.w - 10, 4, 1, CREAM, 0.9);
  ln(0.8, '#ffffff', w.x - 1, w.y + w.h - 0.8, w.x + w.w + 1, w.y + w.h - 0.8);
}

export function drawWindowLight(ctx, L, t, day, alpha) {
  c = ctx;
  const w = L.bedroom.win;
  const F = L.F;
  c.save();
  c.globalAlpha = alpha;
  const shaft = c.createLinearGradient(0, w.y + w.h, 0, F + 3);
  shaft.addColorStop(0, day ? 'rgba(255, 233, 160, 0.3)' : 'rgba(200, 210, 255, 0.16)');
  shaft.addColorStop(1, day ? 'rgba(255, 233, 160, 0.12)' : 'rgba(200, 210, 255, 0.06)');
  c.fillStyle = shaft;
  c.beginPath();
  c.moveTo(w.x + 5, w.y + w.h - 5);
  c.lineTo(w.x + w.w - 5, w.y + w.h - 5);
  c.lineTo(44, F + 3);
  c.lineTo(8, F + 3);
  c.closePath();
  c.fill();
  if (day) {
    for (let i = 0; i < 6; i++) {
      const ph = (t * 0.12 + i / 6) % 1;
      c.globalAlpha = alpha * Math.sin(ph * Math.PI) * 0.8;
      el(lerp(w.x + 12 + ((i * 17) % 34), 12 + ((i * 9) % 28), ph), lerp(w.y + w.h, F + 4, ph), 0.8, 0.8, '#fffbe6', 0);
    }
    c.globalAlpha = alpha;
  }
  c.translate(8, F + 3);
  c.transform(1, 0, 0.8, 1, 0, 0);
  c.fillStyle = day ? 'rgba(255, 222, 110, 0.6)' : 'rgba(190, 200, 255, 0.34)';
  for (const [x, y] of [[0, 0], [19, 0], [0, 15], [19, 15]]) c.fillRect(x, y, 17, 13);
  c.restore();
}

export function drawBookIn(ctx, x, y, rot, s = 1) {
  c = ctx;
  c.save();
  c.translate(x, y);
  c.rotate(rot);
  c.scale(s, s);
  rr(-9, -6.5, 18, 13, 1.8, LILAC, 1);
  rr(-9, -6.5, 3.6, 13, 1.4, '#b39be6', 1);
  rr(-3, -4.6, 10.6, 9.2, 1, CREAM, 0.6);
  c.save();
  c.translate(2.4, 0.2);
  c.scale(0.7, 0.7);
  c.fillStyle = PINK;
  c.fill(new Path2D('M0 3C-3 1-4-.6-4-1.9A2 2 0 0 1 0-2.6 2 2 0 0 1 4-1.9C4-.6 3 1 0 3z'));
  c.restore();
  c.restore();
}

export function drawDrawer(ctx, L, k, bookIn) {
  if (k <= 0) return;
  c = ctx;
  const F = L.F;
  const d = 7 * k;
  rr(143, F - 29.5, 32, 17, 0, '#f6e3c8', 0);
  rr(144, F - 28, 30, 7 + d, 2, '#bf9f86', 1);
  ln(0.8, 'rgba(255,255,255,0.45)', 146, F - 26.4, 172, F - 26.4);
  if (bookIn) drawBookIn(ctx, 159, F - 22.8 + d * 0.2, 0, 1);
  rr(143.4, F - 28 + d, 31.2, 14.4, 3, '#fbeedd', 1.1);
  rr(145.6, F - 26 + d, 26.8, 10.4, 2, null, 0.5);
  c.strokeStyle = '#e9d2b0';
  c.stroke();
  el(159, F - 21 + d, 2.4, 2.4, '#e9b47a', 1);
  el(158.4, F - 21.6 + d, 0.8, 0.8, '#fff3d6', 0);
}

export function drawBrush(ctx, x, y, ang, paste, dir = 1) {
  c = ctx;
  c.save();
  c.translate(x, y);
  c.scale(dir, 1);
  c.rotate(ang);
  ln(4.6, INK, 2, 0, 17, 0);
  ln(2.4, '#a9d4f5', 2, 0, 17, 0);
  rr(-6, -2.6, 9, 5.2, 1.6, '#fff', 0.8);
  if (paste) {
    rr(-6.6, -5, 6.6, 2.6, 1.3, MINT, 0.6);
    ln(0.7, '#fff', -5.4, -4.2, -2, -4.2);
  }
  c.restore();
}

export function drawShelfBrush(ctx, L) {
  drawBrush(ctx, 133.5, L.F - 73, Math.PI / 2 - 0.15, false);
}

export function drawMouthFoam(ctx, x, y, k, t) {
  const spots = [[-7, 1.5, 3], [7, 1.5, 3], [-3, 4, 3.2], [3, 4, 3.4], [-10, 5, 2.4], [10, 5, 2.4], [0, 7.5, 3], [-5, 8.5, 2.2], [5, 9, 2]];
  const n = Math.ceil(k * spots.length);
  for (let i = 0; i < n; i++) {
    const [dx, dy, s] = spots[i];
    drawFoam(ctx, x + dx, y + dy + Math.sin(t * 3 + i) * 0.4, s * Math.min(1, k * spots.length - i + 0.4));
  }
}

export function drawGrin(ctx, x, y, t) {
  c = ctx;
  rr(x - 6, y - 2, 12, 4.4, 2.2, '#fff', 0.9);
  ln(0.5, '#d8cfc6', x - 2, y - 1.6, x - 2, y + 2);
  ln(0.5, '#d8cfc6', x + 2, y - 1.6, x + 2, y + 2);
  const k = 0.5 + 0.5 * Math.sin(t * 7);
  c.save();
  c.translate(x + 7, y - 4);
  c.rotate(t * 2);
  star(0, 0, 0.9 + k * 0.7, '#fff6cf');
  c.lineWidth = 0.5;
  c.strokeStyle = BUTTER;
  c.stroke(STAR);
  c.restore();
}
