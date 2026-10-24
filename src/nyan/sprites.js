import { scale } from '../core/engine.js';

export const OUT = '#4b2e1e';
export const PASTEL = ['#ff9aa8', '#ffc48a', '#ffe27a', '#a8e6b0', '#9bd0f5', '#c3aef5'];
const BLUSH = '#f6a5b6';
const TAU = Math.PI * 2;
const ICON_RES = 6;

function line(g, lw = 1.1) {
  g.lineWidth = lw;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.strokeStyle = OUT;
}

function ink(g, fill, lw = 1.1) {
  if (fill) {
    g.fillStyle = fill;
    g.fill();
  }
  line(g, lw);
  g.stroke();
}

function circle(g, x, y, r) {
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
}

function dot(g, x, y, r, color = OUT) {
  circle(g, x, y, r);
  g.fillStyle = color;
  g.fill();
}

function pill(g, x, y, w, h) {
  const r = Math.min(w, h) / 2;
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function blob(g, circles, fill, outline, lw) {
  g.lineWidth = lw * 2;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.strokeStyle = outline;
  for (const [x, y, r] of circles) {
    circle(g, x, y, r);
    g.stroke();
  }
  g.fillStyle = fill;
  for (const [x, y, r] of circles) {
    circle(g, x, y, r);
    g.fill();
  }
}

function face(g, x, y, { mouth = 'smile', brows = 0, blush = true, spread = 1.6 } = {}) {
  if (blush) {
    g.globalAlpha = 0.75;
    dot(g, x - spread - 1.3, y + 1.1, 0.95, BLUSH);
    dot(g, x + spread + 1.3, y + 1.1, 0.95, BLUSH);
    g.globalAlpha = 1;
  }
  dot(g, x - spread, y, 0.6);
  dot(g, x + spread, y, 0.6);
  line(g, 0.5);
  g.beginPath();
  if (mouth === 'smile') {
    g.arc(x, y + 0.5, 0.9, 0.15 * Math.PI, 0.85 * Math.PI);
  } else if (mouth === 'frown') {
    g.arc(x, y + 2.2, 1.1, 1.15 * Math.PI, 1.85 * Math.PI);
  } else {
    g.ellipse(x, y + 1.7, 0.55, 0.75, 0, 0, TAU);
  }
  g.stroke();
  if (brows) {
    g.beginPath();
    g.moveTo(x - spread - 1, y - 1.4 - brows);
    g.lineTo(x - spread + 0.9, y - 1.4 + brows * 0.4);
    g.moveTo(x + spread + 1, y - 1.4 - brows);
    g.lineTo(x + spread - 0.9, y - 1.4 + brows * 0.4);
    g.stroke();
  }
}

const DEFS = {
  coin: {
    w: 14, h: 14,
    draw(g) {
      circle(g, 0, 0, 5.4);
      ink(g, '#ffd45e');
      circle(g, 0, 0, 3.7);
      g.strokeStyle = '#eba929';
      g.lineWidth = 0.6;
      g.stroke();
      g.globalAlpha = 0.85;
      g.beginPath();
      g.arc(0, 0, 4.4, 1.15 * Math.PI, 1.6 * Math.PI);
      g.strokeStyle = '#fff';
      g.lineWidth = 0.8;
      g.stroke();
      g.globalAlpha = 1;
      g.beginPath();
      g.ellipse(0, 1, 1.7, 1.3, 0, 0, TAU);
      g.fillStyle = BLUSH;
      g.fill();
      dot(g, -1.6, -0.7, 0.55, BLUSH);
      dot(g, 0, -1.4, 0.55, BLUSH);
      dot(g, 1.6, -0.7, 0.55, BLUSH);
    },
  },
  cookie: {
    w: 15, h: 15,
    draw(g) {
      circle(g, 0, 0, 5.8);
      ink(g, '#eab87b');
      dot(g, -3, -2.6, 0.9, '#7a4a2e');
      dot(g, 3.1, -2.2, 0.9, '#7a4a2e');
      dot(g, -3.4, 2.4, 0.9, '#7a4a2e');
      dot(g, 3, 3, 0.9, '#7a4a2e');
      dot(g, 0.2, -4, 0.7, '#7a4a2e');
      face(g, 0, 0.2, { spread: 1.5 });
    },
  },
  heart: {
    w: 14, h: 13,
    draw(g) {
      g.beginPath();
      g.moveTo(0, 4.8);
      g.bezierCurveTo(-6.8, 0.2, -4.8, -5.4, -2.2, -4.5);
      g.bezierCurveTo(-1, -4.1, -0.2, -3.3, 0, -2.5);
      g.bezierCurveTo(0.2, -3.3, 1, -4.1, 2.2, -4.5);
      g.bezierCurveTo(4.8, -5.4, 6.8, 0.2, 0, 4.8);
      g.closePath();
      ink(g, '#ff8fab');
      g.beginPath();
      g.ellipse(-3, -2, 1.1, 0.7, -0.6, 0, TAU);
      g.fillStyle = 'rgba(255,255,255,0.85)';
      g.fill();
    },
  },
  star: {
    w: 17, h: 17,
    draw(g) {
      g.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 ? 3.6 : 7;
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        g.lineTo(Math.cos(a) * r, Math.sin(a) * r + 0.4);
      }
      g.closePath();
      ink(g, '#ffe27a', 1.3);
      face(g, 0, 0.4, { spread: 1.5 });
    },
  },
  cucH: { w: 25, h: 13, draw: (g) => cucumber(g, false) },
  cucV: { w: 13, h: 25, draw: (g) => cucumber(g, true) },
  cloud: { w: 36, h: 32, draw: (g) => stormCloud(g, true) },
  cloudOff: { w: 36, h: 32, draw: (g) => stormCloud(g, false) },
  vacuum: { w: 32, h: 26, draw: vacuum },
  planetMint: { w: 38, h: 38, draw: (g) => planet(g, '#a8e6cf', '#7fcdb2', false) },
  planetPeach: { w: 48, h: 40, draw: (g) => planet(g, '#ffd2a6', '#ffb98a', true) },
  cloudBig: { w: 70, h: 38, draw: (g) => softCloud(g, [[-20, 4, 9], [-8, -3, 12], [8, -1, 11], [20, 5, 8], [0, 6, 10]]) },
  cloudSmall: { w: 44, h: 26, draw: (g) => softCloud(g, [[-11, 3, 6.5], [-2, -2, 8.5], [9, 1, 7], [0, 5, 7]]) },
};

function cucumber(g, vertical) {
  g.save();
  if (vertical) g.rotate(-Math.PI / 2);
  pill(g, -10.5, -4.5, 21, 9);
  ink(g, '#a6dd8f');
  g.save();
  pill(g, -10.5, -4.5, 21, 9);
  g.clip();
  g.fillStyle = '#8acb74';
  g.fillRect(-11, 1.2, 22, 4);
  g.restore();
  line(g, 1.2);
  pill(g, -10.5, -4.5, 21, 9);
  g.stroke();
  line(g, 0.9);
  g.strokeStyle = '#d6f2c6';
  g.beginPath();
  g.moveTo(-7, -2.4);
  g.lineTo(-1, -2.4);
  g.stroke();
  g.beginPath();
  g.ellipse(-10.6, 0, 1.4, 2.2, 0, 0, TAU);
  ink(g, '#f2d56b', 0.9);
  for (const [x, y] of [[-6, 1.5], [-3, 2.8], [-8, 2.6]]) dot(g, x, y, 0.5, '#6fb865');
  g.restore();
  const fx = vertical ? 0 : 3.6;
  const fy = vertical ? -3.6 : 0;
  face(g, fx, fy, { mouth: 'o', spread: 1.5 });
}

function stormCloud(g, bolt) {
  blob(g, [[-9, -3, 6.5], [-1, -7, 8], [8, -4, 7], [0, -1, 7.5]], '#d1cbe8', OUT, 1.1);
  g.globalAlpha = 0.8;
  g.beginPath();
  g.arc(-1, -7, 5.2, 1.15 * Math.PI, 1.55 * Math.PI);
  g.strokeStyle = '#fff';
  g.lineWidth = 0.8;
  g.lineCap = 'round';
  g.stroke();
  g.globalAlpha = 1;
  face(g, 0, -3.4, { mouth: 'frown', brows: 1, spread: 2.6 });
  if (!bolt) return;
  g.beginPath();
  g.moveTo(2.2, 5);
  g.lineTo(-3, 10);
  g.lineTo(-0.2, 10);
  g.lineTo(-2.8, 14.6);
  g.lineTo(4.2, 8.4);
  g.lineTo(1.2, 8.4);
  g.lineTo(4.4, 5);
  g.closePath();
  ink(g, '#ffe27a', 1);
}

function vacuum(g) {
  g.beginPath();
  g.moveTo(-12, 3.6);
  g.bezierCurveTo(-14, 8, -9, 10, -7, 6);
  line(g, 2.6);
  g.stroke();
  g.strokeStyle = '#d9d2e6';
  g.lineWidth = 1;
  g.stroke();
  pill(g, -15.5, 0.6, 7, 5.4);
  ink(g, '#d9d2e6', 1);
  pill(g, -4, -11, 11, 6);
  ink(g, '#8bd3bb', 1);
  pill(g, -8.5, -7.5, 21, 14.5);
  ink(g, '#9fdcc8');
  dot(g, -3.8, 8.6, 2.7, '#a59fa9');
  circle(g, -3.8, 8.6, 2.7);
  ink(g, null, 1);
  dot(g, 8, 8.6, 2.7, '#a59fa9');
  circle(g, 8, 8.6, 2.7);
  ink(g, null, 1);
  face(g, 2, -1, { mouth: 'o', brows: 0.7, spread: 2.3 });
}

function planet(g, base, shade, ring) {
  const r = 12;
  const tilt = -0.35;
  const ringPath = (from, to) => {
    g.beginPath();
    g.ellipse(0, 0, 21, 5.5, tilt, from, to);
  };
  if (ring) {
    ringPath(Math.PI, TAU);
    line(g, 3.4);
    g.stroke();
    ringPath(Math.PI, TAU);
    g.strokeStyle = '#fff5c8';
    g.lineWidth = 1.4;
    g.stroke();
  }
  circle(g, 0, 0, r);
  ink(g, base, 1.2);
  g.save();
  circle(g, 0, 0, r);
  g.clip();
  g.fillStyle = shade;
  if (ring) {
    g.fillRect(-r, -4, r * 2, 4);
    g.fillRect(-r, 5, r * 2, 3);
  } else {
    dot(g, -4, -4, 2.2, shade);
    dot(g, 4, 3, 3, shade);
    dot(g, -3, 6, 1.4, shade);
  }
  g.restore();
  circle(g, 0, 0, r);
  line(g, 1.2);
  g.stroke();
  if (ring) {
    ringPath(0, Math.PI);
    line(g, 3.4);
    g.stroke();
    ringPath(0, Math.PI);
    g.strokeStyle = '#fff5c8';
    g.lineWidth = 1.4;
    g.stroke();
  }
}

function softCloud(g, circles) {
  blob(g, circles, '#fffaf6', '#c4b0ea', 0.9);
}

let built = 0;
let cache = {};

function render(def, res) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(def.w * res);
  c.height = Math.ceil(def.h * res);
  const g = c.getContext('2d');
  g.scale(res, res);
  g.translate(def.w / 2, def.h / 2);
  def.draw(g);
  return { c, w: c.width / res, h: c.height / res };
}

export function sprite(name) {
  if (built !== scale) {
    built = scale;
    cache = {};
  }
  return cache[name] || (cache[name] = render(DEFS[name], scale));
}

export function blit(ctx, s, x, y, sx = 1) {
  const w = s.w * sx;
  const dx = Math.round((x - w / 2) * scale) / scale;
  const dy = Math.round((y - s.h / 2) * scale) / scale;
  ctx.drawImage(s.c, dx, dy, w, s.h);
}

const urls = {};

export function iconUrl(name) {
  if (!urls[name]) urls[name] = render(DEFS[name], ICON_RES).c.toDataURL();
  return urls[name];
}
