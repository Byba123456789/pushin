import { geometry, inPoly, smooth } from './shape.js';
import { drawFace } from './face.js';
import { outfitUnder, outfitOver, unicornFur } from './outfits.js';
import { propBack, propFront, bowl } from './props.js';

const LW = 1.6;

export const PUSHEEN = { fur: '#b3a89e', stripe: '#6e6158', line: '#4b2e1e' };
export const TOMMY = { fur: '#7a6d63', stripe: '#5a4d44', line: '#4b2e1e', belly: '#cfcfcf', earTip: '#4f423a', alt: { pear: 'tommy', front: 'tommy' } };

const DIRT = '#8a6d55';

function polyline(ctx, pts) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
}

function tail(ctx, t, pal, uni) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  polyline(ctx, t.pts);
  ctx.strokeStyle = pal.line;
  ctx.lineWidth = t.w + LW * 2;
  ctx.stroke();
  ctx.strokeStyle = uni ? '#fbf7ff' : pal.fur;
  ctx.lineWidth = t.w;
  ctx.stroke();
  ctx.lineCap = 'butt';
  if (uni) {
    const cols = ['#f6a5b6', '#ffd38a', '#fff0a0', '#a8e2c8', '#a6cdf2', '#c9b3f0'];
    const n = t.pts.length - 1;
    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.moveTo(t.pts[i][0], t.pts[i][1]);
      ctx.lineTo(t.pts[i + 1][0], t.pts[i + 1][1]);
      ctx.strokeStyle = cols[Math.floor((i / n) * 6)];
      ctx.stroke();
    }
  } else {
    ctx.strokeStyle = pal.stripe;
    ctx.setLineDash([2.6, 2.6]);
    ctx.lineDashOffset = -1;
    polyline(ctx, t.pts.slice(4));
    ctx.stroke();
  }
  ctx.restore();
}

function paw(ctx, x, y, pal, r = 3.3, beans) {
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.86, 0, 0, Math.PI * 2);
  ctx.fillStyle = pal.fur;
  ctx.fill();
  ctx.strokeStyle = pal.line;
  ctx.lineWidth = LW;
  ctx.stroke();
  if (beans) {
    ctx.fillStyle = '#f6a5b6';
    ctx.beginPath();
    ctx.ellipse(x, y + 0.6, 1.4, 1.1, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function frontPaws(ctx, g, P, pal) {
  if (!g.chest || !P.fp) return;
  const c = g.chest;
  const [dl, dr] = P.fpo || [0, 0];
  ctx.save();
  ctx.strokeStyle = pal.line;
  ctx.lineWidth = LW * 0.85;
  ctx.lineCap = 'round';
  for (const [s, d] of [[-1, dl], [1, dr]]) {
    const x = c.x + (s * c.sp) / 2 + (P.fpx || 0);
    const y = c.y + d + (P.fpy || 0);
    ctx.beginPath();
    if (P.fp === 'n') ctx.arc(x, y + 1.2, 2.2, Math.PI * 1.05, Math.PI * 1.95);
    else {
      ctx.moveTo(x - 2, y - 2.4);
      ctx.lineTo(x - 2, y);
      ctx.arc(x, y, 2, Math.PI, 0, true);
      ctx.lineTo(x + 2, y - 2.4);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function legs(ctx, g, [front, back], pal, uni) {
  ctx.save();
  ctx.lineCap = 'round';
  const at = [[g.R - 12, front], [g.R - 20, front + 14], [g.L + 14, back], [g.L + 22, back - 14]];
  for (const [x, deg] of at) {
    const a = (deg * Math.PI) / 180;
    const y = g.bot - 7;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * 13, y + Math.sin(a) * 13);
    ctx.strokeStyle = pal.line;
    ctx.lineWidth = 5.4 + LW * 2;
    ctx.stroke();
    ctx.strokeStyle = uni ? '#fbf7ff' : pal.fur;
    ctx.lineWidth = 5.4;
    ctx.stroke();
  }
  ctx.restore();
}

function capsule(ctx, a, b, w, pal, uni) {
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.strokeStyle = pal.line;
  ctx.lineWidth = w + LW * 2;
  ctx.stroke();
  ctx.strokeStyle = uni ? '#fbf7ff' : pal.fur;
  ctx.lineWidth = w;
  ctx.stroke();
}

function raisedPaws(ctx, g, pal, uni) {
  ctx.save();
  ctx.lineCap = 'round';
  for (const [x, y] of g.marks) {
    let top = y;
    while (top > y - 60 && inPoly(g.pts, x, top)) top--;
    capsule(ctx, [x, top + 4], [x, top - 5], 6, pal, uni);
  }
  ctx.restore();
}

function frontArms(ctx, g, P, pal, uni) {
  ctx.save();
  ctx.lineCap = 'round';
  for (const r of [P.pL, P.pR]) {
    if (!r) continue;
    const tip = [g.face.x + r[0], g.face.y + r[1]];
    if (!inPoly(g.pts, tip[0], tip[1])) continue;
    const side = Math.sign(r[0]) || 1;
    const sy = tip[1] - 7;
    const sx = side > 0 ? Math.min(tip[0] + 9, g.edge(sy, side) - 1) : Math.max(tip[0] - 9, g.edge(sy, side) + 1);
    capsule(ctx, [sx, sy], tip, 6.4, pal, uni);
    paw(ctx, tip[0], tip[1], pal, 4, r[2]);
  }
  ctx.restore();
}

function arms(ctx, g, P, pal, uni) {
  ctx.save();
  ctx.lineCap = 'round';
  for (const r of [P.pL, P.pR]) {
    if (!r) continue;
    const tip = [g.face.x + r[0], g.face.y + r[1]];
    if (inPoly(g.pts, tip[0], tip[1])) continue;
    capsule(ctx, [g.face.x + Math.sign(r[0]) * 8, g.face.y + 16], tip, 7, pal, uni);
  }
  ctx.restore();
}

export function drawCat(ctx, P, pal, outfit, dirt) {
  const g = geometry(P, pal.alt);
  const uni = outfit && outfit.body === 'unicorn';
  ctx.save();
  const m = g.m;
  ctx.transform(m.a, m.b, m.c, m.d, m.e, m.f);
  propBack(ctx, g, P);
  if (!g.tail.front) tail(ctx, g.tail, pal, uni);
  if (P.legs) legs(ctx, g, P.legs, pal, uni);
  arms(ctx, g, P, pal, uni);

  const union = smooth(g.pts);
  ctx.lineJoin = 'round';
  ctx.strokeStyle = pal.line;
  ctx.lineWidth = LW * 2;
  ctx.stroke(union);
  ctx.fillStyle = uni ? '#fbf7ff' : pal.fur;
  ctx.fill(union);

  ctx.save();
  ctx.clip(union);
  if (uni) unicornFur(ctx, g, pal);
  if (pal.belly) {
    ctx.fillStyle = pal.belly;
    ctx.beginPath();
    ctx.ellipse(g.belly.x, g.belly.y, g.belly.rx, g.belly.ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (pal.earTip) {
    ctx.fillStyle = pal.earTip;
    for (const e of g.ears) {
      ctx.beginPath();
      ctx.arc(e.tip[0], e.tip[1], 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (!uni) {
    ctx.fillStyle = pal.stripe;
    for (const s of g.spots) {
      ctx.beginPath();
      ctx.ellipse(s.x, s.y, s.rx, s.ry, s.rot, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = pal.stripe;
    ctx.lineCap = 'round';
    ctx.lineWidth = 2.6;
    for (const f of g.fore) {
      ctx.beginPath();
      ctx.moveTo(f.x, f.y - 2);
      ctx.lineTo(f.x, f.y + 3.4);
      ctx.stroke();
    }
  }
  if (dirt > 0) {
    ctx.fillStyle = DIRT;
    const spots = [[-0.3, 0.6], [0.15, 0.78], [-0.62, 0.35], [0.45, 0.62], [-0.15, 0.4], [-0.75, 0.62], [0.05, 0.25], [-0.45, 0.82]];
    const n = Math.ceil(dirt * spots.length);
    for (let i = 0; i < n; i++) {
      const [u, v] = spots[i];
      const x = g.cx + u * g.W * 0.5;
      const y = g.bot - g.H + v * g.H;
      ctx.beginPath();
      ctx.ellipse(x, y, 2.6, 1.8, i, 0, Math.PI * 2);
      ctx.ellipse(x + 2.2, y + 1, 1.4, 1.1, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (P.paint) {
    const cols = ['#c9b3f0', '#f6a5b6', '#a8e2c8'];
    const at = [[-0.5, 0.35, 9, 6], [0.2, 0.62, 7, 5], [-0.15, 0.85, 8, 4]];
    at.forEach(([u, v, rx, ry], i) => {
      ctx.fillStyle = cols[i];
      ctx.beginPath();
      ctx.ellipse(g.cx + u * g.W * 0.5, g.bot - g.H + v * g.H, rx, ry, i * 0.7, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  outfitUnder(ctx, g, P, pal, outfit);
  ctx.restore();

  if (g.tail.front) tail(ctx, g.tail, pal, uni);
  drawFace(ctx, g, P, pal, LW);
  frontPaws(ctx, g, P, pal);
  raisedPaws(ctx, g, pal, uni);
  outfitOver(ctx, g, P, pal, outfit);
  propFront(ctx, g, P, outfit);
  frontArms(ctx, g, P, pal, uni);
  ctx.restore();
  if (P.prop === 'bowl') {
    const front = Math.max(...g.pts.map(([x, y]) => m.transformPoint({ x, y }).x));
    const bx = P.dip ? front - 2 : m.transformPoint({ x: g.face.x, y: g.face.y }).x + 24;
    ctx.save();
    ctx.translate(bx, 0);
    ctx.scale(1.7, 1.7);
    bowl(ctx, 0, 0, P.food, P.left ?? 3, 1.7);
    ctx.restore();
  }
  return g;
}
