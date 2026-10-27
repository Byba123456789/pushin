const TAU = Math.PI * 2;

function polygon(ctx, pts, r) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x * r, y * r) : ctx.moveTo(x * r, y * r)));
  ctx.closePath();
  ctx.fill();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

const SHAPES = [
  (ctx, r) => {
    ctx.beginPath();
    ctx.moveTo(0, r * 0.85);
    ctx.bezierCurveTo(-r * 1.4, r * 0.05, -r * 0.8, -r * 0.95, 0, -r * 0.3);
    ctx.bezierCurveTo(r * 0.8, -r * 0.95, r * 1.4, r * 0.05, 0, r * 0.85);
    ctx.fill();
  },
  (ctx, r) => {
    circle(ctx, 0, 0, r * 0.55);
    ctx.lineWidth = r * 0.28;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * TAU) / 8;
      ctx.moveTo(Math.cos(a) * r * 0.82, Math.sin(a) * r * 0.82);
      ctx.lineTo(Math.cos(a) * r * 1.05, Math.sin(a) * r * 1.05);
    }
    ctx.stroke();
  },
  (ctx, r) => {
    const pts = Array.from({ length: 10 }, (_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const d = i % 2 ? 0.45 : 1.05;
      return [Math.cos(a) * d, Math.sin(a) * d];
    });
    polygon(ctx, pts, r);
  },
  (ctx, r) => {
    ctx.beginPath();
    ctx.moveTo(-r * 0.85, r * 0.85);
    ctx.quadraticCurveTo(-r * 1.05, -r * 0.7, r * 0.85, -r * 0.85);
    ctx.quadraticCurveTo(r * 1.05, r * 0.7, -r * 0.85, r * 0.85);
    ctx.fill();
  },
  (ctx, r) => {
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.bezierCurveTo(r * 0.35, -r * 0.45, r * 0.75, -r * 0.05, r * 0.75, r * 0.3);
    ctx.arc(0, r * 0.3, r * 0.75, 0, Math.PI);
    ctx.bezierCurveTo(-r * 0.75, -r * 0.05, -r * 0.35, -r * 0.45, 0, -r);
    ctx.fill();
  },
  (ctx, r) => {
    circle(ctx, -r * 0.5, r * 0.15, r * 0.45);
    circle(ctx, r * 0.05, -r * 0.2, r * 0.55);
    circle(ctx, r * 0.55, r * 0.2, r * 0.4);
    ctx.fillRect(-r * 0.5, r * 0.15, r * 1.05, r * 0.45);
  },
  (ctx, r) => {
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.95, -Math.PI / 2, Math.PI / 2, true);
    ctx.quadraticCurveTo(r * 0.5, 0, 0, -r * 0.95);
    ctx.fill();
  },
  (ctx, r) => {
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * TAU) / 5;
      circle(ctx, Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6, r * 0.4);
    }
    circle(ctx, 0, 0, r * 0.35);
  },
  (ctx, r) => polygon(ctx, [[0, -1], [0.8, 0], [0, 1], [-0.8, 0]], r),
  (ctx, r) => {
    ctx.beginPath();
    ctx.ellipse(0, r * 0.35, r * 0.6, r * 0.5, 0, 0, TAU);
    ctx.fill();
    for (const [x, y] of [[-0.7, -0.1], [-0.28, -0.6], [0.28, -0.6], [0.7, -0.1]]) circle(ctx, x * r, y * r, r * 0.22);
  },
  (ctx, r) => polygon(ctx, [[0.2, -1], [-0.65, 0.1], [-0.05, 0.1], [-0.2, 1], [0.65, -0.2], [0.05, -0.2]], r),
  (ctx, r) => {
    ctx.lineWidth = r * 0.4;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.7, 0, TAU);
    ctx.stroke();
  },
];

export const ICON_COUNT = SHAPES.length;

export function drawIcon(ctx, kind, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  SHAPES[kind](ctx, r);
  ctx.restore();
}
