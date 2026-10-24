const KEY = 'pushin.muted';
const MASTER_VOLUME = 0.9;
const UNLOCK_EVENTS = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'];

let ac = null;
let master = null;
let sfxBus = null;
let musicBus = null;
let noiseBuf = null;
let wanted = null;
let current = null;
let muted = readMuted();

function readMuted() {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

function ensure() {
  if (ac) return ac;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  ac = new Ctor();
  master = ac.createGain();
  master.gain.value = muted ? 0 : MASTER_VOLUME;
  const comp = ac.createDynamicsCompressor();
  master.connect(comp).connect(ac.destination);
  sfxBus = ac.createGain();
  sfxBus.gain.value = 0.55;
  sfxBus.connect(master);
  musicBus = ac.createGain();
  musicBus.gain.value = 0.13;
  musicBus.connect(master);
  noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return ac;
}

function unlock() {
  const c = ensure();
  if (!c) return;
  c.resume().then(() => {
    if (c.state !== 'running') return;
    UNLOCK_EVENTS.forEach((e) => window.removeEventListener(e, unlock, true));
    if (wanted && !current) startTrack(wanted);
  }).catch(() => {});
}

UNLOCK_EVENTS.forEach((e) => window.addEventListener(e, unlock, true));

document.addEventListener('visibilitychange', () => {
  if (!ac) return;
  if (document.hidden) {
    ac.suspend();
    return;
  }
  ac.resume().then(() => {
    if (wanted && !current && ac.state === 'running') startTrack(wanted);
  }).catch(() => {});
});

function when(fn) {
  const c = ensure();
  if (!c || document.hidden) return;
  if (c.state === 'running') {
    fn(c);
    return;
  }
  const t0 = performance.now();
  c.resume().then(() => {
    if (c.state === 'running' && performance.now() - t0 < 400) fn(c);
  }).catch(() => {});
}

function tone(c, { f, to, type = 'square', t = 0, d = 0.1, v = 0.3, a = 0.005, bus = sfxBus }) {
  const s = c.currentTime + t;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, s);
  if (to) o.frequency.exponentialRampToValueAtTime(to, s + d);
  g.gain.setValueAtTime(0.0001, s);
  g.gain.linearRampToValueAtTime(v, s + a);
  g.gain.exponentialRampToValueAtTime(0.0001, s + d);
  o.connect(g).connect(bus);
  o.start(s);
  o.stop(s + d + 0.02);
}

function noise(c, { t = 0, d = 0.1, v = 0.3, type = 'bandpass', f = 1000, to, q = 1, a = 0.005, am, bus = sfxBus }) {
  const s = c.currentTime + t;
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  const filter = c.createBiquadFilter();
  filter.type = type;
  filter.Q.value = q;
  filter.frequency.setValueAtTime(f, s);
  if (to) filter.frequency.exponentialRampToValueAtTime(to, s + d);
  const env = c.createGain();
  env.gain.setValueAtTime(0.0001, s);
  env.gain.linearRampToValueAtTime(v, s + a);
  env.gain.exponentialRampToValueAtTime(0.0001, s + d);
  let last = filter;
  if (am) {
    const mod = c.createGain();
    mod.gain.value = 0.5;
    const lfo = c.createOscillator();
    const depth = c.createGain();
    lfo.frequency.value = am;
    depth.gain.value = 0.5;
    lfo.connect(depth).connect(mod.gain);
    lfo.start(s);
    lfo.stop(s + d + 0.02);
    filter.connect(mod);
    last = mod;
  }
  src.connect(filter);
  last.connect(env).connect(bus);
  src.start(s);
  src.stop(s + d + 0.02);
}

const SFX = {
  tap: (c) => tone(c, { f: 880, to: 660, d: 0.05, v: 0.25 }),
  meow: (c) => {
    tone(c, { f: 480, to: 840, type: 'sawtooth', d: 0.16, v: 0.16, a: 0.02 });
    tone(c, { f: 800, to: 500, type: 'sawtooth', t: 0.15, d: 0.28, v: 0.16, a: 0.02 });
    tone(c, { f: 960, to: 1680, type: 'sine', d: 0.16, v: 0.06, a: 0.02 });
    tone(c, { f: 1600, to: 1000, type: 'sine', t: 0.15, d: 0.28, v: 0.06, a: 0.02 });
  },
  purr: (c) => {
    noise(c, { d: 1.1, v: 0.7, type: 'bandpass', f: 220, q: 1.2, a: 0.3, am: 26 });
    noise(c, { d: 1.1, v: 0.12, type: 'highpass', f: 900, a: 0.3, am: 26 });
  },
  eat: (c) => {
    for (let i = 0; i < 6; i++) {
      const t = (i < 3 ? 0 : 0.18) + (i % 3) * 0.07;
      noise(c, { t, d: 0.05, v: 0.5, f: 1800 + i * 150, q: 1.5 });
      tone(c, { f: 220 + (i % 3) * 40, to: 120, type: 'square', t, d: 0.04, v: 0.1 });
    }
  },
  splash: (c) => {
    noise(c, { d: 0.4, v: 0.45, f: 600, to: 2600, q: 0.8, a: 0.03 });
    for (let i = 0; i < 4; i++) tone(c, { f: 500 + i * 160, to: 900 + i * 200, type: 'sine', t: 0.05 + i * 0.07, d: 0.07, v: 0.12 });
  },
  scrub: (c) => {
    for (let i = 0; i < 3; i++) noise(c, { t: i * 0.11, d: 0.1, v: 0.32, type: 'highpass', f: 2500, a: 0.02 });
  },
  flush: (c) => {
    noise(c, { d: 1.3, v: 0.5, type: 'lowpass', f: 1400, to: 160, q: 2, a: 0.1, am: 7 });
    tone(c, { f: 400, to: 120, type: 'sine', d: 1.2, v: 0.08, a: 0.2 });
  },
  coin: (c) => {
    tone(c, { f: 988, d: 0.07, v: 0.22 });
    tone(c, { f: 1319, t: 0.07, d: 0.28, v: 0.22 });
  },
  buy: (c) => {
    [659, 784, 1047].forEach((f, i) => tone(c, { f, type: 'triangle', t: i * 0.07, d: 0.18, v: 0.3 }));
    tone(c, { f: 2093, t: 0.2, d: 0.3, v: 0.08, type: 'sine' });
  },
  jump: (c) => tone(c, { f: 300, to: 760, d: 0.16, v: 0.22 }),
  hit: (c) => {
    tone(c, { f: 320, to: 70, type: 'sawtooth', d: 0.28, v: 0.3 });
    noise(c, { d: 0.14, v: 0.35, type: 'lowpass', f: 1800, to: 300 });
  },
  yawn: (c) => {
    tone(c, { f: 300, to: 520, type: 'triangle', d: 0.5, v: 0.2, a: 0.15 });
    tone(c, { f: 520, to: 190, type: 'triangle', t: 0.5, d: 0.7, v: 0.2, a: 0.02 });
    noise(c, { d: 1.2, v: 0.08, type: 'lowpass', f: 900, a: 0.3 });
  },
  sneeze: (c) => {
    noise(c, { d: 0.28, v: 0.15, f: 700, to: 2600, q: 1.5, a: 0.2 });
    noise(c, { t: 0.3, d: 0.14, v: 0.5, type: 'highpass', f: 1200 });
    tone(c, { f: 1100, to: 380, type: 'triangle', t: 0.3, d: 0.16, v: 0.2 });
  },
  levelup: (c) => {
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone(c, { f, t: i * 0.08, d: i === 4 ? 0.5 : 0.14, v: 0.22 }));
  },
  pop: (c) => {
    tone(c, { f: 260, to: 780, type: 'sine', d: 0.09, v: 0.3, a: 0.003 });
    noise(c, { d: 0.03, v: 0.12, type: 'highpass', f: 3000 });
  },
  whoosh: (c) => noise(c, { d: 0.4, v: 0.3, f: 300, to: 2400, q: 0.9, a: 0.18 }),
};

export function sfx(name) {
  if (muted || !SFX[name]) return;
  when((c) => SFX[name](c));
}

const SEMITONE = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };

function midi(name) {
  const m = /^([a-g])([#b]?)(\d)$/.exec(name);
  return 12 * (Number(m[3]) + 1) + SEMITONE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}

const hz = (m) => 440 * 2 ** ((m - 69) / 12);

// '.' пауза, '_' продлевает предыдущую ноту, 'a4+c5' — аккорд; один токен = одна восьмая
function pattern(bars) {
  const slots = [];
  for (const tk of bars.join(' ').trim().split(/\s+/)) {
    if (tk === '_') slots[slots.length - 1].len++;
    else slots.push({ notes: tk === '.' ? [] : tk.split('+').map(midi), len: 1 });
  }
  const steps = [];
  for (const s of slots) {
    steps.push(s);
    for (let i = 1; i < s.len; i++) steps.push(null);
  }
  return steps;
}

const DRUMS = {
  k: (c, t, bus) => tone(c, { f: 150, to: 45, type: 'sine', t, d: 0.13, v: 0.9, bus }),
  s: (c, t, bus) => {
    noise(c, { t, d: 0.11, v: 0.45, type: 'highpass', f: 1600, bus });
    tone(c, { f: 220, to: 130, type: 'triangle', t, d: 0.07, v: 0.3, bus });
  },
  h: (c, t, bus) => noise(c, { t, d: 0.035, v: 0.16, type: 'highpass', f: 7000, bus }),
};

const DRUM_TOKENS = { k: 'k', s: 's', h: 'h', b: 'kh', z: 'sh', '.': '' };

function drums(bars) {
  return bars.join(' ').trim().split(/\s+/).map((tk) => DRUM_TOKENS[tk]);
}

const TRACKS = {
  home: {
    step: 60 / 72 / 2,
    voices: [
      {
        wave: 'sine', v: 0.55, pluck: true,
        steps: pattern([
          'e5 . g5 _ e5 . d5 e5',
          'c5 . e5 _ a5 _ g5 .',
          'a5 . g5 f5 e5 _ c5 .',
          'd5 . g5 _ b5 _ g5 .',
          'e5 g5 c6 _ b5 g5 e5 g5',
          'g5 _ e5 _ b4 . d5 e5',
          'f5 a5 c6 _ a5 f5 a5 .',
          'g5 _ f5 e5 d5 _ . .',
        ]),
      },
      {
        wave: 'sine', v: 0.55,
        steps: pattern([
          'c3 _ _ _ g3 _ _ _',
          'a2 _ _ _ e3 _ _ _',
          'f2 _ _ _ c3 _ _ _',
          'g2 _ _ _ d3 _ _ _',
          'c3 _ _ _ g3 _ _ _',
          'e3 _ _ _ b2 _ _ _',
          'f2 _ _ _ c3 _ _ _',
          'g2 _ _ _ d3 _ _ _',
        ]),
      },
      {
        wave: 'sine', v: 0.16, pad: true,
        steps: pattern([
          'e4+g4+b4 _ _ _ _ _ _ _',
          'e4+g4+c5 _ _ _ _ _ _ _',
          'c4+e4+a4 _ _ _ _ _ _ _',
          'b3+d4+g4 _ _ _ _ _ _ _',
          'e4+g4+b4 _ _ _ _ _ _ _',
          'e4+g4+b4 _ _ _ _ _ _ _',
          'c4+e4+a4 _ _ _ _ _ _ _',
          'b3+d4+g4 _ _ _ _ _ _ _',
        ]),
      },
    ],
  },
  nyan: {
    step: 60 / 140 / 2,
    voices: [
      {
        wave: 'square', v: 0.42,
        steps: pattern([
          'f#5 f#5 a5 _ f#5 d5 e5 f#5',
          'd5 _ b4 d5 f#5 _ e5 d5',
          'b4 d5 g5 _ g5 f#5 e5 d5',
          'e5 _ a4 c#5 e5 g5 f#5 e5',
          'f#5 a5 d6 _ a5 f#5 d5 f#5',
          'b5 _ a5 f#5 d5 _ f#5 a5',
          'g5 b5 a5 g5 f#5 e5 d5 e5',
          'c#5 e5 a5 _ g5 e5 c#5 a4',
        ]),
      },
      {
        wave: 'triangle', v: 0.7,
        steps: pattern([
          'd3 d4 d3 d4 d3 d4 d3 d4',
          'b2 b3 b2 b3 b2 b3 b2 b3',
          'g2 g3 g2 g3 g2 g3 g2 g3',
          'a2 a3 a2 a3 a2 a3 a2 a3',
          'd3 d4 d3 d4 d3 d4 d3 d4',
          'b2 b3 b2 b3 b2 b3 b2 b3',
          'g2 g3 g2 g3 g2 g3 g2 g3',
          'a2 a3 a2 a3 a2 a3 a2 a3',
        ]),
      },
      {
        wave: 'square', v: 0.1,
        steps: pattern([
          'd4 f#4 a4 f#4 d4 f#4 a4 f#4',
          'b3 d4 f#4 d4 b3 d4 f#4 d4',
          'g3 b3 d4 b3 g3 b3 d4 b3',
          'a3 c#4 e4 c#4 a3 c#4 e4 c#4',
          'd4 f#4 a4 f#4 d4 f#4 a4 f#4',
          'b3 d4 f#4 d4 b3 d4 f#4 d4',
          'g3 b3 d4 b3 g3 b3 d4 b3',
          'a3 c#4 e4 c#4 a3 c#4 e4 c#4',
        ]),
      },
    ],
    drums: drums([
      'b h z h b h z h',
      'b h z h b h z h',
      'b h z h b h z h',
      'b h z h b h z h',
      'b h z h b h z h',
      'b h z h b h z h',
      'b h z h b h z h',
      'b h z h b z z z',
    ]),
  },
};

function playNote(c, bus, voice, notes, t, dur) {
  for (const m of notes) {
    const o = c.createOscillator();
    const g = c.createGain();
    const s = c.currentTime + t;
    o.type = voice.wave;
    o.frequency.value = hz(m);
    g.gain.setValueAtTime(0.0001, s);
    if (voice.pad) {
      g.gain.linearRampToValueAtTime(voice.v, s + 0.5);
      g.gain.setValueAtTime(voice.v, s + dur - 0.5);
      g.gain.linearRampToValueAtTime(0.0001, s + dur);
    } else if (voice.pluck) {
      g.gain.linearRampToValueAtTime(voice.v, s + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, s + Math.max(dur * 1.6, 0.6));
    } else {
      g.gain.linearRampToValueAtTime(voice.v, s + 0.006);
      g.gain.setValueAtTime(voice.v, s + dur * 0.7);
      g.gain.linearRampToValueAtTime(0.0001, s + dur * 0.95);
    }
    o.connect(g).connect(bus);
    o.start(s);
    o.stop(s + Math.max(dur * 1.6, 0.6) + 0.05);
  }
}

function pump() {
  const c = ac;
  const tr = current;
  const len = tr.track.voices[0].steps.length;
  while (tr.next < c.currentTime + 0.25) {
    const t = tr.next - c.currentTime;
    for (const v of tr.track.voices) {
      const s = v.steps[tr.i];
      if (s && s.notes.length) playNote(c, tr.bus, v, s.notes, t, s.len * tr.track.step);
    }
    if (tr.track.drums) for (const d of tr.track.drums[tr.i]) DRUMS[d](c, t, tr.bus);
    tr.i = (tr.i + 1) % len;
    tr.next += tr.track.step;
  }
}

function startTrack(name) {
  const c = ensure();
  const bus = c.createGain();
  bus.gain.setValueAtTime(0.0001, c.currentTime);
  bus.gain.linearRampToValueAtTime(1, c.currentTime + 0.4);
  bus.connect(musicBus);
  current = { name, track: TRACKS[name], bus, i: 0, next: c.currentTime + 0.1 };
  current.timer = setInterval(pump, 40);
}

function stopTrack() {
  if (!current) return;
  const { bus, timer } = current;
  clearInterval(timer);
  bus.gain.cancelScheduledValues(ac.currentTime);
  bus.gain.setValueAtTime(bus.gain.value, ac.currentTime);
  bus.gain.linearRampToValueAtTime(0.0001, ac.currentTime + 0.25);
  setTimeout(() => bus.disconnect(), 400);
  current = null;
}

export function music(name) {
  wanted = name || null;
  if (current && current.name === wanted) return;
  stopTrack();
  if (!wanted) return;
  const c = ensure();
  if (c && c.state === 'running') startTrack(wanted);
}

export function setMuted(value) {
  muted = Boolean(value);
  try {
    localStorage.setItem(KEY, muted ? '1' : '0');
  } catch {
    // хранилище недоступно: настройка живёт до перезагрузки
  }
  if (master) master.gain.setTargetAtTime(muted ? 0 : MASTER_VOLUME, ac.currentTime, 0.02);
}

export function isMuted() {
  return muted;
}
