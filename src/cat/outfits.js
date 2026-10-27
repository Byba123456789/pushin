import { inPoly, smooth } from './shape.js';

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

const lying = (g, P) => g.body === 'back' || !!P.rest;

function neckPath(g, ctx, dy = 0) {
  const [a, b, c] = g.neck;
  ctx.moveTo(a[0], a[1] + dy);
  ctx.quadraticCurveTo(b[0], b[1] + dy, c[0], c[1] + dy);
}

function sweater(ctx, g, P) {
  const far = 200;
  const side = g.body === 'back';
  const collar = lying(g, P) && !side;
  const h = g.head;
  const [a, c] = collar ? [[h.x - h.rx, h.y], [h.x + h.rx, h.y]] : [g.neck[0], g.neck[2]];
  const hem = collar ? g.bot - 1 : g.hem;
  const edge = (dy = 0) => {
    if (!collar) return neckPath(g, ctx, dy);
    ctx.moveTo(a[0], a[1]);
    ctx.ellipse(h.x, h.y + dy, h.rx, h.ry, 0, Math.PI, 0, true);
  };
  ctx.beginPath();
  edge();
  if (side) {
    ctx.lineTo(c[0], c[1] + far);
    ctx.lineTo(a[0] + far, c[1] + far);
    ctx.lineTo(a[0] + far, a[1] - far);
    ctx.lineTo(a[0], a[1] - far);
  } else {
    ctx.lineTo(c[0] + far, c[1]);
    ctx.lineTo(c[0] + far, hem);
    ctx.lineTo(a[0] - far, hem);
    ctx.lineTo(a[0] - far, collar ? a[1] - far : a[1]);
    if (collar) ctx.lineTo(a[0], a[1] - far);
  }
  ctx.closePath();
  ctx.fillStyle = '#f6b5c9';
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = '#ec92b2';
  ctx.lineWidth = 1;
  ctx.lineCap = 'round';
  for (let y = hem - 3.6; !side && y < hem; y += 10) {
    for (let x = g.cx - 60; x < g.cx + 60; x += 2.2) {
      ctx.beginPath();
      ctx.moveTo(x, hem - 3.4);
      ctx.lineTo(x, hem - 0.6);
      ctx.stroke();
    }
  }
  const cx = g.face.x;
  for (const dx of [-3.2, 3.2]) {
    ctx.beginPath();
    for (let y = g.neck[1][1] - 2; y < hem - 4; y += 3.4) {
      ctx.moveTo(cx + dx - 1.6 * Math.sign(dx), y);
      ctx.quadraticCurveTo(cx + dx + 1.8 * Math.sign(dx), y + 1.7, cx + dx - 1.6 * Math.sign(dx), y + 3.4);
    }
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  edge();
  if (!side) {
    ctx.moveTo(a[0] - far, hem);
    ctx.lineTo(c[0] + far, hem);
  }
  ctx.stroke();
  ctx.strokeStyle = '#fbd3e0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  edge(1.8);
  ctx.stroke();
}

const SCARF_SHIFT = {
  loaf: [[-2, 3], [-9, 6], [-1, 1]],
  flat: [[-3, 3], [-9, 3], [-1, 0]],
};

function along(a, b, d = 7) {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return [b[0] + ((b[0] - a[0]) / l) * d, b[1] + ((b[1] - a[1]) / l) * d];
}

function scarfCurve(g) {
  const sh = SCARF_SHIFT[g.body] || [[0, 0], [0, 0], [0, 0]];
  const [A, B, C] = g.neck.map((p, i) => [p[0] + sh[i][0], p[1] + sh[i][1]]);
  const at = (t) => {
    const m = 1 - t;
    return [m * m * A[0] + 2 * m * t * B[0] + t * t * C[0], m * m * A[1] + 2 * m * t * B[1] + t * t * C[1]];
  };
  const pts = [];
  for (let k = 0; k <= 30; k++) pts.push(at(k / 30));
  pts.unshift(along(pts[1], pts[0]));
  pts.push(along(pts[pts.length - 2], pts[pts.length - 1]));
  return { pts, at };
}

function offset(pts, d) {
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [p[0] - ((b[1] - a[1]) / l) * d, p[1] + ((b[0] - a[0]) / l) * d];
  });
}

function trace(ctx, pts, join = false) {
  pts.forEach(([x, y], i) => (i || join ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
}

const SCARF_W = 3.7;

function scarfBand(ctx, g, pal) {
  const { pts } = scarfCurve(g);
  const top = offset(pts, -SCARF_W);
  const low = offset(pts, SCARF_W);
  ctx.save();
  ctx.clip(smooth(g.pts));
  ctx.beginPath();
  trace(ctx, top);
  trace(ctx, low.slice().reverse(), true);
  ctx.closePath();
  ctx.fillStyle = '#a8e2d2';
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = '#fff6e6';
  ctx.lineWidth = 2.4;
  let run = 0;
  for (let i = 1; i < pts.length; i++) {
    const before = run;
    run += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (Math.floor(before / 5.2) === Math.floor(run / 5.2)) continue;
    ctx.beginPath();
    ctx.moveTo(top[i][0], top[i][1]);
    ctx.lineTo(low[i][0], low[i][1]);
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1.3;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  trace(ctx, top);
  ctx.moveTo(low[0][0], low[0][1]);
  trace(ctx, low);
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  trace(ctx, offset(pts, -SCARF_W - 2));
  trace(ctx, offset(pts, SCARF_W + 2).reverse(), true);
  ctx.closePath();
  ctx.clip();
  ctx.strokeStyle = pal.line;
  ctx.lineWidth = 3.2;
  ctx.stroke(smooth(g.pts));
  ctx.restore();
}

function scarfEnd(ctx, g) {
  const { at } = scarfCurve(g);
  const [x, y] = at(0.7);
  ctx.save();
  ctx.translate(x, y - 1.5);
  ctx.rotate(-0.1);
  ctx.beginPath();
  ctx.roundRect(-3.4, 0, 6.8, 13.5, 1.6);
  ink(ctx, '#a8e2d2');
  ctx.save();
  ctx.clip();
  ctx.fillStyle = '#fff6e6';
  for (const sy of [3.6, 8.4]) ctx.fillRect(-4, sy, 8, 2.4);
  ctx.restore();
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(-3.4, 0, 6.8, 13.5, 1.6);
  ctx.stroke();
  for (const dx of [-2.2, 0, 2.2]) {
    ctx.beginPath();
    ctx.moveTo(dx, 13.5);
    ctx.lineTo(dx, 16.2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.ellipse(0, 0, 4.4, 3.2, 0, 0, Math.PI * 2);
  ink(ctx, '#a8e2d2', 1.1);
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
  } else if (kind === 'star_glasses') {
    for (const s of [-1, 1]) starLens(ctx, fx + s * es);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(fx - es + 5, ey - 1.2);
    ctx.lineTo(fx + es - 5, ey - 1.2);
    ctx.stroke();
  } else if (kind === 'monocle') {
    monocle(ctx, es);
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

function headAt(ctx, g, fn) {
  ctx.save();
  ctx.translate(g.hat.x, g.hat.y);
  ctx.rotate(g.face.ang);
  fn();
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
  headAt(ctx, g, () => {
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
  headAt(ctx, g, () => {
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
  headAt(ctx, g, () => {
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

function capWidth(g) {
  const { ang, x: fx, y: fy } = g.face;
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const dx = g.hat.x - fx;
  const dy = g.hat.y - fy;
  const u0 = dx * c + dy * s;
  const v = -dx * s + dy * c + 5;
  let half = g.head.rx * 0.95;
  for (const dir of [-1, 1]) {
    let u = u0;
    while (Math.abs(u - u0) < half && inPoly(g.pts, fx + u * c - v * s, fy + u * s + v * c)) u += dir * 0.5;
    half = Math.min(half, Math.abs(u - u0));
  }
  return Math.max(half, 14);
}

function beanie(ctx, g) {
  const w = capWidth(g);
  headAt(ctx, g, () => {
    ctx.beginPath();
    ctx.moveTo(-w, 1);
    ctx.bezierCurveTo(-w - 1, -17, w + 1, -17, w, 1);
    ctx.closePath();
    ink(ctx, '#a8e2d2', 1.5);
    ctx.beginPath();
    ctx.moveTo(-w - 0.6, -0.6);
    ctx.quadraticCurveTo(0, 2.4, w + 0.6, -0.6);
    ctx.lineTo(w + 0.2, 4.4);
    ctx.quadraticCurveTo(0, 7.2, -w - 0.2, 4.4);
    ctx.closePath();
    ink(ctx, '#fff6e6', 1.4);
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = '#d9cdb8';
    ctx.lineWidth = 0.9;
    for (let x = -w + 2.4; x < w - 1; x += 3.4) {
      ctx.beginPath();
      ctx.moveTo(x, -2);
      ctx.lineTo(x, 8);
      ctx.stroke();
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(0, -14.6, 3.2, 0, Math.PI * 2);
    ink(ctx, '#fff6e6');
  });
}

function horn(ctx, g) {
  hatAt(ctx, g, () => {
    ctx.translate(3, g.body === 'back' ? 2.5 : -1);
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
  if (g.body === 'back') {
    for (let k = 4; k >= 0; k--) {
      const y = g.hat.y + 3 + k * 3.8;
      ctx.beginPath();
      ctx.ellipse(g.edge(y, -1) + 1.5, y, 4, 3.2, -0.5, 0, Math.PI * 2);
      ink(ctx, RAINBOW[k], 1.2);
    }
    return;
  }
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

function flower(ctx, x, y, r, petal) {
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * r * 0.75, y + Math.sin(a) * r * 0.75, r * 0.62, 0, Math.PI * 2);
    ink(ctx, petal, 0.9);
  }
  ctx.beginPath();
  ctx.arc(x, y, r * 0.5, 0, Math.PI * 2);
  ink(ctx, '#ffd86b', 0.8);
}

function wreath(ctx, g) {
  const w = capWidth(g);
  const at = (t) => {
    const m = 1 - t;
    return [m * m * -w + t * t * w, m * m * 2 + 2 * m * t * 7 + t * t * 2];
  };
  headAt(ctx, g, () => {
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let k = 0; k <= 20; k++) ctx.lineTo(...at(k / 20));
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 5.4;
    ctx.stroke();
    ctx.strokeStyle = '#9bd6ae';
    ctx.lineWidth = 3.6;
    ctx.stroke();
    for (const t of [0.1, 0.24, 0.38, 0.62, 0.76, 0.9]) {
      const [x, y] = at(t);
      ctx.beginPath();
      ctx.ellipse(x, y - 2.6, 1.6, 3.2, (t - 0.5) * 1.6, 0, Math.PI * 2);
      ink(ctx, '#7fc496', 0.9);
    }
    const cols = ['#f6a5b6', '#fff6e6', '#c9b3f0', '#fff6e6', '#f6a5b6'];
    [0.06, 0.28, 0.5, 0.72, 0.94].forEach((t, i) => {
      const [x, y] = at(t);
      flower(ctx, x, y, i === 2 ? 3.4 : 2.8, cols[i]);
    });
  });
}

function bunnyEars(ctx, g) {
  const w = capWidth(g);
  headAt(ctx, g, () => {
    ctx.beginPath();
    ctx.moveTo(-w * 0.8, 3.4);
    ctx.quadraticCurveTo(0, 7, w * 0.8, 3.4);
    ctx.strokeStyle = LINE;
    ctx.lineCap = 'round';
    ctx.lineWidth = 4.2;
    ctx.stroke();
    ctx.strokeStyle = '#f6a5b6';
    ctx.lineWidth = 2.4;
    ctx.stroke();
    for (const s of [-1, 1]) {
      ctx.save();
      ctx.translate(s * w * 0.42, 3);
      ctx.rotate(s * 0.14);
      ctx.beginPath();
      ctx.moveTo(-3.8, 1);
      ctx.bezierCurveTo(-5.6, -9, -3.6, -20, 0, -22);
      ctx.bezierCurveTo(3.6, -20, 5.6, -9, 3.8, 1);
      ctx.closePath();
      ink(ctx, '#fff6e6', 1.4);
      ctx.beginPath();
      ctx.moveTo(-1.9, -1);
      ctx.bezierCurveTo(-3, -8, -1.8, -15, 0, -17);
      ctx.bezierCurveTo(1.8, -15, 3, -8, 1.9, -1);
      ctx.closePath();
      ink(ctx, '#f6b5c9', 0.8);
      ctx.restore();
    }
  });
}

function star(ctx, x, y, r, rot) {
  ctx.beginPath();
  for (let k = 0; k < 10; k++) {
    const a = rot + (k * Math.PI) / 5 - Math.PI / 2;
    const d = k % 2 ? r * 0.45 : r;
    ctx.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
  }
  ctx.closePath();
  ink(ctx, '#fff0a0', 0.9);
}

function wizardHat(ctx, g) {
  const w = capWidth(g);
  headAt(ctx, g, () => {
    ctx.beginPath();
    ctx.ellipse(0, 2, w + 3.6, 3.8, 0, 0, Math.PI * 2);
    ink(ctx, '#a58be0', 1.5);
    ctx.beginPath();
    ctx.moveTo(-w * 0.62, 1.4);
    ctx.quadraticCurveTo(-w * 0.42, -13, 2, -22);
    ctx.quadraticCurveTo(7, -26, 11, -21);
    ctx.quadraticCurveTo(5, -19, w * 0.46, -6);
    ctx.quadraticCurveTo(w * 0.58, -2, w * 0.62, 1.4);
    ctx.quadraticCurveTo(0, 5.2, -w * 0.62, 1.4);
    ctx.closePath();
    ink(ctx, '#b9a1ec', 1.5);
    ctx.beginPath();
    ctx.moveTo(-w * 0.6, -1);
    ctx.quadraticCurveTo(0, 3, w * 0.6, -1);
    ctx.lineTo(w * 0.62, 1.8);
    ctx.quadraticCurveTo(0, 5.6, -w * 0.62, 1.8);
    ctx.closePath();
    ink(ctx, '#ffd86b', 1.1);
    star(ctx, -2, -9, 3.6, 0.2);
    star(ctx, 5, -3.4, 2.2, -0.3);
  });
}

function starLens(ctx, x) {
  ctx.beginPath();
  for (let k = 0; k < 10; k++) {
    const a = (k * Math.PI) / 5 - Math.PI / 2;
    const d = k % 2 ? 3.1 : 6.2;
    ctx.lineTo(x + Math.cos(a) * d, 0.4 + Math.sin(a) * d);
  }
  ctx.closePath();
  ink(ctx, '#ffd86b', 1.2);
  ctx.beginPath();
  ctx.moveTo(x - 1.8, -2.4);
  ctx.lineTo(x - 0.4, -3.4);
  ctx.strokeStyle = '#fff6e6';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function monocle(ctx, es) {
  ctx.beginPath();
  ctx.arc(es, 0, 5.2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fill();
  ctx.strokeStyle = '#d9a93a';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.arc(es, 0, 6.2, 0, Math.PI * 2);
  ctx.moveTo(es + 4.2, 0);
  ctx.arc(es, 0, 4.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#d9a93a';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([1.4, 1]);
  ctx.beginPath();
  ctx.moveTo(es + 3.8, 4.4);
  ctx.quadraticCurveTo(es + 9, 12, es + 5, 22);
  ctx.stroke();
}

function apron(ctx, g) {
  const b = g.belly;
  const top = g.body === 'back' ? b.y - b.ry * 0.85 : Math.max(b.y - b.ry * 0.85, g.face.y + 9);
  const bot = Math.min(b.y + b.ry * 0.95, g.bot - 3);
  const room = (y) => (g.edge(y, 1) - g.edge(y, -1)) / 2 - 3;
  const hw = Math.min(b.rx * 0.72, room(top), room(bot));
  const cx = b.x;
  const mid = top + (bot - top) * 0.34;
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - hw * 0.55, top);
  ctx.lineTo(cx + hw * 0.55, top);
  ctx.quadraticCurveTo(cx + hw * 0.62, mid - 2, cx + hw, mid);
  ctx.lineTo(cx + hw, bot - 3);
  ctx.quadraticCurveTo(cx + hw, bot, cx + hw - 3, bot);
  ctx.lineTo(cx - hw + 3, bot);
  ctx.quadraticCurveTo(cx - hw, bot, cx - hw, bot - 3);
  ctx.lineTo(cx - hw, mid);
  ctx.quadraticCurveTo(cx - hw * 0.62, mid - 2, cx - hw * 0.55, top);
  ctx.closePath();
  ink(ctx, '#fffaf2', 1.3);
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = '#f6a5b6';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([2.2, 1.8]);
  ctx.strokeRect(cx - hw + 2, top + 2, hw * 2 - 4, bot - top - 4);
  ctx.restore();
  const py = top + (bot - top) * 0.56;
  const ph = (bot - py) * 0.62;
  ctx.beginPath();
  ctx.roundRect(cx - hw * 0.5, py, hw, ph, [1.2, 1.2, 3, 3]);
  ink(ctx, '#fbd3e0', 1.1);
  const hy = py + ph * 0.45;
  ctx.beginPath();
  ctx.moveTo(cx, hy + 2.4);
  ctx.bezierCurveTo(cx - 4, hy - 0.4, cx - 2, hy - 3, cx, hy - 1);
  ctx.bezierCurveTo(cx + 2, hy - 3, cx + 4, hy - 0.4, cx, hy + 2.4);
  ink(ctx, '#e8566e', 0.9);
  ctx.strokeStyle = '#f6a5b6';
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  const neck = scarfCurve(g).pts;
  ctx.save();
  ctx.clip(smooth(g.pts));
  ctx.beginPath();
  trace(ctx, neck);
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 3.8;
  ctx.stroke();
  ctx.strokeStyle = '#f6a5b6';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
  for (const s of [-1, 1]) {
    const x = cx + s * hw * 0.55;
    const [nx, ny] = neck.reduce((best, p) => (Math.abs(p[0] - x) < Math.abs(best[0] - x) ? p : best));
    if (Math.abs(nx - x) > 4 || top - ny > 14 || ny > top) continue;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x + s * 0.6, ny);
    ctx.stroke();
  }
  ctx.restore();
}

const TUTU_TIERS = [['#fff6e6', 11, 16], ['#fbd3e0', 7.5, 12], ['#f6a5b6', 4, 8]];

function tutu(ctx, g) {
  const side = g.body === 'back';
  const x = g.cx + 8;
  const r1 = side ? 0 : g.bot - 22;
  const half = (y) => (side ? (g.bot - g.top(x)) / 2 : (g.edge(y, 1) - g.edge(y, -1)) / 2);
  const mid = (y) => (side ? 0 : (g.edge(y, 1) + g.edge(y, -1)) / 2);
  ctx.save();
  if (side) {
    ctx.translate(x, (g.top(x) + g.bot) / 2);
    ctx.rotate(-Math.PI / 2);
  }
  for (const [col, flare, depth] of TUTU_TIERS) {
    const r2 = r1 + depth;
    const w1 = half(r1) + 1;
    const w2 = half(r2) + (side ? flare * 0.2 : flare);
    const n = Math.round(w2 / 4.4);
    const step = (w2 * 2) / n;
    ctx.beginPath();
    ctx.moveTo(mid(r1) - w1, r1);
    ctx.lineTo(mid(r2) - w2, r2);
    for (let k = 0; k < n; k++) {
      const x0 = mid(r2) - w2 + k * step;
      ctx.quadraticCurveTo(x0 + step / 2, r2 + 4.4, x0 + step, r2);
    }
    ctx.lineTo(mid(r1) + w1, r1);
    ctx.closePath();
    ink(ctx, col, 1.2);
  }
  const w0 = half(r1) + 1;
  ctx.beginPath();
  ctx.roundRect(mid(r1) - w0, r1 - 2.2, w0 * 2, 4.4, 2);
  ink(ctx, '#c9b3f0', 1.2);
  ctx.restore();
}

function capelet(ctx, g, pal) {
  const { pts, at } = scarfCurve(g);
  const hem = offset(pts, SCARF_W + 2);
  let run = 0;
  const lower = offset(pts, SCARF_W + 12).map((p, i) => {
    if (i) run += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    const k = Math.abs(Math.sin((run / 6.4) * Math.PI)) * 3.4;
    const q = hem[i];
    const l = Math.hypot(p[0] - q[0], p[1] - q[1]) || 1;
    return [p[0] + ((p[0] - q[0]) / l) * k, p[1] + ((p[1] - q[1]) / l) * k];
  });
  ctx.save();
  ctx.clip(smooth(g.pts));
  ctx.beginPath();
  trace(ctx, hem);
  trace(ctx, lower.slice().reverse(), true);
  ctx.closePath();
  ctx.fillStyle = '#e8566e';
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = '#c63d55';
  ctx.lineWidth = 1;
  ctx.lineCap = 'round';
  for (let i = 3; i < pts.length - 2; i += 4) {
    ctx.beginPath();
    ctx.moveTo(hem[i][0], hem[i][1]);
    ctx.lineTo(lower[i][0], lower[i][1]);
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1.3;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  trace(ctx, lower);
  ctx.stroke();
  ctx.beginPath();
  trace(ctx, pts);
  ctx.strokeStyle = '#fff6e6';
  ctx.lineWidth = SCARF_W * 2 + 1;
  ctx.stroke();
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  trace(ctx, offset(pts, -SCARF_W - 0.5));
  ctx.moveTo(hem[0][0], hem[0][1]);
  trace(ctx, hem);
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  trace(ctx, offset(pts, -SCARF_W - 2));
  trace(ctx, offset(pts, SCARF_W + 2).reverse(), true);
  ctx.closePath();
  ctx.clip();
  ctx.strokeStyle = pal.line;
  ctx.lineWidth = 3.2;
  ctx.stroke(smooth(g.pts));
  ctx.restore();
  const [x, y] = at(0.66);
  ctx.beginPath();
  ctx.arc(x, y + 1, 2.3, 0, Math.PI * 2);
  ink(ctx, '#ffd86b', 1.1);
}

export function outfitUnder(ctx, g, P, pal, o) {
  if (!o) return;
  if (o.body === 'sweater') sweater(ctx, g, P);
  if (o.body === 'apron') apron(ctx, g);
  if (o.eyes === 'heart_glasses' || o.eyes === 'star_glasses') g.hideBrows = true;
}

export function outfitOver(ctx, g, P, pal, o) {
  if (!o) return;
  if (o.body === 'scarf') {
    scarfBand(ctx, g, pal);
    scarfEnd(ctx, g);
  }
  if (o.body === 'bowtie') bowtie(ctx, g);
  if (o.body === 'tutu') tutu(ctx, g);
  if (o.body === 'cape') capelet(ctx, g, pal);
  if (o.body === 'unicorn') {
    mane(ctx, g);
    horn(ctx, g);
  }
  if (o.eyes) glasses(ctx, g, o.eyes);
  const hat = o.head && P.prop !== 'phones';
  if (hat && o.head === 'bow' && g.ears.length) {
    const e = g.ears[1];
    bowShape(ctx, e.base[0] + 3, e.base[1] - 3, 0.85, '#f6a5b6', '#e07a98', 0.35);
  }
  if (hat && o.head === 'bow' && !g.ears.length && g.body !== 'back') headAt(ctx, g, () => bowShape(ctx, 4, -1, 0.9, '#f6a5b6', '#e07a98', 0.35));
  if (hat && o.head === 'bow' && g.body === 'back') inFace(ctx, g, () => bowShape(ctx, 14, -10, 0.85, '#f6a5b6', '#e07a98', 0.35));
  if (hat && o.head === 'party_hat') partyHat(ctx, g);
  if (hat && o.head === 'crown') crown(ctx, g);
  if (hat && o.head === 'chef_hat') chefHat(ctx, g);
  if (hat && o.head === 'beanie') beanie(ctx, g);
  if (hat && o.head === 'bunny_ears') bunnyEars(ctx, g);
  if (hat && o.head === 'flower_wreath') wreath(ctx, g);
  if (hat && o.head === 'wizard_hat') wizardHat(ctx, g);
}
