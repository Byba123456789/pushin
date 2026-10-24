export const W = 180;
export let H = 320;

const canvas = document.getElementById('game');
export const ctx = canvas.getContext('2d');
export let scale = 1;

let scene = null;
const scenes = {};

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  scale = Math.min((vw * dpr) / W, (vh * dpr) / 300);
  H = Math.max(300, Math.floor((vh * dpr) / scale));
  canvas.width = Math.round(W * scale);
  canvas.height = Math.round(H * scale);
  canvas.style.width = (W * scale) / dpr + 'px';
  canvas.style.height = (H * scale) / dpr + 'px';
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  document.documentElement.style.setProperty('--px', scale / dpr + 'px');
  if (scene && scene.resize) scene.resize();
}

function toLogical(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) / r.width) * W,
    y: ((e.clientY - r.top) / r.height) * H,
    id: e.pointerId,
  };
}

for (const type of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel']) {
  canvas.addEventListener(type, (e) => {
    if (type === 'pointerdown') canvas.setPointerCapture(e.pointerId);
    if (scene && scene.pointer) scene.pointer(type.slice(7), toLogical(e));
  });
}

export function register(name, s) {
  scenes[name] = s;
}

export function go(name, params) {
  if (scene && scene.exit) scene.exit();
  scene = scenes[name];
  if (scene.enter) scene.enter(params);
}

export function current() {
  return scene;
}

let last = 0;
function frame(t) {
  const dt = Math.min(0.1, (t - last) / 1000 || 0);
  last = t;
  if (scene) {
    scene.update(dt);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, W, H);
    scene.draw(ctx);
  }
  requestAnimationFrame(frame);
}

window.addEventListener('resize', resize);
resize();
requestAnimationFrame(frame);
