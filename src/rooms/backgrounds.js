import { W } from '../core/engine.js';

const INK = '#4b2e1e';
const TAU = Math.PI * 2;
const CREAM = '#fffaf3';
const WOOD = '#e9b47a';
const PINK = '#f6a5b6';
const MINT = '#9fdcc8';
const BUTTER = '#ffd66b';
const LILAC = '#c9b3ef';
let c = null;

const r = (x, y, w, h) => ({ x, y, w, h });

export function layout(H) {
  const F = H - 112;
  return {
    F,
    living: { wardrobe: r(0, F - 124, 48, 132), win: r(56, F - 148, 68, 62), tv: r(140, F - 96, 40, 100), gift: r(146, F + 6, 28, 28), sofa: { x: 62, y: F - 18 } },
    kitchen: { fridge: r(0, F - 134, 52, 142), win: r(62, F - 148, 56, 58), bowl: { x: 152, y: F + 50 } },
    bath: { toilet: r(134, F - 60, 46, 72), tub: r(0, F - 40, 72, 54) },
    bedroom: { win: r(8, F - 150, 54, 62), sw: r(118, F - 66, 22, 28), lamp: r(140, F - 82, 40, 50), bed: r(36, F - 14, 108, 28) },
  };
}

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

const SHADOW = 'rgba(75,46,30,0.13)';
const shade = (x, y, rx) => el(x, y, rx, 2.4, SHADOW, 0);

function blob(x, y, rx, ry, k, fill, lw) {
  const n = 7;
  const p = [];
  for (let i = 0; i < n; i++) {
    const a = k + (i * TAU) / n;
    const m = 1 + 0.13 * Math.sin(i * 2.1 + k * 3);
    p.push([x + Math.cos(a) * rx * m, y + Math.sin(a) * ry * m]);
  }
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  c.beginPath();
  c.moveTo(...mid(p[n - 1], p[0]));
  for (let i = 0; i < n; i++) c.quadraticCurveTo(...p[i], ...mid(p[i], p[(i + 1) % n]));
  c.closePath();
  paint(fill, lw);
}

function ln(lw, col, ...p) {
  c.beginPath();
  c.moveTo(p[0], p[1]);
  for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]);
  line(lw, col);
}

function pth(x, y, d, fill, lw = 1.2, s = 1) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  const p = new Path2D(d);
  if (fill) {
    c.fillStyle = fill;
    c.fill(p);
  }
  if (lw) {
    c.lineWidth = lw / s;
    c.strokeStyle = INK;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.stroke(p);
  }
  c.restore();
}

const HEART = 'M0 3C-3 1-4-.6-4-1.9A2 2 0 0 1 0-2.6 2 2 0 0 1 4-1.9C4-.6 3 1 0 3z';
const STAR = 'M0-4l1.2 2.6 2.8.4-2 2 .5 2.8L0 2.5-2.5 3.8-2 1-4-1l2.8-.4z';
const heart = (x, y, s, fill, lw = 0) => pth(x, y, HEART, fill, lw, s);
const star = (x, y, s, fill, lw = 0) => pth(x, y, STAR, fill, lw, s);

function floorBase(H, F, base) {
  c.fillStyle = base;
  c.fillRect(0, F, W, H - F);
}

function planks(H, F, base, seam) {
  floorBase(H, F, base);
  for (let y = F + 9, i = 0; y < H; y += 10, i++) {
    ln(0.6, seam, 0, y, W, y);
    for (let x = (i % 2) * 24 + 14; x < W; x += 48) ln(0.6, seam, x, y - 10, x, y);
  }
}

function checker(H, F, a, b, s = 12) {
  for (let y = F, j = 0; y < H; y += s * 0.8, j++) {
    for (let x = 0, i = 0; x < W; x += s, i++) {
      c.fillStyle = (i + j) % 2 ? a : b;
      c.fillRect(x, y, s + 0.5, s * 0.8 + 0.5);
    }
  }
}

function baseboard(F) {
  rr(-3, F - 6, W + 6, 7, 0, CREAM, 1.1);
  ln(1.3, INK, 0, F + 1, W, F + 1);
}

function windowFrame(w, night) {
  rr(w.x, w.y, w.w, w.h, 6, CREAM, 1.3);
  const g = c.createLinearGradient(0, w.y, 0, w.y + w.h);
  g.addColorStop(0, night ? '#38346e' : '#a9dcf7');
  g.addColorStop(1, night ? '#5d56a3' : '#e3f5ff');
  rr(w.x + 5, w.y + 5, w.w - 10, w.h - 10, 4, g, 1);
  rr(w.x - 4, w.y + w.h - 3, w.w + 8, 6, 3, CREAM, 1.3);
}

function windowBars(w) {
  const cx = w.x + w.w / 2;
  const cy = w.y + w.h / 2;
  rr(cx - 2, w.y + 5, 4, w.h - 10, 1, CREAM, 0.9);
  rr(w.x + 5, cy - 2, w.w - 10, 4, 1, CREAM, 0.9);
}

function curtains(w, fill) {
  ln(1.3, INK, w.x - 12, w.y - 4, w.x + w.w + 12, w.y - 4);
  el(w.x - 13, w.y - 4, 2, 2, WOOD, 1);
  el(w.x + w.w + 13, w.y - 4, 2, 2, WOOD, 1);
  pth(w.x - 10, w.y - 3, 'M0 0h17c-1 18-7 30-3 52-5 2-9 2-14 0z', fill, 1.2);
  pth(w.x + w.w + 10, w.y - 3, 'M0 0h-17c1 18 7 30 3 52 5 2 9 2 14 0z', fill, 1.2);
  pth(w.x - 10, w.y - 3, 'M6 6c1 12 0 22 2 40M11 5c0 12-2 20-2 40', null, 0.8);
  pth(w.x + w.w + 10, w.y - 3, 'M-6 6c-1 12 0 22-2 40M-11 5c0 12 2 20 2 40', null, 0.8);
}

function pot(x, y, potFill) {
  pth(x, y, 'M0-2c-3-9-9-11-12-13 5 0 10 4 12 13zM0-2c1-10 5-14 9-16-1 6-5 11-9 16zM0-2c0-9 0-13 1-17 2 6 1 12-1 17z', MINT, 1.1);
  pth(x - 7, y - 2, 'M0 0h14l-2 11H2z', potFill, 1.2);
}

function frame(x, y, w, h, inner) {
  rr(x, y, w, h, 3, '#ffe2a6', 1.2);
  rr(x + 3, y + 3, w - 6, h - 6, 2, inner, 1);
}

function lvOutline(x, y, w, h, rad, col, lw = 0.7) {
  c.beginPath();
  c.roundRect(x, y, w, h, rad);
  line(lw, col);
}

function lvStitch(x, y, w, h, rad, col) {
  c.setLineDash([1.4, 1.8]);
  lvOutline(x, y, w, h, rad, col, 0.6);
  c.setLineDash([]);
}

const lvWob = (a, k) => 1 + 0.018 * Math.sin(3 * a + k) + 0.012 * Math.sin(7 * a);

function lvWobble(x, y, rx, ry, k, fill, lw) {
  c.beginPath();
  for (let i = 0; i < 48; i++) {
    const a = (i * TAU) / 48;
    const m = lvWob(a, k);
    c[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rx * m, y + Math.sin(a) * ry * m);
  }
  c.closePath();
  paint(fill, lw);
}

function lvRug(x, y, rx, ry, k, fill, edge, ring, mark) {
  for (let i = 0; i < 44; i++) {
    const a = (i * TAU) / 44;
    const m = lvWob(a, k);
    ln(0.7, edge, x + Math.cos(a) * rx * m, y + Math.sin(a) * ry * m, x + Math.cos(a) * (rx * m + 3.5), y + Math.sin(a) * (ry * m + 2.6));
  }
  lvWobble(x, y, rx, ry, k, fill, 1.3);
  lvWobble(x, y, rx * 0.88, ry * 0.7, k, null, 0);
  c.setLineDash([2.5, 3]);
  line(0.8, ring);
  c.setLineDash([]);
  lvWobble(x, y, rx * 0.74, ry * 0.52, k, null, 0);
  line(0.6, ring);
  for (let i = 0; i < 12; i++) {
    const a = (i * TAU) / 12 + 0.26;
    heart(x + Math.cos(a) * rx * 0.81, y + Math.sin(a) * ry * 0.61, 0.38, mark);
  }
}

function lvClock(x, y, rim, hour, min) {
  el(x, y, 9, 9, rim, 1.3);
  el(x, y, 6.5, 6.5, CREAM, 0.9);
  for (let i = 0; i < 12; i++) {
    const a = (i * TAU) / 12;
    const k = i % 3 ? 5.3 : 4.5;
    ln(0.6, INK, x + Math.cos(a) * k, y + Math.sin(a) * k, x + Math.cos(a) * 6, y + Math.sin(a) * 6);
  }
  ln(1, INK, x, y, x + Math.cos(hour) * 3, y + Math.sin(hour) * 3);
  ln(0.8, INK, x, y, x + Math.cos(min) * 4.3, y + Math.sin(min) * 4.3);
  el(x, y, 0.9, 0.9, PINK, 0.6);
  c.beginPath();
  c.arc(x, y, 7.9, Math.PI * 1.05, Math.PI * 1.4);
  line(0.9, 'rgba(255,255,255,0.8)');
}

function lvFrame(x, y, w, h, inner) {
  rr(x + 1.2, y + 1.8, w, h, 3, SHADOW, 0);
  ln(0.6, INK, x + 4, y + 1, x + w / 2, y - 3, x + w - 4, y + 1);
  el(x + w / 2, y - 3, 0.9, 0.9, WOOD, 0.7);
  frame(x, y, w, h, inner);
  ln(1.2, 'rgba(75,46,30,0.14)', x + 4, y + 4.7, x + w - 4, y + 4.7);
  for (const [dx, dy] of [[1.8, 1.8], [w - 1.8, 1.8], [1.8, h - 1.8], [w - 1.8, h - 1.8]]) el(x + dx, y + dy, 0.5, 0.5, '#f1c27d', 0);
}

function lvGlare(x, y, s = 1) {
  ln(1.2, 'rgba(255,255,255,0.7)', x, y, x + 5 * s, y - 9 * s);
  ln(1.2, 'rgba(255,255,255,0.7)', x + 8 * s, y, x + 10.5 * s, y - 4.5 * s);
}

function lvPlant(x, y, fill) {
  pot(x, y, fill);
  for (const [dx, dy] of [[-8.5, -11], [6, -13], [0.6, -14]]) ln(0.5, '#6fbaa0', x, y - 2.5, x + dx, y + dy);
  rr(x - 8.2, y - 3.6, 16.4, 3.6, 1.4, '#f9bccb', 1.1);
  ln(0.8, 'rgba(255,255,255,0.6)', x - 5, y + 2, x - 4, y + 7);
  ln(0.6, '#e58aa3', x - 5.8, y + 4.5, x + 5.8, y + 4.5);
}

function lvFloor(H, F) {
  for (let y = F + 9, i = 0; y < H; y += 10, i++) {
    if (i % 2) {
      c.fillStyle = 'rgba(255,255,255,0.1)';
      c.fillRect(0, y - 10, W, 10);
    }
    for (let x = (i % 2) * 24 + 14, k = 0; x < W; x += 48, k++) {
      const g = x + 7 + ((i * 13 + k * 7) % 15);
      ln(0.5, 'rgba(150,90,40,0.28)', g, y - 6.5, g + 8, y - 5.8);
      el(x + 2, y - 5, 0.5, 0.5, 'rgba(75,46,30,0.3)', 0);
    }
  }
  c.fillStyle = 'rgba(75,46,30,0.07)';
  c.fillRect(0, F + 1, W, 5);
}

function drawLiving(H, L) {
  const F = L.F;
  c.fillStyle = '#f9d4dc';
  c.fillRect(0, 0, W, F);
  for (let y = 6, j = 0; y < F; y += 11, j++) {
    for (let x = (j % 2) * 7 + 3; x < W; x += 14) el(x, y, 1.4, 1.4, '#fdedf1', 0);
  }
  for (let y = 22.5, j = 0; y < F - 12; y += 33, j++) {
    for (let x = 10 + (j % 2) * 21; x < W; x += 42) heart(x, y, 0.5, '#f3b5c5');
  }
  planks(H, F, '#f6d2a4', 'rgba(75,46,30,0.22)');
  lvFloor(H, F);
  baseboard(F);
  ln(0.7, 'rgba(75,46,30,0.25)', 0, F - 3.5, W, F - 3.5);
  lvRug(90, F + 20, 86, 17, 0.4, '#fff3e6', '#e7c9b4', '#f2bfcb', '#f4c4cf');
  lvFrame(6, F - 178, 32, 26, '#d9f0fc');
  pth(22, F - 164, 'M-6 4a6 6 0 0 1 12 0z', MINT, 1);
  ln(0.7, '#8fcfba', 12, F - 160, 32, F - 160);
  el(30, F - 171, 2.2, 2.2, BUTTER, 0.8);
  pth(15, F - 169, 'M0 2a2 2 0 0 1 1-3 2.4 2.4 0 0 1 4 0 1.6 1.6 0 0 1 0 3z', '#ffffff', 0.7);
  lvGlare(31, F - 156, 0.7);
  lvClock(90, F - 176, PINK, 0, -Math.PI / 2);
  const w = L.living.win;
  el(w.x + w.w / 2, w.y + w.h + 5.5, w.w / 2 + 2, 1.8, SHADOW, 0);
  windowFrame(w, false);
  ln(0.9, 'rgba(255,255,255,0.9)', w.x - 1, w.y + w.h - 1.3, w.x + w.w + 1, w.y + w.h - 1.3);
  lvGlare(w.x + 10, w.y + 24);
  lvGlare(w.x + 44, w.y + 53, 0.9);
  curtains(w, '#bfe9db');
  for (const [dx, dy] of [[-7, 9], [-2, 17], [-6, 37]]) {
    el(w.x + dx, w.y + dy, 0.8, 0.8, '#e6f7f1', 0);
    el(w.x + w.w - dx, w.y + dy, 0.8, 0.8, '#e6f7f1', 0);
  }
  ln(0.6, '#8cc9b4', w.x - 9.5, w.y + 44, w.x + 3.5, w.y + 44.5);
  ln(0.6, '#8cc9b4', w.x + w.w - 3.5, w.y + 44.5, w.x + w.w + 9.5, w.y + 44);
  rr(w.x - 10.4, w.y + 28.5, 13.4, 3.4, 1.7, PINK, 0.9);
  rr(w.x + w.w - 3, w.y + 28.5, 13.4, 3.4, 1.7, PINK, 0.9);
  lvFrame(148, F - 140, 28, 26, '#bfe6ff');
  el(162, F - 127, 7, 6.5, '#e9b47a', 1);
  el(162, F - 128, 6, 5, PINK, 0.9);
  el(162, F - 128, 2, 1.6, '#fff7ec', 0.8);
  ln(0.9, MINT, 158, F - 132, 159.5, F - 131);
  ln(0.9, BUTTER, 164, F - 132.5, 165.5, F - 133.4);
  ln(0.9, LILAC, 166, F - 129, 167.4, F - 128.4);
  ln(0.9, '#ffffff', 158.6, F - 126.6, 159.8, F - 127.4);
  lvFrame(150, F - 170, 22, 20, '#fff3e6');
  heart(161, F - 161, 1.3, PINK, 0.9);
  ln(0.8, '#ffffff', 157.5, F - 163, 158.6, F - 164);
  star(155, F - 155, 0.4, BUTTER);
  star(167.5, F - 156, 0.35, MINT);
  const wd = L.living.wardrobe;
  shade(24, F + 7, 26);
  shade(164, F + 7, 25);
  shade(90, F + 5, 56);
  rr(wd.x + 3, wd.y + 6, 42, 120, 4, CREAM, 1.3);
  ln(1.2, 'rgba(75,46,30,0.07)', wd.x + 43.5, wd.y + 14, wd.x + 43.5, wd.y + 118);
  rr(wd.x, wd.y, 48, 9, 3, WOOD, 1.3);
  ln(1, 'rgba(255,255,255,0.55)', wd.x + 4, wd.y + 2.4, wd.x + 44, wd.y + 2.4);
  ln(0.5, 'rgba(140,80,30,0.3)', wd.x + 8, wd.y + 5.3, wd.x + 20, wd.y + 5.3);
  ln(0.5, 'rgba(140,80,30,0.3)', wd.x + 26, wd.y + 6.3, wd.x + 38, wd.y + 6.3);
  rr(wd.x + 7, wd.y + 16, 15, 98, 3, '#f9cad5', 1.1);
  rr(wd.x + 26, wd.y + 16, 15, 98, 3, '#f9cad5', 1.1);
  for (const [dx, y0, y1] of [[7, 26, 48], [26, 64, 86]]) {
    lvOutline(wd.x + dx + 2.5, wd.y + 21, 10, 88, 2, '#eb9fb3');
    ln(1.3, 'rgba(255,255,255,0.55)', wd.x + dx + 5, wd.y + y0, wd.x + dx + 5, wd.y + y1);
  }
  for (const y of [24, 98]) {
    rr(wd.x + 5.6, wd.y + y, 3, 6, 1, WOOD, 0.7);
    rr(wd.x + 39.4, wd.y + y, 3, 6, 1, WOOD, 0.7);
  }
  el(wd.x + 20, wd.y + 66, 1.7, 1.7, WOOD, 1);
  el(wd.x + 28, wd.y + 66, 1.7, 1.7, WOOD, 1);
  el(wd.x + 19.5, wd.y + 65.4, 0.5, 0.5, '#fff', 0);
  el(wd.x + 27.5, wd.y + 65.4, 0.5, 0.5, '#fff', 0);
  heart(wd.x + 33.5, wd.y + 36, 1.1, '#fff3f6', 0.8);
  ln(0.7, 'rgba(75,46,30,0.3)', wd.x + 4, wd.y + 119, wd.x + 44, wd.y + 119);
  rr(wd.x + 6, wd.y + 124, 6, 6, 2, WOOD, 1);
  rr(wd.x + 36, wd.y + 124, 6, 6, 2, WOOD, 1);
  ln(0.7, 'rgba(255,255,255,0.6)', wd.x + 8, wd.y + 125.8, wd.x + 8, wd.y + 127.6);
  ln(0.7, 'rgba(255,255,255,0.6)', wd.x + 38, wd.y + 125.8, wd.x + 38, wd.y + 127.6);
  lvPlant(wd.x + 24, wd.y - 9, PINK);
  rr(142, F - 44, 44, 50, 3, CREAM, 1.3);
  ln(1.2, 'rgba(75,46,30,0.07)', 183.5, F - 38, 183.5, F + 3);
  rr(139, F - 50, 48, 8, 3, WOOD, 1.3);
  ln(1, 'rgba(255,255,255,0.55)', 143, F - 47.6, 183, F - 47.6);
  ln(0.5, 'rgba(140,80,30,0.3)', 146, F - 44.8, 156, F - 44.8);
  ln(0.5, 'rgba(140,80,30,0.3)', 166, F - 45.6, 176, F - 45.6);
  for (const y of [F - 37, F - 16]) {
    rr(146, y, 38, 18, 3, '#fff1dd', 1.1);
    lvOutline(149, y + 3, 32, 12, 2, '#ecd3ab');
    rr(161, y + 6.2, 8, 5.6, 2.4, '#ffe7c2', 0.7);
    el(165, y + 9, 1.8, 1.8, WOOD, 1);
    el(164.4, y + 8.4, 0.5, 0.5, '#fff', 0);
  }
  rr(144, F + 4.5, 5, 4, 1.4, WOOD, 1);
  rr(180, F + 4.5, 5, 4, 1.4, WOOD, 1);
  rr(150, F - 50.5, 6, 3, 1, '#8fcfba', 0.9);
  rr(170, F - 50.5, 6, 3, 1, '#8fcfba', 0.9);
  ln(1.1, INK, 157, F - 82, 150, F - 94);
  ln(1.1, INK, 165, F - 82, 172, F - 94);
  el(150, F - 94, 1.6, 1.6, PINK, 1);
  el(172, F - 94, 1.6, 1.6, PINK, 1);
  rr(143, F - 84, 36, 34, 7, MINT, 1.3);
  rr(155, F - 86.4, 12, 3.4, 1.7, '#8fcfba', 0.9);
  ln(1.2, '#e6f7f1', 146, F - 62, 146, F - 77);
  rr(147, F - 80, 24, 26, 5, '#61707f', 1.1);
  lvOutline(148.3, F - 78.7, 21.4, 23.4, 4, 'rgba(255,255,255,0.18)');
  ln(1.2, '#8c9cad', 150, F - 76, 154, F - 76);
  ln(1.2, '#7c8c9e', 150, F - 73.4, 152, F - 73.4);
  ln(1, 'rgba(255,255,255,0.14)', 162, F - 56.5, 168, F - 64);
  el(175, F - 73, 1.5, 1.5, '#fff', 0.9);
  el(175, F - 66, 1.5, 1.5, '#fff', 0.9);
  ln(0.6, INK, 175, F - 73, 175, F - 74.2);
  ln(0.6, INK, 175, F - 66, 176, F - 66.8);
  for (const y of [F - 61, F - 59, F - 57]) ln(0.6, '#6fbfa8', 173.5, y, 177.5, y);
  shade(167, F + 25.5, 13);
  ln(0.8, INK, 157, F + 19, 150, F + 12);
  rr(156, F + 16, 22, 9, 3, '#f3eef8', 1.1);
  ln(0.7, '#cfc3df', 159, F + 19.5, 169, F + 19.5);
  ln(1, 'rgba(255,255,255,0.9)', 159, F + 17.4, 165, F + 17.4);
  el(173, F + 20.5, 1.2, 1.2, PINK, 0);
  rr(40, F - 60, 100, 48, 15, '#f7a9bd', 1.3);
  lvStitch(43.5, F - 56.5, 93, 40, 12, 'rgba(255,255,255,0.55)');
  for (const x of [56, 73, 107, 124]) {
    for (const [dx, dy] of [[-3.4, -3], [3.4, -3], [-3.4, 3], [3.4, 3]]) ln(0.5, '#e58aa3', x, F - 44, x + dx, F - 44 + dy);
    el(x, F - 44, 1.3, 1.3, '#f48fa9', 0.7);
  }
  ln(1.1, INK, 90, F - 56, 90, F - 28);
  rr(40, F - 28, 100, 24, 8, '#f9b8c9', 1.3);
  ln(1.1, INK, 90, F - 26, 90, F - 6);
  ln(1.3, 'rgba(255,255,255,0.4)', 48, F - 24.6, 84, F - 24.6);
  ln(1.3, 'rgba(255,255,255,0.4)', 96, F - 24.6, 132, F - 24.6);
  pth(54, F - 22, 'M0 0q8 4 16 0M46 2q8 3 14 0M70 0q8 4 16 0', null, 0.8);
  for (const x of [29, 132]) {
    rr(x, F - 42, 19, 44, 9, '#f7a9bd', 1.3);
    lvStitch(x + 2.5, F - 39.5, 14, 38, 6.5, 'rgba(255,255,255,0.5)');
    ln(1.3, 'rgba(255,255,255,0.4)', x + 5, F - 33, x + 5, F - 22);
    ln(0.6, '#e58aa3', x + 3, F - 6, x + 16, F - 5);
  }
  for (const x of [36, 137]) {
    pth(x, F + 2, 'M0 0h7l-1.5 6h-4z', WOOD, 1);
    ln(0.7, 'rgba(255,255,255,0.6)', x + 2, F + 3.4, x + 2, F + 6);
  }
  c.save();
  c.translate(118, F - 36);
  c.rotate(0.22);
  rr(-12, -12, 24, 24, 5, CREAM, 1.2);
  for (const [dx, dy] of [[-6, -6], [2, -7], [7, 0], [-7, 2], [-7, 7], [4, 7]]) el(dx, dy, 1.6, 1.6, MINT, 0);
  lvStitch(-9.5, -9.5, 19, 19, 3, '#dccbb0');
  for (const [dx, dy] of [[-2.6, -2.6], [2.6, -2.6], [-2.6, 2.6], [2.6, 2.6]]) ln(0.5, '#dccbb0', 0, 0, dx, dy);
  el(0, 0, 1.3, 1.3, '#f3d9b8', 0.7);
  for (const [dx, dy] of [[-12, -12], [12, -12], [-12, 12], [12, 12]]) el(dx, dy, 1.4, 1.4, PINK, 0.7);
  c.restore();
}

function ktTile(x, y, i, j) {
  const accent = (i * 3 + j * 2) % 11 === 0;
  c.beginPath();
  c.roundRect(x, y, 10, 9, 1.5);
  c.fillStyle = accent ? '#fde3ea' : '#fbfffd';
  c.fill();
  line(0.5, '#b8decf');
  c.fillStyle = 'rgba(159,220,200,0.22)';
  c.fillRect(x + 1, y + 7, 8, 1.2);
  if (accent) heart(x + 5, y + 4.4, 0.35, '#f6a5b6');
  else ln(0.6, '#ffffff', x + 1.8, y + 2, x + 3.6, y + 2);
}

function drawKitchen(H, L) {
  const F = L.F;
  c.fillStyle = '#dcf1e7';
  c.fillRect(0, 0, W, F);
  for (let x = 4, k = 0; x < W; x += 12, k++) {
    c.fillStyle = '#e9f8f1';
    c.fillRect(x, 0, 6, F);
    for (let y = 12 + (k % 2) * 13; y < F - 60; y += 26) el(x + 9, y, 1, 1, '#c3e5d6', 0);
  }
  for (let y = F - 48, j = 0; y < F - 4; y += 9, j++) {
    for (let x = (j % 2) * -5, i = 0; x < W; x += 10, i++) ktTile(x, y, i, j);
  }
  rr(-2, F - 52, W + 4, 4, 1.5, '#f9cad5', 0.9);
  ln(0.8, 'rgba(255,255,255,0.7)', 0, F - 50.8, W, F - 50.8);
  checker(H, F, '#fff2e1', '#fbdcc2');
  baseboard(F);
  ln(0.7, 'rgba(75,46,30,0.25)', 0, F - 3.5, W, F - 3.5);
  lvRug(90, F + 22, 62, 12, 1.7, '#ffe0cc', '#efc5ad', '#f6a5b6', '#f6a5b6');
  lvClock(90, F - 172, '#f9cad5', 2.68, -Math.PI / 2);
  const w = L.kitchen.win;
  el(w.x + w.w / 2, w.y + w.h + 5.5, w.w / 2 + 2, 1.8, SHADOW, 0);
  windowFrame(w, false);
  ln(0.9, 'rgba(255,255,255,0.9)', w.x - 1, w.y + w.h - 1.3, w.x + w.w + 1, w.y + w.h - 1.3);
  lvGlare(w.x + 10, w.y + 23, 0.9);
  ln(1.2, 'rgba(255,255,255,0.7)', w.x + 38, w.y + 23, w.x + 41, w.y + 17);
  ln(1.3, INK, w.x + 4, w.y + 26, w.x + w.w - 4, w.y + 26);
  el(w.x + 4, w.y + 26, 2, 2, WOOD, 1);
  el(w.x + w.w - 4, w.y + 26, 2, 2, WOOD, 1);
  c.save();
  c.beginPath();
  c.rect(w.x + 3, w.y + 27, w.w - 6, 22);
  c.clip();
  c.fillStyle = '#fbd2dc';
  c.fillRect(w.x, w.y + 27, w.w, 24);
  c.fillStyle = 'rgba(246,165,182,0.55)';
  for (let x = w.x; x < w.x + w.w; x += 6) c.fillRect(x, w.y + 27, 3, 24);
  for (let y = w.y + 27; y < w.y + 52; y += 6) c.fillRect(w.x, y, w.w, 3);
  c.restore();
  for (let k = 0; k < 6; k++) el(w.x + 8 + k * 8, w.y + 27.8, 1, 1.5, null, 0.6);
  c.setLineDash([1.2, 1.6]);
  ln(0.6, '#e58aa3', w.x + 4, w.y + 31, w.x + w.w - 4, w.y + 31);
  c.setLineDash([]);
  pth(w.x + 3, w.y + 49, `M0 0${'q2.5 3 5 0'.repeat(10)}`, null, 1.1);
  const f = L.kitchen.fridge;
  shade(26, F + 9, 29);
  shade(154, F + 7, 32);
  rr(f.x + 3, f.y, 46, 138, 8, '#bfe9db', 1.3);
  ln(1.4, 'rgba(75,46,30,0.07)', f.x + 46.5, f.y + 10, f.x + 46.5, f.y + 130);
  ln(1.1, 'rgba(255,255,255,0.45)', f.x + 14, f.y + 3.4, f.x + 34, f.y + 3.4);
  ln(1.2, INK, f.x + 3, f.y + 44, f.x + 49, f.y + 44);
  ln(1.2, 'rgba(75,46,30,0.12)', f.x + 5, f.y + 46, f.x + 47, f.y + 46);
  ln(1.6, 'rgba(255,255,255,0.75)', f.x + 10, f.y + 12, f.x + 10, f.y + 34);
  rr(f.x + 14, f.y + 36, 18, 4.5, 2.2, '#a8dccb', 0.7);
  heart(f.x + 18, f.y + 38.2, 0.35, '#fff');
  for (const y of [10, 30, 56, 84]) rr(f.x + 4.4, f.y + y, 2.4, 6, 1, '#8fcfba', 0.7);
  for (const y of [12, 54]) {
    const h = y === 12 ? 20 : 30;
    rr(f.x + 41, f.y + y, 4, h, 2, CREAM, 1.1);
    el(f.x + 43, f.y + y + 2.6, 0.5, 0.5, '#c8a98a', 0);
    el(f.x + 43, f.y + y + h - 2.6, 0.5, 0.5, '#c8a98a', 0);
    ln(0.7, '#ffffff', f.x + 42.1, f.y + y + 5, f.x + 42.1, f.y + y + h - 5);
  }
  heart(f.x + 16, f.y + 62, 1.4, PINK, 0.9);
  el(f.x + 13.8, f.y + 60, 0.6, 0.5, '#ffffff', 0);
  star(f.x + 28, f.y + 78, 1.2, BUTTER, 0.9);
  el(f.x + 26.4, f.y + 76.6, 0.5, 0.5, '#ffffff', 0);
  el(f.x + 31, f.y + 62, 2, 2, LILAC, 0.9);
  el(f.x + 30.4, f.y + 61.4, 0.5, 0.5, '#ffffff', 0);
  el(f.x + 33, f.y + 68, 2, 2, MINT, 0.9);
  el(f.x + 32.4, f.y + 67.4, 0.5, 0.5, '#ffffff', 0);
  rr(f.x + 10, f.y + 90, 16, 18, 2, CREAM, 1);
  ln(0.8, '#c8a98a', f.x + 13, f.y + 96, f.x + 23, f.y + 96);
  ln(0.8, '#c8a98a', f.x + 13, f.y + 101, f.x + 20, f.y + 101);
  el(f.x + 18, f.y + 91, 1.5, 1.5, PINK, 0.7);
  heart(f.x + 22.5, f.y + 104, 0.5, PINK);
  for (const y of [127.5, 130.5, 133.5]) ln(0.6, '#8fcfba', f.x + 14, f.y + y, f.x + 38, f.y + y);
  rr(f.x + 8, f.y + 136, 7, 6, 2, '#8fcfba', 1);
  rr(f.x + 37, f.y + 136, 7, 6, 2, '#8fcfba', 1);
  rr(126, F - 155.5, 58, 44, 5, SHADOW, 0);
  rr(124, F - 158, 58, 44, 5, '#f9cad5', 1.3);
  rr(122, F - 161, 62, 4, 2, '#f4b4c4', 1.1);
  ln(0.8, 'rgba(255,255,255,0.6)', 125, F - 159.8, 180, F - 159.8);
  ln(1.1, INK, 153, F - 154, 153, F - 118);
  lvOutline(127.5, F - 152, 22, 34, 3, '#eea9bb');
  lvOutline(156.5, F - 152, 22, 34, 3, '#eea9bb');
  ln(1.3, 'rgba(255,255,255,0.55)', 131, F - 146, 131, F - 130);
  rr(124.6, F - 148, 2.4, 6, 1, '#f4b4c4', 0.7);
  rr(124.6, F - 128, 2.4, 6, 1, '#f4b4c4', 0.7);
  el(148, F - 134, 1.6, 1.6, CREAM, 1);
  el(158, F - 134, 1.6, 1.6, CREAM, 1);
  el(147.5, F - 134.5, 0.5, 0.5, '#ffffff', 0);
  el(157.5, F - 134.5, 0.5, 0.5, '#ffffff', 0);
  rr(122, F - 98, 60, 4, 2, WOOD, 1.1);
  ln(0.8, 'rgba(255,255,255,0.6)', 125, F - 97, 179, F - 97);
  ln(0.5, 'rgba(140,80,30,0.3)', 130, F - 95.8, 146, F - 95.8);
  ln(0.5, 'rgba(140,80,30,0.3)', 156, F - 95.8, 168, F - 95.8);
  for (const x of [126, 172]) pth(x, F - 94, 'M0 0h5L0 7z', WOOD, 0.9);
  for (const [x, h, lid] of [[128, 14, PINK], [142, 11, MINT], [156, 16, BUTTER], [170, 12, LILAC]]) {
    rr(x, F - 98 - h, 10, h, 3, CREAM, 1);
    c.globalAlpha = 0.5;
    rr(x + 0.8, F - 98 - h * 0.55, 8.4, h * 0.55 - 0.8, 2, lid, 0);
    c.globalAlpha = 1;
    rr(x + 2, F - 98 - h * 0.5 - 2, 6, 3.6, 1, CREAM, 0.6);
    el(x + 5, F - 98 - h * 0.5 - 0.2, 0.6, 0.6, lid, 0);
    rr(x - 1, F - 100 - h, 12, 4, 2, lid, 1);
    rr(x + 3.5, F - 101.4 - h, 3, 1.8, 0.9, lid, 0.7);
    ln(0.5, 'rgba(75,46,30,0.35)', x + 1, F - 98.4 - h, x + 9, F - 98.4 - h);
    ln(1, '#e3f4fd', x + 2.5, F - 95 - h, x + 2.5, F - 99);
  }
  rr(124, F - 40, 60, 46, 3, CREAM, 1.3);
  ln(1.2, 'rgba(75,46,30,0.07)', 181.5, F - 36, 181.5, F + 3);
  rr(128, F - 33, 23, 36, 3, '#fff1dd', 1);
  rr(155, F - 33, 23, 36, 3, '#fff1dd', 1);
  lvOutline(131, F - 29.5, 17, 29, 2, '#ecd3ab');
  lvOutline(158, F - 29.5, 17, 29, 2, '#ecd3ab');
  ln(1.2, 'rgba(255,255,255,0.7)', 133, F - 26, 133, F - 18);
  ln(1.2, 'rgba(255,255,255,0.7)', 160, F - 26, 160, F - 18);
  el(146, F - 16, 1.6, 1.6, WOOD, 1);
  el(160, F - 16, 1.6, 1.6, WOOD, 1);
  el(145.5, F - 16.6, 0.5, 0.5, '#fff', 0);
  el(159.5, F - 16.6, 0.5, 0.5, '#fff', 0);
  rr(127, F + 1.6, 54, 4.4, 1, '#f1dcc0', 0.9);
  rr(120, F - 48, 64, 9, 3, WOOD, 1.3);
  ln(1, 'rgba(255,255,255,0.55)', 124, F - 45.6, 180, F - 45.6);
  ln(0.5, 'rgba(140,80,30,0.3)', 126, F - 43.4, 140, F - 43.4);
  ln(0.5, 'rgba(140,80,30,0.3)', 150, F - 42.4, 168, F - 42.4);
  ln(0.5, 'rgba(140,80,30,0.3)', 170, F - 43.8, 178, F - 43.8);
  ln(2, 'rgba(75,46,30,0.1)', 125, F - 38.6, 183, F - 38.6);
  shade(146, F - 47.5, 15);
  c.beginPath();
  c.moveTo(135.5, F - 59);
  c.bezierCurveTo(125, F - 62, 125, F - 49, 135.5, F - 51);
  line(4.4, INK);
  c.beginPath();
  c.moveTo(135.5, F - 59);
  c.bezierCurveTo(125, F - 62, 125, F - 49, 135.5, F - 51);
  line(2, PINK);
  pth(153, F - 55, 'M0-2C4-3 7-6 8-10l3 1C10-4 7 0 0 2z', PINK, 1.2);
  el(163.5, F - 66.6, 1, 1, '#f9c2d0', 0.8);
  pth(132, F - 48, 'M2 0c-3-8 0-17 12-17s15 9 12 17z', PINK, 1.2);
  rr(133.5, F - 50.4, 25, 2.4, 1.2, '#f19bb2', 0.8);
  ln(0.6, 'rgba(255,255,255,0.55)', 136, F - 56.5, 156, F - 56.5);
  heart(146, F - 53.2, 0.55, '#fff3f6');
  for (const x of [139, 153]) el(x, F - 53.6, 0.7, 0.7, '#fff3f6', 0);
  ln(1.3, '#ffffff', 137, F - 56, 138, F - 60);
  el(146, F - 65, 7.5, 2.4, '#f9c2d0', 1.1);
  ln(0.6, 'rgba(75,46,30,0.35)', 141, F - 65, 151, F - 65);
  el(146, F - 69, 2.2, 2.2, BUTTER, 1);
  el(145.3, F - 69.7, 0.6, 0.6, '#ffffff', 0);
}

function btSoft(x, y, w, h, rad, col, lw = 0.6) {
  c.beginPath();
  c.roundRect(x, y, w, h, rad);
  line(lw, col);
}

function btStroke(x, y, d, col, lw = 0.7) {
  c.save();
  c.translate(x, y);
  c.beginPath();
  c.lineWidth = lw;
  c.strokeStyle = col;
  c.lineCap = 'round';
  c.stroke(new Path2D(d));
  c.restore();
}

function btScallop(x, y, rx, ry, n, amp, fill, lw) {
  const pt = (a, k) => [x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k];
  c.beginPath();
  c.moveTo(...pt(0, 1));
  for (let i = 0; i < n; i++) c.quadraticCurveTo(...pt(((i + 0.5) * TAU) / n, 1 + amp), ...pt(((i + 1) * TAU) / n, 1));
  c.closePath();
  paint(fill, lw);
}

function btRing(x, y, rx, ry, col, lw, dash) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, TAU);
  c.setLineDash(dash);
  line(lw, col);
  c.setLineDash([]);
}

function btWall(F) {
  c.fillStyle = '#d8edf9';
  c.fillRect(0, 0, W, F);
  for (let i = 0; i < 60; i++) {
    const x = (i * 53) % W;
    const y = (i * 37) % Math.max(1, F - 80);
    const br = 1.2 + ((i * 7) % 5) * 0.7;
    el(x, y, br, br, null, 0);
    line(0.6, '#bcdcf0');
    if (br > 2.4) {
      c.beginPath();
      c.arc(x, y, br * 0.62, Math.PI * 1.1, Math.PI * 1.55);
      line(0.6, '#ffffff');
    }
  }
  for (let y = F - 74; y < F - 4; y += 9) {
    for (let x = 0; x < W; x += 11) {
      c.beginPath();
      c.roundRect(x, y, 11, 9, 1.5);
      c.fillStyle = '#fbfdff';
      c.fill();
      line(0.5, '#c2dff2');
    }
  }
  for (const [col, row, i] of [[7, 1, 0], [8, 4, 1], [10, 3, 0], [12, 5, 1], [9, 6, 0], [11, 0, 1], [13, 2, 0], [8, 2, 1]]) {
    const x = col * 11 + 5.5;
    const y = F - 74 + row * 9 + 4.5;
    if (i) star(x, y, 0.5, '#ffe9a8');
    else heart(x, y, 0.5, '#f9cad5');
  }
  for (const [col, row] of [[7, 0], [9, 3], [11, 4], [12, 1], [8, 5]]) {
    const x = col * 11;
    const y = F - 74 + row * 9;
    ln(0.8, '#ffffff', x + 2.5, y + 6.5, x + 6, y + 2.5);
    ln(0.6, '#ffffff', x + 7, y + 3.5, x + 8, y + 2.5);
  }
  rr(-3, F - 77, W + 6, 4, 0, '#a9d4f5', 1);
  ln(0.6, '#ffffff', 0, F - 75.6, W, F - 75.6);
}

function btMat(F) {
  btScallop(90, F + 48, 58, 11, 26, 0.09, '#cdeee2', 1.2);
  btRing(90, F + 48, 49, 7.6, '#8fcfba', 0.8, [2.2, 1.8]);
  for (const x of [48, 132]) heart(x, F + 48, 0.8, '#f9cad5');
  for (const x of [66, 114]) star(x, F + 48, 0.55, '#fff3c4');
}

function btPorthole(F) {
  el(150, F - 160, 16, 16, CREAM, 1.3);
  const sky = c.createLinearGradient(0, F - 172, 0, F - 148);
  sky.addColorStop(0, '#a9dcf7');
  sky.addColorStop(1, '#e3f5ff');
  el(150, F - 160, 11.5, 11.5, sky, 1);
  for (let i = 0; i < 8; i++) {
    const a = (i * TAU) / 8 + 0.4;
    el(150 + Math.cos(a) * 13.8, F - 160 + Math.sin(a) * 13.8, 0.8, 0.8, '#d9e4ec', 0.5);
  }
  btRing(150, F - 160, 14.9, 14.9, '#e3d3b8', 0.5, []);
  pth(144, F - 160, 'M0 4a3 3 0 0 1 2-5 4.5 4.5 0 0 1 8 0 3 3 0 0 1 1.5 5z', '#ffffff', 0.8);
  btStroke(0, 0, `M${142} ${F - 167}a9 9 0 0 1 6-3`, '#ffffff', 1.2);
  btStroke(0, 0, `M${152} ${F - 153}q4 0 6-4`, '#ffffff', 0.9);
  star(157, F - 166, 0.4, BUTTER);
}

function btPicture(F) {
  btStroke(0, 0, `M34 ${F - 178}L40 ${F - 185}L46 ${F - 178}`, INK, 0.7);
  el(40, F - 185, 1, 1, '#d8a24f', 0.6);
  frame(24, F - 178, 32, 26, '#fff3e6');
  for (const [x, y] of [[26, -176], [53, -176], [26, -155], [53, -155]]) el(x, F + y, 0.7, 0.7, '#d8a24f', 0.4);
  btSoft(27.5, F - 174.5, 25, 21, 1.5, '#e3d3b8', 0.5);
  el(40, F - 163, 6, 4, BUTTER, 1);
  el(43, F - 168, 3.2, 3.2, BUTTER, 1);
  pth(46, F - 169, 'M0 0l3 1-3 1.6z', '#ffa76b', 0.7);
  el(44, F - 168.5, 0.5, 0.5, INK, 0);
  pth(39, F - 164, 'M0 0q3 2 5-1', null, 0.6);
  btStroke(29, F - 156, 'M0 0q2-2 4 0t4 0t4 0t4 0t4 0', '#8fd0f5', 0.7);
  el(33, F - 171, 1.3, 1.3, null, 0);
  line(0.5, '#8fd0f5');
  el(51, F - 160, 0.9, 0.9, null, 0);
  line(0.5, '#8fd0f5');
  ln(0.9, '#ffffff', 49, F - 174, 53, F - 170);
}

function btLamp(F) {
  ln(1, INK, 90, 0, 90, F - 150);
  rr(88.4, F - 160, 3.2, 2.6, 1, '#d9e4ec', 0.8);
  rr(88.2, F - 153.4, 3.6, 3.6, 1, '#d9e4ec', 0.8);
  el(90, F - 141, 7.5, 5, 'rgba(255,226,150,0.28)', 0);
  pth(90, F - 150, 'M-8 8a8 8 0 0 1 16 0z', '#cfeafb', 1.2);
  btStroke(90, F - 150, 'M-3 7.4c-.6-3 .2-5.4 2-6.8M3 7.4c.6-3-.2-5.4-2-6.8', '#a9d4f5', 0.6);
  btStroke(90, F - 150, 'M-6 3c.8-1.6 2-2.6 3.4-3', '#ffffff', 0.9);
  rr(81.6, F - 143.2, 16.8, 2.6, 1.3, '#a9d4f5', 0.9);
  el(90, F - 140.5, 2.2, 1.6, BUTTER, 0.8);
  ln(0.8, INK, 96.5, F - 141, 96.5, F - 135);
  el(96.5, F - 134.4, 1, 1.2, PINK, 0.7);
}

function btMirror(F) {
  pth(90, F - 108, 'M0-21C10-21 17-11 17 1 17 13 9 21 0 21-9 21-17 13-17 1-17-11-10-21 0-21z', '#ffe2a6', 1.3);
  btStroke(90, F - 108, 'M0-19C8.6-19 15-10 15 1 15 11.6 8 19 0 19-8 19-15 11.6-15 1-15-10-8.6-19 0-19z', '#d8a24f', 0.6);
  pth(90, F - 108, 'M0-17C7.4-17 13-9 13 1 13 10 7 17 0 17-7 17-13 10-13 1-13-9-7.4-17 0-17z', '#e6f5fd', 1);
  for (let i = 0; i < 10; i++) {
    const a = (i * TAU) / 10 + 0.3;
    el(90 + Math.cos(a) * 15, F - 107 + Math.sin(a) * 19, 0.85, 0.85, CREAM, 0.5);
  }
  pth(90, F - 130, 'M0 0c-5-4-8 1-5.5 3.5C-3 5.5 0 3 0 0zM0 0c5-4 8 1 5.5 3.5C3 5.5 0 3 0 0z', PINK, 0.9);
  el(90, F - 129.4, 1.3, 1.3, '#f08aa4', 0.7);
  ln(1.4, '#ffffff', 83, F - 114, 89, F - 120);
  ln(1, '#ffffff', 79, F - 104, 80, F - 98);
  ln(1.4, '#ffffff', 84, F - 107, 93, F - 116);
  btStroke(90, F - 108, 'M5 13q5-3 7-10', '#ffffff', 0.9);
  star(95, F - 118, 0.45, '#ffffff');
  el(90, F - 87, 2, 1.2, '#d8a24f', 0.5);
}

function btShelf(F) {
  rr(132, F - 110, 48, 4, 2, CREAM, 1.1);
  ln(0.7, '#e3d3b8', 134, F - 107.8, 178, F - 107.8);
  for (const x of [137, 170]) pth(x, F - 106, 'M0 0v7q0 1 1 .5l5-7z', CREAM, 0.9);
  el(156, F - 98.6, 22, 1.4, 'rgba(75,46,30,0.08)', 0);
  for (const [x, w, h, fill, mark] of [[136, 8, 16, PINK, 0], [148, 9, 12, MINT, 1], [162, 7, 18, BUTTER, 2]]) {
    rr(x, F - 110 - h, w, h, 3, fill, 1);
    if (mark === 2) {
      rr(x + w / 2 - 1, F - 115 - h, 2, 5, 0.8, CREAM, 0.8);
      rr(x + w / 2 - 1, F - 116 - h, 6, 2.2, 1.1, CREAM, 0.8);
    } else {
      rr(x + w / 2 - 1.5, F - 113 - h, 3, 3, 1, CREAM, 0.8);
    }
    rr(x + 1.2, F - 110 - h * 0.6, w - 2.4, h * 0.34, 1.2, CREAM, 0.5);
    if (mark === 0) heart(x + w / 2, F - 110 - h * 0.43, 0.38, PINK);
    else el(x + w / 2, F - 110 - h * 0.43, 0.9, 0.9, mark === 1 ? '#8fcfba' : '#ffbf69', 0);
    ln(0.9, '#ffffff', x + 1.8, F - 110 - h + 3, x + 1.8, F - 110 - h + 5.2);
  }
}

function btShelfLow(F) {
  rr(106, F - 44, 36, 4, 2, CREAM, 1.1);
  ln(0.7, '#e3d3b8', 108, F - 41.8, 140, F - 41.8);
  for (const x of [110, 133]) pth(x, F - 40, 'M0 0v7q0 1 1 .5l5-7z', CREAM, 0.9);
  el(124, F - 32.8, 18, 1.3, 'rgba(75,46,30,0.08)', 0);
  rr(113, F - 68, 11, 24, 3, '#bfe9db', 1.1);
  rr(116, F - 72, 5, 4, 1.5, '#d9e4ec', 1);
  ln(1.5, INK, 118.5, F - 72, 118.5, F - 75, 122.5, F - 75);
  ln(1, '#ffffff', 113, F - 50, 124, F - 50);
  ln(1.1, '#ffffff', 116, F - 63, 116, F - 56);
  rr(114.4, F - 59, 8.2, 7.5, 1.2, CREAM, 0.5);
  heart(118.5, F - 55, 0.45, '#8fcfba');
  rr(128, F - 55, 9, 11, 2, CREAM, 1);
  rr(129.4, F - 52, 6.2, 4.6, 1, '#f9cad5', 0.5);
  ln(0.9, '#ffffff', 129.5, F - 54, 129.5, F - 53);
  rr(126, F - 58, 13, 3, 1.5, '#d9e4ec', 1);
  ln(0.8, '#ffffff', 128, F - 57.2, 132, F - 57.2);
}

function btCurtain(F) {
  ln(1.1, INK, 0, F - 132, 74, F - 132);
  el(74, F - 132, 3, 3, '#d9e4ec', 1);
  rr(71, F - 136, 6, 8, 2, '#d9e4ec', 1);
  pth(0, F - 131, 'M0 0h20c-4 30 3 58-3 90-2 4-4 4-6 1-2 3-5 4-7 0-2 3-3 3-4 1z', '#f9cad5', 1.3);
  btStroke(0, F - 131, 'M6 4c2 24-2 44 1 82M13 4c1 26-2 46 0 82', '#eba3b6', 0.7);
  btStroke(0, F - 131, 'M0 80c6 2 12 2 17 0', '#eba3b6', 0.7);
  for (const [x, y, i] of [[5, 12, 0], [12, 26, 1], [6, 42, 0], [13, 58, 1], [6, 74, 0]]) {
    if (i) heart(x, F - 131 + y, 0.5, CREAM);
    else el(x, F - 131 + y, 1.6, 1.6, CREAM, 0);
  }
  for (const x of [4, 10, 16]) el(x, F - 131.5, 1.3, 2.2, '#f7fbff', 0.7);
}

function btShower(F) {
  ln(2.8, INK, 34, F - 108, 34, F - 126, 44, F - 126);
  ln(1.4, '#cfdae3', 34, F - 108, 34, F - 126, 44, F - 126);
  rr(43, F - 131, 3.4, 10, 1.5, '#d9e4ec', 1);
  rr(32.2, F - 120, 3.6, 3, 1, '#e6eef4', 0.8);
  rr(32.2, F - 112, 3.6, 3, 1, '#e6eef4', 0.8);
  pth(34, F - 104, 'M-7 .4a7 5.4 0 0 1 14 0z', '#d9e4ec', 1.2);
  el(34, F - 103.6, 7, 1.8, '#c2d0da', 1);
  btStroke(34, F - 104, 'M-4.6-1.6q1.4-2.2 3.4-2.8', '#ffffff', 0.8);
  for (const [x, y] of [[-3.5, -1.6], [0, -2.6], [3.5, -1.6], [-1.8, 0.6], [1.8, 0.6]]) el(34 + x, F - 104 + y, 0.45, 0.45, '#8fa6b4', 0);
  el(30.5, F - 99, 0.6, 0.8, '#8fd0f5', 0);
  el(38, F - 97.5, 0.6, 0.8, '#8fd0f5', 0);
}

function btTub(F) {
  shade(36, F + 14, 44);
  for (const x of [14, 50]) {
    pth(x, F, 'M0 0h8v6.5c0 4.6-2 6.5-4 6.5s-4-1.9-4-6.5z', BUTTER, 1);
    ln(0.6, '#d99a3a', x + 2.7, F + 8, x + 2.7, F + 11);
    ln(0.6, '#d99a3a', x + 5.3, F + 8, x + 5.3, F + 11);
    rr(x - 0.8, F + 1.5, 9.6, 3, 1.5, '#ffe9a8', 0.9);
  }
  const body = 'M0 0h78v14c0 14-10 22-22 22H22C10 36 0 28 0 14z';
  pth(-4, F - 34, body, '#ffffff', 1.3);
  c.save();
  c.translate(-4, F - 34);
  c.clip(new Path2D(body));
  c.fillStyle = '#cfeafb';
  c.fillRect(0, 15, 78, 3.4);
  c.fillStyle = 'rgba(143,200,230,0.22)';
  c.fillRect(0, 27, 78, 10);
  c.restore();
  for (let x = 6; x < 70; x += 9) heart(x - 4 + 3, F - 17.2 + (x % 2), 0.38, '#f6a5b6');
  btStroke(-4, F - 34, 'M6 22c-.4 4 1.6 8 5 10', '#ffffff', 1.3);
  btStroke(-4, F - 34, 'M70 20c.4 3-1 6-3 8', '#ffffff', 1);
  rr(-6, F - 40, 82, 8, 4, '#f7fbff', 1.3);
  ln(1, '#ffffff', 0, F - 38.6, 68, F - 38.6);
  ln(0.6, '#bcdcf0', 3, F - 33.8, 68, F - 33.8);
  el(64, F - 25, 2.6, 2.6, '#e6f5fd', 0.9);
  el(64, F - 25, 0.9, 0.9, '#8fcfba', 0);
  const foam = [[19, F - 48, 9, 7.5, 1], [8, F - 43, 7.5, 5.5, 0.3], [33, F - 45, 7, 6, 2], [44, F - 43, 5.5, 4.5, 0.6], [25, F - 42, 6.5, 4.5, 1.7]];
  for (const [x, y, rx, ry, k] of foam) blob(x, y, rx, ry, k, '#ffffff', 2.4);
  for (const [x, y, rx, ry, k] of foam) blob(x, y, rx, ry, k, '#ffffff', 0);
  for (const [x, y, rx, ry] of foam) {
    c.beginPath();
    c.arc(x, y, Math.min(rx, ry) * 0.62, 0.1, 1.2);
    line(0.7, '#bcdcf0');
  }
  el(14, F - 59, 2.2, 2.2, '#e9f6fd', 0.7);
  el(38, F - 56, 1.5, 1.5, '#e9f6fd', 0.7);
  ln(0.6, '#ffffff', 13, F - 60, 14.5, F - 60.6);
  el(58, F - 45, 6.5, 4.5, BUTTER, 1.1);
  el(62, F - 51, 4, 4, BUTTER, 1.1);
  pth(65, F - 52, 'M0 0l4 1-4 2z', '#ffa76b', 0.9);
  el(63, F - 52, 0.8, 0.8, INK, 0);
  pth(55, F - 46, 'M0 0q3.4-1.6 5.6 1', null, 0.6);
  el(61, F - 49.6, 1, 0.7, '#ffb3a1', 0);
  rr(68, F - 44, 6, 4, 1.5, '#d9e4ec', 1);
  ln(3.2, INK, 71, F - 44, 71, F - 57, 66, F - 57, 66, F - 54.5);
  ln(1.8, '#e6eef4', 71, F - 44, 71, F - 57, 66, F - 57, 66, F - 54.5);
  ln(1.6, INK, 71, F - 52, 75, F - 54);
  el(75.4, F - 54.2, 1.4, 1.4, PINK, 0.8);
  ln(0.9, '#ffffff', 71.6, F - 51, 71.6, F - 46);
}

function btToilet(F, t) {
  shade(t.x + 21, F + 12, 24);
  rr(t.x + 7, t.y + 2, 28, 24, 6, '#ffffff', 1.3);
  rr(t.x + 5, t.y, 32, 4.4, 2.2, '#f4fafe', 1.2);
  btStroke(t.x, t.y, 'M10 9v11', '#e6f5fd', 1.4);
  btStroke(t.x, t.y, 'M33 9c1 5 1 10 0 14', '#cfe4f2', 0.7);
  rr(t.x + 9, t.y + 6, 5, 2, 1, '#d9e4ec', 0.8);
  el(t.x + 21, t.y + 14, 2.2, 2.2, PINK, 0);
  for (const [dx, dy] of [[-3, -3], [0, -4.2], [3, -3]]) el(t.x + 21 + dx, t.y + 14 + dy, 0.9, 0.9, PINK, 0);
  rr(t.x + 17, t.y - 1, 8, 3, 1.5, '#d9e4ec', 1);
  ln(0.8, '#ffffff', t.x + 18.5, t.y - 0.2, t.x + 21, t.y - 0.2);
  rr(t.x + 12.5, t.y + 25, 3.4, 3, 1, '#d9e4ec', 0.8);
  rr(t.x + 26.5, t.y + 25, 3.4, 3, 1, '#d9e4ec', 0.8);
  pth(t.x + 4, t.y + 30, 'M0 0h34c0 12-7 18-13 18v8h-8v-8C7 18 0 12 0 0z', '#ffffff', 1.3);
  pth(t.x + 4, t.y + 30, 'M27 7c0 7-3 11-6 12v6h-3v-5c5-2 7-6 9-13z', 'rgba(143,200,230,0.3)', 0);
  rr(t.x + 13, t.y + 54, 16, 3.2, 1.6, '#ffffff', 1.1);
  pth(t.x + 21, t.y + 30, 'M-19 0C-19-3.6-10-5.2 0-5.2S19-3.6 19 0 10 6 0 6-19 3.6-19 0z', '#ffffff', 1.3);
  btStroke(t.x + 21, t.y + 30, 'M-17 2.2C-14 4.6-8 5.6 0 5.6', '#cfe4f2', 0.6);
  pth(t.x + 21, t.y + 30, 'M-13 0c0-1.6 5-2.6 13-2.6S13-1.6 13 0 8 2.8 0 2.8-13 1.6-13 0z', '#bfe3f5', 1);
  btStroke(t.x + 21, t.y + 30, 'M-9-.6q1-1 4-1.2', '#ffffff', 0.7);
}

function drawBath(H, L) {
  const F = L.F;
  btWall(F);
  checker(H, F, '#eef8ff', '#d5eaf8');
  baseboard(F);
  btMat(F - 28);
  btPorthole(F);
  btPicture(F);
  btLamp(F);
  btMirror(F);
  btShelf(F);
  btShelfLow(F);
  btCurtain(F);
  btShower(F);
  btTub(F);
  btToilet(F, L.bath.toilet);
}

function bdWall(H, F) {
  c.fillStyle = '#e8def6';
  c.fillRect(0, 0, W, F);
  for (let y = 8, j = 0; y < F - 8; y += 14, j++) {
    for (let x = (j % 2) * 9 + 5; x < W; x += 18) {
      if ((x + j) % 3) heart(x, y, 0.55, '#f5c6d6');
      else star(x, y, 0.5, '#fbeec2');
    }
  }
  c.fillStyle = '#d9cbee';
  c.fillRect(0, F - 30, W, 24);
  for (let x = 4; x < W; x += 9) ln(0.5, 'rgba(75,46,30,0.12)', x, F - 28, x, F - 7);
  rr(-3, F - 33, W + 6, 4, 0, CREAM, 1);
  ln(0.6, '#ffffff', 0, F - 31.6, W, F - 31.6);
  planks(H, F, '#e3d3ef', 'rgba(75,46,30,0.16)');
  for (let y = F + 4, i = 0; y < H; y += 10, i++) {
    const x = (i * 37 + 11) % 120;
    ln(0.5, 'rgba(75,46,30,0.13)', x + 6, y, x + 16, y);
    ln(0.5, 'rgba(75,46,30,0.13)', x + 70, y + 3, x + 77, y + 3);
  }
  baseboard(F);
}

function bdWindow(F, w) {
  windowFrame(w, true);
  btSoft(w.x + 2.2, w.y + 2.2, w.w - 4.4, w.h - 4.4, 4.6, '#e3d3b8', 0.5);
  c.save();
  c.beginPath();
  c.roundRect(w.x + 5, w.y + 5, w.w - 10, w.h - 10, 4);
  c.clip();
  c.fillStyle = '#463f86';
  c.beginPath();
  c.moveTo(w.x + 5, F - 103);
  c.quadraticCurveTo(w.x + 16, F - 112, w.x + 28, F - 102);
  c.quadraticCurveTo(w.x + 40, F - 109, w.x + w.w - 5, F - 100);
  c.lineTo(w.x + w.w - 5, F - 90);
  c.lineTo(w.x + 5, F - 90);
  c.fill();
  rr(w.x + 36, F - 104, 8, 6, 1, '#363073', 0);
  pth(w.x + 35, F - 104, 'M0 0l5-4 5 4z', '#363073', 0);
  rr(w.x + 38, F - 102.4, 2, 2, 0.4, BUTTER, 0);
  pth(w.x + 12, w.y + 34, 'M0 4a2.5 2.5 0 0 1 2-4 3.5 3.5 0 0 1 6.5 0 2.5 2.5 0 0 1 1.5 4z', '#6f67b5', 0);
  el(w.x + 36, w.y + 15, 9, 9, 'rgba(255,243,196,0.16)', 0);
  c.globalAlpha = 0.25;
  ln(1.2, '#ffffff', w.x + 8, w.y + 22, w.x + 18, w.y + 8);
  ln(0.8, '#ffffff', w.x + 21, w.y + 10, w.x + 24, w.y + 6);
  c.globalAlpha = 1;
  c.restore();
  pth(w.x + 36, w.y + 15, 'M0-6a6 6 0 1 0 5 9 5 5 0 0 1-5-9z', '#fff3c4', 0.9);
  el(w.x + 33.4, w.y + 14, 0.7, 0.7, '#e8d9a0', 0);
  el(w.x + 34.6, w.y + 18, 0.5, 0.5, '#e8d9a0', 0);
  ln(0.8, '#ffffff', w.x - 1, w.y + w.h - 0.8, w.x + w.w + 1, w.y + w.h - 0.8);
  for (const x of [w.x + 2, w.x + w.w - 8]) pth(x, w.y + w.h + 3, 'M0 0v7q0 1 1 .5l5-7z', CREAM, 0.9);
  curtains(w, '#cdb9f2');
  for (const [x, y] of [[-6, 11], [0, 34], [-4, 44]]) star(w.x + x, w.y + y, 0.38, '#ffffff');
  for (const [x, y] of [[w.w + 6, 12], [w.w + 1, 35], [w.w + 5, 42]]) star(w.x + x, w.y + y, 0.38, '#ffffff');
  for (const x of [-8, -3, 2, w.w - 2, w.w + 3, w.w + 8]) el(w.x + x, w.y - 3.6, 1.1, 1.8, '#f5eeff', 0.7);
  for (const x of [w.x - 10, w.x + w.w - 3.6]) {
    rr(x, w.y + 21, 13.6, 3.4, 1.7, BUTTER, 0.9);
    el(x + 6.8, w.y + 22.7, 1, 1, CREAM, 0.5);
  }
}

function bdGarland(F) {
  ln(1, INK, 66, F - 148, 92, F - 134, 116, F - 124);
  el(66, F - 148, 1.3, 1.3, '#d8a24f', 0.7);
  el(116, F - 124, 1.3, 1.3, '#d8a24f', 0.7);
  for (const [x, y] of [[74, -143.7], [83, -138.9], [92, -134], [101, -130.3], [110, -126.5]]) star(x, F + y, 0.9, BUTTER, 0.8);
  for (const [x, y] of [[78.5, -139.1], [87.5, -134.3], [96.5, -130.1], [105.5, -126.2]]) heart(x, F + y, 0.5, PINK);
}

function bdFrame(F) {
  btStroke(0, 0, `M82 ${F - 116}L91 ${F - 123}L100 ${F - 116}`, INK, 0.7);
  el(91, F - 123, 1, 1, '#d8a24f', 0.6);
  frame(78, F - 116, 26, 22, '#fff3e6');
  btSoft(81.4, F - 112.6, 19.2, 15.2, 1.5, '#e3d3b8', 0.5);
  pth(91, F - 105, 'M0-5a5 5 0 1 0 4 8 4 4 0 0 1-4-8z', BUTTER, 0.9);
  star(84.5, F - 108.6, 0.3, '#f4b66b');
  star(98, F - 100.5, 0.3, '#f4b66b');
  ln(0.9, '#ffffff', 96.5, F - 111, 99, F - 108.5);
}

function bdShelf(F) {
  rr(116, F - 124, 64, 4, 2, WOOD, 1.1);
  ln(0.6, '#fbd9a8', 118, F - 122, 178, F - 122);
  for (const x of [124, 150]) pth(x, F - 120, 'M0 0v7q0 1 1 .5l5-7z', WOOD, 0.9);
  el(148, F - 112.6, 30, 1.4, 'rgba(75,46,30,0.08)', 0);
  for (const [x, h, fill] of [[120, 16, PINK], [126, 14, MINT], [132, 17, LILAC], [138, 13, BUTTER]]) {
    rr(x, F - 124 - h, 6, h, 1.5, fill, 1);
    ln(0.7, '#ffffff', x + 0.8, F - 124 - h + 3.2, x + 5.2, F - 124 - h + 3.2);
    ln(0.7, '#ffffff', x + 0.8, F - 124 - 3.6, x + 5.2, F - 124 - 3.6);
  }
  c.save();
  c.translate(144, F - 124);
  c.rotate(0.15);
  rr(0, -14, 5, 14, 1.3, '#a9d4f5', 1);
  ln(0.7, '#ffffff', 0.8, -11, 4.2, -11);
  heart(2.5, -6.5, 0.4, '#ffffff');
  c.restore();
  pth(172, F - 128, 'M0 0c-8-3-11-8-11-13 6 1 11 5 11 13z', '#8fd0bb', 0.9);
  el(158, F - 131, 7, 6, '#b3a89e', 1.1);
  ln(1, '#d8cfc6', 154, F - 134, 156, F - 136);
  pth(153, F - 136, 'M0 0l1-4 3 2M10 0l-1-4-3 2', '#b3a89e', 1);
  el(156, F - 131, 0.8, 0.8, INK, 0);
  el(160, F - 131, 0.8, 0.8, INK, 0);
  ln(0.7, '#8f857b', 157, F - 136.6, 157, F - 134.8);
  ln(0.7, '#8f857b', 159.2, F - 136.6, 159.2, F - 134.8);
  el(154.4, F - 129.6, 1.1, 0.7, '#f4b9c4', 0);
  el(161.6, F - 129.6, 1.1, 0.7, '#f4b9c4', 0);
  pth(164, F - 126, 'M0 0q5 0 4-5', null, 0.9);
  pot(172, F - 126, '#f9cad5');
  rr(165.4, F - 128.4, 13.2, 2.6, 1.2, '#f6b8c8', 0.8);
  heart(172, F - 120.6, 0.65, CREAM);
}

function bdCabinet(F) {
  shade(20, F + 7, 22);
  for (const x of [5, 29]) rr(x, F + 5.5, 6, 3.4, 1.2, WOOD, 1);
  rr(2, F - 50, 36, 56, 3, '#f6e3c8', 1.3);
  rr(0, F - 53, 40, 4.4, 2, '#f2d3a6', 1.2);
  ln(0.7, '#fff3d6', 3, F - 51.6, 37, F - 51.6);
  rr(4.5, F - 46, 31, 21, 2, '#ecd2ae', 0.7);
  rr(5, F - 21, 30, 22, 3, '#fbeedd', 0.8);
  ln(1.1, INK, 2, F - 24, 38, F - 24);
  for (const [x, h, fill] of [[6, 20, PINK], [12, 18, '#a9d4f5'], [18, 21, MINT], [24, 17, BUTTER]]) {
    rr(x, F - 25 - h, 6, h, 1.5, fill, 1);
    ln(0.7, '#ffffff', x + 0.8, F - 25 - h + 3.2, x + 5.2, F - 25 - h + 3.2);
    ln(0.7, '#ffffff', x + 0.8, F - 29, x + 5.2, F - 29);
  }
  rr(30.4, F - 41, 3.6, 16, 1.2, LILAC, 0.9);
  heart(13, F - 11, 0.7, '#f9b4c6');
  el(30, F - 6, 5, 5, LILAC, 1.1);
  el(28.6, F - 7.4, 1.4, 1, '#ffffff', 0);
}

function bdNightstand(F) {
  shade(159, F + 7, 23);
  for (const x of [144, 169]) rr(x, F + 5.5, 5, 3.4, 1.2, WOOD, 1);
  rr(140, F - 36, 38, 42, 3, '#f6e3c8', 1.3);
  rr(138, F - 39, 42, 5, 2, '#f2d3a6', 1.2);
  ln(0.7, '#fff3d6', 141, F - 37.6, 177, F - 37.6);
  rr(144, F - 28, 30, 14, 3, '#fbeedd', 1);
  btSoft(146, F - 26, 26, 10, 2, '#e9d2b0', 0.5);
  el(159, F - 21, 2.4, 2.4, WOOD, 1);
  el(158.4, F - 21.6, 0.8, 0.8, '#fff3d6', 0);
  rr(144, F - 11, 30, 15, 3, '#fbeedd', 0.9);
  el(159, F - 3.6, 1.3, 1.3, WOOD, 0.8);
  heart(150, F - 4, 0.55, '#f9b4c6');
  heart(168, F - 4, 0.55, '#f9b4c6');
  el(159, F - 36.6, 6.5, 1.6, '#b79fe0', 1);
  rr(156, F - 60, 6, 24, 2, LILAC, 1.1);
  rr(155, F - 47, 8, 3, 1.5, '#b79fe0', 0.9);
  ln(0.8, '#ffffff', 157.4, F - 58, 157.4, F - 50);
}

function bdSwitch(F) {
  rr(122, F - 62, 12, 17, 2.5, CREAM, 1.1);
  btSoft(123.8, F - 60.2, 8.4, 13.4, 1.6, '#e3d3b8', 0.5);
  rr(126, F - 59.6, 4, 14.4, 2, '#eadcc6', 0.6);
  for (const y of [-60.8, -46.2]) el(128, F + y, 0.55, 0.55, '#c9b79c', 0);
}

function bedGeo(b) {
  const cy = b.y + b.h / 2;
  return { x: b.x + b.w / 2, rx: b.w / 2, top: cy - 5, base: cy + 3, ryT: 10, ryB: 11, inX: 43, inY: 5.6 };
}

function bedWall(g) {
  const { x, rx, top, base, ryT, ryB } = g;
  c.beginPath();
  c.moveTo(x - rx, top);
  c.quadraticCurveTo(x - rx - 2.4, (top + base) / 2, x - rx, base);
  c.ellipse(x, base, rx, ryB, 0, Math.PI, 0, true);
  c.quadraticCurveTo(x + rx + 2.4, (top + base) / 2, x + rx, top);
  c.ellipse(x, top, rx, ryT, 0, 0, Math.PI);
  c.closePath();
  const grad = c.createLinearGradient(0, top, 0, base + ryB);
  grad.addColorStop(0, '#f7aabb');
  grad.addColorStop(1, '#e3819c');
  paint(grad, 1.3);
  for (const a of [0.28, 0.62, 0.9, 1.25, 1.55, 1.89, 2.2, 2.52, 2.86]) {
    const px = x + Math.cos(a) * (rx - 0.6);
    ln(0.6, '#d36f8c', px, top + Math.sin(a) * ryT + 1.6, px - Math.cos(a) * 0.6, base + Math.sin(a) * ryB - 2.2);
  }
  btStroke(x - rx + 5, top + 5, 'M0 0Q1 5 5 8.4', '#ffffff', 0.9);
}

function bedRimFront(g) {
  const { x, rx, top, ryT, inX, inY } = g;
  c.beginPath();
  c.ellipse(x, top, rx, ryT, 0, 0, Math.PI);
  c.ellipse(x, top, inX, inY, 0, Math.PI, 0, true);
  c.closePath();
  c.fillStyle = '#fcd3dd';
  c.fill();
  for (const [ex, ey, a0, a1, ccw] of [[rx, ryT, 0, Math.PI, false], [inX, inY, Math.PI, 0, true]]) {
    c.beginPath();
    c.ellipse(x, top, ex, ey, 0, a0, a1, ccw);
    line(1.3);
  }
  c.beginPath();
  c.ellipse(x, top, (rx + inX) / 2, (ryT + inY) / 2, 0, 0.12, Math.PI - 0.12);
  c.setLineDash([1.6, 1.6]);
  line(0.7, '#e98aa4');
  c.setLineDash([]);
  btStroke(x, top, `M${-rx * 0.62} ${ryT * 0.72}Q${-rx * 0.4} ${ryT * 0.9} ${-rx * 0.2} ${ryT * 0.93}`, '#ffffff', 0.9);
}

function bedInside(g) {
  const { x, top, inX, inY } = g;
  c.beginPath();
  c.ellipse(x, top, inX, inY, 0, 0, TAU);
  paint('#e2859f', 0);
  c.save();
  c.clip();
  el(x, top + 2.6, inX - 2.4, inY - 0.4, '#fff0f4', 0);
  el(x, top + 3.8, inX - 8, inY - 2, '#fbdbe4', 0);
  rr(x - 36, top - 3.2, 14, 6.4, 3.2, LILAC, 1);
  btStroke(x - 36, top - 3.2, 'M2 1.4q5-1.2 9.6 0', '#ffffff', 0.7);
  star(x - 29, top + 0.4, 0.45, BUTTER);
  heart(x + 14, top + 3.2, 0.7, '#f6a5b6');
  heart(x + 22, top + 2.2, 0.45, '#f6a5b6');
  c.beginPath();
  c.ellipse(x, top, inX, inY, 0, 0, TAU);
  line(4, 'rgba(176,78,110,0.28)');
  c.restore();
  c.beginPath();
  c.ellipse(x, top, inX, inY, 0, 0, TAU);
  line(1.3);
}

function bedFront(g) {
  bedWall(g);
  bedRimFront(g);
  c.beginPath();
  c.ellipse(g.x, g.top, g.inX, g.inY, 0, 0.02, Math.PI - 0.02);
  line(1.3);
}

function bdBed(F, b) {
  const g = bedGeo(b);
  const { x, rx, top, ryT, inX, inY } = g;
  el(x, g.base + g.ryB + 0.4, rx + 5, 3.8, SHADOW, 0);
  el(x, g.base + g.ryB - 0.4, rx + 1, 2.6, 'rgba(75,46,30,0.12)', 0);
  bedWall(g);
  c.beginPath();
  c.ellipse(x, top, rx, ryT, 0, 0, TAU);
  paint('#fcd3dd', 1.3);
  c.beginPath();
  c.ellipse(x, top, (rx + inX) / 2, (ryT + inY) / 2, 0, 0, TAU);
  c.setLineDash([1.6, 1.6]);
  line(0.7, '#e98aa4');
  c.setLineDash([]);
  bedInside(g);
  bedRimFront(g);
}

function bdRug(F) {
  btScallop(90, F + 44, 62, 16, 28, 0.08, LILAC, 1.3);
  btScallop(90, F + 41, 50, 11, 22, 0.05, '#f5eeff', 1.1);
  btRing(90, F + 41, 44, 8.4, '#c9b3ef', 0.7, [2, 1.8]);
  for (const x of [66, 114]) heart(x, F + 41, 0.8, '#f9b4c6');
  star(90, F + 41, 0.7, '#fbeec2');
  blob(30, F + 40, 6, 6, 0.4, '#f9b4c6', 1.1);
  pth(25, F + 38, 'M0 0q5 3 10-1M1 4q4 2 9-1', null, 0.9);
  el(28.4, F + 37.6, 1.4, 0.9, '#ffe3ea', 0);
  pth(36, F + 44, 'M0 0q6 4 10 0', null, 0.9);
}

function drawBedroom(H, L) {
  const F = L.F;
  const w = L.bedroom.win;
  bdWall(H, F);
  bdGarland(F);
  bdWindow(F, w);
  bdFrame(F);
  bdShelf(F);
  bdCabinet(F);
  bdNightstand(F);
  bdSwitch(F);
  bdBed(F, L.bedroom.bed);
  bdRug(F - 24);
}

const DRAW = { living: drawLiving, kitchen: drawKitchen, bath: drawBath, bedroom: drawBedroom };
let bgCache = {};
let cacheKey = '';

export function background(name, H, L, scale) {
  const key = H + 'x' + scale;
  if (key !== cacheKey) {
    bgCache = {};
    cacheKey = key;
  }
  if (!bgCache[name]) {
    const cv = document.createElement('canvas');
    cv.width = Math.round(W * scale);
    cv.height = Math.round(H * scale);
    c = cv.getContext('2d');
    c.scale(cv.width / W, cv.height / H);
    DRAW[name](H, L);
    bgCache[name] = cv;
  }
  return bgCache[name];
}

function clouds(w, t, top) {
  c.save();
  c.beginPath();
  c.roundRect(w.x + 5, w.y + 5, w.w - 10, (top || w.h) - 10, 4);
  c.clip();
  for (let k = 0; k < 2; k++) {
    const x = w.x + ((t * 3 + k * 37) % (w.w + 30)) - 16;
    const y = w.y + 14 + k * 16;
    pth(x, y, 'M0 6a4 4 0 0 1 3-6 6 6 0 0 1 11 0 4 4 0 0 1 2 6z', '#ffffff', 0.9);
  }
  c.restore();
  if (top) rr(w.x + w.w / 2 - 2, w.y + 5, 4, top - 5, 1, CREAM, 0.9);
  else windowBars(w);
}

const BULBS = [PINK, BUTTER, MINT, '#a9d4f5', LILAC];
const STARS = [[8, 10], [16, 30], [26, 8], [11, 42], [38, 34], [40, 46], [22, 44], [32, 22]];

function stars(L, t) {
  const w = L.bedroom.win;
  c.save();
  c.beginPath();
  c.roundRect(w.x + 5, w.y + 5, w.w - 10, w.h - 10, 4);
  c.clip();
  STARS.forEach(([sx, sy], i) => {
    const b = 0.5 + 0.5 * Math.sin(t * 2 + i * 1.7);
    c.globalAlpha = 0.35 + 0.65 * b;
    star(w.x + 5 + sx, w.y + 5 + sy, 0.35 + b * 0.35, '#fff3c4');
  });
  c.globalAlpha = 1;
  c.restore();
  windowBars(w);
}

function lamp(F, lit) {
  if (lit) {
    const g = c.createRadialGradient(159, F - 64, 2, 159, F - 64, 22);
    g.addColorStop(0, 'rgba(255,236,170,0.9)');
    g.addColorStop(1, 'rgba(255,236,170,0)');
    c.fillStyle = g;
    c.fillRect(135, F - 88, 48, 48);
  }
  rr(153, F - 82.4, 10, 2.8, 1.2, '#d9e4ec', 0.9);
  pth(147, F - 80, 'M4 0h16l4 20H0z', lit ? '#fff0b8' : '#f9cad5', 1.2);
  for (const [top, bottom] of [[154, 153], [157, 159], [160, 165]]) ln(0.6, lit ? '#f2d98f' : '#eaa6ba', top, F - 79.4, bottom, F - 61);
  ln(2, lit ? '#ffe08a' : '#f6b8c8', 148, F - 61.6, 170, F - 61.6);
  for (let x = 149; x < 171; x += 5.2) el(x, F - 59.8, 1.3, 1.3, CREAM, 0.6);
  ln(1.2, '#ffffff', 151, F - 76, 149.5, F - 66);
}

export function drawLife(ctx, name, L, t, f) {
  c = ctx;
  const F = L.F;
  if (name === 'living') {
    clouds(L.living.win, t);
    ln(1, INK, 46, F - 150, 68, F - 141, 90, F - 146, 112, F - 141, 134, F - 150);
    const pts = [[50, -147.4], [58, -144.1], [68, -140], [79, -142.5], [90, -145], [101, -142.5], [112, -140], [122, -144.1], [130, -147.4]];
    pts.forEach(([x, dy], i) => {
      const lit = f.still || (Math.floor(t * 2) + i) % 3 !== 0;
      rr(x - 1.1, F + dy - 0.9, 2.2, 2, 0.6, '#b89a86', 0.6);
      el(x, F + dy + 3, 2.4, 2.8, lit ? BULBS[i % 5] : '#ece2e6', 0.9);
      el(x - 0.8, F + dy + 2.2, 0.55, 0.55, '#ffffff', 0);
      if (lit && !f.still) {
        c.globalAlpha = 0.25;
        el(x, F + dy + 3, 4.5, 5, BULBS[i % 5], 0);
        c.globalAlpha = 1;
      }
    });
    if (f.tvOn) {
      rr(147, F - 80, 24, 26, 5, '#2f2b52', 1.1);
      for (let i = 0; i < 5; i++) el(150 + ((i * 7 + t * 18) % 18), F - 76 + ((i * 5) % 16), 1.6, 1.6, BULBS[i], 0);
      el(159 + Math.sin(t * 6) * 5, F - 61, 2.4, 2.4, '#fff', 0.8);
    }
    if (f.gift) drawGift(L.living.gift, t, f.giftOpen);
  } else if (name === 'kitchen') {
    clouds(L.kitchen.win, t, 27);
    for (let k = 0; k < 3; k++) {
      const ph = (t * 0.45 + k / 3) % 1;
      c.globalAlpha = 0.9 * (1 - ph);
      el(166 + Math.sin(ph * 6 + k) * 3, F - 62 - ph * 18, 2 + ph * 2, 2 + ph * 2, '#ffffff', 0.6);
    }
    c.globalAlpha = 1;
    if (f.fridgeOpen) {
      const fr = L.kitchen.fridge;
      rr(fr.x + 6, fr.y + 3, 40, 132, 6, '#fffdf2', 1.1);
      for (const y of [44, 80, 112]) ln(1, '#e3d3b8', fr.x + 8, fr.y + y, fr.x + 44, fr.y + y);
      rr(fr.x + 10, fr.y + 26, 7, 18, 2, '#ffffff', 1);
      rr(fr.x + 10.6, fr.y + 31, 5.8, 5, 0.8, '#bfe6ff', 0);
      ln(0.8, '#a9d4f5', fr.x + 11, fr.y + 27.4, fr.x + 16, fr.y + 27.4);
      rr(fr.x + 22, fr.y + 33, 16, 11, 3, '#f9c2d0', 1);
      el(fr.x + 18, fr.y + 74, 7, 5, '#a9d4f5', 1);
      el(fr.x + 34, fr.y + 75, 4, 4, BUTTER, 1);
      ln(0.6, '#ffffff', fr.x + 14.5, fr.y + 72.5, fr.x + 17, fr.y + 71.8);
      ln(0.6, '#e6a93a', fr.x + 32, fr.y + 75.5, fr.x + 36, fr.y + 74.6);
      rr(fr.x + 12, fr.y + 100, 24, 12, 3, WOOD, 1);
      ln(0.7, 'rgba(255,255,255,0.55)', fr.x + 15, fr.y + 102.5, fr.x + 33, fr.y + 102.5);
      ln(0.6, '#c98f55', fr.x + 24, fr.y + 106, fr.x + 24, fr.y + 111);
      el(fr.x + 25, fr.y + 8, 5, 1.4, '#fffbe0', 0.7);
      c.fillStyle = 'rgba(255,248,210,0.35)';
      c.fillRect(fr.x + 6, fr.y + 3, 40, 132);
      pth(fr.x + 49, fr.y, 'M0 0l14 8v124l-14 6z', '#bfe9db', 1.3);
      rr(fr.x + 54, fr.y + 54, 3, 26, 1.5, CREAM, 1);
    }
  } else if (name === 'bath') {
    const ph = (t % 1.8) / 1.8;
    const dy = ph < 0.55 ? 0 : (ph - 0.55) * 140;
    if (dy < 60) pth(34, F - 100 + dy, 'M0 0c-1.6 2.2-1.6 4 0 4s1.6-1.8 0-4z', '#8fd0f5', 0.7, 1 + Math.min(0.4, ph));
    for (let k = 0; k < 3; k++) {
      const bp = (t * 0.35 + k / 3) % 1;
      c.globalAlpha = 1 - bp;
      el(14 + k * 14 + Math.sin(bp * 7 + k) * 2, F - 48 - bp * 30, 2, 2, '#e9f6fd', 0.7);
    }
    c.globalAlpha = 1;
  } else if (name === 'bedroom') {
    stars(L, t);
    rr(126.5, F - 58 + (f.dark ? 6 : 0), 3, 5, 1.2, PINK, 0.8);
    lamp(F, f.dark);
  }
}

export function drawDark(ctx, L, H, t, curtainsClosed) {
  c = ctx;
  const F = L.F;
  c.fillStyle = 'rgba(30, 24, 66, 0.62)';
  c.fillRect(0, 0, W, H);
  const g = c.createRadialGradient(159, F - 60, 4, 159, F - 60, 70);
  g.addColorStop(0, 'rgba(255, 214, 140, 0.32)');
  g.addColorStop(1, 'rgba(255, 214, 140, 0)');
  c.fillStyle = g;
  c.fillRect(80, F - 140, 100, 160);
  if (!curtainsClosed) {
    c.save();
    c.translate(6, F + 10);
    c.transform(1, 0, 0.8, 1, 0, 0);
    c.fillStyle = 'rgba(190, 200, 255, 0.06)';
    for (const [x, y] of [[0, 0], [21, 0], [0, 22], [21, 22]]) c.fillRect(x, y, 19, 20);
    c.restore();
  }
  lamp(F, true);
  stars(L, t);
}

function drawGift(g, t, open) {
  const bob = open ? 0 : Math.max(0, Math.sin(t * 5)) * (Math.floor(t / 1.3) % 3 === 0 ? 2 : 0);
  const lift = open ? Math.min(18, open * 40) : 0;
  const x = g.x;
  const y = g.y - bob;
  rr(x + 1, y + 9, g.w - 2, g.h - 9, 2.5, MINT, 1.3);
  ln(3, '#ffffff', x + g.w / 2, y + 10, x + g.w / 2, y + g.h - 1);
  for (const [dx, dy] of [[5, 15], [21, 14], [6, 22], [22, 21]]) el(x + dx, y + dy, 1.1, 1.1, '#f6a5b6', 0);
  ln(1.2, 'rgba(255,255,255,0.7)', x + 3, y + 12, x + 3, y + g.h - 4);
  rr(x - 1, y + 4 - lift, g.w + 2, 7, 2.5, '#bdebdc', 1.3);
  ln(1, 'rgba(255,255,255,0.7)', x + 2, y + 6 - lift, x + 8, y + 6 - lift);
  ln(1.4, '#ffffff', x + g.w / 2, y + 4 - lift, x + g.w / 2 - 5, y + 9 - lift);
  ln(1.4, '#ffffff', x + g.w / 2, y + 4 - lift, x + g.w / 2 + 5, y + 9 - lift);
  pth(x + g.w / 2, y + 4 - lift, 'M0 0c-7-9-13-2 0 0zm0 0c7-9 13-2 0 0z', '#ffffff', 1.1);
  el(x + g.w / 2, y + 3.4 - lift, 1.7, 1.4, '#e3f4ee', 0.8);
}

export function drawScreen(ctx, L) {
  c = ctx;
  const F = L.F;
  const cols = ['#ffdcc4', '#f9cad5', '#cdeee2'];
  for (let i = 0; i < 3; i++) {
    const x = 126 + i * 18;
    rr(x, F - 74, 18, 90, [8, 8, 2, 2], cols[i], 1.3);
    heart(x + 9, F - 40, 1.2, '#ffffff', 0.8);
    rr(x + 3, F + 15, 3, 4, 1, WOOD, 0.8);
    rr(x + 12, F + 15, 3, 4, 1, WOOD, 0.8);
  }
}

export function drawShower(ctx, x, top, bottom, t) {
  c = ctx;
  ln(2.8, INK, x, top - 30, x, top);
  ln(1.4, '#cfdae3', x, top - 30, x, top);
  el(x, top + 2, 10, 4, '#d9e4ec', 1.2);
  for (let i = 0; i < 16; i++) {
    const y = top + 6 + ((t * 120 + i * 17) % (bottom - top));
    const dx = ((i * 7) % 18) - 9;
    ln(1, '#5aaee0', x + dx, y, x + dx * 1.1, y + 4);
  }
}

export function drawSponge(ctx, x, y) {
  c = ctx;
  rr(x - 8, y - 5, 16, 10, 3.5, BUTTER, 1.1);
  el(x - 3, y - 1, 1, 1, '#e0a526', 0);
  el(x + 3, y + 2, 1.2, 1.2, '#e0a526', 0);
  el(x + 4, y - 2, 0.8, 0.8, '#e0a526', 0);
}

export function drawBedFront(ctx, L) {
  c = ctx;
  bedFront(bedGeo(L.bedroom.bed));
}

export function drawFoam(ctx, x, y, s) {
  c = ctx;
  el(x, y, s, s, '#ffffff', 0.7);
  el(x - s * 0.3, y - s * 0.3, s * 0.3, s * 0.3, '#e9f6fd', 0);
}

export function drawBowl(ctx, x, y, img, hot) {
  c = ctx;
  c.save();
  c.translate(x, y);
  c.scale(1.4, 1.4);
  if (hot) {
    c.globalAlpha = 0.45;
    el(0, -6, 24, 14, BUTTER, 0);
    c.globalAlpha = 1;
  }
  el(0, 1, 16, 3, 'rgba(75,46,30,0.15)', 0);
  rr(-7, 0, 14, 2.4, 1, '#f19bb2', 1);
  if (img && img.complete) c.drawImage(img, -10, -26, 20, 20);
  pth(-15, -11, 'M0 0h30c0 8-6 12-15 12S0 8 0 0z', PINK, 1.1);
  el(0, -11, 15, 3.2, '#f9c2d0', 1);
  el(0, -1.6, 2.9, 2.3, '#ffffff', 0);
  for (const [dx, dy] of [[-3.9, -4.6], [-1.4, -6.2], [1.4, -6.2], [3.9, -4.6]]) el(dx, dy, 1.15, 1.4, '#ffffff', 0);
  ln(0.9, 'rgba(255,255,255,0.7)', -11, -8, -9, -4);
  el(0, -11, 12.4, 2.1, null, 0);
  line(0.5, 'rgba(75,46,30,0.3)');
  heart(10.5, -3.6, 0.4, '#ffffff');
  c.restore();
}

const TF_BODY = 'M0 0h78v14c0 14-10 22-22 22H22C10 36 0 28 0 14z';

function tfWall(F) {
  pth(-4, F - 34, TF_BODY, '#ffffff', 1.3);
  c.save();
  c.translate(-4, F - 34);
  c.clip(new Path2D(TF_BODY));
  c.fillStyle = '#cfeafb';
  c.fillRect(0, 15, 78, 3.4);
  c.fillStyle = 'rgba(143,200,230,0.22)';
  c.fillRect(0, 27, 78, 10);
  c.restore();
  for (let x = 6; x < 70; x += 9) heart(x - 1, F - 17.2 + (x % 2), 0.38, '#f6a5b6');
  btStroke(-4, F - 34, 'M6 22c-.4 4 1.6 8 5 10', '#ffffff', 1.3);
  btStroke(-4, F - 34, 'M70 20c.4 3-1 6-3 8', '#ffffff', 1);
  rr(-6, F - 40, 82, 8, 4, '#f7fbff', 1.3);
  ln(1, '#ffffff', 0, F - 38.6, 68, F - 38.6);
  ln(0.6, '#bcdcf0', 3, F - 33.8, 68, F - 33.8);
  el(64, F - 25, 2.6, 2.6, '#e6f5fd', 0.9);
  el(64, F - 25, 0.9, 0.9, '#8fcfba', 0);
}

function tfFoam(F) {
  const foam = [[5, F - 40, 7, 5, 0.3], [16, F - 42, 8.5, 6.5, 1], [29, F - 40, 7.5, 5.5, 2], [40, F - 43, 7, 6.5, 0.6], [51, F - 40, 8, 5.5, 1.7], [62, F - 42, 7.5, 6, 2.4], [71, F - 39, 6, 4.5, 0.9], [23, F - 46, 5, 3.6, 1.2], [46, F - 47, 4.6, 3.4, 0.2]];
  for (const [x, y, rx, ry, k] of foam) blob(x, y, rx, ry, k, '#ffffff', 2.4);
  for (const [x, y, rx, ry, k] of foam) blob(x, y, rx, ry, k, '#ffffff', 0);
  for (const [x, y, rx, ry] of foam) {
    c.beginPath();
    c.arc(x, y, Math.min(rx, ry) * 0.62, 0.1, 1.2);
    line(0.7, '#bcdcf0');
  }
  for (const [x, y, s] of [[9, F - 47.5, 2.2], [33, F - 49, 1.6], [57, F - 48, 2], [67, F - 45, 1.4]]) {
    el(x, y, s, s, '#e9f6fd', 0.7);
    ln(0.6, '#ffffff', x - s * 0.5, y - s * 0.4, x - s * 0.1, y - s * 0.8);
  }
}

export function drawTubFront(ctx, L) {
  c = ctx;
  tfWall(L.F);
  tfFoam(L.F);
}

function sfLip(F) {
  rr(40, F - 17, 100, 13, [4, 4, 8, 8], '#f9b8c9', 1.3);
  ln(1.1, INK, 90, F - 17, 90, F - 5);
  ln(1.3, 'rgba(255,255,255,0.4)', 48, F - 13.4, 84, F - 13.4);
  ln(1.3, 'rgba(255,255,255,0.4)', 96, F - 13.4, 132, F - 13.4);
  pth(54, F - 10, 'M0 0q8 3 16 0M46 1q8 2 14 0M70 0q8 3 16 0', null, 0.8);
}

function sfArms(F) {
  for (const x of [29, 132]) {
    rr(x, F - 42, 19, 44, 9, '#f7a9bd', 1.3);
    lvStitch(x + 2.5, F - 39.5, 14, 38, 6.5, 'rgba(255,255,255,0.5)');
    ln(1.3, 'rgba(255,255,255,0.4)', x + 5, F - 33, x + 5, F - 22);
    ln(0.6, '#e58aa3', x + 3, F - 6, x + 16, F - 5);
  }
}

export function drawSofaFront(ctx, L) {
  c = ctx;
  sfLip(L.F);
  sfArms(L.F);
}
