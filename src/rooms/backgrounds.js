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
    bedroom: { win: r(8, F - 150, 54, 62), sw: r(118, F - 76, 22, 28), lamp: r(140, F - 82, 40, 50) },
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
}

function pot(x, y, potFill) {
  pth(x, y, 'M0-2c-3-9-9-11-12-13 5 0 10 4 12 13zM0-2c1-10 5-14 9-16-1 6-5 11-9 16zM0-2c0-9 0-13 1-17 2 6 1 12-1 17z', MINT, 1.1);
  pth(x - 7, y - 2, 'M0 0h14l-2 11H2z', potFill, 1.2);
}

function frame(x, y, w, h, inner) {
  rr(x, y, w, h, 3, '#ffe2a6', 1.2);
  rr(x + 3, y + 3, w - 6, h - 6, 2, inner, 1);
}

function drawLiving(H, L) {
  const F = L.F;
  c.fillStyle = '#f9d4dc';
  c.fillRect(0, 0, W, F);
  for (let y = 6, j = 0; y < F; y += 11, j++) {
    for (let x = (j % 2) * 7 + 3; x < W; x += 14) el(x, y, 1.4, 1.4, '#fdedf1', 0);
  }
  planks(H, F, '#f6d2a4', 'rgba(75,46,30,0.22)');
  baseboard(F);
  el(90, F + 48, 86, 17, '#fff3e6', 1.3);
  c.setLineDash([2.5, 3]);
  el(90, F + 48, 76, 12, null, 0);
  line(0.8, '#f2bfcb');
  c.setLineDash([]);
  frame(6, F - 178, 32, 26, '#d9f0fc');
  pth(22, F - 164, 'M-6 4a6 6 0 0 1 12 0z', MINT, 1);
  el(90, F - 176, 9, 9, PINK, 1.3);
  el(90, F - 176, 6.5, 6.5, CREAM, 0.9);
  ln(1, INK, 90, F - 176, 90, F - 180.5);
  ln(1, INK, 90, F - 176, 93, F - 176);
  const w = L.living.win;
  windowFrame(w, false);
  curtains(w, '#bfe9db');
  frame(148, F - 140, 28, 26, '#bfe6ff');
  el(162, F - 127, 7, 6.5, '#e9b47a', 1);
  el(162, F - 128, 6, 5, PINK, 0.9);
  el(162, F - 128, 2, 1.6, '#fff7ec', 0.8);
  frame(150, F - 170, 22, 20, '#fff3e6');
  heart(161, F - 161, 1.3, PINK, 0.9);
  const wd = L.living.wardrobe;
  rr(wd.x + 3, wd.y + 6, 42, 120, 4, CREAM, 1.3);
  rr(wd.x, wd.y, 48, 9, 3, WOOD, 1.3);
  rr(wd.x + 7, wd.y + 16, 15, 98, 3, '#f9cad5', 1.1);
  rr(wd.x + 26, wd.y + 16, 15, 98, 3, '#f9cad5', 1.1);
  el(wd.x + 20, wd.y + 66, 1.7, 1.7, WOOD, 1);
  el(wd.x + 28, wd.y + 66, 1.7, 1.7, WOOD, 1);
  heart(wd.x + 33.5, wd.y + 36, 1.1, '#fff3f6', 0.8);
  rr(wd.x + 6, wd.y + 124, 6, 6, 2, WOOD, 1);
  rr(wd.x + 36, wd.y + 124, 6, 6, 2, WOOD, 1);
  pot(wd.x + 24, wd.y - 9, PINK);
  rr(142, F - 44, 44, 50, 3, CREAM, 1.3);
  rr(139, F - 50, 48, 8, 3, WOOD, 1.3);
  rr(146, F - 37, 38, 18, 3, '#fff1dd', 1.1);
  rr(146, F - 16, 38, 18, 3, '#fff1dd', 1.1);
  el(165, F - 28, 1.8, 1.8, WOOD, 1);
  el(165, F - 7, 1.8, 1.8, WOOD, 1);
  ln(1.1, INK, 157, F - 84, 150, F - 96);
  ln(1.1, INK, 165, F - 84, 172, F - 96);
  el(150, F - 96, 1.6, 1.6, PINK, 1);
  el(172, F - 96, 1.6, 1.6, PINK, 1);
  rr(143, F - 86, 36, 34, 7, MINT, 1.3);
  rr(147, F - 82, 24, 26, 5, '#61707f', 1.1);
  ln(1.2, '#8c9cad', 150, F - 78, 154, F - 78);
  el(175, F - 75, 1.5, 1.5, '#fff', 0.9);
  el(175, F - 68, 1.5, 1.5, '#fff', 0.9);
  rr(156, F + 6, 22, 9, 3, '#f3eef8', 1.1);
  el(173, F + 10.5, 1.2, 1.2, PINK, 0);
  rr(40, F - 60, 100, 48, 15, '#f7a9bd', 1.3);
  ln(1.1, INK, 90, F - 56, 90, F - 28);
  rr(40, F - 28, 100, 24, 8, '#f9b8c9', 1.3);
  ln(1.1, INK, 90, F - 26, 90, F - 6);
  rr(29, F - 42, 19, 44, 9, '#f7a9bd', 1.3);
  rr(132, F - 42, 19, 44, 9, '#f7a9bd', 1.3);
  pth(36, F + 2, 'M0 0h7l-1.5 6h-4z', WOOD, 1);
  pth(137, F + 2, 'M0 0h7l-1.5 6h-4z', WOOD, 1);
  c.save();
  c.translate(118, F - 36);
  c.rotate(0.22);
  rr(-12, -12, 24, 24, 5, CREAM, 1.2);
  for (const [dx, dy] of [[-6, -6], [2, -7], [7, 0], [-2, 0], [-7, 6], [3, 6]]) el(dx, dy, 1.6, 1.6, MINT, 0);
  c.restore();
}

function drawKitchen(H, L) {
  const F = L.F;
  c.fillStyle = '#dcf1e7';
  c.fillRect(0, 0, W, F);
  for (let x = 4; x < W; x += 12) {
    c.fillStyle = '#e9f8f1';
    c.fillRect(x, 0, 6, F);
  }
  for (let y = F - 48, j = 0; y < F - 4; y += 9, j++) {
    for (let x = (j % 2) * -5; x < W; x += 10) {
      c.beginPath();
      c.roundRect(x, y, 10, 9, 1.5);
      c.fillStyle = '#fbfffd';
      c.fill();
      line(0.5, '#b8decf');
    }
  }
  checker(H, F, '#fff2e1', '#fbdcc2');
  baseboard(F);
  el(90, F + 48, 62, 12, '#ffe0cc', 1.2);
  el(90, F - 172, 9.5, 9.5, '#f9cad5', 1.3);
  el(90, F - 172, 7, 7, CREAM, 0.9);
  ln(1, INK, 90, F - 172, 90, F - 177);
  ln(1, INK, 90, F - 172, 86, F - 170);
  const w = L.kitchen.win;
  windowFrame(w, false);
  ln(1.2, INK, w.x - 2, w.y + 26, w.x + w.w + 2, w.y + 26);
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
  pth(w.x + 3, w.y + 49, `M0 0${'q2.5 3 5 0'.repeat(10)}`, null, 1.1);
  const f = L.kitchen.fridge;
  rr(f.x + 3, f.y, 46, 138, 8, '#bfe9db', 1.3);
  ln(1.2, INK, f.x + 3, f.y + 44, f.x + 49, f.y + 44);
  rr(f.x + 41, f.y + 12, 4, 20, 2, CREAM, 1.1);
  rr(f.x + 41, f.y + 54, 4, 30, 2, CREAM, 1.1);
  heart(f.x + 16, f.y + 62, 1.4, PINK, 0.9);
  star(f.x + 28, f.y + 78, 1.2, BUTTER, 0.9);
  rr(f.x + 10, f.y + 90, 16, 18, 2, CREAM, 1);
  ln(0.8, '#c8a98a', f.x + 13, f.y + 96, f.x + 23, f.y + 96);
  ln(0.8, '#c8a98a', f.x + 13, f.y + 101, f.x + 20, f.y + 101);
  rr(f.x + 8, f.y + 136, 7, 6, 2, '#8fcfba', 1);
  rr(f.x + 37, f.y + 136, 7, 6, 2, '#8fcfba', 1);
  rr(124, F - 158, 58, 44, 5, '#f9cad5', 1.3);
  ln(1.1, INK, 153, F - 154, 153, F - 118);
  el(148, F - 134, 1.6, 1.6, CREAM, 1);
  el(158, F - 134, 1.6, 1.6, CREAM, 1);
  rr(122, F - 98, 60, 4, 2, WOOD, 1.1);
  for (const [x, h, lid] of [[128, 14, PINK], [142, 11, MINT], [156, 16, BUTTER], [170, 12, LILAC]]) {
    rr(x, F - 98 - h, 10, h, 3, CREAM, 1);
    rr(x - 1, F - 100 - h, 12, 4, 2, lid, 1);
  }
  rr(124, F - 40, 60, 46, 3, CREAM, 1.3);
  rr(128, F - 33, 23, 36, 3, '#fff1dd', 1);
  rr(155, F - 33, 23, 36, 3, '#fff1dd', 1);
  el(146, F - 16, 1.6, 1.6, WOOD, 1);
  el(160, F - 16, 1.6, 1.6, WOOD, 1);
  rr(120, F - 48, 64, 9, 3, WOOD, 1.3);
  pth(132, F - 48, 'M3 0c-2-10 2-17 11-17s13 7 11 17z', PINK, 1.2);
  pth(156, F - 58, 'M0 0c4 0 6-3 8-6', null, 1.3);
  el(146, F - 66, 6, 2.2, '#f9c2d0', 1.1);
  el(146, F - 69, 2, 2, BUTTER, 1);
  pth(134, F - 60, 'M0 0c-5 1-6 8-1 10', null, 1.2);
}

function drawBath(H, L) {
  const F = L.F;
  c.fillStyle = '#d8edf9';
  c.fillRect(0, 0, W, F);
  for (let i = 0; i < 60; i++) {
    const x = (i * 53) % W;
    const y = (i * 37) % Math.max(1, F - 80);
    el(x, y, 1.5 + (i % 3), 1.5 + (i % 3), null, 0);
    line(0.6, '#bcdcf0');
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
  rr(-3, F - 77, W + 6, 4, 0, '#a9d4f5', 1);
  checker(H, F, '#eef8ff', '#d5eaf8');
  baseboard(F);
  el(90, F + 48, 58, 11, '#cdeee2', 1.2);
  for (let x = 38; x <= 142; x += 6) ln(0.8, '#8fcfba', x, F + 59, x, F + 62);
  el(150, F - 160, 16, 16, CREAM, 1.3);
  const sky = c.createLinearGradient(0, F - 172, 0, F - 148);
  sky.addColorStop(0, '#a9dcf7');
  sky.addColorStop(1, '#e3f5ff');
  el(150, F - 160, 11.5, 11.5, sky, 1);
  pth(144, F - 160, 'M0 4a3 3 0 0 1 2-5 4.5 4.5 0 0 1 8 0 3 3 0 0 1 1.5 5z', '#ffffff', 0.8);
  frame(24, F - 178, 32, 26, '#fff3e6');
  el(40, F - 163, 6, 4, BUTTER, 1);
  el(43, F - 168, 3.2, 3.2, BUTTER, 1);
  pth(46, F - 169, 'M0 0l3 1-3 1.6z', '#ffa76b', 0.7);
  ln(1, INK, 90, 0, 90, F - 150);
  pth(90, F - 150, 'M-8 8a8 8 0 0 1 16 0z', '#cfeafb', 1.2);
  el(90, F - 141, 2.2, 1.6, BUTTER, 0.8);
  el(90, F - 108, 17, 21, '#ffe2a6', 1.3);
  el(90, F - 108, 13, 17, '#e6f5fd', 1);
  ln(1.4, '#ffffff', 83, F - 114, 89, F - 120);
  ln(1.4, '#ffffff', 84, F - 107, 93, F - 116);
  rr(132, F - 110, 48, 4, 2, CREAM, 1.1);
  for (const [x, w, h, fill] of [[136, 8, 16, PINK], [148, 9, 12, MINT], [162, 7, 18, BUTTER]]) {
    rr(x, F - 110 - h, w, h, 3, fill, 1);
    rr(x + w / 2 - 1.5, F - 113 - h, 3, 3, 1, CREAM, 0.8);
  }
  el(118, F - 72, 4, 4, null, 1.1);
  rr(112, F - 68, 12, 24, 3, '#bfe9db', 1.1);
  ln(1, '#ffffff', 112, F - 50, 124, F - 50);
  ln(1.1, INK, 0, F - 132, 74, F - 132);
  pth(0, F - 131, 'M0 0h20c-4 30 3 58-3 92H0z', '#f9cad5', 1.3);
  for (const [x, y] of [[5, 12], [12, 26], [6, 42], [13, 58], [6, 74]]) el(x, F - 131 + y, 1.6, 1.6, CREAM, 0);
  ln(2.8, INK, 34, F - 108, 34, F - 126, 44, F - 126);
  ln(1.4, '#cfdae3', 34, F - 108, 34, F - 126, 44, F - 126);
  el(34, F - 104, 7, 3.2, '#d9e4ec', 1.2);
  pth(-4, F - 34, 'M0 0h78v14c0 14-10 22-22 22H22C10 36 0 28 0 14z', '#ffffff', 1.3);
  rr(-6, F - 40, 82, 8, 4, '#f7fbff', 1.3);
  rr(6, F + 6, 8, 7, 3, BUTTER, 1);
  rr(54, F + 6, 8, 7, 3, BUTTER, 1);
  for (const [x, y, rx] of [[8, F - 43, 7], [20, F - 46, 8], [33, F - 43, 6], [44, F - 44, 5]]) el(x, y, rx, rx * 0.65, '#ffffff', 1);
  el(58, F - 45, 6.5, 4.5, BUTTER, 1.1);
  el(62, F - 51, 4, 4, BUTTER, 1.1);
  pth(65, F - 52, 'M0 0l4 1-4 2z', '#ffa76b', 0.9);
  el(63, F - 52, 0.8, 0.8, INK, 0);
  rr(127, F - 42, 9, 11, 2, CREAM, 1);
  ln(1.1, INK, 125, F - 42, 138, F - 42);
  const t = L.bath.toilet;
  rr(t.x + 16, t.y + 2, 28, 24, 6, '#ffffff', 1.3);
  el(t.x + 30, t.y + 14, 2.2, 2.2, PINK, 0);
  for (const [dx, dy] of [[-3, -3], [0, -4.2], [3, -3]]) el(t.x + 30 + dx, t.y + 14 + dy, 0.9, 0.9, PINK, 0);
  rr(t.x + 26, t.y - 1, 8, 3, 1.5, '#d9e4ec', 1);
  pth(t.x + 4, t.y + 30, 'M0 0h34c0 12-7 18-13 18v8h-8v-8C7 18 0 12 0 0z', '#ffffff', 1.3);
  el(t.x + 21, t.y + 30, 19, 5, '#ffffff', 1.3);
  el(t.x + 21, t.y + 30, 13, 2.6, '#e6f5fd', 1);
}

function drawBedroom(H, L) {
  const F = L.F;
  c.fillStyle = '#e8def6';
  c.fillRect(0, 0, W, F);
  for (let y = 8, j = 0; y < F - 8; y += 14, j++) {
    for (let x = (j % 2) * 9 + 5; x < W; x += 18) {
      if ((x + j) % 3) heart(x, y, 0.55, '#f5c6d6');
      else star(x, y, 0.5, '#fbeec2');
    }
  }
  planks(H, F, '#e3d3ef', 'rgba(75,46,30,0.16)');
  baseboard(F);
  ln(1, INK, 66, F - 176, 122, F - 162, 178, F - 172);
  for (let i = 0; i < 6; i++) {
    const x = 74 + i * 18;
    const y = i < 3 ? F - 174 + i * 4.5 : F - 162 - (i - 3) * 3.5;
    star(x, y + 4, 0.9, BUTTER, 0.8);
  }
  const w = L.bedroom.win;
  windowFrame(w, true);
  pth(w.x + 36, w.y + 15, 'M0-6a6 6 0 1 0 5 9 5 5 0 0 1-5-9z', '#fff3c4', 0.9);
  curtains(w, '#cdb9f2');
  frame(78, F - 116, 26, 22, '#fff3e6');
  pth(91, F - 105, 'M0-5a5 5 0 1 0 4 8 4 4 0 0 1-4-8z', BUTTER, 0.9);
  rr(116, F - 124, 64, 4, 2, WOOD, 1.1);
  for (const [x, h, fill] of [[120, 16, PINK], [126, 14, MINT], [132, 17, LILAC], [138, 13, BUTTER]]) rr(x, F - 124 - h, 6, h, 1.5, fill, 1);
  el(158, F - 131, 7, 6, '#b3a89e', 1.1);
  pth(153, F - 136, 'M0 0l1-4 3 2M10 0l-1-4-3 2', '#b3a89e', 1);
  el(156, F - 131, 0.8, 0.8, INK, 0);
  el(160, F - 131, 0.8, 0.8, INK, 0);
  pot(172, F - 126, '#f9cad5');
  rr(2, F - 50, 36, 56, 3, '#f6e3c8', 1.3);
  ln(1.1, INK, 2, F - 24, 38, F - 24);
  for (const [x, h, fill] of [[6, 20, PINK], [12, 18, '#a9d4f5'], [18, 21, MINT], [24, 17, BUTTER]]) rr(x, F - 25 - h, 6, h, 1.5, fill, 1);
  el(30, F - 6, 5, 5, LILAC, 1.1);
  rr(140, F - 36, 38, 42, 3, '#f6e3c8', 1.3);
  rr(144, F - 28, 30, 14, 3, '#fbeedd', 1);
  el(159, F - 21, 1.6, 1.6, WOOD, 1);
  rr(156, F - 46, 6, 10, 2, LILAC, 1.1);
  rr(122, F - 72, 12, 17, 2.5, CREAM, 1.1);
  el(90, F + 44, 62, 16, LILAC, 1.3);
  el(90, F + 41, 50, 11, '#f5eeff', 1.1);
  el(30, F + 40, 6, 6, '#f9b4c6', 1.1);
  pth(25, F + 38, 'M0 0q5 3 10-1M1 4q4 2 9-1', null, 0.9);
  pth(36, F + 44, 'M0 0q6 4 10 0', null, 0.9);
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
  pth(147, F - 80, 'M4 0h16l4 20H0z', lit ? '#fff0b8' : '#f9cad5', 1.2);
}

export function drawLife(ctx, name, L, t, f) {
  c = ctx;
  const F = L.F;
  if (name === 'living') {
    clouds(L.living.win, t);
    ln(1, INK, 2, F - 152, 50, F - 138, 90, F - 146, 130, F - 138, 178, F - 152);
    const pts = [[8, -149], [20, -145], [32, -141], [44, -139], [62, -141], [76, -144], [90, -145], [104, -144], [118, -141], [136, -139], [148, -141], [160, -145], [172, -149]];
    pts.forEach(([x, dy], i) => {
      const lit = f.still || (Math.floor(t * 2) + i) % 3 !== 0;
      el(x, F + dy + 3, 2.4, 2.8, lit ? BULBS[i % 5] : '#ece2e6', 0.9);
      if (lit && !f.still) {
        c.globalAlpha = 0.25;
        el(x, F + dy + 3, 4.5, 5, BULBS[i % 5], 0);
        c.globalAlpha = 1;
      }
    });
    if (f.tvOn) {
      rr(147, F - 82, 24, 26, 5, '#2f2b52', 1.1);
      for (let i = 0; i < 5; i++) el(150 + ((i * 7 + t * 18) % 18), F - 78 + ((i * 5) % 16), 1.6, 1.6, BULBS[i], 0);
      el(159 + Math.sin(t * 6) * 5, F - 63, 2.4, 2.4, '#fff', 0.8);
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
      rr(fr.x + 22, fr.y + 33, 16, 11, 3, '#f9c2d0', 1);
      el(fr.x + 18, fr.y + 74, 7, 5, '#a9d4f5', 1);
      el(fr.x + 34, fr.y + 75, 4, 4, BUTTER, 1);
      rr(fr.x + 12, fr.y + 100, 24, 12, 3, WOOD, 1);
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
    rr(126.5, F - 68 + (f.dark ? 6 : 0), 3, 5, 1.2, PINK, 0.8);
    lamp(F, f.dark);
  }
}

export function drawDark(ctx, L, H, t) {
  c = ctx;
  const F = L.F;
  c.fillStyle = 'rgba(30, 24, 66, 0.62)';
  c.fillRect(0, 0, W, H);
  const g = c.createRadialGradient(159, F - 60, 4, 159, F - 60, 70);
  g.addColorStop(0, 'rgba(255, 214, 140, 0.32)');
  g.addColorStop(1, 'rgba(255, 214, 140, 0)');
  c.fillStyle = g;
  c.fillRect(80, F - 140, 100, 160);
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
  rr(x - 1, y + 4 - lift, g.w + 2, 7, 2.5, '#bdebdc', 1.3);
  pth(x + g.w / 2, y + 4 - lift, 'M0 0c-7-9-13-2 0 0zm0 0c7-9 13-2 0 0z', '#ffffff', 1.1);
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
  if (img && img.complete) c.drawImage(img, -10, -26, 20, 20);
  pth(-15, -11, 'M0 0h30c0 8-6 12-15 12S0 8 0 0z', PINK, 1.1);
  el(0, -11, 15, 3.2, '#f9c2d0', 1);
  el(0, -4, 2.2, 2.2, '#ffffff', 0);
  for (const [dx, dy] of [[-2.5, -2.6], [0, -3.6], [2.5, -2.6]]) el(dx, -4 + dy, 0.9, 0.9, '#ffffff', 0);
  c.restore();
}
