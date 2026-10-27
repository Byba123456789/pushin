import { FOOD, OUTFITS, XP, DAILY_BONUS, GIFT, HOME_ACTS, WATER_GAP_HOURS, xpToNext, xpAtLevel, levelAtXp } from './catalog.js';

const KEY = 'pushin.v1';
const SAVE_DELAY_MS = 2000;
const AUTOSAVE_MS = 30000;
const CLOUD_TIMEOUT_MS = 5000;
const PET_XP_GAP_MS = 3000;
const ANGRY_AFTER_MS = 30 * 60 * 1000;
const FULL_FOOD = 98;
const SCHEMA = 2;
const OLD_XP_PER_LEVEL = 100;
const SLEEP_XP_HOURS = 0.5;
const MAX_LEVEL = 50;
const FRIEND_NAME_MAX = 16;
const HOUR_MS = 3600 * 1000;
const WATER_GAP_MS = WATER_GAP_HOURS * HOUR_MS;
// fetch вместо import-атрибутов JSON: их нет в старых WebView Telegram
const rules = await (await fetch(new URL('./rules.json' + new URL(import.meta.url).search, import.meta.url))).json();

let clock = Date.now;
let storage = globalThis.localStorage;
let listeners = {};
let saveTimer = null;
let lastSavedAt = 0;
let lastPetXpAt = -Infinity;
let urgentSince = null;
let watching = false;
let awayMs = 0;

const freshState = () => ({
  needs: { food: 80, clean: 80, energy: 80, fun: 80, potty: 80 },
  coins: 50, xp: 0, level: 1, owned: [], equipped: { head: null, eyes: null, body: null },
  sleeping: false, feeds: 0, best: 0, giftSeen: false, streak: 0, lastDaily: null,
  sleptHours: 0, curtainsClosed: false, lastBrush: 0, infCoins: false, friend: { name: null, equipped: { head: null, eyes: null, body: null } },
  wateredAt: 0, lastSeen: clock(), version: 1, schema: SCHEMA,
});

let s = freshState();

const clamp = (v) => Math.max(0, Math.min(100, v));
const canPay = (n) => s.infCoins || s.coins >= n;
const pay = (n) => {
  if (!s.infCoins) s.coins -= n;
};
// облако Telegram привязано к аккаунту и переживает чистку памяти WebView; есть с Bot API 6.9
const cloud = () => {
  const tg = globalThis.window?.Telegram?.WebApp;
  return tg?.initData && tg.isVersionAtLeast?.('6.9') ? tg.CloudStorage : null;
};

export function _setClock(fn) { clock = fn; }
export function _setStorage(obj) { storage = obj; }
export function _reset() {
  clearTimeout(saveTimer);
  saveTimer = null;
  listeners = {};
  s = freshState();
  urgentSince = null;
  lastPetXpAt = -Infinity;
  lastSavedAt = clock();
}

export function on(ev, cb) { (listeners[ev] ??= []).push(cb); }
const emit = (ev, arg) => (listeners[ev] ?? []).forEach((cb) => cb(arg, s));

function schedule() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, SAVE_DELAY_MS);
}

export function flush() {
  clearTimeout(saveTimer);
  saveTimer = null;
  s.lastSeen = clock();
  lastSavedAt = s.lastSeen;
  const json = JSON.stringify(s);
  try { storage.setItem(KEY, json); } catch {}
  const c = cloud();
  if (c) try { c.setItem(KEY, json, () => {}); } catch {}
}

const isSaved = (x) => x && typeof x === 'object' && x.needs && Number.isFinite(x.lastSeen);

// старая кривая: 100 опыта на уровень; сохраняем уровень и долю прогресса внутри него
function migratedXp(x) {
  const level = Number.isFinite(x.level) ? Math.max(1, x.level) : 1;
  const share = Math.min(Math.max(((x.xp ?? 0) - OLD_XP_PER_LEVEL * (level - 1)) / OLD_XP_PER_LEVEL, 0), 0.999);
  return xpAtLevel(level) + Math.floor(share * xpToNext(level));
}

const normalize = (x) => {
  const f = freshState();
  const xp = x.schema >= SCHEMA ? x.xp : migratedXp(x);
  return {
    ...f, ...x, xp,
    needs: { ...f.needs, ...x.needs },
    equipped: { ...f.equipped, ...x.equipped },
    friend: { ...f.friend, ...x.friend, equipped: { ...f.friend.equipped, ...x.friend?.equipped } },
    version: 1, schema: SCHEMA,
  };
};

function readLocal() {
  try {
    const x = JSON.parse(storage.getItem(KEY));
    return isSaved(x) ? x : null;
  } catch {
    return null;
  }
}

function readRemote() {
  const c = cloud();
  if (!c) return Promise.resolve(null);
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), CLOUD_TIMEOUT_MS);
    const done = (x) => {
      clearTimeout(timer);
      resolve(isSaved(x) ? x : null);
    };
    try {
      c.getItem(KEY, (err, v) => {
        try { done(!err && v ? JSON.parse(v) : null); } catch { done(null); }
      });
    } catch {
      done(null);
    }
  });
}

export const isNight = (ms = clock()) => {
  const h = new Date(ms).getHours();
  return h >= rules.night.from || h < rules.night.to;
};

// доля ночи в промежутке, по часовым отрезкам локального времени
function nightShare(fromMs, toMs) {
  let night = 0;
  for (let t = fromMs; t < toMs;) {
    const next = Math.min(new Date(t).setMinutes(60, 0, 0), toMs);
    if (isNight(t)) night += next - t;
    t = next;
  }
  return night / (toMs - fromMs);
}

// просьба о сне имеет смысл только ночью
const asks = (k) => k !== 'energy' || isNight();

export const wantsSleep = () => isNight() && s.needs.energy < rules.wantAt;

function signature() {
  return rules.needs.map((k) => Math.round(s.needs[k])).join() + mood() + s.sleeping;
}

function refreshUrgent() {
  const urgent = rules.needs.some((k) => asks(k) && s.needs[k] < rules.urgentAt);
  urgentSince = urgent ? (urgentSince ?? clock()) : null;
}

function changed() {
  refreshUrgent();
  emit('change');
  schedule();
}

function addXp(n) {
  s.xp += n;
  const level = levelAtXp(s.xp);
  if (level > s.level) {
    s.level = level;
    emit('levelup', level);
  }
}

function wake() {
  const rested = s.sleptHours >= SLEEP_XP_HOURS;
  s.sleeping = false;
  s.sleptHours = 0;
  if (rested) addXp(XP.sleep);
}

function advance(hours, night = Number(isNight())) {
  for (const k of rules.needs) {
    if (s.sleeping && k === 'energy') {
      s.needs.energy = clamp(s.needs.energy + rules.sleepEnergyPerHour * hours);
    } else if (s.needs[k] > rules.floor) {
      const dayFactor = k === 'energy' ? night + (1 - night) * rules.dayEnergyFactor : 1;
      const rate = rules.decayPerHour[k] * (s.sleeping ? 0.5 : 1) * dayFactor;
      s.needs[k] = Math.max(rules.floor, s.needs[k] - rate * hours);
    }
  }
  if (s.sleeping) s.sleptHours += hours;
  if (s.sleeping && s.needs.energy >= 100) wake();
}

export async function load() {
  const [local, remote] = [readLocal(), await readRemote()];
  const saved = [local, remote].filter(Boolean).sort((a, b) => b.lastSeen - a.lastSeen)[0];
  s = saved ? normalize(saved) : freshState();
  awayMs = saved ? Math.max(clock() - s.lastSeen, 0) : 0;
  if (saved) {
    const hours = Math.min(awayMs / HOUR_MS, rules.maxOfflineHours);
    const end = clock();
    advance(hours * rules.offlineFactor, hours > 0 ? nightShare(end - hours * HOUR_MS, end) : 0);
  }
  s.lastSeen = clock();
  if (!watching && globalThis.document) {
    watching = true;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush();
    });
  }
  changed();
}

export const get = () => s;
export const away = () => awayMs;

export function tick(dt) {
  const before = signature();
  advance(dt / 3600);
  s.lastSeen = clock();
  refreshUrgent();
  if (signature() !== before) emit('change');
  if (s.lastSeen - lastSavedAt >= AUTOSAVE_MS) schedule();
}

export function feed(foodId) {
  const food = FOOD.find((f) => f.id === foodId);
  if (!food || !canPay(food.price) || s.needs.food >= FULL_FOOD) return false;
  pay(food.price);
  s.needs.food = clamp(s.needs.food + food.food);
  s.needs.fun = clamp(s.needs.fun + food.fun);
  s.needs.potty = clamp(s.needs.potty + food.potty);
  s.feeds++;
  addXp(XP.feed);
  changed();
  return true;
}

export function wash(amount) {
  s.needs.clean = clamp(s.needs.clean + amount);
  addXp(XP.wash);
  changed();
}

export function potty() {
  s.needs.potty = 100;
  addXp(XP.potty);
  changed();
}

export function play(amount) {
  s.needs.fun = clamp(s.needs.fun + amount);
  addXp(XP.play);
  changed();
}

export function readBook() {
  s.needs.fun = clamp(s.needs.fun + rules.readFun);
  addXp(XP.read);
  changed();
}

export const canBrush = () => clock() - s.lastBrush >= rules.brushGapHours * HOUR_MS;

export function brushTeeth() {
  if (!canBrush()) return false;
  s.needs.clean = clamp(s.needs.clean + rules.brushClean);
  s.lastBrush = clock();
  addXp(XP.brush);
  changed();
  return true;
}

export function homeAct(id) {
  const a = HOME_ACTS[id];
  if (!a) return false;
  s.needs.food = clamp(s.needs.food + (a.food ?? 0));
  s.needs.fun = clamp(s.needs.fun + (a.fun ?? 0));
  addXp(a.xp);
  changed();
  return true;
}

export function canWater() {
  const gone = clock() - s.wateredAt;
  return gone < 0 || gone >= WATER_GAP_MS;
}

export function water() {
  if (!canWater()) return false;
  s.wateredAt = clock();
  return homeAct('water');
}

export function setCurtains(closed) {
  s.curtainsClosed = closed;
  changed();
}

export function pet() {
  s.needs.fun = clamp(s.needs.fun + 1);
  if (clock() - lastPetXpAt >= PET_XP_GAP_MS) {
    lastPetXpAt = clock();
    addXp(XP.pet);
  }
  changed();
}

export function setSleeping(v) {
  if (v === s.sleeping) return;
  if (v) {
    s.sleeping = true;
    s.sleptHours = 0;
  } else wake();
  changed();
}

export function addCoins(n) {
  s.coins += n;
  changed();
}

export function buy(outfitId) {
  const item = OUTFITS.find((o) => o.id === outfitId);
  if (!item || s.owned.includes(item.id) || s.level < item.level || !canPay(item.price)) return false;
  pay(item.price);
  s.owned.push(item.id);
  changed();
  return true;
}

export function equip(slot, id) {
  if (id !== null) {
    const item = OUTFITS.find((o) => o.id === id);
    if (!item || item.slot !== slot || !s.owned.includes(id)) return;
  }
  s.equipped[slot] = id;
  changed();
}

export function equipFriend(slot, id) {
  if (id !== null) {
    const item = OUTFITS.find((o) => o.id === id);
    if (!item || item.slot !== slot || !s.owned.includes(id)) return;
  }
  s.friend.equipped[slot] = id;
  changed();
}

export function nameFriend(name) {
  s.friend.name = name.trim().slice(0, FRIEND_NAME_MAX) || null;
  changed();
}

export function devSetLevel(n) {
  s.level = Math.min(Math.max(Math.round(n), 1), MAX_LEVEL);
  s.xp = xpAtLevel(s.level);
  changed();
}

export function devUnlockAll() {
  s.owned = OUTFITS.map((o) => o.id);
  changed();
}

export function devFillNeeds() {
  for (const k of rules.needs) s.needs[k] = 100;
  changed();
}

export function devShowGift() {
  s.giftSeen = false;
  s.feeds = Math.max(s.feeds, GIFT.unlockAfterFeeds);
  changed();
}

export function devToggleInfinite() {
  s.infCoins = !s.infCoins;
  changed();
}

export function devReset() {
  s = freshState();
  changed();
}

export function wants() {
  return rules.needs
    .filter((k) => asks(k) && s.needs[k] < rules.wantAt)
    .sort((a, b) => s.needs[a] - s.needs[b])
    .map((need) => ({ need, level: s.needs[need] < rules.urgentAt ? 'urgent' : 'want' }));
}

export function mood() {
  const n = s.needs;
  if (n.potty < rules.urgentAt) return 'potty';
  if (n.clean < rules.wantAt) return 'dirty';
  if (n.energy < rules.urgentAt && isNight()) return 'tired';
  if (urgentSince !== null && clock() - urgentSince > ANGRY_AFTER_MS) return 'angry';
  if (wants().length) return 'sad';
  if (rules.needs.every((k) => n[k] > 70)) return 'happy';
  return 'neutral';
}

const dateKey = (ms) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

export function claimDaily() {
  const today = dateKey(clock());
  if (s.lastDaily === today) return 0;
  const yesterday = new Date(clock());
  yesterday.setDate(yesterday.getDate() - 1);
  s.streak = s.lastDaily === dateKey(yesterday.getTime()) ? s.streak + 1 : 1;
  s.lastDaily = today;
  const coins = Math.min(DAILY_BONUS.max, DAILY_BONUS.base + DAILY_BONUS.perStreakDay * (s.streak - 1));
  s.coins += coins;
  emit('daily', coins);
  changed();
  return coins;
}

export function recordRun({ score, coins }) {
  s.best = Math.max(s.best, score);
  s.coins += coins;
  addXp(XP.play);
  changed();
}

export const giftReady = () => s.feeds >= GIFT.unlockAfterFeeds && !s.giftSeen;

export function markGiftSeen() {
  s.giftSeen = true;
  changed();
}
