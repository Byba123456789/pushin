const BLUSH = '#f6a5b6';
const TEAR = '#a8dcf5';
const MOUTH_IN = '#f08aa3';

function line(ctx, pts) {
  ctx.beginPath();
  ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.stroke();
}

function arc(ctx, x, y, r, a0, a1) {
  ctx.beginPath();
  ctx.arc(x, y, r, a0, a1);
  ctx.stroke();
}

export function drop(ctx, x, y, s = 1, col = TEAR, edge) {
  ctx.beginPath();
  ctx.moveTo(x, y - 2.6 * s);
  ctx.bezierCurveTo(x + 0.6 * s, y - 1.2 * s, x + 1.7 * s, y - 0.2 * s, x + 1.7 * s, y + 0.7 * s);
  ctx.arc(x, y + 0.7 * s, 1.7 * s, 0, Math.PI);
  ctx.bezierCurveTo(x - 1.7 * s, y - 0.2 * s, x - 0.6 * s, y - 1.2 * s, x, y - 2.6 * s);
  ctx.fillStyle = col;
  ctx.fill();
  if (edge) {
    ctx.strokeStyle = edge;
    ctx.lineWidth = 0.7;
    ctx.stroke();
  }
}

function eye(ctx, type, x, y, s, lw) {
  switch (type) {
    case 'happy':
      arc(ctx, x, y + 1, 2.4, Math.PI * 1.1, Math.PI * 1.9);
      break;
    case 'content':
      arc(ctx, x, y - 1.2, 2.4, Math.PI * 0.15, Math.PI * 0.85);
      break;
    case 'closed':
    case 'sleep':
    case 'dash':
      line(ctx, [x - 2.3, y + 0.3, x + 2.3, y + 0.3]);
      break;
    case 'x':
      line(ctx, [x - 1.6 * s, y - 2, x + 1.5 * s, y, x - 1.6 * s, y + 2]);
      break;
    case 'ring':
      ctx.lineWidth = lw * 0.9;
      arc(ctx, x, y, 2.5, 0, Math.PI * 2);
      ctx.beginPath();
      ctx.arc(x, y, 0.9, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'half':
      ctx.beginPath();
      ctx.arc(x, y, 2.1, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      line(ctx, [x - 2.5, y, x + 2.5, y]);
      break;
    case 'big':
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    default:
      ctx.beginPath();
      ctx.arc(x, y, 2.1, 0, Math.PI * 2);
      ctx.fill();
  }
}

function mouth(ctx, type, x, y) {
  switch (type) {
    case 'open':
      ctx.beginPath();
      ctx.ellipse(x, y + 1.6, 1.6, 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = MOUTH_IN;
      ctx.fill();
      ctx.stroke();
      break;
    case 'yawn':
      ctx.beginPath();
      ctx.ellipse(x, y + 2.6, 2.6, 3.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = MOUTH_IN;
      ctx.fill();
      ctx.stroke();
      break;
    case 'laugh':
      ctx.beginPath();
      ctx.moveTo(x - 3, y);
      ctx.lineTo(x + 3, y);
      ctx.quadraticCurveTo(x + 2.6, y + 4.2, x, y + 4.2);
      ctx.quadraticCurveTo(x - 2.6, y + 4.2, x - 3, y);
      ctx.closePath();
      ctx.fillStyle = MOUTH_IN;
      ctx.fill();
      ctx.stroke();
      break;
    case 'frown':
      line(ctx, [x - 2, y + 1.8, x, y, x + 2, y + 1.8]);
      break;
    case 'flat':
      line(ctx, [x - 2, y + 0.8, x + 2, y + 0.8]);
      break;
    case 'kiss':
      ctx.beginPath();
      ctx.moveTo(x - 0.8, y - 0.6);
      ctx.quadraticCurveTo(x + 1.8, y - 0.2, x, y + 1);
      ctx.quadraticCurveTo(x + 1.8, y + 2.2, x - 0.8, y + 2.6);
      ctx.stroke();
      break;
    case 'chew':
      ctx.beginPath();
      ctx.ellipse(x, y + 1, 1.3, 1, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 'tongue':
      mouth(ctx, 'w', x, y);
      ctx.beginPath();
      ctx.ellipse(x, y + 2.2, 1.3, 1.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = MOUTH_IN;
      ctx.fill();
      ctx.stroke();
      break;
    case 'wavy':
      line(ctx, [x - 2.6, y + 1, x - 1.3, y, x, y + 1, x + 1.3, y, x + 2.6, y + 1]);
      break;
    default:
      ctx.beginPath();
      ctx.moveTo(x, y - 1.3);
      ctx.lineTo(x, y + 0.4);
      ctx.moveTo(x - 2.6, y + 0.1);
      ctx.quadraticCurveTo(x - 1.3, y + 2.1, x, y + 0.4);
      ctx.quadraticCurveTo(x + 1.3, y + 2.1, x + 2.6, y + 0.1);
      ctx.stroke();
  }
}

export function drawFace(ctx, g, P, pal, lw) {
  const { x: fx, y: ey, es, ang, my } = g.face;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = pal.line;
  ctx.fillStyle = pal.line;
  ctx.lineWidth = lw * 0.62;
  for (const w of g.whisk) line(ctx, w);
  ctx.translate(fx, ey);
  ctx.rotate(ang);
  if (P.blush) {
    ctx.fillStyle = BLUSH;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(s * (es + 1.5), 4.2, 3, 1.7, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = pal.line;
  }
  ctx.lineWidth = lw * 0.82;
  const [lx, ly] = P.look || [0, 0];
  for (const s of [-1, 1]) eye(ctx, P.eyes, s * es + lx, ly, s, lw);
  if (P.brows) {
    for (const s of [-1, 1]) {
      const x = s * es;
      const y = -4.6;
      const tilt = P.brows === 'angry' ? 1.3 : P.brows === 'sad' ? -1.3 : 0;
      line(ctx, [x - 2.4 * s, y + tilt, x + 2.2 * s, y - tilt]);
    }
  }
  mouth(ctx, P.mouth, 0, my - 0.6);
  if (P.tear) drop(ctx, es + 0.5, 4.6 + P.tear * 1.8, 1, TEAR);
  if (P.sweat) drop(ctx, -es - 7, -6, 1.1, TEAR);
  ctx.restore();
}
