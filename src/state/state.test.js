import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { FOOD, OUTFITS, XP, XP_PER_LEVEL, DAILY_BONUS, GIFT } from './catalog.js';

const rules = JSON.parse(await readFile(new URL('./rules.json', import.meta.url), 'utf8'));
globalThis.fetch = async (url) => ({ json: async () => JSON.parse(await readFile(url, 'utf8')) });
const st = await import('./state.js');

const HOUR = 3600;
const DAY_MS = 24 * 3600 * 1000;
let now;
let mem;

const memStorage = () => {
  const data = {};
  return { getItem: (k) => (k in data ? data[k] : null), setItem: (k, v) => { data[k] = String(v); } };
};

beforeEach(() => {
  now = new Date(2026, 5, 10, 12, 0, 0).getTime();
  mem = memStorage();
  delete globalThis.window;
  delete globalThis.fetch;
  st._reset();
  st._setClock(() => now);
  st._setStorage(mem);
});

const setNeeds = (v) => Object.assign(st.get().needs, v);
const allFull = { food: 90, clean: 90, energy: 90, fun: 90, potty: 90 };

test('старт: все потребности 80, 50 монет', () => {
  const s = st.get();
  assert.deepEqual(s.needs, { food: 80, clean: 80, energy: 80, fun: 80, potty: 80 });
  assert.equal(s.coins, 50);
  assert.equal(s.level, 1);
  assert.equal(s.version, 1);
});

test('онлайн-падение по decayPerHour', () => {
  st.tick(HOUR);
  const n = st.get().needs;
  assert.equal(n.food, 80 - rules.decayPerHour.food);
  assert.equal(n.clean, 80 - rules.decayPerHour.clean);
  assert.equal(n.energy, 80 - rules.decayPerHour.energy);
});

test('ниже floor онлайн не падает', () => {
  st.tick(100 * HOUR);
  for (const v of Object.values(st.get().needs)) assert.equal(v, rules.floor);
});

test('значение уже ниже floor не поднимается тиком', () => {
  setNeeds({ food: 5 });
  st.tick(HOUR);
  assert.equal(st.get().needs.food, 5);
});

test('сон: energy растёт, остальные падают вдвое медленнее', () => {
  setNeeds({ energy: 50 });
  st.setSleeping(true);
  st.tick(HOUR);
  const n = st.get().needs;
  assert.equal(n.energy, 50 + rules.sleepEnergyPerHour);
  assert.equal(n.food, 80 - rules.decayPerHour.food / 2);
});

test('полная энергия во сне будит автоматически', () => {
  st.setSleeping(true);
  st.tick(10 * HOUR);
  assert.equal(st.get().needs.energy, 100);
  assert.equal(st.get().sleeping, false);
});

test('низкая энергия не будит спящего', () => {
  setNeeds({ energy: 10 });
  st.setSleeping(true);
  st.tick(1);
  assert.equal(st.get().sleeping, true);
});

const saved = (over = {}) => ({
  needs: { food: 80, clean: 80, energy: 80, fun: 80, potty: 80 },
  coins: 7, xp: 0, level: 1, owned: [], equipped: { head: null, eyes: null, body: null },
  sleeping: false, feeds: 0, best: 0, giftSeen: false, streak: 0, lastDaily: null,
  lastSeen: now - 10 * 3600 * 1000, version: 1, ...over,
});

const loadWith = async (s) => {
  mem.setItem('pushin.v1', JSON.stringify(s));
  await st.load();
  return st.get();
};

test('оффлайн: падение умножается на offlineFactor', async () => {
  const s = await loadWith(saved());
  assert.equal(s.needs.food, 80 - 10 * rules.decayPerHour.food * rules.offlineFactor);
});

test('оффлайн: не больше maxOfflineHours', async () => {
  const s = await loadWith(saved({
    needs: { food: 100, clean: 100, energy: 100, fun: 100, potty: 100 },
    lastSeen: now - 500 * 3600 * 1000,
  }));
  const expected = 100 - rules.maxOfflineHours * rules.decayPerHour.clean * rules.offlineFactor;
  assert.ok(Math.abs(s.needs.clean - expected) < 1e-9);
});

test('оффлайн: floor соблюдается', async () => {
  const s = await loadWith(saved({ lastSeen: now - 400 * 3600 * 1000 }));
  assert.equal(s.needs.food, rules.floor);
});

test('оффлайн: часы переведены назад, падения нет', async () => {
  const s = await loadWith(saved({ lastSeen: now + 5 * 3600 * 1000 }));
  assert.equal(s.needs.food, 80);
});

test('оффлайн во сне: энергия растёт и будит', async () => {
  const s = await loadWith(saved({ sleeping: true, needs: { food: 80, clean: 80, energy: 50, fun: 80, potty: 80 } }));
  assert.equal(s.needs.energy, 100);
  assert.equal(s.sleeping, false);
});

test('load без сохранения даёт дефолт', async () => {
  await st.load();
  assert.equal(st.get().coins, 50);
});

test('load: битый JSON в localStorage игнорируется', async () => {
  mem.setItem('pushin.v1', '{oops');
  await st.load();
  assert.equal(st.get().coins, 50);
});

test('feed: списывает монеты и применяет еду', () => {
  setNeeds({ food: 30, fun: 50, potty: 90 });
  const f = FOOD.find((x) => x.id === 'fish');
  assert.equal(st.feed('fish'), true);
  const s = st.get();
  assert.equal(s.coins, 50 - f.price);
  assert.equal(s.needs.food, 30 + f.food);
  assert.equal(s.needs.fun, 50 + f.fun);
  assert.equal(s.needs.potty, 90 + f.potty);
  assert.equal(s.feeds, 1);
  assert.equal(s.xp, XP.feed);
});

test('feed: значения зажаты в 0..100', () => {
  setNeeds({ food: 90, fun: 99, potty: 2 });
  st.get().coins = 100;
  st.feed('cake');
  const n = st.get().needs;
  assert.equal(n.food, 100);
  assert.equal(n.fun, 100);
  assert.equal(n.potty, 0);
});

test('feed: false при нехватке монет', () => {
  setNeeds({ food: 10 });
  st.get().coins = 1;
  assert.equal(st.feed('pizza'), false);
  assert.equal(st.get().coins, 1);
  assert.equal(st.get().feeds, 0);
});

test('feed: false если сыт (food >= 98), монеты целы', () => {
  setNeeds({ food: 98 });
  assert.equal(st.feed('cookie'), false);
  assert.equal(st.get().coins, 50);
});

test('feed: неизвестная еда даёт false', () => {
  assert.equal(st.feed('nope'), false);
});

test('wash, potty, play', () => {
  setNeeds({ clean: 20, potty: 10, fun: 20 });
  st.wash(30);
  assert.equal(st.get().needs.clean, 50);
  st.potty();
  assert.equal(st.get().needs.potty, 100);
  st.play(15);
  assert.equal(st.get().needs.fun, 35);
  assert.equal(st.get().xp, XP.wash + XP.potty + XP.play);
});

test('wash зажат до 100', () => {
  st.wash(500);
  assert.equal(st.get().needs.clean, 100);
});

test('pet: +1 fun, XP не чаще раза в 3 с', () => {
  setNeeds({ fun: 50 });
  st.pet();
  now += 1000;
  st.pet();
  assert.equal(st.get().needs.fun, 52);
  assert.equal(st.get().xp, XP.pet);
  now += 2000;
  st.pet();
  assert.equal(st.get().xp, 2 * XP.pet);
});

test('уровень растёт по XP_PER_LEVEL и шлёт levelup', () => {
  const levels = [];
  st.on('levelup', (l) => levels.push(l));
  const n = Math.ceil(XP_PER_LEVEL / XP.play);
  for (let i = 0; i < n; i++) st.play(1);
  assert.equal(st.get().level, 2);
  assert.deepEqual(levels, [2]);
});

test('addCoins и recordRun', () => {
  st.addCoins(10);
  st.recordRun({ score: 120, coins: 15 });
  st.recordRun({ score: 80, coins: 5 });
  const s = st.get();
  assert.equal(s.coins, 80);
  assert.equal(s.best, 120);
});

test('daily: первый день, повтор в тот же день даёт 0', () => {
  assert.equal(st.claimDaily(), DAILY_BONUS.base);
  assert.equal(st.get().streak, 1);
  assert.equal(st.claimDaily(), 0);
  assert.equal(st.get().coins, 50 + DAILY_BONUS.base);
});

test('daily: серия растёт по дням, бонус ограничен max', () => {
  const got = [];
  for (let i = 0; i < 12; i++) {
    got.push(st.claimDaily());
    now += DAY_MS;
  }
  assert.equal(got[1], DAILY_BONUS.base + DAILY_BONUS.perStreakDay);
  assert.equal(got[11], DAILY_BONUS.max);
  assert.equal(st.get().streak, 12);
});

test('daily: пропуск дня сбрасывает серию', () => {
  st.claimDaily();
  now += DAY_MS;
  st.claimDaily();
  now += 3 * DAY_MS;
  assert.equal(st.claimDaily(), DAILY_BONUS.base);
  assert.equal(st.get().streak, 1);
});

test('daily: шлёт событие с монетами', () => {
  const got = [];
  st.on('daily', (c) => got.push(c));
  st.claimDaily();
  assert.deepEqual(got, [DAILY_BONUS.base]);
});

test('buy: монеты, уровень, владение', () => {
  const crown = OUTFITS.find((o) => o.id === 'crown');
  assert.equal(st.buy('crown'), false);
  st.get().coins = 1000;
  assert.equal(st.buy('crown'), false);
  st.get().level = crown.level;
  assert.equal(st.buy('crown'), true);
  assert.equal(st.get().coins, 1000 - crown.price);
  assert.deepEqual(st.get().owned, ['crown']);
  assert.equal(st.buy('crown'), false);
  assert.equal(st.buy('nope'), false);
});

test('buy: не хватает монет', () => {
  st.get().coins = 10;
  assert.equal(st.buy('bow'), false);
  assert.deepEqual(st.get().owned, []);
});

test('equip: только купленное и в свой слот, null снимает', () => {
  st.get().coins = 100;
  st.equip('head', 'bow');
  assert.equal(st.get().equipped.head, null);
  st.buy('bow');
  st.equip('eyes', 'bow');
  assert.equal(st.get().equipped.eyes, null);
  st.equip('head', 'bow');
  assert.equal(st.get().equipped.head, 'bow');
  st.equip('head', null);
  assert.equal(st.get().equipped.head, null);
});

test('wants: ниже wantAt по возрастанию, urgent ниже urgentAt', () => {
  setNeeds({ food: 35, clean: 10, fun: 39, energy: 41 });
  assert.deepEqual(st.wants(), [
    { need: 'clean', level: 'urgent' },
    { need: 'food', level: 'want' },
    { need: 'fun', level: 'want' },
  ]);
});

test('mood: нейтрально и счастлив', () => {
  setNeeds({ food: 60 });
  assert.equal(st.mood(), 'neutral');
  setNeeds(allFull);
  assert.equal(st.mood(), 'happy');
});

test('mood: грусть при want', () => {
  setNeeds({ fun: 30 });
  assert.equal(st.mood(), 'sad');
});

test('mood: приоритеты potty, dirty, tired', () => {
  setNeeds({ clean: 10, energy: 10, potty: 10 });
  assert.equal(st.mood(), 'potty');
  setNeeds({ potty: 80 });
  assert.equal(st.mood(), 'dirty');
  setNeeds({ clean: 80 });
  assert.equal(st.mood(), 'tired');
});

test('mood: dirty при clean ниже wantAt, даже не urgent', () => {
  setNeeds({ clean: 35 });
  assert.equal(st.mood(), 'dirty');
});

test('mood: angry после 30 минут urgent подряд', () => {
  setNeeds({ food: 10 });
  st.tick(0);
  assert.equal(st.mood(), 'sad');
  now += 29 * 60 * 1000;
  st.tick(0);
  assert.equal(st.mood(), 'sad');
  now += 2 * 60 * 1000;
  st.tick(0);
  assert.equal(st.mood(), 'angry');
});

test('mood: когда urgent прошёл, angry сбрасывается', () => {
  setNeeds({ food: 10 });
  st.tick(0);
  now += 40 * 60 * 1000;
  st.tick(0);
  setNeeds(allFull);
  st.tick(0);
  assert.equal(st.mood(), 'happy');
});

test('giftReady: после unlockAfterFeeds кормлений и пока не показан', () => {
  assert.equal(st.giftReady(), false);
  st.get().feeds = GIFT.unlockAfterFeeds;
  assert.equal(st.giftReady(), true);
  st.markGiftSeen();
  assert.equal(st.giftReady(), false);
});

test('change: срабатывает при действиях', () => {
  let n = 0;
  st.on('change', () => n++);
  st.addCoins(1);
  st.wash(1);
  assert.equal(n, 2);
});

test('change: tick шлёт событие только при заметном изменении', () => {
  let n = 0;
  st.on('change', () => n++);
  st.tick(1);
  assert.equal(n, 0);
  st.tick(HOUR);
  assert.equal(n, 1);
});

test('сохранение: flush пишет в localStorage с версией и lastSeen', () => {
  st.addCoins(5);
  st.flush();
  const s = JSON.parse(mem.getItem('pushin.v1'));
  assert.equal(s.coins, 55);
  assert.equal(s.version, 1);
  assert.equal(s.lastSeen, now);
});

test('сохранение: дебаунс 2 с', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  st.addCoins(5);
  t.mock.timers.tick(1500);
  st.addCoins(5);
  t.mock.timers.tick(1500);
  assert.equal(mem.getItem('pushin.v1'), null);
  t.mock.timers.tick(600);
  assert.equal(JSON.parse(mem.getItem('pushin.v1')).coins, 60);
});

const withCloud = (value, { initData = 'qid=1', version = true } = {}) => {
  const box = { data: {}, sets: 0 };
  if (value) box.data['pushin.v1'] = JSON.stringify(value);
  globalThis.window = { Telegram: { WebApp: {
    initData,
    isVersionAtLeast: () => version,
    CloudStorage: {
      getItem: (k, cb) => cb(null, box.data[k] ?? ''),
      setItem: (k, v, cb) => { box.sets++; box.data[k] = v; cb(null, true); },
    },
  } } };
  return box;
};

test('выбор сохранения: облако свежее localStorage', async () => {
  withCloud(saved({ coins: 999, lastSeen: now - 1000 }));
  const s = await loadWith(saved({ coins: 1, lastSeen: now - 5000 }));
  assert.equal(s.coins, 999);
});

test('выбор сохранения: localStorage свежее облака', async () => {
  withCloud(saved({ coins: 999, lastSeen: now - 5000 }));
  const s = await loadWith(saved({ coins: 1, lastSeen: now - 1000 }));
  assert.equal(s.coins, 1);
});

test('выбор сохранения: облако пусто, берём localStorage', async () => {
  withCloud(null);
  const s = await loadWith(saved({ coins: 3 }));
  assert.equal(s.coins, 3);
});

test('облако: ошибка не ломает загрузку и запись', async () => {
  globalThis.window = { Telegram: { WebApp: {
    initData: 'qid=1',
    isVersionAtLeast: () => true,
    CloudStorage: { getItem: () => { throw new Error('nope'); }, setItem: () => { throw new Error('nope'); } },
  } } };
  const s = await loadWith(saved({ coins: 3 }));
  assert.equal(s.coins, 3);
  st.addCoins(1);
  assert.doesNotThrow(() => st.flush());
});

test('облако: flush пишет состояние', async () => {
  const box = withCloud(null);
  await st.load();
  st.addCoins(1);
  st.flush();
  assert.equal(JSON.parse(box.data['pushin.v1']).coins, 51);
});

test('без Telegram облако не используется', async () => {
  await st.load();
  assert.doesNotThrow(() => st.flush());
});

test('пустой initData или старый Telegram — без облака', async () => {
  const a = withCloud(saved({ coins: 999 }), { initData: '' });
  let s = await loadWith(saved({ coins: 3 }));
  assert.equal(s.coins, 3);
  st.flush();
  assert.equal(a.sets, 0);
  const b = withCloud(saved({ coins: 999 }), { version: false });
  s = await loadWith(saved({ coins: 4 }));
  assert.equal(s.coins, 4);
  st.flush();
  assert.equal(b.sets, 0);
});
