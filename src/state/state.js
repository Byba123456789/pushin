import { FOOD, OUTFITS, XP, XP_PER_LEVEL, DAILY_BONUS, GIFT } from './catalog.js';

const KEY = 'pushin.v1';
const SAVE_DELAY_MS = 2000;
const AUTOSAVE_MS = 30000;
const CLOUD_TIMEOUT_MS = 5000;
const PET_XP_GAP_MS = 3000;
const ANGRY_AFTER_MS = 30 * 60 * 1000;
const FULL_FOOD = 98;
const HOUR_MS = 3600 * 1000;
// fetch вместо import-атрибутов JSON: их нет в старых WebView Telegram
const rules = await (await fetch(new URL('./rules.json', import.meta.url))).json();

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
  lastSeen: clock(), version: 1,
});

let s = freshState();

const clamp = (v) => Math.max(0, Math.min(100, v));
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

const normalize = (x) => {
  const f = freshState();
  return { ...f, ...x, needs: { ...f.needs, ...x.needs }, equipped: { ...f.equipped, ...x.equipped }, version: 1 };
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

function signature() {
  return rules.needs.map((k) => Math.round(s.needs[k])).join() + mood() + s.sleeping;
}

function refreshUrgent() {
  const urgent = rules.needs.some((k) => s.needs[k] < rules.urgentAt);
  urgentSince = urgent ? (urgentSince ?? clock()) : null;
}

function changed() {
  refreshUrgent();
  emit('change');
  schedule();
}

function addXp(n) {
  s.xp += n;
  const level = 1 + Math.floor(s.xp / XP_PER_LEVEL);
  if (level > s.level) {
    s.level = level;
    emit('levelup', level);
  }
}

function wake() {
  s.sleeping = false;
  addXp(XP.sleep);
}

function advance(hours) {
  for (const k of rules.needs) {
    if (s.sleeping && k === 'energy') {
      s.needs.energy = clamp(s.needs.energy + rules.sleepEnergyPerHour * hours);
    } else if (s.needs[k] > rules.floor) {
      const rate = rules.decayPerHour[k] * (s.sleeping ? 0.5 : 1);
      s.needs[k] = Math.max(rules.floor, s.needs[k] - rate * hours);
    }
  }
  if (s.sleeping && s.needs.energy >= 100) wake();
}

export async function load() {
  const [local, remote] = [readLocal(), await readRemote()];
  const saved = [local, remote].filter(Boolean).sort((a, b) => b.lastSeen - a.lastSeen)[0];
  s = saved ? normalize(saved) : freshState();
  awayMs = saved ? Math.max(clock() - s.lastSeen, 0) : 0;
  if (saved) {
    const hours = Math.min(awayMs / HOUR_MS, rules.maxOfflineHours);
    advance(hours * rules.offlineFactor);
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
  if (!food || s.coins < food.price || s.needs.food >= FULL_FOOD) return false;
  s.coins -= food.price;
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
  if (v) s.sleeping = true;
  else wake();
  changed();
}

export function addCoins(n) {
  s.coins += n;
  changed();
}

export function buy(outfitId) {
  const item = OUTFITS.find((o) => o.id === outfitId);
  if (!item || s.owned.includes(item.id) || s.level < item.level || s.coins < item.price) return false;
  s.coins -= item.price;
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

export function wants() {
  return rules.needs
    .filter((k) => s.needs[k] < rules.wantAt)
    .sort((a, b) => s.needs[a] - s.needs[b])
    .map((need) => ({ need, level: s.needs[need] < rules.urgentAt ? 'urgent' : 'want' }));
}

export function mood() {
  const n = s.needs;
  if (n.potty < rules.urgentAt) return 'potty';
  if (n.clean < rules.wantAt) return 'dirty';
  if (n.energy < rules.urgentAt) return 'tired';
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
