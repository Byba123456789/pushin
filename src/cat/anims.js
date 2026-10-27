const f = (ms, p = {}) => ({ ms, p });
const PI = Math.PI;
const rep = (n, frames) => Array.from({ length: n }, () => frames).flat();
const seq = (list, ms, base) => list.map((p) => f(ms, { ...base, ...p }));

export const BASE = {
  body: 'loaf', x: 0, y: 0, sw: 0, sh: 0, rot: 0, kx: 0, rest: 0, oy: 0, flip: 1, 
  ea: 0, eb: 0, tail: -163, tw: 22, tl: 1, ts: 0, tailFront: 0, pw: null, fp: 'u', fpo: null, fpx: 0, fpy: 0, pL: null, pR: null,
  eyes: 'dot', mouth: 'w', brows: null, blush: 0, tear: 0, sweat: 0, look: null,
  prop: null, pv: 0, left: 3, dip: 0, paint: 0, lines: 0, air: 0, legs: null,
};

export const MOOD_FACE = {
  neutral: {},
  happy: {},
  sad: { brows: 'sad', mouth: 'frown', ea: 30 },
  angry: { brows: 'angry', mouth: 'frown', ea: 20 },
  tired: { eyes: 'half', ea: 14 },
  dirty: { brows: 'sad', mouth: 'wavy' },
  potty: { brows: 'sad', mouth: 'wavy', sweat: 1 },
};

const PEAR = { body: 'pear' };
const tailWag = [-168, -160, -150, -144, -150, -160];

export const IDLE = {
  neutral: tailWag.map((t, i) => f(i === 0 ? 260 : 150, { tail: t, sh: [0, 0, -0.6, -0.9, -0.5, 0][i] })),
  happy: [
    f(150, { eyes: 'happy', tail: -130, tw: -10 }), f(150, { eyes: 'happy', tail: -118, eb: 8, sh: -0.6 }),
    f(150, { eyes: 'happy', tail: -128, tw: -10 }), f(150, { eyes: 'happy', tail: -116, eb: -4, sh: -0.6 }),
    f(400, { tail: -124 }), f(150, { tail: -118 }),
  ],
  sad: seq([{}, { sh: 0.6 }, { sh: 1 }, { sh: 0.6 }], 380, { ...PEAR, tail: -175, tw: 10 }),
  angry: [
    f(220, { body: 'flat' }), f(90, { body: 'flat', sh: 0.6, sw: 0.6, tw: 8 }),
    f(220, { body: 'flat' }), f(200, { body: 'flat', tw: 10, fx: 'steam', fxp: 0.35 }),
  ],
  tired: [
    f(380, { rot: -0.025 }), f(150, {}), f(380, { rot: 0.025 }), f(150, {}),
    f(420, { eyes: 'closed', sh: 0.8 }), f(150, { eyes: 'half' }),
  ],
  dirty: [f(300, { tail: -170 }), f(80, { x: -0.6 }), f(80, { x: 0.6 }), f(80, { x: -0.6 }), f(320, {}), f(300, { tail: -150 })],
  potty: seq([{ x: -0.8, pw: [[0, 1.2]] }, {}, { x: 0.8, pw: [null, [0, 1.2]] }, {}, { x: -0.8, pw: [[0, 1.2]] }, { fx: 'sweat', fxp: 0.4 }], 120, PEAR),
};

const SL = { eyes: 'sleep', mouth: 'w', brows: null, sweat: 0, prop: 'nightcap', ea: 6, tail: -176, tw: 6 };
export const SLEEP = [f(450, SL), f(150, { ...SL, sh: -0.8, tail: -172 }), f(450, { ...SL, sh: -1.2, sw: 0.6, tail: -170 }), f(150, { ...SL, sh: -0.6 })];

const run = [0, 1, 2, 3, 4, 5].map((k) => {
  const ph = (k / 6) * PI * 2;
  const leg = (o) => [Math.cos(ph + o) * 3, Math.max(0, Math.sin(ph + o)) * 2.4];
  return f(k % 3 === 0 ? 90 : 70, {
    pw: [leg(0), leg(PI), leg(PI * 0.9), leg(PI * 1.9)],
    oy: [0, -2, -1.2, 0, -2, -1.2][k], sh: k % 3 === 0 ? 0.8 : -0.8, ea: 14, tail: -172 + (k % 2) * 8, tw: k % 2 ? -10 : 12,
  });
});

const jump = [
  f(120, { sh: 4, sw: 3, ea: 16, tail: -175 }),
  f(60, { sh: -2.5, sw: -1.5, oy: -5, ea: 6, pw: [[1, 1.5], [1, 1.5], [-1, 1.5], [-1, 1.5]] }),
  f(80, { sh: -2.5, sw: -1.5, oy: -16, pw: [[2, 2], [2, 2], [-2, 2], [-2, 2]], tail: -178 }),
  f(150, { sh: -1, oy: -21, pw: [[1, 2.6], [1, 2.6], [-1, 2.6], [-1, 2.6]], eyes: 'happy', ea: -4, tail: -140 }),
  f(80, { sh: -1.5, oy: -14, tail: -130 }), f(60, { sh: -2.5, sw: -1.5, oy: -5, tail: -125 }),
  f(110, { sh: 4.5, sw: 4, ea: 18, tail: -150 }), f(90, { sh: 1.4, sw: 1.4, ea: 8 }), f(120),
];

const FL = { sw: 6, sh: 6, ea: 22, tail: -182, tw: 0, tl: 1.1, air: 1 };
const fly = [
  f(90, { ...FL, legs: [6, 174], rot: -0.04, tw: 12 }),
  f(90, { ...FL, legs: [28, 152], rot: -0.02, oy: -1 }),
  f(90, { ...FL, legs: [6, 174], rot: 0.02, oy: -1, tw: -12 }),
  f(90, { ...FL, legs: [28, 152], rot: 0.04 }),
]

const WV = { ...PEAR, fp: null };
const wave = [
  f(110, WV), f(70, { ...WV, pR: [26, 10], sh: -1 }),
  ...rep(3, [f(130, { ...WV, pR: [28, 3], eyes: 'happy', tail: -150 }), f(120, { ...WV, pR: [29, -2], eyes: 'happy', tail: -140 })]),
  f(80, { ...WV, pR: [26, 10] }), f(130, PEAR),
];

const XD = { eyes: 'x', mouth: 'laugh' };
const hop = [
  f(100, { sh: 3, sw: 3, ea: 6 }), f(60, { ...XD, sh: -2, sw: -1.5, oy: -5 }),
  f(130, { eyes: 'happy', mouth: 'open', sh: -1, oy: -11, tail: -120, fx: 'sparkle' }),
  f(70, { eyes: 'happy', mouth: 'open', oy: -5 }), f(90, { ...XD, sh: 3.5, sw: 3.5 }), f(80, { ...XD, sh: 1, sw: 1 }),
];
const happy = [...hop, ...hop, f(260, { eyes: 'happy', tail: -125 })];

const CRY = { ...PEAR, brows: 'sad', mouth: 'frown', ea: 34, tail: -176 };
const sad = [
  f(160, CRY), f(80, { ...CRY, sh: 0.8 }),
  f(420, { ...CRY, tear: 1, sh: 1.2, fx: 'tear' }), f(140, { ...CRY, tear: 2, sh: 1 }),
  f(420, { ...CRY, tear: 1, sh: 1.2 }), f(140, { ...CRY, eyes: 'closed', tear: 2 }),
  f(420, { ...CRY, tear: 1, sh: 1.2 }), f(220, CRY),
];

const ANG = { body: 'flat', brows: 'angry', mouth: 'frown', ea: 10 };
const angry = [
  f(100, { ...ANG, sh: -1 }), f(70, { ...ANG, sh: 1.5, sw: 2 }), f(170, { ...ANG, fx: 'steam' }),
  f(60, { ...ANG, x: -1 }), f(60, { ...ANG, x: 1 }), f(60, { ...ANG, x: -1 }), f(60, { ...ANG, x: 1 }),
  f(420, { ...ANG, tw: 14, fx: 'steam' }), f(160, ANG),
];

const G = { ...PEAR, prop: 'pad', fp: null, pL: [-6, 13], pR: [7, 13] };
const press = [
  f(110, { ...G, pL: [-6, 12] }), f(80, G), f(110, { ...G, pR: [7, 12] }), f(80, G),
  f(110, { ...G, pL: [-6, 12], pR: [7, 12] }), f(90, G),
];
const gaming = [
  ...rep(2, press),
  f(80, { ...G, sh: 1, sw: 1 }),
  f(130, { ...G, oy: -3, sh: -1, eyes: 'happy', mouth: 'open', pL: [-8, 9], pR: [9, 9], fx: 'sparkle' }),
  f(260, { ...G, eyes: 'happy', mouth: 'open' }),
  ...rep(2, press),
  f(110, { ...G, brows: 'angry', mouth: 'frown', ea: 22 }), f(60, { ...G, brows: 'angry', mouth: 'frown', x: -1 }),
  f(60, { ...G, brows: 'angry', mouth: 'frown', x: 1 }), f(220, { ...G, brows: 'angry', mouth: 'frown', fx: 'steam' }),
  ...press,
];

const D1 = { body: 'front', fp: null, mouth: 'open' };
const dance1 = rep(2, [
  { fpo: [0, 0], tail: -150, rot: 0.02 }, { fpo: [-3, 2], tail: -150, rot: 0.03 }, { fpo: [-1, -2], tail: -25, ts: 1, tw: -22, rot: 0 },
  { fpo: [2, -3], tail: -25, ts: 1, tw: -22, rot: -0.03 }, { fpo: [0, 0], tail: -150, rot: -0.02 }, { fpo: [2, -2], tail: -150, rot: 0 },
  { fpo: [-2, 2], tail: -25, ts: 1, tw: -22, rot: 0.02 }, { fpo: [-3, 1], tail: -25, ts: 1, tw: -22, rot: 0.03, fx: 'note' },
].map(({ fpo: [l, r], ...p }) => f(100, { ...D1, ...p, pL: [-37, 26 + l * 2], pR: [37, 26 + r * 2] })));

const D2 = { eyes: 'happy', mouth: 'open' };
const half = (fl) => [
  f(100, { ...D2, flip: fl, sh: 3, sw: 3 }), f(60, { ...D2, flip: fl, sh: -2, oy: -6 }),
  f(130, { ...D2, flip: fl, oy: -12, tail: -120, fx: 'note' }), f(60, { ...D2, flip: -fl, oy: -7 }),
  f(100, { ...D2, flip: -fl, sh: 3.5, sw: 3.5 }), f(110, { ...D2, flip: -fl, sh: 1, sw: 1 }),
];
const dance2 = [...half(1), ...half(-1), ...half(1), ...half(-1)];

const D3 = { body: 'front', eyes: 'happy', mouth: 'open', fp: null };
const dance3 = rep(2, [0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
  const ph = (k / 8) * PI * 2;
  return f(k % 2 ? 80 : 110, {
    ...D3, kx: Math.sin(ph) * 9, sh: Math.cos(ph) * 1.6, sw: -Math.cos(ph),
    pL: [-24, -8 + Math.sin(ph) * 3], pR: [25, -8 - Math.sin(ph) * 3], tail: -150 + Math.sin(ph + 1) * 25, fx: k === 0 ? 'note' : undefined,
  });
}));

const B = { ...PEAR, prop: 'bowl' };
const meow = [f(60, { ...B, mouth: 'open', tail: -150 }), f(50, { ...B, mouth: 'open', tail: -140 }), f(60, { ...B, tail: -146 }), f(50, { ...B, tail: -156 })];
const E = { prop: 'bowl', dip: 1, sh: 19, sw: 6, rest: 1, eyes: 'content', ea: 10, tail: -172, tw: 8 };
const bite = (left) => [
  f(100, { ...E, left, rot: 0.04, mouth: 'open' }),
  f(100, { ...E, left, rot: 0.11, mouth: 'chew', fx: 'crumbs' }),
  f(80, { ...E, left, rot: 0.07, mouth: 'w', tail: -164 }),
  f(80, { ...E, left, rot: 0.11, mouth: 'chew', tail: -176 }),
];
const eat = [...rep(2, meow), f(90, { ...E, rot: 0, eyes: 'dot' }), ...rep(2, bite(3)), ...rep(2, bite(2)), ...rep(2, bite(1)), f(160, { ...E, left: 0, rot: 0, eyes: 'happy', mouth: 'open' }), f(200, { ...B, left: 0, eyes: 'happy' })];

const CH = { ...PEAR, eyes: 'content' };
const chew = [...rep(4, [f(120, { ...CH, mouth: 'chew', sw: 0.6 }), f(120, { ...CH, mouth: 'w', sh: 0.6 })]), f(200, { ...CH, eyes: 'happy', mouth: 'open' })];

const yawn = [
  f(140, { eyes: 'half', mouth: 'chew', ea: 6 }), f(70, { eyes: 'closed', mouth: 'open', sh: -1, ea: 12 }),
  f(160, { eyes: 'x', mouth: 'yawn', sh: -2.5, sw: -1, ea: 20, rot: -0.04, tail: -140 }),
  f(460, { eyes: 'x', mouth: 'yawn', sh: -2.5, sw: -1, ea: 22, rot: -0.05, tail: -135 }),
  f(70, { eyes: 'closed', mouth: 'open', sh: -1, ea: 14 }), f(120, { eyes: 'closed', sh: 1, sw: 1 }),
  f(220, { eyes: 'half' }), f(110, { eyes: 'closed' }), f(150),
];

const W = { prop: 'foam', eyes: 'x', mouth: 'w', brows: null, ea: 12 };
const wash = [f(140, { ...W, pv: 0 }), f(140, { ...W, pv: 1, x: 0.8, sh: 0.6 }), f(140, { ...W, pv: 0 }), f(140, { ...W, pv: 1, x: -0.8, sh: 0.6, fx: 'bubble', fxp: 0.5 })];

const SH = { eyes: 'x', mouth: 'frown', brows: null };
const shake = [
  f(130, { ...SH, sh: 1, ea: 10 }),
  ...rep(3, [f(60, { ...SH, rot: -0.12, x: -2, ea: 34, tail: -175, fx: 'drops' }), f(60, { ...SH, rot: 0.12, x: 2, ea: -6, tail: -130 })]),
  f(70, { ...SH, rot: -0.04, x: -1, ea: 16 }), f(120, { ...SH, sh: -1 }), f(150, { mouth: 'open' }), f(120),
];

const PT = { ...PEAR, brows: 'sad', mouth: 'wavy', sweat: 1 };
const potty = seq([
  { x: -1, pw: [[0, 2]], rot: -0.03 }, {}, { x: 1, pw: [null, [0, 2]], rot: 0.03 }, {},
  { x: -1, pw: [[0, 2]], rot: -0.03, eyes: 'x' }, {}, { x: 1, pw: [null, [0, 2]], rot: 0.03 }, { sh: 1, fx: 'sweat', fxp: 0.5 },
], 100, PT);

const PU = { ...PEAR, eyes: 'content', mouth: 'kiss', lines: 1, brows: null };
const pet = [
  f(120, { ...PU, pv: 0 }),
  ...rep(5, [
    f(40, { ...PU, pv: 1, x: 0.5, rot: 0.015 }), f(40, { ...PU, pv: 2, x: -0.5 }), f(80, { ...PU, pv: 3, rot: -0.015, sh: 0.5 }),
    f(40, { ...PU, pv: 4, x: 0.5 }), f(40, { ...PU, pv: 5, x: -0.5, rot: 0.015 }),
  ]),
  f(120, { ...PU, lines: 0, eyes: 'happy', mouth: 'w' }),
];

const BU = { body: 'back', eyes: 'happy', mouth: 'open', brows: null };
const bellyup = [
  f(100, { sh: 2, sw: 2 }), f(80, { ...BU, eyes: 'dot', sh: 2 }),
  ...rep(4, [f(110, { ...BU, sw: 1 }), f(110, { ...BU, sh: 1, tw: 20 })]),
  f(80, { ...BU, eyes: 'dot' }), f(100, { sh: 2, sw: 2 }), f(120),
];

const sneeze = [
  f(150, { eyes: 'half', mouth: 'chew', sh: -1, rot: -0.03 }), f(150, { eyes: 'half', mouth: 'open', sh: -2, rot: -0.06, ea: 8 }),
  f(220, { eyes: 'x', mouth: 'open', sh: -2, rot: -0.08, ea: 12 }),
  f(60, { eyes: 'x', mouth: 'frown', sh: 4, sw: 3, rot: 0.08, x: 2, ea: 30, fx: 'spray' }),
  f(140, { eyes: 'x', mouth: 'frown', sh: 2.5, sw: 2, rot: 0.05, x: 1, ea: 24 }),
  f(100, { eyes: 'closed', sh: 1 }), f(150), f(100, { eyes: 'closed' }), f(120),
];

const LB = { look: [-1.4, -0.6], tail: -100, tw: -30, tl: 1.7 };
const lookback = [
  f(100, { look: [-0.8, 0] }), f(130, LB), f(150, { ...LB, tail: -80, tw: -40 }), f(150, { ...LB, tail: -105, tw: -20 }),
  f(150, { ...LB, tail: -80, tw: -40 }), f(160, { ...LB, eyes: 'happy', tail: -95 }), f(100, { look: [-0.6, 0] }), f(120),
];

const SC = { eyes: 'x', mouth: 'open', brows: null, rot: -0.12, tail: -98, tw: -6, tl: 1.7, ea: -8 };
const surprised = [
  f(70, { eyes: 'dot', mouth: 'open', sh: -1, ea: -10 }),
  f(70, { ...SC, oy: -4, sh: -3 }),
  ...rep(4, [f(60, { ...SC, x: -0.8 }), f(50, { ...SC, x: 0.8 })]),
  f(400, { ...SC, rot: -0.08 }), f(120, { eyes: 'dot', mouth: 'open' }), f(150),
];

const RD = { prop: 'read', tail: -165 };
const read = [
  ...tailWag.map((t, i) => f(150, { ...RD, tail: t, look: [i % 3 === 2 ? 1 : 0.4, 1] })),
  f(150, { ...RD, pv: 1, look: [-0.6, 1] }), f(150, { ...RD, pv: 1 }),
  ...tailWag.map((t, i) => f(150, { ...RD, tail: t, look: [i % 3 === 2 ? -0.4 : 0.6, 1] })),
];

const MU = { ...PEAR, prop: 'phones', eyes: 'happy', mouth: 'w' };
const music = rep(2, [
  f(150, { ...MU, rot: 0.06, tail: -165 }), f(150, { ...MU, rot: 0.03, tail: -155, fx: 'note' }),
  f(150, { ...MU, rot: -0.03, tail: -150 }), f(150, { ...MU, rot: -0.06, tail: -158, fx: 'heart', fxp: 0.5 }),
]);

const PI_ = { ...PEAR, prop: 'piano', fp: null, eyes: 'content', mouth: 'w' };
const piano = rep(4, [
  f(80, { ...PI_, pL: [-10, 44], pR: [6, 42] }), f(80, { ...PI_, pL: [-10, 42], pR: [6, 44], fx: 'note', fxp: 0.4 }),
  f(80, { ...PI_, pL: [-7, 44], pR: [9, 42] }), f(80, { ...PI_, pL: [-7, 42], pR: [9, 44], sh: 0.6 }),
]);

const BX = { ...PEAR, prop: 'box' };
const box = [
  f(200, { ...BX, y: 22, eyes: 'closed' }), f(80, { ...BX, y: 15 }), f(80, { ...BX, y: 8, look: [-1, 0] }),
  f(500, { ...BX, y: 6, look: [-1, 0] }), f(120, { ...BX, y: 6 }), f(500, { ...BX, y: 6, look: [1, 0] }),
  f(80, { ...BX, y: 6, eyes: 'closed' }), f(400, { ...BX, y: 6, eyes: 'happy' }), f(100, { ...BX, y: 14 }), f(200, { ...BX, y: 22, eyes: 'closed' }),
];

const YA = { prop: 'yarn', eyes: 'content', mouth: 'w', sh: 4, sw: 2 };
const yarn = rep(3, [
  f(120, { ...YA, pv: 0 }), f(60, { ...YA, pv: 0, pR: [30, 44] }), f(60, { ...YA, pv: 1, pR: [34, 46] }),
  f(100, { ...YA, pv: 2 }), f(100, { ...YA, pv: 3, tail: -150 }), f(120, { ...YA, pv: 0, tail: -168 }),
]);

const CK = { ...PEAR, prop: 'cake', eyes: 'happy', mouth: 'open' };
const cake = rep(3, [f(150, { ...CK, pv: 0 }), f(150, { ...CK, pv: 1, sh: -0.6 }), f(150, { ...CK, pv: 0, fx: 'sparkle', fxp: 0.4 }), f(150, { ...CK, pv: 1 })]);

const DN = { ...PEAR, prop: 'donut', eyes: 'content', fp: null };
const donut = rep(4, [f(100, { ...DN, sh: 0 }), f(100, { ...DN, sh: 0.8, sw: 0.5 }), f(100, { ...DN, sh: 0.3 }), f(100, { ...DN, sh: 0.8 })]);

const FF = { prop: 'fastfood' };
const fastfood = rep(3, [f(140, { ...FF, eyes: 'happy', mouth: 'chew' }), f(140, { ...FF, eyes: 'happy', mouth: 'w', sh: 0.6 }), f(140, { ...FF, eyes: 'content', mouth: 'chew' }), f(140, { ...FF, tail: -150 })]);

const CO = { prop: 'shades', mouth: 'kiss' };
const cool = rep(2, tailWag.map((t, i) => f(150, { ...CO, tail: t, oy: i % 3 === 1 ? -1 : 0 })));

const SY = { ...PEAR, eyes: 'dot', mouth: 'w', blush: 1, brows: null, fp: 'n', fpy: -49.5 };
const shy = rep(2, [f(200, { ...SY, rot: 0.02 }), f(150, { ...SY, look: [0, 0.6] }), f(200, { ...SY, rot: -0.02, eyes: 'closed' }), f(150, SY)]);

const laugh = rep(4, [f(80, { ...XD, sh: 1.5, sw: 1, tail: -130 }), f(80, { ...XD, sh: -1, oy: -1.5, tail: -118 }), f(80, { ...XD, sh: 1, tail: -126 })]);

const WO = { eyes: 'dot', mouth: 'open', tail: -92, tw: -4, tl: 1.8, ea: -6 };
const wow = [f(70, { ...WO, sh: -1.5, oy: -2 }), f(500, WO), f(120, { ...WO, eb: 8 }), f(500, WO), f(150, { mouth: 'open' })];

const SO = { eyes: 'ring', mouth: 'frown', ea: -8, tail: -110 };
const shocked = [f(60, { ...SO, sh: -2, oy: -3 }), f(60, { ...SO, sh: 1 }), ...rep(3, [f(50, { ...SO, x: -0.6 }), f(50, { ...SO, x: 0.6 })]), f(700, SO), f(150)];

const GR = { eyes: 'dash', mouth: 'frown', brows: 'flat', ea: 18, tail: -176 };
const grumpy = [f(300, GR), f(100, { ...GR, tail: -168, tw: 14 }), f(300, GR), f(500, { ...GR, look: [1, 0] }), f(100, { ...GR, tail: -170, tw: 16 }), f(400, GR)];

const CR = { ...PEAR, eyes: 'happy', brows: 'sad', mouth: 'frown', ea: 34, tail: -176 };
const cry = rep(3, [f(140, { ...CR, tear: 1, fx: 'tear' }), f(140, { ...CR, tear: 2, sh: 0.8 }), f(140, { ...CR, tear: 1 }), f(140, { ...CR, tear: 2, sh: 0.8 })]);

const LV = { ...PEAR, prop: 'heart', eyes: 'happy', blush: 1 };
const love = rep(3, [f(150, { ...LV, pv: 0, eb: 6 }), f(150, { ...LV, pv: 1 }), f(150, { ...LV, pv: 0, eb: -4, fx: 'heart', fxp: 0.35 }), f(150, { ...LV, pv: 1 })]);

const BA = { body: 'ball', eyes: 'happy' };
const ball = [f(90, { sh: 3, sw: 2 }), ...rep(4, [f(150, { ...BA, rot: 0.14 }), f(110, { ...BA, rot: 0, sh: 1 }), f(150, { ...BA, rot: -0.14 }), f(110, { ...BA, rot: 0, sh: 1 })]), f(90, { sh: 3, sw: 2 })];

const PS = { prop: 'pillow', sh: 6, sw: 2, rot: -0.14, rest: 1, ea: 6, tail: -176, tw: 6 };
const pillowsleep = [
  ...rep(3, [f(50, { ...PS, pw: [[0, 2]] }), f(40, { ...PS }), f(50, { ...PS, pw: [null, [0, 2]] }), f(40, { ...PS })]),
  ...rep(3, [f(450, { ...PS, eyes: 'sleep', fx: 'zzz', fxp: 0.5 }), f(150, { ...PS, eyes: 'sleep', sh: 5.2 }), f(450, { ...PS, eyes: 'sleep', sh: 4.8, sw: 2.6 }), f(150, { ...PS, eyes: 'sleep', sh: 5.4 })]),
];

const LT = { prop: 'laptop', sh: 2 };
const laptop = rep(4, [f(90, { ...LT, pL: [12, 14], pR: [20, 15] }), f(90, { ...LT, pL: [12, 15], pR: [20, 13] }), f(90, { ...LT, pL: [13, 13], pR: [20, 15], look: [1, 1] }), f(150, { ...LT, look: [1, 1] })]);

const BL = { prop: 'blanket', eyes: 'closed', sh: 3 };
const blanket = rep(3, [f(300, BL), f(150, { ...BL, sh: 2.4 }), f(300, { ...BL, sh: 2, sw: 0.6 }), f(150, { ...BL, sh: 2.6 })]);

const PA = { prop: 'paint', paint: 1, eyes: 'happy' };
const paint = rep(3, [f(140, { ...PA, pR: [18, 43] }), f(100, { ...PA, pR: [12, 45] }), f(140, { ...PA, pR: [6, 44], tail: -150 }), f(100, { ...PA, pR: [12, 43] })]);

const LI = { ...PEAR, prop: 'lights', eyes: 'content' };
const lights = rep(3, [f(300, { ...LI, pv: 0 }), f(300, { ...LI, pv: 1, sh: -0.5 }), f(300, { ...LI, pv: 2 }), f(300, { ...LI, pv: 3, sh: -0.5 })]);

const HG = { ...PEAR, eyes: 'happy', blush: 1, fp: null, pR: [28, 8] };
const hug = rep(4, [f(160, { ...HG, rot: 0.03 }), f(160, { ...HG, rot: 0.05, fx: 'heart', fxp: 0.3 }), f(160, { ...HG, rot: 0.03 }), f(160, { ...HG, rot: 0.01 })]);

const sit = seq([{ tail: -165 }, { sh: 0.6, tail: -158 }, { sh: 0.8, tail: -150 }, { sh: 0.4, tail: -158 }], 200, PEAR);
const walk = run.map((fr) => f(fr.ms * 1.6, { ...fr.p, oy: fr.p.oy / 2 }));

export const ANIMS = {
  wave, happy, sad, angry, run, jump, fly, gaming, dance1, dance2, dance3, eat, chew, yawn, sleep: SLEEP, wash, shake,
  potty, pet, bellyup, sneeze, lookback, surprised, read, music, piano, box, yarn, cake, donut, fastfood, cool, shy,
  laugh, wow, shocked, grumpy, cry, love, ball, pillowsleep, laptop, blanket, paint, lights, hug, sit, walk,
};

export const MOODY = new Set(['idle', 'run', 'walk', 'jump', 'fly', 'gaming', 'lookback', 'sit']);

export const LOOPS = new Set(['idle', 'run', 'walk', 'fly', 'gaming', 'sleep', 'wash', 'potty', 'pillowsleep', 'blanket', 'sit']);
