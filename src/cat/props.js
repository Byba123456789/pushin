import { glasses, bowtie, partyHat } from './outfits.js';

const LINE = '#4b2e1e';
let K = 1;

function ink(ctx, fill, lw = 1.3) {
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.strokeStyle = LINE;
  ctx.lineWidth = lw / K;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

export function foodIcon(ctx, id, x, y, s = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  switch (id) {
    case 'cookie':
      circle(ctx, 0, 0, 4.6);
      ink(ctx, '#e3b27a', 1.1);
      ctx.fillStyle = '#7a4a2a';
      for (const [a, b] of [[-1.8, -1.4], [1.6, -0.6], [-0.4, 1.8], [2, 2]]) {
        circle(ctx, a, b, 0.75);
        ctx.fill();
      }
      break;
    case 'milk':
      rr(ctx, -3.6, -4.4, 7.2, 9, 1.2);
      ink(ctx, '#fffaf2', 1.1);
      ctx.beginPath();
      ctx.moveTo(-3.6, -1.6);
      ctx.lineTo(3.6, -1.6);
      ctx.moveTo(-3.6, 1.4);
      ctx.lineTo(3.6, 1.4);
      ctx.strokeStyle = '#a6cdf2';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      break;
    case 'fish':
      ctx.beginPath();
      ctx.ellipse(-0.8, 0, 4.4, 2.8, 0, 0, Math.PI * 2);
      ctx.moveTo(3, 0);
      ctx.lineTo(6, -2.8);
      ctx.lineTo(6, 2.8);
      ctx.closePath();
      ink(ctx, '#ffad7a', 1.1);
      ctx.fillStyle = LINE;
      circle(ctx, -3, -0.6, 0.7);
      ctx.fill();
      break;
    case 'donut':
      circle(ctx, 0, 0, 4.8);
      ink(ctx, '#e8b07a', 1.1);
      circle(ctx, 0, -0.4, 3.8);
      ctx.fillStyle = '#f6a5b6';
      ctx.fill();
      circle(ctx, 0, 0, 1.5);
      ink(ctx, '#fdf3ea', 1);
      ctx.strokeStyle = '#fffaf2';
      ctx.lineWidth = 0.8;
      for (const [a, b] of [[-2.6, -1.4], [2.2, -2], [1.6, 2], [-2, 1.8]]) {
        ctx.beginPath();
        ctx.moveTo(a, b);
        ctx.lineTo(a + 0.8, b + 0.5);
        ctx.stroke();
      }
      break;
    case 'sushi':
      rr(ctx, -4.6, -2.4, 9.2, 5.4, 2.2);
      ink(ctx, '#fffaf2', 1.1);
      rr(ctx, -4.8, -4.4, 9.6, 3.2, 1.6);
      ink(ctx, '#ff9f80', 1.1);
      ctx.fillStyle = LINE;
      ctx.fillRect(-1, -4.2, 2, 7.2);
      break;
    case 'ramen':
      ctx.beginPath();
      ctx.moveTo(-5.4, -1);
      ctx.lineTo(5.4, -1);
      ctx.quadraticCurveTo(5, 5, 0, 5);
      ctx.quadraticCurveTo(-5, 5, -5.4, -1);
      ink(ctx, '#f6a5b6', 1.1);
      ctx.strokeStyle = '#ffd86b';
      ctx.lineWidth = 1.1;
      for (const dx of [-2.6, 0, 2.4]) {
        ctx.beginPath();
        ctx.moveTo(dx, -1.4);
        ctx.quadraticCurveTo(dx + 1, -3.4, dx, -5);
        ctx.stroke();
      }
      circle(ctx, 2.6, -1.6, 1.6);
      ink(ctx, '#fffaf2', 0.8);
      break;
    case 'pizza':
      ctx.beginPath();
      ctx.moveTo(-4.6, -3.6);
      ctx.lineTo(4.6, -3.6);
      ctx.lineTo(0, 4.6);
      ctx.closePath();
      ink(ctx, '#ffd86b', 1.1);
      rr(ctx, -5, -5.2, 10, 2.2, 1.1);
      ink(ctx, '#e3a25e', 1.1);
      ctx.fillStyle = '#e8566e';
      circle(ctx, -1.4, -1.6, 0.9);
      ctx.fill();
      circle(ctx, 1.2, 0.6, 0.9);
      ctx.fill();
      break;
    case 'cake':
      ctx.beginPath();
      ctx.moveTo(-4.6, 4);
      ctx.lineTo(-4.6, -1);
      ctx.lineTo(4.6, -3.6);
      ctx.lineTo(4.6, 4);
      ctx.closePath();
      ink(ctx, '#fff4e3', 1.1);
      ctx.beginPath();
      ctx.moveTo(-4.6, -1);
      ctx.lineTo(4.6, -3.6);
      ctx.lineTo(4.6, -1.4);
      ctx.lineTo(-4.6, 1.2);
      ctx.closePath();
      ink(ctx, '#f6a5b6', 1.1);
      circle(ctx, 1.6, -4.4, 1.3);
      ink(ctx, '#e8566e', 0.9);
      break;
    default:
      circle(ctx, 0, 0, 3);
      ink(ctx, '#e3b27a', 1);
  }
  ctx.restore();
}

export function bowl(ctx, x, y, food, left, k = 1) {
  K = k;
  ctx.beginPath();
  ctx.moveTo(x - 9, y - 6.5);
  ctx.lineTo(x + 9, y - 6.5);
  ctx.lineTo(x + 7, y);
  ctx.lineTo(x - 7, y);
  ctx.closePath();
  ink(ctx, '#f6a5b6', 1.3);
  ctx.beginPath();
  ctx.ellipse(x, y - 6.5, 9, 2.1, 0, 0, Math.PI * 2);
  ink(ctx, '#e47e9c', 1.3);
  if (food && left > 0) {
    const n = Math.min(3, left);
    const spots = [[0, -8.6], [-4, -7.8], [4, -7.8]];
    for (let i = n - 1; i >= 0; i--) foodIcon(ctx, food, x + spots[i][0], y + spots[i][1], 0.62);
  }
  K = 1;
}

function piano(ctx, g) {
  const x = g.face.x - 8;
  const y = g.bot;
  ctx.fillStyle = '#2f2622';
  ctx.strokeStyle = LINE;
  rr(ctx, x - 16, y - 18, 40, 7, 1.5);
  ink(ctx, '#2f2622');
  rr(ctx, x - 16, y - 12.5, 40, 4.6, 0.8);
  ink(ctx, '#fffaf2', 1.1);
  ctx.fillStyle = '#2f2622';
  for (let k = 0; k < 9; k++) ctx.fillRect(x - 13 + k * 4.2, y - 12.5, 1.6, 2.6);
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = '#2f2622';
  for (const dx of [-13, 21]) {
    ctx.beginPath();
    ctx.moveTo(x + dx, y - 8);
    ctx.lineTo(x + dx, y);
    ctx.stroke();
  }
}

function box(ctx, g) {
  const L = g.cx - 33;
  const R = g.cx + 33;
  const top = g.bot - 25;
  ctx.beginPath();
  ctx.moveTo(L, top);
  ctx.lineTo(L - 9, top - 7);
  ctx.lineTo(L + 9, top - 7);
  ctx.lineTo(L + 14, top);
  ctx.closePath();
  ink(ctx, '#f3d6a6');
  ctx.beginPath();
  ctx.moveTo(R, top);
  ctx.lineTo(R + 9, top - 7);
  ctx.lineTo(R - 9, top - 7);
  ctx.lineTo(R - 14, top);
  ctx.closePath();
  ink(ctx, '#f3d6a6');
  rr(ctx, L, top, R - L, g.bot - top + 1, 1.2);
  ink(ctx, '#e8c48f');
}

function cake(ctx, g, pv) {
  const x = g.R + 4;
  const y = g.bot;
  ctx.beginPath();
  ctx.ellipse(x, y - 1, 15, 2.6, 0, 0, Math.PI * 2);
  ink(ctx, '#ece4f2');
  rr(ctx, x - 12, y - 17, 24, 15, 3);
  ink(ctx, '#fff4e3');
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 13);
  for (let k = 0; k <= 6; k++) ctx.quadraticCurveTo(x - 12 + k * 4 - 2, y - 10, x - 12 + k * 4, y - 13);
  ctx.lineTo(x + 12, y - 15);
  ctx.quadraticCurveTo(x + 12, y - 17, x + 9, y - 17);
  ctx.lineTo(x - 9, y - 17);
  ctx.quadraticCurveTo(x - 12, y - 17, x - 12, y - 15);
  ctx.closePath();
  ink(ctx, '#f6a5b6');
  ctx.fillStyle = '#f08aa3';
  for (let k = 0; k < 5; k++) {
    circle(ctx, x - 8 + k * 4, y - 6, 0.9);
    ctx.fill();
  }
  rr(ctx, x - 1.2, y - 24, 2.4, 7, 0.8);
  ink(ctx, '#a6cdf2', 1);
  ctx.beginPath();
  const f = pv % 2 ? 0.5 : -0.5;
  ctx.moveTo(x + f, y - 30);
  ctx.quadraticCurveTo(x + 2.4, y - 26.5, x, y - 25);
  ctx.quadraticCurveTo(x - 2.4, y - 26.5, x + f, y - 30);
  ink(ctx, '#ffd86b', 1);
}

function book(ctx, g, pv) {
  const x = g.face.x + 4;
  const y = g.bot;
  ctx.save();
  ctx.translate(x, y);
  rr(ctx, -12, -24, 24, 23, 1.5);
  ink(ctx, '#c99a6b');
  ctx.beginPath();
  ctx.moveTo(0, -24);
  ctx.lineTo(0, -1);
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  if (pv % 2) {
    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.quadraticCurveTo(5, -30, 9, -26);
    ctx.lineTo(9, -3);
    ctx.quadraticCurveTo(5, -6, 0, -1);
    ctx.closePath();
    ink(ctx, '#fffaf2', 1.1);
  }
  ctx.restore();
}

function laptop(ctx, g) {
  const x = g.face.x + 6;
  const y = g.bot;
  ctx.beginPath();
  ctx.moveTo(x - 6, y - 1);
  ctx.lineTo(x - 13, y - 26);
  ctx.lineTo(x + 15, y - 26);
  ctx.lineTo(x + 18, y - 1);
  ctx.closePath();
  ink(ctx, '#c9b3f0');
  ctx.beginPath();
  ctx.moveTo(x - 9, y - 4);
  ctx.lineTo(x - 13.5, y - 22.5);
  ctx.lineTo(x + 12.5, y - 22.5);
  ctx.lineTo(x + 15, y - 4);
  ctx.closePath();
  ink(ctx, '#fdfcff', 1);
  rr(ctx, x - 16, y - 3, 36, 3.4, 1.2);
  ink(ctx, '#b19ae6');
  ctx.fillStyle = '#f08aa3';
  circle(ctx, x + 1.5, y - 13.5, 3);
  ctx.fill();
}

function blanket(ctx, g) {
  const L = g.cx - g.W / 2 - 3;
  const top = g.T + g.H * 0.18;
  const x0 = g.face.x - g.face.es - 6;
  ctx.beginPath();
  ctx.moveTo(x0, g.bot + 1);
  ctx.quadraticCurveTo(x0 - 4, top + 6, x0 - 14, top);
  ctx.quadraticCurveTo(L + 8, top - 3, L, top + 14);
  ctx.quadraticCurveTo(L - 4, g.bot - 6, L + 2, g.bot + 1);
  ctx.closePath();
  ink(ctx, '#ffe3a3', 1.4);
  ctx.save();
  ctx.clip();
  ctx.fillStyle = '#fffaf2';
  for (let y = top; y < g.bot; y += 6) for (let x = L; x < x0; x += 6) {
    circle(ctx, x + ((y / 6) % 2) * 3, y, 1.2);
    ctx.fill();
  }
  ctx.restore();
}

function paintSet(ctx, g) {
  const x = g.face.x + 2;
  const y = g.bot + 1;
  ctx.beginPath();
  ctx.moveTo(x - 22, y);
  ctx.lineTo(x - 15, y - 6);
  ctx.lineTo(x + 18, y - 6);
  ctx.lineTo(x + 14, y);
  ctx.closePath();
  ink(ctx, '#fffaf2', 1.1);
  ctx.strokeStyle = '#c9b3f0';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x - 10, y - 3);
  ctx.quadraticCurveTo(x - 6, y - 5.5, x - 2, y - 3);
  ctx.stroke();
  ctx.strokeStyle = '#a8e2c8';
  ctx.beginPath();
  ctx.arc(x + 6, y - 3, 1.6, 0, Math.PI * 1.6);
  ctx.stroke();
  ctx.save();
  ctx.translate(x + 20, y - 2);
  ctx.rotate(-0.25);
  rr(ctx, -6, -1, 9, 2, 0.8);
  ink(ctx, '#e3b27a', 1);
  rr(ctx, 3, -1.4, 3, 2.8, 0.8);
  ink(ctx, '#f6a5b6', 1);
  ctx.restore();
}

function lights(ctx, g, pv) {
  const cols = ['#ffd86b', '#f6a5b6', '#a8e2c8', '#a6cdf2'];
  const rows = [0.42, 0.62, 0.82];
  rows.forEach((f, r) => {
    const y = g.T + f * g.H;
    const x0 = g.edge(y, -1) - 1;
    const x1 = g.edge(y + 5, 1) + 1;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.quadraticCurveTo((x0 + x1) / 2, y + 7, x1, y + 5);
    ctx.strokeStyle = '#5e7d5a';
    ctx.lineWidth = 0.9;
    ctx.stroke();
    for (let k = 1; k < 6; k++) {
      const t = k / 6;
      const bx = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * ((x0 + x1) / 2) + t * t * x1;
      const by = (1 - t) * (1 - t) * y + 2 * (1 - t) * t * (y + 7) + t * t * (y + 5);
      circle(ctx, bx, by + 1.4, 1.5);
      ink(ctx, cols[(k + r + pv) % 4], 0.8);
    }
  });
}

function headphones(ctx, g) {
  const { x, y, es } = g.face;
  const top = g.top(x) - 3;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - es - 9, y - 2);
  ctx.bezierCurveTo(x - es - 10, top - 10, x + es + 10, top - 10, x + es + 9, y - 2);
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 5.2;
  ctx.stroke();
  ctx.strokeStyle = '#f6a5b6';
  ctx.lineWidth = 2.6;
  ctx.stroke();
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(x + s * (es + 9), y - 1, 5.4, 7.4, 0, 0, Math.PI * 2);
    ink(ctx, '#7d6f6a', 1.3);
    ctx.beginPath();
    ctx.ellipse(x + s * (es + 11), y - 1, 3.2, 6.6, 0, 0, Math.PI * 2);
    ink(ctx, '#f6a5b6', 1.1);
  }
  ctx.restore();
}

function pad(ctx, g) {
  const x = g.face.x;
  const y = g.face.y + 13;
  rr(ctx, x - 9, y - 3.5, 18, 7.5, 3.6);
  ink(ctx, '#c9b3f0');
  ctx.fillStyle = LINE;
  ctx.fillRect(x - 6.4, y - 0.4, 4, 1.2);
  ctx.fillRect(x - 5, y - 1.8, 1.2, 4);
  for (const [a, b, c] of [[4.4, -1.2, '#f08aa3'], [6.4, 0.6, '#a8e2c8']]) {
    circle(ctx, x + a, y + b, 1.1);
    ctx.fillStyle = c;
    ctx.fill();
  }
}

function foam(ctx, g, pv) {
  const blobs = [[-0.55, 0.06, 7], [-0.2, 0, 7.5], [0.15, 0.04, 6.5], [0.45, 0.1, 5.5], [-0.8, 0.3, 6], [-0.65, 0.75, 5], [0.05, 0.9, 5]];
  for (const [i, [u, v, r]] of blobs.entries()) {
    const x = g.cx + u * g.W * 0.5;
    const y = g.T + v * g.H;
    circle(ctx, x, y, r + (i % 2 === pv % 2 ? 0.8 : 0));
    ink(ctx, '#ffffff', 1.1);
  }
}

function pillow(ctx, g) {
  const x = g.R + 4;
  const y = g.bot;
  ctx.beginPath();
  ctx.moveTo(x - 30, y - 3);
  ctx.quadraticCurveTo(x - 33, y - 34, x - 24, y - 38);
  ctx.quadraticCurveTo(x, y - 44, x + 24, y - 37);
  ctx.quadraticCurveTo(x + 33, y - 18, x + 25, y);
  ctx.quadraticCurveTo(x, y + 2, x - 30, y - 3);
  ink(ctx, '#fffaf2', 1.5);
  ctx.beginPath();
  ctx.moveTo(x + 22, y - 33);
  ctx.quadraticCurveTo(x + 18, y - 18, x + 21, y - 4);
  ctx.strokeStyle = '#e9ded2';
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

function yarn(ctx, g, pv) {
  const x = g.R + 8 + [0, 2, 4, 2][pv % 4];
  const y = g.bot - 5;
  ctx.beginPath();
  ctx.moveTo(x - 3, y + 4.5);
  ctx.quadraticCurveTo(x - 12, y + 6, x - 18, y + 3);
  ctx.strokeStyle = '#9d7ad6';
  ctx.lineWidth = 1;
  ctx.stroke();
  circle(ctx, x, y, 5);
  ink(ctx, '#b495e6');
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = '#8a66cc';
  ctx.lineWidth = 0.9;
  for (let k = -6; k <= 6; k += 2.4) {
    ctx.beginPath();
    ctx.moveTo(x + k - 4, y - 6);
    ctx.quadraticCurveTo(x + k + 2 + pv, y, x + k - 3, y + 6);
    ctx.stroke();
  }
  ctx.restore();
}

function fastfood(ctx, g) {
  const x = g.R - 4;
  const y = g.bot + 0.5;
  ctx.save();
  ctx.translate(x - 4, y);
  ctx.beginPath();
  ctx.moveTo(-6, -5);
  ctx.quadraticCurveTo(0, -13, 6, -5);
  ctx.closePath();
  ink(ctx, '#e8a85c');
  rr(ctx, -6.6, -5, 13.2, 1.8, 0.8);
  ink(ctx, '#8fd06b', 1);
  rr(ctx, -6.2, -3.2, 12.4, 2, 0.8);
  ink(ctx, '#7a4a2a', 1);
  rr(ctx, -6, -1.4, 12, 1.8, 0.8);
  ink(ctx, '#e8a85c', 1);
  ctx.restore();
  ctx.save();
  ctx.translate(x + 9, y);
  ctx.beginPath();
  ctx.moveTo(-4.4, -15);
  ctx.lineTo(4.4, -15);
  ctx.lineTo(3.4, 0);
  ctx.lineTo(-3.4, 0);
  ctx.closePath();
  ink(ctx, '#e8566e');
  ctx.fillStyle = '#fffaf2';
  ctx.fillRect(-3.8, -10, 7.6, 3.4);
  rr(ctx, -5, -17, 10, 2.4, 1);
  ink(ctx, '#a6cdf2', 1);
  ctx.beginPath();
  ctx.moveTo(1, -17);
  ctx.lineTo(2.6, -23);
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.translate(x + 21, y);
  ctx.strokeStyle = LINE;
  ctx.fillStyle = '#ffd86b';
  for (const dx of [-3, -1, 1, 3]) {
    rr(ctx, dx - 0.8, -12 + Math.abs(dx) * 0.6, 1.6, 7, 0.6);
    ink(ctx, '#ffd86b', 0.8);
  }
  ctx.beginPath();
  ctx.moveTo(-4.8, -7);
  ctx.lineTo(4.8, -7);
  ctx.lineTo(3.6, 0);
  ctx.lineTo(-3.6, 0);
  ctx.closePath();
  ink(ctx, '#e8566e');
  ctx.restore();
}

function heart(ctx, g, pv) {
  const x = g.hat.x;
  const y = g.top(g.hat.x) - 10 - (pv % 2);
  ctx.beginPath();
  ctx.moveTo(x, y + 4.6);
  ctx.bezierCurveTo(x - 7, y - 0.4, x - 3.6, y - 6, x, y - 2.6);
  ctx.bezierCurveTo(x + 3.6, y - 6, x + 7, y - 0.4, x, y + 4.6);
  ink(ctx, '#f6a5b6', 1.3);
}

function capOn(ctx, g, col, tip) {
  ctx.save();
  ctx.translate(g.hat.x, g.hat.y + 1);
  ctx.beginPath();
  ctx.moveTo(-14, 2);
  ctx.quadraticCurveTo(-8, -12, 4, -15);
  ctx.quadraticCurveTo(12, -17, 16, -10);
  ctx.quadraticCurveTo(10, -9, 13, 2);
  ctx.closePath();
  ink(ctx, col);
  rr(ctx, -15, -1, 30, 4.2, 2);
  ink(ctx, '#fffaf2');
  ctx.beginPath();
  ctx.arc(16.5, -9.5, 2.6, 0, Math.PI * 2);
  ink(ctx, tip);
  ctx.restore();
}

function motion(ctx, g, pv) {
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1.1;
  ctx.lineCap = 'round';
  const r = [g.W * 0.62, g.H * 0.6];
  for (let k = 0; k < 8; k++) {
    const a = k * 0.8 + pv * 0.5;
    const cx = g.cx + Math.cos(a) * r[0];
    const cy = g.bot - g.H * 0.5 + Math.sin(a) * r[1];
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * 2.6, cy + Math.sin(a) * 2.6);
    ctx.stroke();
  }
}

function big(ctx, x, y, s, fn) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.translate(-x, -y);
  K = s;
  fn();
  K = 1;
  ctx.restore();
}

export function propBack(ctx, g, P) {
  if (P.prop === 'pillow') pillow(ctx, g);
}

export function propFront(ctx, g, P, outfit) {
  const p = P.prop;
  const hatOn = !!(outfit && outfit.head);
  const pv = P.pv || 0;
  if (p === 'piano') {
    bowtie(ctx, g);
    big(ctx, g.face.x - 8, g.bot, 1.45, () => piano(ctx, g));
  }
  if (p === 'box') box(ctx, g);
  if (p === 'cake') {
    cake(ctx, g, pv);
    if (!hatOn) partyHat(ctx, g);
  }
  if (p === 'donut') foodIcon(ctx, 'donut', g.face.x, g.face.y + 4.5, 1.3);
  if (p === 'fastfood') big(ctx, g.R, g.bot, 1.45, () => fastfood(ctx, g));
  if (p === 'shades') glasses(ctx, g, 'sunglasses');
  if (p === 'read') {
    if (!(outfit && outfit.eyes)) glasses(ctx, g, 'round_glasses');
    big(ctx, g.face.x + 4, g.bot, 1.35, () => book(ctx, g, pv));
  }
  if (p === 'laptop') big(ctx, g.face.x + 6, g.bot, 1.35, () => laptop(ctx, g));
  if (p === 'blanket') blanket(ctx, g);
  if (p === 'paint') paintSet(ctx, g);
  if (p === 'lights') {
    lights(ctx, g, pv);
    if (!hatOn) capOn(ctx, g, '#e8566e', '#fffaf2');
  }
  if (p === 'phones') headphones(ctx, g);
  if (p === 'pad') pad(ctx, g);
  if (p === 'foam') foam(ctx, g, pv);
  if (p === 'heart') big(ctx, g.hat.x, g.top(g.hat.x) - 6, 1.4, () => heart(ctx, g, pv));
  if (p === 'yarn') big(ctx, g.R + 8, g.bot, 1.4, () => yarn(ctx, g, pv));
  if (p === 'nightcap' && !hatOn) capOn(ctx, g, '#f6a5b6', '#fffaf2');
  if (P.lines) motion(ctx, g, pv);
}
