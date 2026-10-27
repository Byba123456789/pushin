const TILT = 1.25;
const APPROACH = 0.3;
const RETURN_AT = 0.78;
const FLOW_FROM = 0.28;
const FLOW_TO = 0.72;
const BASE_MS = 350;
const MS_PER_LAYER = 25;

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const smooth = (v) => v * v * (3 - 2 * v);
const lerp = (a, b, k) => a + (b - a) * k;

export const pourDuration = (moved) => BASE_MS + MS_PER_LAYER * moved;

// тело баночки уходит в сторону, противоположную наклону, и не должно вылезать за экран
export function pourDir(fromX, toX, width, h) {
  const reach = h * Math.sin(TILT);
  const fits = (dir) => (dir > 0 ? toX - reach >= 0 : toX + reach <= width);
  const natural = Math.sign(toX - fromX) || 1;
  return fits(natural) ? natural : -natural;
}

// from и to — низ баночек в покое; dir = 1 наклон вправо, -1 влево
export function pourPose(t, from, to, geo, dir) {
  const { w, h, layerH } = geo;
  const tilt = smooth(clamp01(t / APPROACH)) * (1 - smooth(clamp01((t - RETURN_AT) / (1 - RETURN_AT))));
  const flow = smooth(clamp01((t - FLOW_FROM) / (FLOW_TO - FLOW_FROM)));
  const angle = dir * TILT * tilt;
  const sin = Math.sin(dir * TILT);
  const cos = Math.cos(dir * TILT);
  const lx = (dir * w) / 2;
  const goal = { x: to.x - dir * w * 0.1, y: to.y - h - layerH * 0.9 };
  const hold = { x: goal.x - (lx * cos + h * sin), y: goal.y - (lx * sin - h * cos) };
  const x = lerp(from.x, hold.x, tilt);
  const y = lerp(from.y, hold.y, tilt);
  const a = angle;
  const lip = { x: x + lx * Math.cos(a) + h * Math.sin(a), y: y + lx * Math.sin(a) - h * Math.cos(a) };
  return { x, y, angle, flow, lip, stream: flow > 0 && flow < 1 ? 1 : 0 };
}
