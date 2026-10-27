import { REF } from './refshapes.js';

export function smooth(pts, path = new Path2D()) {
  const n = pts.length;
  const p = (i) => pts[(i + n) % n];
  path.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < n; i++) {
    const a = p(i - 1);
    const b = p(i);
    const c = p(i + 1);
    const d = p(i + 2);
    path.bezierCurveTo(b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6, c[0] - (d[0] - b[0]) / 6, c[1] - (d[1] - b[1]) / 6, c[0], c[1]);
  }
  path.closePath();
  return path;
}

export function inPoly(pts, x, y) {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

function clockwise(pts) {
  let a = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) a += (pts[j][0] - pts[i][0]) * (pts[j][1] + pts[i][1]);
  return a < 0 ? pts.reverse() : pts;
}

// верх контура в столбце x: первое пересечение многоугольника сверху
function topOf(pts) {
  return (x) => {
    let best = Infinity;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i];
      const [xj, yj] = pts[j];
      if ((xi <= x && xj >= x) || (xj <= x && xi >= x)) {
        const y = xi === xj ? Math.min(yi, yj) : yi + ((x - xi) * (yj - yi)) / (xj - xi);
        if (y < best) best = y;
      }
    }
    return best;
  };
}

function edgeOf(pts) {
  return (y, side) => {
    let best = side > 0 ? -Infinity : Infinity;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i];
      const [xj, yj] = pts[j];
      if ((yi <= y && yj >= y) || (yj <= y && yi >= y)) {
        const x = yi === yj ? xi : xi + ((y - yi) * (xj - xi)) / (yj - yi);
        best = side > 0 ? Math.max(best, x) : Math.min(best, x);
      }
    }
    return best;
  };
}

const META = {
  loaf: {
    earY: -61.2, earX: 21, face: { x: 21.2, y: -49.5, es: 10.2, ang: 0, my: 1.7 },
    whisk: [[40.5, -52.3, 47.5, -53.6], [40.5, -49.4, 47.5, -48.4], [4, -52.9, -3.2, -52.5], [4, -49.8, -3.2, -48.9]],
    fore: [25.9, 20.9, 16.3], spotsTop: [[-16.6, 3.8, 6.6], [-27.1, 3.6, 7.3]], paws: [-29.5, -12.6, 11, 28.1],
    tail: { B: [-41, -32], len: 16, w: 4.8 }, head: [21, -47, 26, 19], hat: [21, -60.8], neck: [[-6, -63], [-3, -36], [46, -38]],
    bow: -38, belly: [15, -19, 25, 15],
  },
  pear: {
    earY: -73.8, earX: 14, face: { x: 12, y: -62.4, es: 10.2, ang: 0.09, my: 1.8 },
    whisk: [[30, -61, 37, -62.6], [30, -58, 37, -57.2], [-8, -64.5, -21, -66.5], [-8, -61.3, -22, -61.6]],
    fore: [10, 13.5, 17], spotsEdge: [[-53.8, -1], [-42.7, -1]], chest: { x: 8, y: -4.5, sp: 7 },
    tail: { pts: [[-31, -7], [-21, -0.5], [-8.5, -5]], w: 4.6 }, head: [12, -61, 24, 17], hat: [14, -72.8],
    neck: [[-27, -52], [12, -45], [34, -52]], bow: -50, belly: [10, -26, 22, 24],
  },
  front: {
    earY: -89.2, earX: 1.5, face: { x: -0.2, y: -74.7, es: 10, ang: 0, my: 2.5 },
    whisk: [[-14.5, -77, -27, -79.5], [-14.5, -73.5, -27, -73], [14.5, -78, 26.5, -81.5], [14.5, -74.5, 26.5, -75]],
    fore: [-2.8, 0.7, 4.2], spotsEdge: [[-51.8, 1], [-35.2, 1], [-40, -1]], chest: { x: -4, y: -50.6, sp: 13.4 },
    tail: { B: [27, -12], len: 16, w: 4.4, side: 1 }, head: [-0.2, -73, 22, 17], hat: [1.5, -88.4],
    neck: [[-26, -64], [0, -58], [26, -64]], bow: -63, belly: [-1, -34, 20, 28],
  },
  ball: {
    face: { x: 7.3, y: -38.2, es: 7.9, ang: -0.435, my: 0.6 },
    whisk: [[22, -50, 31.5, -55], [23, -47, 33, -50], [-6, -33, -13, -31], [-6, -30, -12.5, -27]],
    fore: [], spots: [[-12.4, -50.4, 13, 5.5, 0.5]], tail: { pts: [[-21, -9], [-28, -2], [-15, -3]], w: 4.4 },
    head: [7, -40, 18, 14], hat: [2, -59.8], hatAng: -0.25, neck: [[-26, -26], [7, -24], [29, -26]], bow: -27, belly: [5, -24, 20, 16],
  },
  flat: {
    earY: -58.2, earX: 20, face: { x: 21.1, y: -45.2, es: 10.8, ang: 0, my: 1.9 },
    whisk: [[40, -47.5, 49, -49], [40, -44.5, 49, -44], [1.6, -48.5, -7.4, -48.5], [1.6, -43.6, -7.4, -43.2]],
    fore: [17, 20.5, 24], spotsTop: [[-16, 3.8, 6], [-25, 3.6, 6.4]], tail: { B: [-42, -4], len: 19, w: 4.4, ang: 180 },
    head: [21, -43, 26, 17], hat: [19.8, -57.2], neck: [[-4, -60], [-1, -33], [48, -35]], bow: -35, belly: [15, -16, 26, 13],
  },
  back: {
    face: { x: -28.3, y: -26.7, es: 9, ang: -Math.PI / 2, my: 2 },
    whisk: [[-30, -37, -31, -46], [-26.5, -37.5, -25.5, -46], [-30, -16, -31, -7.5], [-26.5, -15.5, -25.5, -7.5]],
    fore: [], marks: [[-13.1, -42.1], [-11.1, -20.1], [31.3, -16.9], [36, -42.4]], tail: { B: [39, -8], len: 12, w: 4.2, ang: -20 },
    head: [-30, -27, 13, 18], hat: [-41, -27], hatAng: -Math.PI / 2, neck: [[-17, -46], [-15, -27], [-17, -8]], bow: -27, belly: [5, -27, 26, 18],
  },
  tommy: {
    earY: -79.5, earX: -1.5, face: { x: -3, y: -67.6, es: 11, ang: 0.1, my: 0 },
    whisk: [[-16, -69.5, -33, -71.5], [-16, -66, -33, -65], [10, -67.5, 27.5, -70.5], [10, -64, 27.5, -63.5]],
    fore: [-6.5, -3, 0.5], chest: { x: -2, y: -4.5, sp: 6 },
    tail: { pts: [[9, -2.5], [30, -3], [33, -14]], w: 4.4 }, head: [-3, -66, 24, 16], hat: [-1.5, -78.6],
    neck: [[-30, -56], [-3, -50], [26, -56]], bow: -55, belly: [-4, -31, 25, 31],
  },
};

function bez(B, C, T, n = 16) {
  const out = [];
  for (let k = 0; k <= n; k++) {
    const t = k / n;
    const m = 1 - t;
    out.push([m * m * B[0] + 2 * m * t * C[0] + t * t * T[0], m * m * B[1] + 2 * m * t * C[1] + t * t * T[1]]);
  }
  return out;
}

function tailCurve(B, deg, bend, len) {
  const th = (deg * Math.PI) / 180;
  const bd = th + (bend * Math.PI) / 180;
  const T = [B[0] + len * Math.cos(th), B[1] + len * Math.sin(th)];
  const C = [B[0] + len * 0.6 * Math.cos(bd), B[1] + len * 0.6 * Math.sin(bd)];
  return bez(B, C, T);
}

export function geometry(P, alt) {
  const kind = (alt && alt[P.body]) || (META[P.body] ? P.body : 'loaf');
  const M = META[kind];
  const base = REF[kind];
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = 0;
  for (const [x, y] of base) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
  }
  const W0 = maxX - minX;
  const H0 = -minY;
  const kx = (W0 + P.sw) / W0;
  const ky = (H0 - P.sh) / H0;
  const T = ([x, y]) => [P.x + x * kx, P.y + y * ky];
  const groups = [[], []];
  const pts = base.map(([x0, y0], i) => {
    let x = x0;
    let y = P.legs ? Math.min(y0, -2) : y0;
    if (M.earY !== undefined && y < M.earY) groups[x < M.earX ? 0 : 1].push(i);
    if (M.paws && P.pw) {
      M.paws.forEach((px, k) => {
        const o = P.pw[k];
        if (o && y0 > -2.8 && Math.abs(x0 - px) < 4.5) {
          x += o[0];
          y -= o[1];
        }
      });
    }
    return [x, y];
  });
  const ears = groups.map((idx, side) => {
    if (!idx.length) return null;
    const bx = idx.reduce((s, i) => s + base[i][0], 0) / idx.length;
    const a = ((side ? P.ea + P.eb : -P.ea) * Math.PI) / 180;
    const c = Math.cos(a);
    const sn = Math.sin(a);
    let tip = null;
    for (const i of idx) {
      const dx = base[i][0] - bx;
      const dy = base[i][1] - M.earY;
      pts[i] = [bx + dx * c - dy * sn, M.earY + dx * sn + dy * c];
      if (!tip || pts[i][1] < tip[1]) tip = pts[i];
    }
    return { base: T([bx, M.earY]), tip: T(tip) };
  }).filter(Boolean);
  const out = clockwise(pts.map(T));
  const top = topOf(out);
  const edge = edgeOf(out);
  const tl = M.tail;
  let tail;
  if (tl.pts) {
    const [B, C, E] = tl.pts.map(T);
    tail = { pts: bez(B, C, E), w: tl.w, front: true };
  } else {
    const deg = P.tail === -163 && (tl.ang !== undefined || tl.side) ? (tl.side ? -25 : -tl.ang) : P.tail;
    tail = { pts: tailCurve(T(tl.B), deg, P.tw, tl.len * P.tl), w: tl.w, front: !!P.tailFront };
  }
  const spots = [];
  for (const [x, w, l] of M.spotsTop || []) {
    const [sx] = T([x, 0]);
    spots.push({ x: sx, y: top(sx) + 1, rx: w / 2, ry: l * 0.8, rot: Math.atan2(top(sx + 1) - top(sx - 1), 2) });
  }
  for (const [y, side] of M.spotsEdge || []) {
    const [, sy] = T([0, y]);
    spots.push({ x: edge(sy, side) - side * 0.5, y: sy, rx: 4.4, ry: 3.2, rot: 0 });
  }
  for (const [x, y, rx, ry, rot] of M.spots || []) {
    const [sx, sy] = T([x, y]);
    spots.push({ x: sx, y: sy, rx, ry, rot });
  }
  const [fx, fy] = T([M.face.x, M.face.y]);
  const [hx, hy] = T(M.head);
  const [tx, ty] = T(M.hat);
  const [bx, by] = T(M.belly);
  const g = {
    body: kind, pts: out, top, edge, cx: P.x, bot: P.y, T: P.y - H0 * ky, W: W0 * kx, H: H0 * ky,
    L: P.x + minX * kx, R: P.x + maxX * kx, ears,
    face: { x: fx, y: fy, es: M.face.es, ang: M.face.ang, my: M.face.my },
    whisk: M.whisk.map(([a, b, c, d]) => [...T([a, b]), ...T([c, d])]),
    fore: M.fore.map((x) => {
      const [sx] = T([x, 0]);
      return { x: sx, y: top(sx) };
    }),
    spots, tail,
    marks: (M.marks || []).map(T),
    head: { x: hx, y: hy, rx: M.head[2] * kx, ry: M.head[3] * ky },
    hat: { x: tx, y: ty, ang: M.hatAng || 0 },
    neck: M.neck.map(T), hem: P.y - 4, bowY: T([0, M.bow])[1],
    belly: { x: bx, y: by, rx: M.belly[2] * kx, ry: M.belly[3] * ky },
    chest: M.chest && { x: T([M.chest.x, 0])[0], y: T([0, M.chest.y])[1], sp: M.chest.sp },
    earY: M.earY !== undefined ? T([0, M.earY])[1] : -Infinity,
  };
  const [px, py] = P.rot && Math.abs(P.rot) < 0.6 ? [g.cx, g.bot] : [P.x, P.y - g.H / 2];
  let m = new DOMMatrix().translate(px, py).rotate((P.rot * 180) / Math.PI).translate(-px, -py);
  if (P.rest) {
    let low = -Infinity;
    for (const [x, y] of g.pts) low = Math.max(low, m.transformPoint({ x, y }).y);
    m = new DOMMatrix().translate(0, -low).multiply(m);
  }
  if (P.kx) m = new DOMMatrix([1, 0, -P.kx / 60, 1, (P.kx / 60) * g.bot, 0]).multiply(m);
  g.m = m;
  return g;
}
