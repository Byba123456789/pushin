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

function lumpy(ctx, x, y, rx, ry, amp = 0.05, ph = 0) {
  const n = 10;
  const p = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = 1 + amp * Math.sin(a * 3 + ph) + amp * 0.5 * Math.cos(a * 2 + ph * 2);
    p.push([x + Math.cos(a) * rx * r, y + Math.sin(a) * ry * r]);
  }
  ctx.beginPath();
  ctx.moveTo((p[n - 1][0] + p[0][0]) / 2, (p[n - 1][1] + p[0][1]) / 2);
  for (let i = 0; i < n; i++) {
    const q = p[(i + 1) % n];
    ctx.quadraticCurveTo(p[i][0], p[i][1], (p[i][0] + q[0]) / 2, (p[i][1] + q[1]) / 2);
  }
  ctx.closePath();
}

function hair(ctx, col, lw = 0.8) {
  ctx.strokeStyle = col;
  ctx.lineWidth = lw / K;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function dot(ctx, x, y, r, col) {
  circle(ctx, x, y, r);
  ctx.fillStyle = col;
  ctx.fill();
}

function seg(ctx, x1, y1, x2, y2, col, lw) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  hair(ctx, col, lw);
}

function scaled(ctx, cx, cy, kx, ky, path) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(kx, ky);
  ctx.translate(-cx, -cy);
  path();
  ctx.restore();
}

function stitch(ctx, col, lw = 0.9) {
  ctx.setLineDash([2, 1.6]);
  hair(ctx, col, lw);
  ctx.setLineDash([]);
}

export function foodIcon(ctx, id, x, y, s = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  switch (id) {
    case 'cookie':
      lumpy(ctx, 0, 0, 4.6, 4.5, 0.03);
      ink(ctx, '#e3b27a', 1.1);
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0.2, 1.6);
      hair(ctx, '#c98f55', 0.7);
      for (const [a, b, r] of [[-1.8, -1.4, 0.75], [1.6, -0.6, 0.7], [-0.4, 1.8, 0.75], [2, 2, 0.5], [-2.6, 0.9, 0.5]]) dot(ctx, a, b, r, '#7a4a2a');
      ctx.beginPath();
      ctx.arc(0, 0, 3.4, 3.7, 4.4);
      hair(ctx, '#fff0d6', 0.7);
      break;
    case 'milk':
      rr(ctx, 1, -5.5, 2.2, 1.3, 0.5);
      ink(ctx, '#a6cdf2', 0.9);
      rr(ctx, -3.6, -4.4, 7.2, 9, 1.2);
      ink(ctx, '#fffaf2', 1.1);
      ctx.beginPath();
      ctx.moveTo(-3.6, -1.6);
      ctx.lineTo(3.6, -1.6);
      ctx.moveTo(-3.6, 1.4);
      ctx.lineTo(3.6, 1.4);
      hair(ctx, '#a6cdf2', 1.4);
      dot(ctx, 0, -0.1, 0.65, '#a6cdf2');
      seg(ctx, -2.5, -3.4, -2.5, 3.6, '#e4eef7', 0.7);
      break;
    case 'fish':
      ctx.beginPath();
      ctx.moveTo(-2, -2.4);
      ctx.lineTo(0.2, -4.4);
      ctx.lineTo(1.8, -2.2);
      ctx.closePath();
      ink(ctx, '#f08f5e', 1);
      ctx.beginPath();
      ctx.ellipse(-0.8, 0, 4.4, 2.8, 0, 0, Math.PI * 2);
      ctx.moveTo(3, 0);
      ctx.lineTo(6, -2.8);
      ctx.lineTo(6, 2.8);
      ctx.closePath();
      ink(ctx, '#ffad7a', 1.1);
      for (const [a, b] of [[0.4, -0.2], [1.8, 0.9], [0.2, 1.3], [1.6, -1.2]]) {
        ctx.beginPath();
        ctx.arc(a, b, 0.9, 0.3, Math.PI - 0.3);
        hair(ctx, '#e8885a', 0.6);
      }
      ctx.beginPath();
      ctx.arc(-1.8, 0, 2, -0.9, 0.9);
      hair(ctx, '#e8885a', 0.7);
      dot(ctx, -3, -0.6, 0.7, LINE);
      dot(ctx, -3.2, -0.85, 0.25, '#fffaf2');
      break;
    case 'donut':
      lumpy(ctx, 0, 0, 4.8, 4.7, 0.04, 1);
      ink(ctx, '#e8b07a', 1.1);
      lumpy(ctx, 0, -0.4, 3.9, 3.8, 0.1, 2);
      ctx.fillStyle = '#f6a5b6';
      ctx.fill();
      circle(ctx, 0, 0, 1.5);
      ink(ctx, '#fdf3ea', 1);
      ctx.beginPath();
      ctx.arc(0, -0.4, 3.1, 3.6, 4.4);
      hair(ctx, '#fff0f3', 0.7);
      [[-2.7, -1.2, '#fffaf2'], [2.4, -1.8, '#a6cdf2'], [1.8, 2, '#ffd86b'], [-1.8, 2.2, '#a8e2c8'], [0.2, -3, '#ffd86b'], [3, 0.3, '#fffaf2']].forEach(([a, b, c], i) => {
        const d = i % 2 ? 0.8 : -0.5;
        seg(ctx, a, b, a + 0.8, b + d, c, 0.8);
      });
      break;
    case 'sushi':
      rr(ctx, -4.6, -2.4, 9.2, 5.4, 2.2);
      ink(ctx, '#fffaf2', 1.1);
      for (const [a, b] of [[-3.2, 1.3], [2.9, 1.5], [-2.4, 2.2], [3.4, 0.4]]) dot(ctx, a, b, 0.35, '#d9d0c2');
      rr(ctx, -4.8, -4.4, 9.6, 3.2, 1.6);
      ink(ctx, '#ff9f80', 1.1);
      seg(ctx, -3.2, -3.9, -2, -1.8, '#ffd1bd', 0.7);
      seg(ctx, 1.8, -3.9, 3, -1.8, '#ffd1bd', 0.7);
      ctx.fillStyle = LINE;
      ctx.fillRect(-1, -4.2, 2, 7.2);
      seg(ctx, -0.4, -3.4, -0.4, 2, '#7a5a46', 0.5);
      break;
    case 'ramen':
      ctx.beginPath();
      ctx.moveTo(-5.4, -1);
      ctx.lineTo(5.4, -1);
      ctx.quadraticCurveTo(5, 5, 0, 5);
      ctx.quadraticCurveTo(-5, 5, -5.4, -1);
      ink(ctx, '#f6a5b6', 1.1);
      ctx.beginPath();
      ctx.moveTo(-4.4, 2);
      ctx.quadraticCurveTo(0, 3.4, 4.4, 2);
      hair(ctx, '#fffaf2', 0.8);
      ctx.beginPath();
      ctx.moveTo(-4.4, -0.2);
      ctx.lineTo(-4.1, 1);
      hair(ctx, '#fff0f3', 0.7);
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
      dot(ctx, 2.7, -1.5, 0.65, '#ffd86b');
      for (const a of [-4.4, -1.1, 4.5]) dot(ctx, a, -1.5, 0.55, '#8fd06b');
      break;
    case 'pizza':
      ctx.beginPath();
      ctx.moveTo(-4.6, -3.6);
      ctx.lineTo(4.6, -3.6);
      ctx.lineTo(0, 4.6);
      ctx.closePath();
      ink(ctx, '#ffd86b', 1.1);
      for (const [a, b] of [[-2.8, -2.6], [0.6, -2.8], [2.4, -1.2], [-0.4, 2.8]]) dot(ctx, a, b, 0.45, '#fff0b0');
      rr(ctx, -5, -5.2, 10, 2.2, 1.1);
      ink(ctx, '#e3a25e', 1.1);
      for (const a of [-3.4, -0.8, 1.8, 3.8]) dot(ctx, a, -4.1, 0.3, '#c98a4a');
      for (const [a, b, r] of [[-1.4, -1.6, 0.9], [1.2, 0.6, 0.9], [-0.1, 2, 0.55]]) {
        dot(ctx, a, b, r, '#e8566e');
        dot(ctx, a - r * 0.3, b - r * 0.3, r * 0.3, '#f6a5b6');
      }
      ctx.beginPath();
      ctx.ellipse(2.4, -2.2, 1, 0.5, -0.6, 0, Math.PI * 2);
      ctx.fillStyle = '#8fd06b';
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
      seg(ctx, -4.3, 2, 4.3, 2, '#f6a5b6', 1.2);
      ctx.beginPath();
      ctx.moveTo(-4.6, -1);
      ctx.lineTo(4.6, -3.6);
      ctx.lineTo(4.6, -1.4);
      ctx.lineTo(-4.6, 1.2);
      ctx.closePath();
      ink(ctx, '#f6a5b6', 1.1);
      for (const [a, b] of [[-2.6, 0.6], [1, -0.4]]) {
        dot(ctx, a, b + 0.3, 0.8, '#f6a5b6');
        ctx.beginPath();
        ctx.arc(a, b + 0.3, 0.8, 0.1, Math.PI - 0.1);
        hair(ctx, LINE, 0.8);
      }
      seg(ctx, 2.4, -2, 3.2, -2.3, '#fffaf2', 0.7);
      seg(ctx, -1.4, -0.6, -0.6, -0.9, '#a6cdf2', 0.7);
      seg(ctx, 1.6, -4.4, 2.6, -6.2, '#5e7d5a', 0.7);
      circle(ctx, 1.6, -4.4, 1.3);
      ink(ctx, '#e8566e', 0.9);
      dot(ctx, 1.2, -4.8, 0.35, '#fffaf2');
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
  ctx.moveTo(x - 8.2, y - 4.4);
  ctx.lineTo(x + 8.2, y - 4.4);
  hair(ctx, '#fffaf2', 0.9);
  ctx.beginPath();
  ctx.moveTo(x, y - 1.2);
  ctx.bezierCurveTo(x - 3.2, y - 3.4, x - 1.6, y - 3.8, x, y - 2.8);
  ctx.bezierCurveTo(x + 1.6, y - 3.8, x + 3.2, y - 3.4, x, y - 1.2);
  ctx.fillStyle = '#fffaf2';
  ctx.fill();
  seg(ctx, x - 6.6, y - 3, x - 6, y - 1, '#fff0f3', 0.8);
  ctx.beginPath();
  ctx.ellipse(x, y - 6.5, 9, 2.1, 0, 0, Math.PI * 2);
  ink(ctx, '#e47e9c', 1.3);
  ctx.beginPath();
  ctx.ellipse(x, y - 6.5, 6.6, 1.2, 0, Math.PI * 1.05, Math.PI * 1.5);
  hair(ctx, '#f6a5b6', 0.8);
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
  for (let k = 0; k < 9; k++) seg(ctx, x - 12.2 + k * 4.2, y - 10, x - 12.2 + k * 4.2, y - 8.2, '#b9aea4', 0.6);
  ctx.fillStyle = '#2f2622';
  for (let k = 0; k < 9; k++) ctx.fillRect(x - 13 + k * 4.2, y - 12.5, 1.6, 2.6);
  seg(ctx, x - 14, y - 16.6, x - 4, y - 16.6, '#6b5b52', 0.8);
  rr(ctx, x + 4, y - 16.3, 8, 1.6, 0.8);
  ink(ctx, '#f6a5b6', 0.7);
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = '#2f2622';
  for (const dx of [-13, 21]) {
    ctx.beginPath();
    ctx.moveTo(x + dx, y - 8);
    ctx.lineTo(x + dx, y);
    ctx.stroke();
    dot(ctx, x + dx, y - 0.5, 1.4, '#7d6f6a');
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
  seg(ctx, L + 4, top - 3.4, L + 10, top - 0.8, '#d9ae72', 0.8);
  seg(ctx, R - 4, top - 3.4, R - 10, top - 0.8, '#d9ae72', 0.8);
  rr(ctx, L, top, R - L, g.bot - top + 1, 1.2);
  ink(ctx, '#e8c48f');
  for (const dy of [4, 7]) {
    ctx.beginPath();
    ctx.moveTo(L + 2, top + dy);
    for (let x = L + 2; x < R - 2; x += 4) ctx.quadraticCurveTo(x + 1, top + dy - 1, x + 2, top + dy);
    hair(ctx, '#d9ae72', 0.7);
  }
  rr(ctx, g.cx - 4.5, top, 9, 13, 0.6);
  ink(ctx, '#f5e8c8', 0.9);
  seg(ctx, g.cx - 2.4, top + 2, g.cx - 2.4, top + 7, '#fffaf2', 0.8);
  rr(ctx, L + 5, top + 12, 13, 8, 1);
  ink(ctx, '#fffaf2', 0.9);
  seg(ctx, L + 7.5, top + 15, L + 15.5, top + 15, '#a6cdf2', 0.9);
  seg(ctx, L + 7.5, top + 17.4, L + 13, top + 17.4, '#f6a5b6', 0.9);
  rr(ctx, R - 16, top + 12, 10, 3, 1.5);
  ink(ctx, '#c9a06a', 0.9);
}

function cake(ctx, g, pv) {
  const x = g.R + 4;
  const y = g.bot;
  lumpy(ctx, x, y - 1, 15, 2.6, 0.03);
  ink(ctx, '#ece4f2');
  ctx.beginPath();
  ctx.ellipse(x, y - 1, 11, 1.5, 0, 0, Math.PI * 2);
  hair(ctx, '#d6c8e4', 0.7);
  rr(ctx, x - 12, y - 17, 24, 15, 3);
  ink(ctx, '#fff4e3');
  const drip = [10, 10, 8.4, 10.4, 9.6, 8, 10];
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 13);
  for (let k = 0; k <= 6; k++) ctx.quadraticCurveTo(x - 12 + k * 4 - 2, y - drip[k], x - 12 + k * 4, y - 13);
  ctx.lineTo(x + 12, y - 15);
  ctx.quadraticCurveTo(x + 12, y - 17, x + 9, y - 17);
  ctx.lineTo(x - 9, y - 17);
  ctx.quadraticCurveTo(x - 12, y - 17, x - 12, y - 15);
  ctx.closePath();
  ink(ctx, '#f6a5b6');
  ctx.fillStyle = '#f6a5b6';
  ctx.fillRect(x - 11.4, y - 5, 22.8, 1.8);
  seg(ctx, x - 11.4, y - 5, x + 11.4, y - 5, '#f08aa3', 0.6);
  for (let k = 0; k < 5; k++) dot(ctx, x - 8 + k * 4, y - 6.4, 0.8, '#f08aa3');
  [['#ffd86b', -7], ['#a6cdf2', -2.5], ['#fffaf2', 3], ['#a8e2c8', 7.5]].forEach(([c, dx], i) => {
    const sx = x + dx;
    const sy = y - 15 + (i % 2) * 0.8;
    seg(ctx, sx, sy, sx + 0.9, sy - 0.5, c, 0.9);
  });
  for (const dx of [-7.5, 7.5]) {
    seg(ctx, x + dx, y - 18, x + dx + 1, y - 20.2, '#5e7d5a', 0.7);
    circle(ctx, x + dx, y - 18.2, 1.5);
    ink(ctx, '#e8566e', 0.9);
    dot(ctx, x + dx - 0.5, y - 18.8, 0.4, '#fffaf2');
  }
  rr(ctx, x - 1.2, y - 24, 2.4, 7, 0.8);
  ink(ctx, '#a6cdf2', 1);
  seg(ctx, x - 1.1, y - 22.6, x + 1.1, y - 21.8, '#fffaf2', 0.8);
  seg(ctx, x - 1.1, y - 19.8, x + 1.1, y - 19, '#fffaf2', 0.8);
  ctx.beginPath();
  const f = pv % 2 ? 0.5 : -0.5;
  ctx.moveTo(x + f, y - 30);
  ctx.quadraticCurveTo(x + 2.4, y - 26.5, x, y - 25);
  ctx.quadraticCurveTo(x - 2.4, y - 26.5, x + f, y - 30);
  ink(ctx, '#ffd86b', 1);
  dot(ctx, x + f * 0.6, y - 27.2, 0.8, '#fffaf2');
}

function book(ctx, g, pv) {
  const x = g.face.x + 4;
  const y = g.bot;
  ctx.save();
  ctx.translate(x, y);
  rr(ctx, -12, -24, 24, 23, 1.5);
  ink(ctx, '#c99a6b');
  rr(ctx, -10.4, -22.4, 20.8, 19.8, 1);
  ctx.setLineDash([1.6, 1.4]);
  hair(ctx, '#e3c096', 0.7);
  ctx.setLineDash([]);
  rr(ctx, -9.4, -4, 18.8, 2.4, 0.6);
  ink(ctx, '#fffaf2', 0.8);
  seg(ctx, -8, -2.8, 8, -2.8, '#e4d6c4', 0.5);
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(s * 12, -12, 3.4, 3, 0, 0, Math.PI * 2);
    ink(ctx, '#b3a89e', 1.6);
  }
  ctx.beginPath();
  ctx.moveTo(0, -24);
  ctx.lineTo(0, -1);
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  seg(ctx, -2.4, -22, -2.4, -4.6, '#b07f52', 0.7);
  seg(ctx, 2.4, -22, 2.4, -4.6, '#e3c096', 0.7);
  ctx.beginPath();
  ctx.moveTo(-7, -17);
  ctx.lineTo(-5.4, -14);
  ctx.lineTo(-3.8, -17);
  ctx.lineTo(-5.4, -19.6);
  ctx.closePath();
  ink(ctx, '#f6a5b6', 0.8);
  seg(ctx, 4, -17, 8, -17, '#a6cdf2', 0.9);
  seg(ctx, 4, -14.5, 7, -14.5, '#a6cdf2', 0.9);
  ctx.beginPath();
  ctx.moveTo(5.4, -1.4);
  ctx.lineTo(5.4, 3);
  ctx.lineTo(6.6, 2);
  ctx.lineTo(7.8, 3);
  ctx.lineTo(7.8, -1.4);
  ink(ctx, '#e8566e', 0.8);
  if (pv % 2) {
    ctx.beginPath();
    ctx.moveTo(-6, -23.6);
    ctx.quadraticCurveTo(-1, -31, 6, -27.4);
    ctx.quadraticCurveTo(3, -25.6, 4, -23.6);
    ctx.closePath();
    ink(ctx, '#fffaf2', 1);
  }
  ctx.restore();
}

function laptopStar(ctx, x, y, r) {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.closePath();
  ink(ctx, '#ffd66b', 0.7);
}

function laptop(ctx, g, pv) {
  const x = g.face.x + 6;
  const y = g.bot;
  const tremble = [0, 0.012, -0.01, 0.008][pv % 4];
  ctx.save();
  ctx.translate(x + 1, y - 3);
  ctx.rotate(tremble);
  ctx.translate(-x - 1, 3 - y);
  rr(ctx, x - 14, y - 26, 30, 23, 3.4);
  ink(ctx, '#cdbaf2');
  rr(ctx, x - 11.6, y - 23.6, 25.2, 18.2, 2);
  ink(ctx, null, 0.6);
  seg(ctx, x - 10.5, y - 21, x - 4, y - 21, '#f1eafd', 1);
  ctx.beginPath();
  ctx.moveTo(x + 1, y - 9.6);
  ctx.bezierCurveTo(x - 6.5, y - 14.2, x - 4.2, y - 21.2, x + 1, y - 17.6);
  ctx.bezierCurveTo(x + 6.2, y - 21.2, x + 8.5, y - 14.2, x + 1, y - 9.6);
  ink(ctx, '#f6a5b6', 0.9);
  seg(ctx, x - 2.4, y - 16.6, x - 1.4, y - 17.8, '#ffffff', 0.9);
  ctx.restore();
  rr(ctx, x - 16, y - 3, 34, 3.4, 1.2);
  ink(ctx, '#b19ae6');
  seg(ctx, x - 12, y - 1.5, x - 3, y - 1.5, '#d9cdf3', 0.8);
  if (pv % 4 === 1) laptopStar(ctx, x + 12, y - 30, 2);
  if (pv % 4 === 2) {
    laptopStar(ctx, x - 4, y - 31, 1.6);
    dot(ctx, x + 6, y - 29, 0.8, LINE);
  }
  if (pv % 4 === 3) {
    seg(ctx, x + 9, y - 31, x + 13, y - 31, LINE, 1);
    seg(ctx, x + 11, y - 33, x + 11, y - 29, LINE, 1);
  }
}

function blanket(ctx, g) {
  const L = g.cx - g.W / 2 - 3;
  const top = g.T + g.H * 0.18;
  const x0 = g.face.x - g.face.es - 6;
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(x0, g.bot + 1);
    ctx.quadraticCurveTo(x0 - 4, top + 6, x0 - 14, top);
    ctx.quadraticCurveTo(L + 8, top - 3, L, top + 14);
    ctx.quadraticCurveTo(L - 4, g.bot - 6, L + 2, g.bot + 1);
    ctx.closePath();
  };
  path();
  ctx.fillStyle = '#ffe3a3';
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = '#fffaf2';
  for (let y = top; y < g.bot; y += 6) for (let x = L; x < x0; x += 6) {
    circle(ctx, x + ((y / 6) % 2) * 3, y, 1.2);
    ctx.fill();
  }
  const mid = (L + x0) / 2;
  const h = g.bot - top;
  for (const [fx, fy] of [[0.15, 0.35], [0.5, 0.62]]) {
    ctx.beginPath();
    ctx.moveTo(L + (x0 - L) * fx, top + h * fy);
    ctx.quadraticCurveTo(mid, top + h * (fy + 0.1), x0 - 2, top + h * (fy - 0.06));
    hair(ctx, '#f0c878', 1.1);
  }
  ctx.restore();
  scaled(ctx, mid, (top + g.bot) / 2, 0.88, 0.9, path);
  stitch(ctx, '#e9b866', 1);
  path();
  ink(ctx, null, 1.4);
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
  seg(ctx, x - 15.6, y - 6.4, x - 13.4, y - 6.4, '#ffd86b', 1.6);
  seg(ctx, x + 18.4, y - 6.4, x + 15.8, y - 6.4, '#ffd86b', 1.6);
  dot(ctx, x - 14, y - 3, 1, '#ffd86b');
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
  rr(ctx, 1.6, -1.3, 2.2, 2.6, 0.6);
  ink(ctx, '#cfd3d8', 0.9);
  seg(ctx, -5, -0.4, 0.8, -0.4, '#f0cf9e', 0.6);
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
      seg(ctx, bx - 0.7, by - 0.2, bx + 0.7, by - 0.2, '#5e7d5a', 1.2);
      dot(ctx, bx - 0.5, by + 0.9, 0.35, '#fffaf2');
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
  ctx.lineWidth = 0.7;
  ctx.strokeStyle = '#e47e9c';
  ctx.setLineDash([1.6, 1.4]);
  ctx.stroke();
  ctx.setLineDash([]);
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(x + s * (es + 9), y - 1, 5.4, 7.4, 0, 0, Math.PI * 2);
    ink(ctx, '#7d6f6a', 1.3);
    ctx.beginPath();
    ctx.ellipse(x + s * (es + 11), y - 1, 3.2, 6.6, 0, 0, Math.PI * 2);
    ink(ctx, '#f6a5b6', 1.1);
    ctx.beginPath();
    ctx.ellipse(x + s * (es + 11), y - 1, 1.5, 3.6, 0, 0, Math.PI * 2);
    ink(ctx, '#e47e9c', 0.8);
    ctx.beginPath();
    ctx.moveTo(x + s * (es + 9.4), y - 6.4);
    ctx.quadraticCurveTo(x + s * (es + 12), y - 6.6, x + s * (es + 12.6), y - 4.4);
    hair(ctx, '#fff0f3', 0.8);
  }
  ctx.restore();
}

function pad(ctx, g) {
  const x = g.face.x;
  const y = g.face.y + 13;
  for (const dx of [-8, 4]) {
    rr(ctx, x + dx, y - 5.2, 4, 2.6, 1);
    ink(ctx, '#b19ae6', 0.9);
  }
  rr(ctx, x - 9, y - 3.5, 18, 7.5, 3.6);
  ink(ctx, '#c9b3f0');
  seg(ctx, x - 6, y - 2.6, x + 1, y - 2.6, '#e4d9f8', 0.8);
  dot(ctx, x - 0.8, y + 1.8, 0.35, '#8a72c9');
  dot(ctx, x + 0.8, y + 1.8, 0.35, '#8a72c9');
  ctx.fillStyle = LINE;
  ctx.fillRect(x - 6.4, y - 0.4, 4, 1.2);
  ctx.fillRect(x - 5, y - 1.8, 1.2, 4);
  for (const [a, b, c] of [[5.4, -1.7, '#f08aa3'], [7, -0.2, '#a8e2c8'], [5.4, 1.3, '#ffd86b'], [3.8, -0.2, '#a6cdf2']]) dot(ctx, x + a, y + b, 0.8, c);
}

function foam(ctx, g, pv) {
  const blobs = [[-0.55, 0.06, 7], [-0.2, 0, 7.5], [0.15, 0.04, 6.5], [0.45, 0.1, 5.5], [-0.8, 0.3, 6], [-0.65, 0.75, 5], [0.05, 0.9, 5]];
  for (const [i, [u, v, r]] of blobs.entries()) {
    const x = g.cx + u * g.W * 0.5;
    const y = g.T + v * g.H;
    const rad = r + (i % 2 === pv % 2 ? 0.8 : 0);
    lumpy(ctx, x, y, rad, rad * 0.95, 0.07, i * 1.7);
    ink(ctx, '#ffffff', 1.1);
    circle(ctx, x + rad * 0.3, y - rad * 0.25, rad * 0.2);
    hair(ctx, '#cfe6f7', 0.6);
    ctx.beginPath();
    ctx.arc(x, y, rad * 0.7, 3.5, 4.3);
    hair(ctx, '#d8ecf9', 0.8);
  }
}

function pillow(ctx, g) {
  ctx.save();
  const inv = g.m.inverse();
  ctx.transform(inv.a, inv.b, inv.c, inv.d, inv.e, inv.f);
  const x = g.face.x - 3;
  const y = g.bot;
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(x - 30, y - 2);
    ctx.quadraticCurveTo(x - 33, y - 17, x - 24, y - 21);
    ctx.quadraticCurveTo(x, y - 25, x + 26, y - 21);
    ctx.quadraticCurveTo(x + 34, y - 12, x + 28, y);
    ctx.quadraticCurveTo(x, y + 2, x - 30, y - 2);
  };
  path();
  ink(ctx, '#fffaf2', 1.5);
  scaled(ctx, x, y - 11, 0.88, 0.7, path);
  stitch(ctx, '#e0d3c4');
  seg(ctx, x - 30, y - 3, x - 26, y - 6, '#e0d3c4', 1);
  seg(ctx, x - 29, y - 19, x - 25, y - 16, '#e0d3c4', 1);
  seg(ctx, x + 28, y - 1, x + 24, y - 4, '#e0d3c4', 1);
  seg(ctx, x + 27, y - 19, x + 23, y - 16, '#e0d3c4', 1);
  ctx.beginPath();
  ctx.moveTo(x - 22, y - 12);
  ctx.quadraticCurveTo(x - 20, y - 15, x - 16, y - 14);
  hair(ctx, '#ece2d6', 1);
  ctx.beginPath();
  ctx.moveTo(x + 25, y - 18);
  ctx.quadraticCurveTo(x + 22, y - 10, x + 24, y - 3);
  ctx.strokeStyle = '#e9ded2';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();
}

function yarn(ctx, g, pv) {
  const x = g.R + 8 + [0, 2, 4, 2][pv % 4];
  const y = g.bot - 5;
  ctx.beginPath();
  ctx.moveTo(x - 3, y + 4.5);
  ctx.bezierCurveTo(x - 9, y + 7.5, x - 14, y + 5.5, x - 18, y + 3.4);
  ctx.bezierCurveTo(x - 21, y + 1.8, x - 20.6, y - 1.6, x - 18.2, y - 0.8);
  hair(ctx, '#9d7ad6', 1);
  lumpy(ctx, x, y, 5, 4.8, 0.05, 0.6);
  ink(ctx, '#b495e6');
  ctx.save();
  ctx.clip();
  for (let k = -6; k <= 6; k += 2.4) {
    ctx.beginPath();
    ctx.moveTo(x + k - 4, y - 6);
    ctx.quadraticCurveTo(x + k + 2 + pv, y, x + k - 3, y + 6);
    hair(ctx, '#8a66cc', 1);
  }
  for (let k = -4; k <= 4; k += 3) {
    ctx.beginPath();
    ctx.moveTo(x - 6, y + k - 2.4);
    ctx.quadraticCurveTo(x, y + k + 2 - pv * 0.4, x + 6, y + k - 2.4);
    hair(ctx, '#a183dc', 0.9);
  }
  ctx.beginPath();
  ctx.arc(x, y, 3.4, 3.7, 4.6);
  hair(ctx, '#d6c4f6', 1);
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
  ctx.beginPath();
  ctx.arc(0, -4.4, 3.6, 3.9, 4.7);
  hair(ctx, '#f5d09b', 0.9);
  for (const [a, b] of [[-2.8, -6.6], [0.2, -7.6], [2.8, -6.4]]) {
    ctx.beginPath();
    ctx.ellipse(a, b, 0.7, 0.35, 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#fffaf2';
    ctx.fill();
  }
  ctx.beginPath();
  ctx.moveTo(-6.6, -5);
  ctx.lineTo(6.6, -5);
  ctx.lineTo(6.6, -3.6);
  for (let i = 0; i < 5; i++) ctx.quadraticCurveTo(6.6 - (i + 0.5) * 2.64, -2, 6.6 - (i + 1) * 2.64, -3.6);
  ctx.closePath();
  ink(ctx, '#8fd06b', 1);
  rr(ctx, -6.2, -3.2, 12.4, 2, 0.8);
  ink(ctx, '#7a4a2a', 1);
  ctx.beginPath();
  ctx.moveTo(-6, -3.4);
  ctx.lineTo(6, -3.4);
  ctx.lineTo(6, -2.6);
  ctx.lineTo(2.6, -2.6);
  ctx.lineTo(1.8, -0.8);
  ctx.lineTo(1, -2.6);
  ctx.lineTo(-6, -2.6);
  ctx.closePath();
  ink(ctx, '#ffd86b', 0.8);
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
  dot(ctx, 0, -8.3, 1, '#ffd86b');
  seg(ctx, -3.3, -14, -2.9, -11, '#f6a5b6', 0.8);
  ctx.beginPath();
  ctx.moveTo(-3.6, -17);
  ctx.quadraticCurveTo(0, -19.8, 3.6, -17);
  ink(ctx, '#d6e9fa', 0.9);
  rr(ctx, -5, -17, 10, 2.4, 1);
  ink(ctx, '#a6cdf2', 1);
  ctx.beginPath();
  ctx.moveTo(1, -18);
  ctx.lineTo(2, -22);
  ctx.lineTo(4, -23);
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  seg(ctx, 1.4, -19.6, 2, -22, '#e8566e', 0.9);
  ctx.restore();
  ctx.save();
  ctx.translate(x + 21, y);
  ctx.strokeStyle = LINE;
  ctx.fillStyle = '#ffd86b';
  for (const dx of [-3, -1, 1, 3]) {
    rr(ctx, dx - 0.8, -12 + Math.abs(dx) * 0.6, 1.6, 7, 0.6);
    ink(ctx, '#ffd86b', 0.8);
    seg(ctx, dx - 0.2, -11 + Math.abs(dx) * 0.6, dx - 0.2, -9 + Math.abs(dx) * 0.6, '#fff0a0', 0.5);
  }
  for (const [a, b] of [[-2, -12.4], [0.2, -12.8], [2.6, -12.2]]) dot(ctx, a, b, 0.3, '#fffaf2');
  ctx.beginPath();
  ctx.moveTo(-4.8, -7);
  ctx.lineTo(4.8, -7);
  ctx.lineTo(3.6, 0);
  ctx.lineTo(-3.6, 0);
  ctx.closePath();
  ink(ctx, '#e8566e');
  dot(ctx, 0, -3.4, 1.1, '#ffd86b');
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
  ctx.beginPath();
  ctx.moveTo(x - 4.2, y - 1.6);
  ctx.quadraticCurveTo(x - 5.2, y - 3.6, x - 3.2, y - 3.8);
  hair(ctx, '#fffaf2', 1);
  seg(ctx, x + 6.4, y - 5.4, x + 6.4, y - 3.2, '#f08aa3', 0.9);
  seg(ctx, x + 5.3, y - 4.3, x + 7.5, y - 4.3, '#f08aa3', 0.9);
}

function capOn(ctx, g, col, tip, dy = 0, k = 1) {
  ctx.save();
  ctx.translate(g.hat.x, g.hat.y + 1 + dy);
  ctx.scale(k, k);
  K = k;
  ctx.beginPath();
  ctx.moveTo(-14, 2);
  ctx.quadraticCurveTo(-8, -12, 4, -15);
  ctx.quadraticCurveTo(12, -17, 16, -10);
  ctx.quadraticCurveTo(10, -9, 13, 2);
  ctx.closePath();
  ink(ctx, col);
  for (const [a, b] of [[-5, -5], [3, -8.4], [7.4, -3.6]]) dot(ctx, a, b, 0.7, '#fffaf2');
  rr(ctx, -15, -1, 30, 4.2, 2);
  ink(ctx, '#fffaf2');
  for (const a of [-10, -4, 2, 8, 12]) seg(ctx, a, 0.4, a + 1.2, 1.4, '#e9ded2', 0.7);
  ctx.beginPath();
  ctx.arc(16.5, -9.5, 2.6, 0, Math.PI * 2);
  ink(ctx, tip);
  dot(ctx, 15.6, -10.3, 0.5, '#e9ded2');
  K = 1;
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
  if (p === 'laptop') big(ctx, g.face.x + 6, g.bot, 1.35, () => laptop(ctx, g, pv));
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
  if (p === 'nightcap' && !hatOn) capOn(ctx, g, '#f6a5b6', '#fffaf2', -3, 0.85);
  if (P.lines) motion(ctx, g, pv);
}
