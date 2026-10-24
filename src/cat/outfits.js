import { inPoly } from './shape.js';

const LINE = '#4b2e1e';
const RAINBOW = ['#f6a5b6', '#ffd38a', '#fff0a0', '#a8e2c8', '#a6cdf2', '#c9b3f0'];

function ink(ctx, fill, lw = 1.3) {
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = LINE;
  ctx.lineWidth = lw;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();
}

function neckPath(g, ctx) {
  const [a, b, c] = g.neck;
  ctx.moveTo(a[0], a[1]);
  ctx.quadraticCurveTo(b[0], b[1], c[0], c[1]);
}

function sweater(ctx, g) {
  const [a, , c] = g.neck;
  const far = 200;
  const side = g.body === 'back';
  ctx.beginPath();
  neckPath(g, ctx);
  if (side) {
    ctx.lineTo(c[0] + far, c[1]);
    ctx.lineTo(a[0] + far, a[1]);
  } else {
    ctx.lineTo(c[0] + far, c[1]);
    ctx.lineTo(c[0] + far, g.hem);
    ctx.lineTo(a[0] - far, g.hem);
    ctx.lineTo(a[0] - far, a[1]);
  }
  ctx.closePath();
  ctx.fillStyle = '#f6b5c9';
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = '#ec92b2';
  ctx.lineWidth = 1;
  ctx.lineCap = 'round';
  for (let y = g.hem - 3.6; y < g.hem; y += 10) {
    for (let x = g.cx - 60; x < g.cx + 60; x += 2.2) {
      ctx.beginPath();
      ctx.moveTo(x, g.hem - 3.4);
      ctx.lineTo(x, g.hem - 0.6);
      ctx.stroke();
    }
  }
  const cx = g.face.x;
  for (const dx of [-3.2, 3.2]) {
    ctx.beginPath();
    for (let y = g.neck[1][1] - 2; y < g.hem - 4; y += 3.4) {
      ctx.moveTo(cx + dx - 1.6 * Math.sign(dx), y);
      ctx.quadraticCurveTo(cx + dx + 1.8 * Math.sign(dx), y + 1.7, cx + dx - 1.6 * Math.sign(dx), y + 3.4);
    }
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  neckPath(g, ctx);
  if (!side) {
    ctx.moveTo(a[0] - far, g.hem);
    ctx.lineTo(c[0] + far, g.hem);
  }
  ctx.stroke();
  ctx.strokeStyle = '#fbd3e0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  const [, b] = g.neck;
  ctx.moveTo(a[0], a[1] + 1.8);
  ctx.quadraticCurveTo(b[0], b[1] + 1.8, c[0], c[1] + 1.8);
  ctx.stroke();
}

function scarfBand(ctx, g) {
  const [A, B, C] = g.neck;
  const raw = [];
  for (let k = 0; k <= 30; k++) {
    const t = k / 30;
    const m = 1 - t;
    raw.push([m * m * A[0] + 2 * m * t * B[0] + t * t * C[0], m * m * A[1] + 2 * m * t * B[1] + t * t * C[1]]);
  }
  const inside = raw.map(([x, y]) => inPoly(g.pts, x, y));
  const i0 = Math.max(0, inside.indexOf(true) - 1);
  const i1 = Math.min(raw.length - 1, inside.lastIndexOf(true) + 1);
  const pts = raw.slice(i0, i1 + 1);
  const side = (d) => pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [p[0] - ((b[1] - a[1]) / l) * d, p[1] + ((b[0] - a[0]) / l) * d];
  });
  const band = [...side(3.6), ...side(-3.6).reverse()];
  ctx.save();
  ctx.beginPath();
  band.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fillStyle = '#a8e2d2';
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.setLineDash([2.8, 2.8]);
  ctx.strokeStyle = '#fff6e6';
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1.3;
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();
}

function scarfEnd(ctx, g) {
  const [, b, c] = g.neck;
  const x = (b[0] + c[0]) / 2 + 2;
  const y = (b[1] + c[1]) / 2 + 2;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(0.18);
  ctx.beginPath();
  ctx.roundRect(-2.8, 0, 5.6, 11, 1.4);
  ink(ctx, '#a8e2d2');
  ctx.fillStyle = '#fff6e6';
  ctx.fillRect(-2.1, 3.6, 4.2, 2.4);
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 0.9;
  for (const dx of [-1.6, 0, 1.6]) {
    ctx.beginPath();
    ctx.moveTo(dx, 11);
    ctx.lineTo(dx, 13.2);
    ctx.stroke();
  }
  ctx.restore();
}

function bowShape(ctx, x, y, s, col, knot, ang = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.scale(s, s);
  for (const d of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(d * 3, -4.2, d * 5.6, -3.2);
    ctx.quadraticCurveTo(d * 6.6, 0, d * 5.6, 3.2);
    ctx.quadraticCurveTo(d * 3, 4.2, 0, 0);
    ink(ctx, col, 1.3 / s);
  }
  ctx.beginPath();
  ctx.ellipse(0, 0, 1.7, 2, 0, 0, Math.PI * 2);
  ink(ctx, knot, 1.3 / s);
  ctx.restore();
}

function inFace(ctx, g, fn) {
  ctx.save();
  ctx.translate(g.face.x, g.face.y);
  ctx.rotate(g.face.ang);
  fn();
  ctx.restore();
}

export function bowtie(ctx, g) {
  const dy = g.face.ang ? 11 : g.bowY - g.face.y;
  inFace(ctx, g, () => bowShape(ctx, 0, dy, 0.95, '#e8566e', '#c63d55'));
}

function lensRect(ctx, x, y) {
  ctx.beginPath();
  ctx.roundRect(x - 4.4, y - 3.4, 8.8, 6.8, 2.2);
}

export function glasses(ctx, g, kind) {
  inFace(ctx, g, () => lenses(ctx, g.face.es, kind));
}

function lenses(ctx, es, kind) {
  const fx = 0;
  const ey = 0;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = LINE;
  if (kind === 'round_glasses') {
    ctx.lineWidth = 1.5;
    for (const s of [-1, 1]) {
      lensRect(ctx, fx + s * es, ey);
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fill();
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(fx - es + 4.4, ey - 1.2);
    ctx.lineTo(fx + es - 4.4, ey - 1.2);
    ctx.moveTo(fx + es + 4.4, ey - 1.6);
    ctx.lineTo(fx + es + 7.5, ey - 2.2);
    ctx.moveTo(fx - es - 4.4, ey - 1.6);
    ctx.lineTo(fx - es - 7.5, ey - 2.2);
    ctx.stroke();
  } else if (kind === 'sunglasses') {
    ctx.lineWidth = 1.2;
    for (const s of [-1, 1]) {
      const x = fx + s * es;
      ctx.beginPath();
      ctx.moveTo(x - 5, ey - 2.6);
      ctx.lineTo(x + 5, ey - 2.6);
      ctx.quadraticCurveTo(x + 5, ey + 3.4, x, ey + 3.4);
      ctx.quadraticCurveTo(x - 5, ey + 3.4, x - 5, ey - 2.6);
      ctx.closePath();
      ink(ctx, '#33241c', 1.2);
      ctx.strokeStyle = '#7d6c62';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(x - 2.8, ey - 1.2);
      ctx.lineTo(x - 1.2, ey - 1.2);
      ctx.stroke();
      ctx.strokeStyle = LINE;
    }
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(fx - es + 5, ey - 2.2);
    ctx.lineTo(fx + es - 5, ey - 2.2);
    ctx.stroke();
  } else if (kind === 'heart_glasses') {
    for (const s of [-1, 1]) {
      const x = fx + s * es;
      ctx.beginPath();
      ctx.moveTo(x, ey + 4);
      ctx.bezierCurveTo(x - 6.5, ey - 0.5, x - 3.2, ey - 5.6, x, ey - 2.4);
      ctx.bezierCurveTo(x + 3.2, ey - 5.6, x + 6.5, ey - 0.5, x, ey + 4);
      ink(ctx, '#f08aa3', 1.2);
    }
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(fx - es + 4.6, ey - 1.6);
    ctx.lineTo(fx + es - 4.6, ey - 1.6);
    ctx.stroke();
  }
  ctx.restore();
}

function hatAt(ctx, g, fn) {
  ctx.save();
  ctx.translate(g.hat.x, g.hat.y);
  ctx.rotate(g.hat.ang);
  fn();
  ctx.restore();
}

export function partyHat(ctx, g) {
  hatAt(ctx, g, () => {
    ctx.rotate(0.18);
    ctx.beginPath();
    ctx.moveTo(-6, 2);
    ctx.lineTo(0, -15);
    ctx.lineTo(6, 2);
    ctx.quadraticCurveTo(0, 3.6, -6, 2);
    ctx.closePath();
    ctx.fillStyle = '#a8e2d2';
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = '#f6a5b6';
    ctx.lineWidth = 2.2;
    for (let k = -14; k < 4; k += 4.4) {
      ctx.beginPath();
      ctx.moveTo(-8, k + 4);
      ctx.lineTo(8, k);
      ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 1.3;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -15.5, 2.2, 0, Math.PI * 2);
    ink(ctx, '#ffd86b');
  });
}

function crown(ctx, g) {
  hatAt(ctx, g, () => {
    ctx.beginPath();
    ctx.moveTo(-7.5, 2.4);
    ctx.lineTo(-8, -7);
    ctx.lineTo(-4, -3);
    ctx.lineTo(0, -9);
    ctx.lineTo(4, -3);
    ctx.lineTo(8, -7);
    ctx.lineTo(7.5, 2.4);
    ctx.quadraticCurveTo(0, 3.8, -7.5, 2.4);
    ctx.closePath();
    ink(ctx, '#ffd86b');
    for (const [x, y, c] of [[0, -1.4, '#f08aa3'], [-4.6, 0, '#a6cdf2'], [4.6, 0, '#a6cdf2']]) {
      ctx.beginPath();
      ctx.arc(x, y, 1.3, 0, Math.PI * 2);
      ink(ctx, c, 0.8);
    }
  });
}

function chefHat(ctx, g) {
  hatAt(ctx, g, () => {
    ctx.beginPath();
    ctx.roundRect(-6.5, -5, 13, 7, 1.5);
    ink(ctx, '#fffaf2');
    ctx.beginPath();
    ctx.arc(-4.8, -9, 4.6, Math.PI * 0.7, Math.PI * 1.75);
    ctx.arc(0, -12.5, 5.4, Math.PI * 1.1, Math.PI * 1.9);
    ctx.arc(4.8, -9, 4.6, Math.PI * 1.25, Math.PI * 0.3);
    ctx.lineTo(6.5, -5);
    ctx.lineTo(-6.5, -5);
    ctx.closePath();
    ink(ctx, '#fffaf2');
  });
}

function beanie(ctx, g) {
  const w = g.ears.length === 2 ? Math.abs(g.ears[1].base[0] - g.ears[0].base[0]) / 2 + 10 : 16;
  hatAt(ctx, g, () => {
    ctx.beginPath();
    ctx.moveTo(-w, 2.5);
    ctx.bezierCurveTo(-w - 1, -16, w + 1, -16, w, 2.5);
    ctx.quadraticCurveTo(0, 5, -w, 2.5);
    ctx.closePath();
    ink(ctx, '#a8e2d2', 1.5);
    ctx.beginPath();
    ctx.moveTo(-w + 0.6, -1.4);
    ctx.quadraticCurveTo(0, 1.6, w - 0.6, -1.4);
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -12.8, 3, 0, Math.PI * 2);
    ink(ctx, '#fff6e6');
  });
}

function horn(ctx, g) {
  hatAt(ctx, g, () => {
    ctx.translate(3, -1);
    ctx.rotate(0.22);
    ctx.beginPath();
    ctx.moveTo(-3.2, 1.5);
    ctx.lineTo(0, -12);
    ctx.lineTo(3.2, 1.5);
    ctx.closePath();
    ink(ctx, '#ffe08a');
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 0.8;
    for (const y of [-2, -5.6, -9]) {
      ctx.beginPath();
      ctx.moveTo(-2.4 * (1 + y / 13), y + 1.2);
      ctx.lineTo(2.4 * (1 + y / 13), y - 0.8);
      ctx.stroke();
    }
  });
}

function mane(ctx, g) {
  if (!g.ears.length) return;
  const back = g.ears.length ? g.ears[0].base[0] - 5 : g.face.x - 18;
  for (let k = 4; k >= 0; k--) {
    let x;
    let y;
    if (g.body === 'loaf') {
      x = back - k * 6;
      y = g.top(x) + 1;
    } else {
      y = g.top(back) + 2 + k * 6.5;
      x = g.edge(y, -1) + 1;
    }
    ctx.beginPath();
    ctx.ellipse(x, y, 4, 3.2, -0.5, 0, Math.PI * 2);
    ink(ctx, RAINBOW[k], 1.2);
  }
}

export function unicornFur(ctx, g, pal) {
  ctx.fillStyle = pal.fur;
  ctx.beginPath();
  ctx.ellipse(g.face.x, g.face.y + 1.5, 16, 10, g.face.ang, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

export function outfitUnder(ctx, g, P, pal, o) {
  if (!o) return;
  if (o.body === 'sweater') sweater(ctx, g);
}

export function outfitOver(ctx, g, P, pal, o) {
  if (!o) return;
  if (o.body === 'scarf') {
    scarfBand(ctx, g);
    scarfEnd(ctx, g);
  }
  if (o.body === 'bowtie') bowtie(ctx, g);
  if (o.body === 'unicorn') {
    mane(ctx, g);
    horn(ctx, g);
  }
  if (o.eyes) glasses(ctx, g, o.eyes);
  if (o.head === 'bow' && g.ears.length) {
    const e = g.ears[1];
    bowShape(ctx, e.base[0] + 3, e.base[1] - 3, 0.85, '#f6a5b6', '#e07a98', 0.35);
  }
  if (o.head === 'party_hat') partyHat(ctx, g);
  if (o.head === 'crown') crown(ctx, g);
  if (o.head === 'chef_hat') chefHat(ctx, g);
  if (o.head === 'beanie') beanie(ctx, g);
}
