import { drawIcon } from './icons.js';

const INK = '#4b2e1e';
const GLASS = 'rgba(255, 255, 255, 0.42)';
const BISECT_STEPS = 22;
const MIN_ICON_FILL = 0.55;

export const COLORS = [
  '#ff8fa3', '#ffb35c', '#ffe36e', '#8fdc6f', '#37bfa0', '#8fdcf5',
  '#4f86f0', '#b58cf5', '#e45fb0', '#b78560', '#f4efe6', '#7d8799',
];

const luma = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b;
};
const ICON_INK = COLORS.map((c) => (luma(c) > 170 ? 'rgba(75, 46, 30, 0.62)' : 'rgba(255, 255, 255, 0.92)'));

function bodyPath(ctx, w, h) {
  const r = w * 0.32;
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h);
  ctx.lineTo(-w / 2, -r);
  ctx.arcTo(-w / 2, 0, -w / 2 + r, 0, r);
  ctx.lineTo(w / 2 - r, 0);
  ctx.arcTo(w / 2, 0, w / 2, -r, r);
  ctx.lineTo(w / 2, -h);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function areaBelow(poly, level) {
  let area = 0;
  let prev = poly[poly.length - 1];
  const out = [];
  for (const cur of poly) {
    const inCur = cur.y >= level;
    const inPrev = prev.y >= level;
    if (inCur !== inPrev) {
      const k = (level - prev.y) / (cur.y - prev.y);
      out.push({ x: prev.x + (cur.x - prev.x) * k, y: level });
    }
    if (inCur) out.push(cur);
    prev = cur;
  }
  for (let i = 0; i < out.length; i++) {
    const a = out[i];
    const b = out[(i + 1) % out.length];
    area += a.x * b.y - b.x * a.y;
  }
  return Math.abs(area) / 2;
}

function levelFor(poly, volume, lo, hi) {
  let top = lo;
  let bottom = hi;
  for (let i = 0; i < BISECT_STEPS; i++) {
    const mid = (top + bottom) / 2;
    if (areaBelow(poly, mid) > volume) top = mid;
    else bottom = mid;
  }
  return (top + bottom) / 2;
}

// высоты поверхности после каждого слоя в мировых координатах; жидкость лежит горизонтально при любом наклоне
function surfaceLevels(jar, geo) {
  const { x, y, angle } = jar;
  const { w, h, layerH } = geo;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const poly = [[-w / 2, 0], [w / 2, 0], [w / 2, -h], [-w / 2, -h]].map(([lx, ly]) => ({
    x: x + lx * cos - ly * sin,
    y: y + lx * sin + ly * cos,
  }));
  const ys = poly.map((p) => p.y);
  const lo = Math.min(...ys);
  const hi = Math.max(...ys);
  const levels = [hi];
  let volume = 0;
  for (const layer of jar.layers) {
    volume += layer.fill * w * layerH;
    levels.push(angle === 0 ? y - volume / w : levelFor(poly, volume, lo, hi));
  }
  return levels;
}

function drawLiquid(ctx, jar, geo) {
  const { x, y, angle } = jar;
  const { w, h, layerH } = geo;
  const levels = surfaceLevels(jar, geo);
  const reach = h + w;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  bodyPath(ctx, w, h);
  ctx.closePath();
  ctx.clip();
  ctx.rotate(-angle);
  ctx.translate(-x, -y);
  jar.layers.forEach((layer, i) => {
    if (layer.fill <= 0) return;
    ctx.fillStyle = COLORS[layer.color];
    ctx.fillRect(x - reach, levels[i + 1], reach * 2, levels[i] - levels[i + 1] + 0.4);
  });
  const hasLiquid = jar.layers.some((l) => l.fill > 0);
  if (hasLiquid) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(x - reach, levels[jar.layers.length] - 0.2, reach * 2, 0.7);
  }
  ctx.restore();

  const cos = Math.cos(angle);
  const r = Math.min(w * 0.28, layerH * 0.34);
  jar.layers.forEach((layer, i) => {
    if (layer.fill < MIN_ICON_FILL) return;
    const mid = (levels[i] + levels[i + 1]) / 2;
    const s = Math.max(0, Math.min(h, (y - mid) / cos));
    ctx.fillStyle = ICON_INK[layer.color];
    ctx.strokeStyle = ICON_INK[layer.color];
    drawIcon(ctx, layer.color, x + s * Math.sin(angle), mid, r * Math.min(1, layer.fill));
  });
}

function drawLid(ctx, jar, geo) {
  const { w, h } = geo;
  const k = jar.lid;
  const color = jar.lidColor;
  ctx.save();
  ctx.globalAlpha = k;
  ctx.translate(0, -(1 - k) * 8);
  ctx.fillStyle = color;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1;
  roundRect(ctx, -w / 2 - 0.6, -h - 6.6, w + 1.2, 5, 1.6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  roundRect(ctx, -w / 2 + 1.4, -h - 5.7, w * 0.5, 1.1, 0.5);
  ctx.fill();
  ctx.restore();
}

export function drawJar(ctx, jar, geo) {
  const { w, h } = geo;
  ctx.save();
  ctx.translate(jar.x, jar.y);
  ctx.rotate(jar.angle);
  bodyPath(ctx, w, h);
  ctx.closePath();
  ctx.fillStyle = GLASS;
  ctx.fill();
  ctx.restore();

  drawLiquid(ctx, jar, geo);

  ctx.save();
  ctx.translate(jar.x, jar.y);
  ctx.rotate(jar.angle);
  bodyPath(ctx, w, h);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.1;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  roundRect(ctx, -w / 2 + 1.7, -h + 4, 1.6, h * 0.5, 0.8);
  ctx.fill();
  ctx.fillStyle = '#fffaf3';
  roundRect(ctx, -w / 2 - 1.2, -h - 2.2, w + 2.4, 2.8, 1.2);
  ctx.fill();
  ctx.stroke();
  if (jar.lid > 0) drawLid(ctx, jar, geo);
  ctx.restore();
}

export function drawShadow(ctx, x, y, w, lifted) {
  ctx.fillStyle = `rgba(75, 46, 30, ${0.16 - lifted * 0.07})`;
  ctx.beginPath();
  ctx.ellipse(x, y + 0.6, w * (0.56 - lifted * 0.08), 1.7, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function drawStream(ctx, from, toY, color, width) {
  if (toY <= from.y) return;
  ctx.lineCap = 'round';
  ctx.strokeStyle = INK;
  ctx.lineWidth = width + 1.4;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(from.x, toY);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(from.x, toY, width * 1.5, width * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function drawShelf(ctx, width, y) {
  ctx.fillStyle = 'rgba(75, 46, 30, 0.1)';
  roundRect(ctx, 5, y + 4, width - 10, 3, 1.5);
  ctx.fill();
  ctx.fillStyle = '#efc08f';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 0.9;
  roundRect(ctx, 3, y, width - 6, 5, 1.8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  roundRect(ctx, 5, y + 0.9, width - 10, 1.1, 0.5);
  ctx.fill();
}

export function drawBackground(ctx, width, height, floorY) {
  const wall = ctx.createLinearGradient(0, 0, 0, floorY);
  wall.addColorStop(0, '#ffe7ee');
  wall.addColorStop(1, '#ffd9cc');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, width, floorY);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  for (let row = 0, y = 8; y < floorY; row++, y += 14) {
    for (let x = row % 2 ? 14 : 7; x < width; x += 14) {
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = '#f7c9a3';
  ctx.fillRect(0, floorY, width, height - floorY);
  ctx.fillStyle = '#fff3e6';
  ctx.fillRect(0, floorY - 3, width, 3);
  ctx.fillStyle = INK;
  ctx.fillRect(0, floorY - 3.5, width, 0.8);
  ctx.fillRect(0, floorY, width, 0.8);
  ctx.fillStyle = 'rgba(75, 46, 30, 0.1)';
  for (let x = 20; x < width; x += 40) ctx.fillRect(x, floorY + 1, 0.7, height - floorY);
}

export function drawRug(ctx, x, y) {
  ctx.fillStyle = '#f7a8c0';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.ellipse(x, y, 36, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffd3df';
  ctx.beginPath();
  ctx.ellipse(x, y, 26, 4.6, 0, 0, Math.PI * 2);
  ctx.fill();
}
