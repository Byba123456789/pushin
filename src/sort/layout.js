import { CAP } from './logic.js';

const MARGIN = 2;
const GAP = 1.2;
const MAX_JAR_W = 30;
const LAYER_RATIO = 0.7;
const ROW_GAP = 12;
const LIFT_LAYERS = 0.9;
const BODY_PAD = 3;
const MAX_ONE_ROW = 7;

export function layoutJars(count, { width, top, bottom }) {
  const rows = count > MAX_ONE_ROW ? 2 : 1;
  const perRow = Math.ceil(count / rows);
  const pitch = (width - 2 * MARGIN) / perRow;
  const jarW = Math.min(pitch - GAP, MAX_JAR_W);
  const fit = ((bottom - top) / rows - ROW_GAP - BODY_PAD) / (CAP + LIFT_LAYERS);
  const layerH = Math.min(jarW * LAYER_RATIO, fit);
  const jarH = CAP * layerH + BODY_PAD;
  const rowH = jarH + layerH * LIFT_LAYERS + ROW_GAP;
  const start = top + (bottom - top - rows * rowH) / 2 + layerH * LIFT_LAYERS;
  const jars = Array.from({ length: count }, (_, i) => {
    const row = Math.floor(i / perRow);
    const inRow = row === 0 ? Math.min(perRow, count) : count - perRow;
    const col = i - row * perRow;
    const x = width / 2 + (col - (inRow - 1) / 2) * pitch;
    return { x, y: start + row * rowH + jarH };
  });
  return { jars, jarW, jarH, layerH, pitch };
}
