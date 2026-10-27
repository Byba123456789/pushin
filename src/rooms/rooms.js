import { register, go, W, H, scale } from '../core/engine.js';
import * as state from '../state/state.js';
import { createCat } from '../cat/cat.js';
import { createFriend } from '../cat/friend.js';
import { sfx, music, setMuted, isMuted } from '../audio/audio.js';
import { GIFT, FRIENDS } from '../state/catalog.js';
import { layout, background, drawLife, drawDark, drawScreen, drawShower, drawSponge, drawFoam, drawBowl } from './backgrounds.js';
import { iconImage } from './icons.js';
import { createUI } from './ui.js';
import { t, friendLabel, userName, phrases, scenes } from './strings.js';

const ROOMS = ['living', 'kitchen', 'bath', 'bedroom'];
const DANCES = ['dance1', 'dance2', 'dance3'];
const POSES = { living: ['read', 'music', 'yarn', 'box', 'laptop', 'blanket'], bedroom: ['read', 'blanket', 'laptop', 'music'], kitchen: [], bath: [] };
const FOOD_ANIM = { donut: 'donut', cake: 'cake', pizza: 'fastfood' };
const CONFETTI = ['#f6a5b6', '#ffd66b', '#9fdcc8', '#a9d4f5', '#c9b3ef'];
const FRIEND = FRIENDS[0];
const FRIEND_SCALE = 0.85;
const MISS_MS = 8 * 3600 * 1000;
const SLIDE = 0.4;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const tg = window.Telegram && window.Telegram.WebApp;
const cat = createCat();

let ui = null;
let room = 'living';
let L = null;
let LH = 0;
let catX = 90;
let catY = 0;
let floorLimit = Infinity;
let time = 0;
let seq = 0;
let switching = false;
let started = false;
let busy = null;
let walk = null;
let timers = [];
let slide = null;
let ptr = null;
let petting = false;
let petClock = 0;
let lastPet = -99;
let tool = null;
let foam = [];
let scrub = 0;
let scrubSfx = 0;
let washAcc = 0;
let cleanHintAt = -9;
let fridgeOpen = false;
let wardrobeOpen = false;
let tvOn = false;
let screen = false;
let catHidden = false;
let lightsOff = false;
let shower = null;
let giftOpen = 0;
let giftShown = false;
let bowlFood = null;
let bowlHidden = false;
let bowlHot = false;
let parts = [];
let taps = [];
let sulkUntil = 0;
let idleIn = 6;
let lastMeow = -130;
let lastSay;
let prevLevel = 0;
let hudIn = 0;
let musicOn = false;
let friend = null;
let fr = null;
let speech = { cat: 0, friend: 0 };
let talkIn = 25 + Math.random() * 30;
let lastPhrase = '';
let sceneIn = 60 + Math.random() * 60;
let lastInput = 0;

function haptic(kind = 'light') {
  if (!tg || !tg.isVersionAtLeast || !tg.isVersionAtLeast('6.1')) return;
  if (kind === 'success' || kind === 'error' || kind === 'warning') tg.HapticFeedback.notificationOccurred(kind);
  else tg.HapticFeedback.impactOccurred(kind);
}

function after(s, fn) {
  timers.push({ t: s, fn });
}

function guard(fn) {
  const id = seq;
  return (...a) => {
    if (id === seq) fn(...a);
  };
}

function getL() {
  if (LH !== H) {
    L = layout(H);
    LH = H;
  }
  return L;
}

function inside(z, p, pad = 0) {
  return p.x >= z.x - pad && p.x <= z.x + z.w + pad && p.y >= z.y - pad && p.y <= z.y + z.h + pad;
}

function canvasRect() {
  return document.getElementById('game').getBoundingClientRect();
}

function toLogical(cx, cy) {
  const r = canvasRect();
  return { x: ((cx - r.left) / r.width) * W, y: ((cy - r.top) / r.height) * H };
}

function toClient(x, y) {
  const r = canvasRect();
  return { x: r.left + (x / W) * r.width, y: r.top + (y / H) * r.height };
}

function hint(key, vars) {
  ui.toast(t(key, vars));
}

const catHit = (x, y) => (catHidden ? null : cat.hit(catX, catY, x, y));
const mouth = () => ({ x: catX, y: catY - cat.height * 0.5 });
const friendOn = () => state.get().level >= FRIEND.level;
const friendName = () => friendLabel(state.get().friend);
const giftVisible = () => state.giftReady();

function say(id, text, dur = 3.6) {
  speech[id] = dur;
  ui.speech(id, text);
}

function shush() {
  speech = { cat: 0, friend: 0 };
  if (ui) {
    ui.speech('cat', null);
    ui.speech('friend', null);
  }
}

function sayPhrase(kind) {
  const list = phrases(kind).filter((p) => p !== lastPhrase);
  lastPhrase = list[Math.floor(Math.random() * list.length)];
  say('cat', lastPhrase);
}

function speakSolo() {
  const wants = state.wants();
  if (wants.length && Math.random() < 0.7) sayPhrase(wants[0].need);
  else {
    sayPhrase('love');
    cat.emit('heart');
  }
}

function burst(kind, x, y, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 20 + Math.random() * 40;
    const heart = kind === 'hearts';
    parts.push({
      kind, x, y,
      vx: Math.cos(a) * sp * (heart ? 0.3 : 1),
      vy: heart ? -18 - Math.random() * 18 : Math.sin(a) * sp - 30,
      g: heart ? 0 : 120,
      life: 0.7 + Math.random() * 0.7,
      col: kind === 'crumbs' ? (i % 2 ? '#e9b47a' : '#8a5a3b') : kind === 'drops' ? '#8fd0f5' : CONFETTI[i % CONFETTI.length],
    });
  }
}

function walkTo(x, cb) {
  if (Math.abs(x - catX) < 2) {
    if (cb) cb();
    return;
  }
  cat.facing = x > catX ? 1 : -1;
  cat.play('run', { loop: true });
  walk = { x, cb };
}

function free() {
  if (state.get().sleeping) {
    hint('sleeping');
    return false;
  }
  if (busy) {
    hint('busy');
    return false;
  }
  return true;
}

function refreshActions() {
  if (!ui) return;
  const list = {
    living: [
      { id: 'console', icon: 'console', label: t('console') },
      { id: 'dance', icon: 'dance', label: t('dance') },
      { id: 'wardrobe', icon: 'wardrobe', label: t('wardrobe'), pressed: wardrobeOpen },
      ...(giftShown ? [{ id: 'gift', icon: 'gift', label: t('giftBox') }] : []),
    ],
    kitchen: [{ id: 'fridge', icon: 'fridge', label: t('fridge'), pressed: fridgeOpen }],
    bath: [
      { id: 'sponge', icon: 'sponge', label: t('sponge'), pressed: tool === 'sponge' },
      { id: 'rinse', icon: 'rinse', label: t('rinse') },
      { id: 'toilet', icon: 'potty', label: t('toilet') },
    ],
    bedroom: [{ id: 'light', icon: lightsOff ? 'light' : 'moon', label: t(lightsOff ? 'lightOn' : 'lightOff') }],
  };
  ui.setActions(list[room]);
}

function refreshInvite() {
  if (ui) ui.invite(room === 'living' && !friendOn() ? t('invite', { name: friendName(), n: FRIEND.level }) : null);
}

function layoutFloor() {
  if (!ui) return;
  const r = canvasRect();
  floorLimit = ((ui.bottomTop() - r.top) / r.height) * H - 4;
}

function resetFriend() {
  if (!friend) {
    friend = createFriend(FRIEND.id);
    friend.mood = 'happy';
  }
  friend.food = null;
  fr = { x: L.living.sofa.x, y: L.living.sofa.y, mode: 'sofa', next: 5 + Math.random() * 5, walk: null, hop: null, busy: false };
  friend.facing = 1;
  friend.play('idle');
}

function resetRoom() {
  seq++;
  timers = [];
  walk = null;
  busy = null;
  petting = false;
  ptr = null;
  tool = null;
  foam = [];
  fridgeOpen = false;
  wardrobeOpen = false;
  tvOn = false;
  screen = false;
  catHidden = false;
  shower = null;
  giftOpen = 0;
  bowlFood = null;
  bowlHidden = false;
  bowlHot = false;
  cat.food = null;
  shush();
  catX = 90;
  lightsOff = state.get().sleeping;
  if (musicOn) {
    music(null);
    musicOn = false;
  }
  if (ui) {
    ui.fridge(false);
    ui.wardrobe(false);
    ui.dev(false);
  }
  if (!lightsOff) cat.play('idle');
}

function switchBy(dir) {
  const i = ROOMS.indexOf(room) + dir;
  if (i >= 0 && i < ROOMS.length) switchTo(ROOMS[i]);
}

function switchTo(name) {
  if (name === room || slide) return;
  if (state.get().sleeping) {
    hint('sleeping');
    haptic('warning');
    return;
  }
  const from = room;
  const dir = ROOMS.indexOf(name) > ROOMS.indexOf(room) ? 1 : -1;
  switching = true;
  go(name);
  switching = false;
  if (!reduced.matches) {
    slide = { from, dir, t: 0 };
    cat.facing = dir;
    cat.play('run', { loop: true });
  }
  sfx('whoosh');
  haptic();
}

function arrive(params) {
  const s = state.get();
  if (!started) {
    started = true;
    prevLevel = s.level;
    if (state.away() > MISS_MS) ui.modal({ title: t('missTitle'), text: t('missText'), icon: 'heart' });
    const bonus = state.claimDaily();
    if (bonus > 0) ui.modal({ title: t('dailyTitle'), text: t('dailyText', { n: bonus }), sub: t('streak', { d: state.get().streak }), icon: 'coin', onClose: () => sfx('coin') });
  }
  if (params && params.coins > 0) {
    hint('coinsWon', { n: params.coins });
    sfx('coin');
    burst('confetti', catX, catY - cat.height, 14);
  }
  if (!s.sleeping) cat.play('wave');
}

function enter(name, params) {
  room = name;
  getL();
  if (!ui) {
    ui = createUI(handlers);
    ui.setMuted(isMuted());
    window.addEventListener('keydown', onKey);
  }
  resetRoom();
  const s = state.get();
  if (s.sleeping) room = 'bedroom';
  if (room === 'living' && friendOn()) resetFriend();
  ui.setRoom(room, s.sleeping);
  refreshActions();
  refreshInvite();
  ui.render(s);
  layoutFloor();
  if (!switching) arrive(params);
}

function exit() {
  if (switching) return;
  resetRoom();
  slide = null;
  parts = [];
  window.removeEventListener('keydown', onKey);
  ui.destroy();
  ui = null;
}

function onKey(e) {
  if (!ui || ui.modalOpen() || e.target instanceof HTMLInputElement) return;
  if (e.key === 'ArrowLeft') switchBy(-1);
  if (e.key === 'ArrowRight') switchBy(1);
}

function broke() {
  hint('noCoins');
  cat.play('sad');
  cat.emit('tear');
  haptic('error');
}

function turnAway(sec) {
  cat.facing = -cat.facing;
  after(sec, () => (cat.facing = -cat.facing));
}

function canFeed(item) {
  const s = state.get();
  if (s.sleeping || busy) return false;
  if (s.needs.food >= 98) {
    hint('full');
    turnAway(1.6);
    return false;
  }
  if (s.coins < item.price) {
    broke();
    return false;
  }
  return true;
}

function bowlTarget() {
  const b = L.kitchen.bowl;
  return { x: b.x, y: b.y - 18 };
}

function nearBowl(p) {
  const b = bowlTarget();
  const m = mouth();
  return Math.hypot(p.x - b.x, p.y - b.y) < 28 || Math.hypot(p.x - m.x, p.y - m.y) < 28;
}

function putInBowl(item) {
  if (!state.feed(item.id)) {
    busy = null;
    broke();
    return;
  }
  bowlFood = item.id;
  busy = 'eat';
  sfx('pop');
  haptic('success');
  const special = FOOD_ANIM[item.id];
  walkTo(L.kitchen.bowl.x - 40, guard(() => {
    cat.facing = 1;
    if (special) bowlFood = null;
    else {
      bowlHidden = true;
      cat.food = item.id;
    }
    sfx('eat');
    const m = mouth();
    burst('crumbs', m.x + 20, m.y + 10, 8);
    cat.play(special || 'eat', {
      onDone: guard(() => {
        bowlHidden = false;
        bowlFood = null;
        cat.food = null;
        busy = null;
        cat.play('happy');
        cat.emit('heart');
      }),
    });
  }));
}

function petTick() {
  if (time - lastPet >= 3) {
    lastPet = time;
    state.pet();
  }
}

function beginPet() {
  if (busy || state.get().sleeping || time < sulkUntil) return;
  walk = null;
  petting = true;
  petClock = 0;
  cat.play('love', { loop: true });
  cat.emit('heart');
  sfx('purr');
  petTick();
  haptic();
}

function endPet() {
  petting = false;
  cat.play('happy');
}

function tapCat(zone) {
  if (state.get().sleeping) {
    wake();
    return;
  }
  if (busy) return;
  taps = taps.filter((x) => time - x < 2);
  taps.push(time);
  if (time < sulkUntil) return;
  if (taps.length > 5) {
    taps = [];
    sulkUntil = time + 2.5;
    walk = null;
    cat.play('shocked');
    turnAway(2.5);
    hint('tooMany');
    haptic('warning');
    return;
  }
  walk = null;
  haptic();
  if (zone === 'head') {
    if (Math.random() < 0.25 && speech.cat <= 0) sayPhrase('love');
    cat.play('shy');
    cat.emit('heart');
    sfx('purr');
    petTick();
  } else if (zone === 'belly') cat.play('laugh');
  else if (zone === 'tail') cat.play('lookback');
  else if (zone === 'ears') cat.play('wow');
  else if (zone === 'nose') {
    if (Math.random() < 0.2) {
      cat.play('sneeze');
      sfx('sneeze');
    } else {
      cat.play('happy');
      cat.emit('sparkle');
    }
  }
}

function friendHit(p) {
  if (!fr || room !== 'living' || !friendOn()) return null;
  const s = FRIEND_SCALE;
  return friend.hit(fr.x, fr.y, fr.x + (p.x - fr.x) / s, fr.y + (p.y - fr.y) / s);
}

function tapFriend() {
  if (fr.busy) return;
  friend.play(Math.random() < 0.5 ? 'love' : 'shy');
  friend.emit('heart');
  sfx('purr');
  haptic();
}

function tapObject(p) {
  const z = L[room];
  if (room === 'living') {
    if (giftVisible() && inside(z.gift, p, 4)) openGift();
    else if (inside(z.tv, p)) startGaming();
    else if (inside(z.wardrobe, p)) toggleWardrobe();
  } else if (room === 'kitchen' && inside(z.fridge, p)) toggleFridge();
  else if (room === 'bath' && inside(z.toilet, p)) tryPotty();
  else if (room === 'bedroom' && (inside(z.sw, p) || inside(z.lamp, p))) toggleLight();
}

function toggleFridge() {
  if (!fridgeOpen && !free()) return;
  fridgeOpen = !fridgeOpen;
  walk = null;
  if (fridgeOpen) ui.dev(false);
  ui.fridge(fridgeOpen);
  refreshActions();
  sfx('pop');
  haptic();
}

function toggleWardrobe() {
  if (!wardrobeOpen && !free()) return;
  wardrobeOpen = !wardrobeOpen;
  walk = null;
  if (wardrobeOpen) ui.dev(false);
  ui.wardrobe(wardrobeOpen);
  refreshActions();
  sfx('pop');
  haptic();
}

function toggleSponge() {
  if (tool !== 'sponge' && !free()) return;
  tool = tool ? null : 'sponge';
  walk = null;
  if (tool) hint('spongeHint');
  refreshActions();
  haptic();
}

function scrubMove(d, p) {
  if (state.get().needs.clean >= 98 && !foam.length) {
    if (time - cleanHintAt > 3) hint('cleanAlready');
    cleanHintAt = time;
    return;
  }
  if (cat.anim !== 'wash') cat.play('wash', { loop: true });
  scrub += d;
  while (scrub >= 16) {
    scrub -= 16;
    washAcc++;
    if (foam.length < 30) {
      const dx = p.x - catX + (Math.random() - 0.5) * 8;
      const dy = Math.max(-cat.height + 8, Math.min(-6, p.y - catY + (Math.random() - 0.5) * 8));
      foam.push({ dx, dy, s: 3 + Math.random() * 3 });
    }
    if (washAcc % 3 === 0) state.wash(2);
    if (foam.length === 14) hint('rinseHint');
  }
  if (time - scrubSfx > 0.3) {
    scrubSfx = time;
    sfx('scrub');
  }
}

function rinse() {
  if (!foam.length) {
    hint('noFoam');
    return;
  }
  if (!free()) return;
  busy = 'rinse';
  tool = null;
  refreshActions();
  shower = { t: 0 };
  sfx('splash');
  haptic();
  after(1.6, () => {
    shower = null;
    foam = [];
    state.wash(10);
    burst('drops', catX, catY - cat.height / 2, 18);
    sfx('splash');
    cat.play('shake', {
      onDone: guard(() => {
        busy = null;
        cat.play('happy');
        cat.emit('sparkle');
      }),
    });
  });
}

function tryPotty() {
  if (room !== 'bath' || !free()) return;
  if (!state.wants().some((w) => w.need === 'potty')) {
    hint('notPotty');
    return;
  }
  busy = 'potty';
  tool = null;
  refreshActions();
  haptic();
  walkTo(152, guard(() => {
    catHidden = true;
    screen = true;
    after(2, () => {
      sfx('flush');
      burst('drops', 155, L.F - 20, 8);
      after(0.8, () => {
        screen = false;
        catHidden = false;
        state.potty();
        walkTo(90, guard(() => {
          busy = null;
          cat.play('happy');
          cat.emit('sparkle');
        }));
      });
    });
  }));
}

function toggleLight() {
  if (state.get().sleeping || lightsOff) wake();
  else sleep();
}

function sleep() {
  if (busy) {
    hint('busy');
    return;
  }
  busy = 'sleep';
  lightsOff = true;
  refreshActions();
  sfx('tap');
  haptic();
  walkTo(90, guard(() => {
    busy = null;
    state.setSleeping(true);
    cat.sleeping = true;
    ui.setRoom(room, true);
  }));
}

function wake() {
  seq++;
  walk = null;
  busy = null;
  lightsOff = false;
  state.setSleeping(false);
  cat.sleeping = false;
  cat.play('yawn');
  sfx('yawn');
  haptic();
  ui.setRoom(room, false);
  refreshActions();
}

function startGaming() {
  if (!free()) return;
  busy = 'game';
  if (wardrobeOpen) toggleWardrobe();
  walkTo(100, guard(() => {
    cat.facing = 1;
    tvOn = true;
    cat.play('gaming', { loop: true });
    state.play(15);
    sfx('tap');
    after(6, () => {
      tvOn = false;
      busy = null;
      cat.play('happy');
      cat.emit('sparkle');
    });
  }));
}

function startDance() {
  if (!free()) return;
  if (wardrobeOpen) toggleWardrobe();
  busy = 'dance';
  walk = null;
  const a = DANCES[Math.floor(Math.random() * DANCES.length)];
  cat.play(a, { loop: true });
  if (fr && room === 'living' && !fr.busy && fr.mode === 'floor') {
    friend.facing = catX > fr.x ? 1 : -1;
    friend.play(a, { loop: true });
  }
  music('home');
  musicOn = true;
  state.play(5);
  haptic();
  after(5, () => {
    music(null);
    musicOn = false;
    busy = null;
    cat.play('happy');
    if (fr && !fr.busy) friend.play('idle');
  });
}

function celebrate(snd) {
  walk = null;
  cat.outfit = { ...state.get().equipped };
  cat.play('jump');
  cat.emit('sparkle');
  sfx(snd);
  haptic('success');
}

function openGift() {
  if (!free()) return;
  busy = 'gift';
  if (wardrobeOpen) toggleWardrobe();
  const g = L.living.gift;
  walkTo(g.x - 52, guard(() => {
    cat.facing = 1;
    cat.play('wow');
    after(0.7, () => {
      giftOpen = 0.01;
      sfx('pop');
      burst('confetti', g.x + 14, g.y + 4, 26);
      burst('hearts', g.x + 14, g.y, 7);
      cat.play('happy');
      cat.emit('heart');
      after(0.9, () => {
        state.markGiftSeen();
        giftOpen = 0;
        busy = null;
        haptic('success');
        ui.modal({
          gift: true,
          title: t('giftTitle'),
          sub: userName ? t('giftFor', { name: userName }) : '',
          text: GIFT.message || t('giftPlaceholder'),
          icon: 'gift',
          onClose: () => {
            burst('hearts', catX, catY - cat.height, 8);
            cat.emit('heart');
          },
        });
      });
    });
  }));
}

function friendWalk(x, cb) {
  friend.facing = x > fr.x ? 1 : -1;
  friend.play('run', { loop: true });
  fr.walk = { x, cb };
}

function friendHop(x, y, mode, cb) {
  friend.play('jump');
  fr.hop = { x0: fr.x, y0: fr.y, x1: x, y1: y, t: 0, mode, cb };
}

function friendAction() {
  const r = Math.random();
  const floorY = H - 76;
  const sofa = L.living.sofa;
  if (fr.mode === 'sofa') {
    if (r < 0.35) friend.play('wave');
    else friendHop(sofa.x - 26, floorY, 'floor', () => friendWalk(24 + Math.random() * 130));
  } else if (r < 0.6) friendWalk(20 + Math.random() * 140);
  else friendWalk(sofa.x - 26, () => friendHop(sofa.x, sofa.y, 'sofa'));
}

function endScene(d) {
  after(d, () => {
    busy = null;
    fr.busy = false;
    tvOn = false;
    cat.food = null;
    friend.food = null;
    cat.play('idle');
    friend.play('idle');
    if (musicOn) {
      music(null);
      musicOn = false;
    }
  });
}

function sceneAct(act, side) {
  const both = (a, opts) => {
    cat.play(a, opts);
    friend.play(a, opts);
  };
  if (act === 'hug') {
    both('hug');
    burst('hearts', catX + side * 25, catY - 50, 7);
    sfx('purr');
    endScene(2.6);
  } else if (act === 'dance') {
    both(DANCES[Math.floor(Math.random() * DANCES.length)], { loop: true });
    music('home');
    musicOn = true;
    endScene(4.5);
  } else if (act === 'eat') {
    cat.food = 'cookie';
    friend.food = 'cookie';
    both('eat');
    sfx('eat');
    endScene(3);
  } else if (act === 'tv') {
    tvOn = true;
    walkTo(104, guard(() => (cat.facing = 1)));
    friendWalk(58, () => (friend.facing = 1));
    endScene(6);
  } else if (act === 'shy') {
    cat.play('shy');
    friend.play('love');
    burst('hearts', catX, catY - 60, 5);
    endScene(2.6);
  } else {
    both(act, { loop: act !== 'laugh' });
    endScene(act === 'laugh' ? 2.6 : 5.5);
  }
}

function runLines(sc, i, side) {
  if (i >= sc.lines.length) {
    sceneAct(sc.act, side);
    return;
  }
  const [who, text] = sc.lines[i];
  say(who, text, 2.3);
  (who === 'cat' ? cat : friend).play('happy');
  after(2.5, () => runLines(sc, i + 1, side));
}

function startScene() {
  const sc = scenes[Math.floor(Math.random() * scenes.length)];
  busy = 'scene';
  fr.busy = true;
  walk = null;
  const meet = () => {
    const side = catX > 90 ? -1 : 1;
    friendWalk(Math.max(20, Math.min(160, catX + side * 50)), () => {
      friend.facing = -side;
      cat.facing = side;
      runLines(sc, 0, side);
    });
  };
  if (fr.mode === 'sofa') friendHop(L.living.sofa.x - 26, H - 76, 'floor', meet);
  else meet();
}

function updateSpeech(dt) {
  for (const id of ['cat', 'friend']) {
    if (speech[id] <= 0) continue;
    speech[id] -= dt;
    if (speech[id] <= 0 || (id === 'cat' && catHidden) || (id === 'friend' && (!fr || room !== 'living'))) {
      speech[id] = 0;
      ui.speech(id, null);
    } else if (id === 'cat') {
      const p = toClient(catX, catY - cat.height);
      ui.placeSpeech('cat', p.x, p.y);
    } else {
      const p = toClient(fr.x, fr.y - friend.height * FRIEND_SCALE);
      ui.placeSpeech('friend', p.x, p.y);
    }
  }
}

function updateFriend(dt) {
  if (!fr || room !== 'living' || !friendOn()) return;
  if (fr.mode === 'sofa' && !fr.hop) fr.y = L.living.sofa.y;
  if (fr.hop) {
    const h = fr.hop;
    h.t = Math.min(1, h.t + dt / 0.45);
    fr.x = h.x0 + (h.x1 - h.x0) * h.t;
    fr.y = h.y0 + (h.y1 - h.y0) * h.t - Math.sin(Math.PI * h.t) * 16;
    if (h.t >= 1) {
      fr.hop = null;
      fr.mode = h.mode;
      friend.play('idle');
      if (h.cb) h.cb();
    }
  } else if (fr.walk) {
    const step = 30 * dt;
    if (Math.abs(fr.walk.x - fr.x) <= step) {
      fr.x = fr.walk.x;
      const cb = fr.walk.cb;
      fr.walk = null;
      friend.play('idle');
      if (cb) cb();
    } else fr.x += Math.sign(fr.walk.x - fr.x) * step;
  } else if (!fr.busy && friend.anim === 'idle' && (fr.next -= dt) <= 0) {
    fr.next = 6 + Math.random() * 8;
    friendAction();
  }
  friend.update(dt);
}

function devLevel(n) {
  state.devSetLevel(n);
  prevLevel = Math.min(prevLevel, state.get().level);
}

function devCallFriend() {
  const called = friendOn();
  devLevel(Math.max(state.get().level, FRIEND.level));
  if (called && room === 'living') {
    resetFriend();
    friend.play('wave');
  }
}

function devReset() {
  state.devReset();
  prevLevel = 1;
}

const DEV_COMMANDS = {
  open() {
    if (wardrobeOpen) toggleWardrobe();
    if (fridgeOpen) toggleFridge();
  },
  coins: () => state.addCoins(1000),
  inf: state.devToggleInfinite,
  level: devLevel,
  up: () => devLevel(state.get().level + 1),
  down: () => devLevel(state.get().level - 1),
  unlock: state.devUnlockAll,
  fill: state.devFillNeeds,
  gift: state.devShowGift,
  friend: devCallFriend,
  yes: devReset,
};

const handlers = {
  nav: switchTo,
  play() {
    if (state.get().sleeping) {
      hint('sleeping');
      return;
    }
    sfx('tap');
    haptic('medium');
    go('nyan');
  },
  mute() {
    const m = !isMuted();
    setMuted(m);
    ui.setMuted(m);
    if (!m) sfx('tap');
  },
  need(n) {
    hint('needValue', { name: t(n), v: Math.round(state.get().needs[n]) });
  },
  invite() {
    hint('inviteHint');
  },
  action(id) {
    lastInput = time;
    ({ console: startGaming, dance: startDance, wardrobe: toggleWardrobe, fridge: toggleFridge, sponge: toggleSponge, rinse, toilet: tryPotty, light: toggleLight, gift: openGift })[id]();
  },
  foodTap(item, rect) {
    lastInput = time;
    if (!canFeed(item)) return;
    busy = 'feed';
    const b = bowlTarget();
    ui.fly(item.id, rect, toClient(b.x, b.y), guard(() => putInBowl(item)));
  },
  foodDrag(item, phase, cx, cy) {
    const p = toLogical(cx, cy);
    if (phase === 'move') bowlHot = !busy && nearBowl(p);
    else if (phase === 'drop' || phase === 'cancel') {
      bowlHot = false;
      if (phase === 'drop' && nearBowl(p) && canFeed(item)) putInBowl(item);
    }
  },
  friendOn,
  rename(name) {
    state.nameFriend(name);
    refreshInvite();
  },
  dev(cmd, arg) {
    DEV_COMMANDS[cmd](arg);
  },
  outfit(item, act, who) {
    if (who === 'friend') {
      state.equipFriend(item.slot, act === 'wear' ? item.id : null);
      if (act === 'wear' && fr && !fr.busy) {
        friend.play('wave');
        friend.emit('heart');
      }
      sfx(act === 'wear' ? 'jump' : 'tap');
      haptic();
      return;
    }
    if (act === 'buy') {
      if (!state.buy(item.id)) {
        broke();
        return;
      }
      state.equip(item.slot, item.id);
      celebrate('buy');
    } else if (act === 'wear') {
      state.equip(item.slot, item.id);
      celebrate('jump');
    } else {
      state.equip(item.slot, null);
      cat.play('happy');
      sfx('tap');
    }
  },
  layout: layoutFloor,
};

function pointer(type, p) {
  lastInput = time;
  if (!ui || ui.modalOpen() || slide) return;
  if (type === 'down') {
    if (ptr) return;
    ptr = { id: p.id, x0: p.x, y0: p.y, x: p.x, y: p.y, t0: time, moved: 0, zone: catHit(p.x, p.y), friend: !catHit(p.x, p.y) && friendHit(p) };
    return;
  }
  if (!ptr || p.id !== ptr.id) return;
  if (type === 'move') {
    const d = Math.hypot(p.x - ptr.x, p.y - ptr.y);
    ptr.moved += d;
    ptr.x = p.x;
    ptr.y = p.y;
    const over = catHit(p.x, p.y);
    if (tool === 'sponge') {
      if (over && !busy) scrubMove(d, p);
    } else if (ptr.zone && over && ptr.moved > 10 && !petting) beginPet();
    return;
  }
  const p0 = ptr;
  ptr = null;
  if (tool === 'sponge' && cat.anim === 'wash') cat.play('idle');
  if (petting) {
    endPet();
    return;
  }
  if (type === 'cancel') return;
  const dx = p.x - p0.x0;
  const dy = p.y - p0.y0;
  if (!p0.zone && Math.abs(dx) > 34 && Math.abs(dx) > Math.abs(dy) * 1.4) switchBy(dx < 0 ? 1 : -1);
  else if (p0.zone && room === 'bath' && p0.moved > 10 && inside(L.bath.toilet, p, 4)) tryPotty();
  else if (p0.moved <= 10 && time - p0.t0 < 0.6) {
    if (p0.zone && tool !== 'sponge') tapCat(p0.zone);
    else if (p0.friend) tapFriend();
    else if (!p0.zone) tapObject(p);
  }
}

function idleAction(s) {
  const r = Math.random();
  const poses = POSES[room];
  if (poses.length && r < 0.35) {
    const a = poses[Math.floor(Math.random() * poses.length)];
    cat.play(a, { loop: true });
    after(6 + Math.random() * 4, () => {
      if (cat.anim === a) cat.play('idle');
    });
  } else if (s.needs.fun > 60 && r < 0.5) {
    const a = DANCES[Math.floor(Math.random() * DANCES.length)];
    cat.play(a, { loop: true });
    after(3, () => {
      if (cat.anim === a) cat.play('idle');
    });
  } else if (r < 0.85) walkTo(40 + Math.random() * 100);
}

function levelUp(s) {
  sfx('levelup');
  if (!busy) cat.play('jump');
  cat.emit('sparkle');
  haptic('success');
  ui.modal({ title: t('levelTitle'), text: t('levelText', { n: s.level }), icon: 'star' });
  if (prevLevel < FRIEND.level && s.level >= FRIEND.level) {
    ui.modal({ title: t('friendTitle', { name: friendName() }), text: t('friendText'), icon: 'heart' });
    refreshInvite();
    if (room === 'living') {
      resetFriend();
      friend.play('wave');
    }
  }
}

function update(dt) {
  time += dt;
  getL();
  state.tick(dt);
  const s = state.get();
  for (const tm of [...timers]) {
    tm.t -= dt;
    if (tm.t <= 0 && timers.includes(tm)) {
      timers.splice(timers.indexOf(tm), 1);
      tm.fn();
    }
  }
  if (slide) {
    slide.t += dt;
    if (slide.t >= SLIDE) {
      slide = null;
      if (!busy && !s.sleeping) cat.play('idle');
    }
  }
  if (walk) {
    const step = 34 * dt;
    if (Math.abs(walk.x - catX) <= step) {
      catX = walk.x;
      const cb = walk.cb;
      walk = null;
      cat.play('idle');
      if (cb) cb();
    } else catX += Math.sign(walk.x - catX) * step;
  }
  const target = Math.min(H - 70, floorLimit);
  catY = catY && !reduced.matches ? catY + (target - catY) * Math.min(1, dt * 10) : target;
  cat.mood = state.mood();
  cat.dirt = s.needs.clean < 40 ? 1 - s.needs.clean / 100 : 0;
  cat.outfit = { ...s.equipped };
  if (friend) friend.outfit = { ...s.friend.equipped };
  cat.sleeping = s.sleeping;
  if (lightsOff && !s.sleeping && busy !== 'sleep') {
    lightsOff = false;
    cat.play('yawn');
    ui.setRoom(room, false);
    refreshActions();
  }
  const wants = state.wants();
  const icon = !busy && !s.sleeping && speech.cat <= 0 && wants.length ? wants[0].need : null;
  if (icon !== lastSay) {
    cat.say(icon);
    lastSay = icon;
  }
  if (wants.length && wants[0].level === 'urgent' && !s.sleeping && time - lastMeow > 150 && !document.hidden) {
    lastMeow = time;
    sfx('meow');
  }
  if (petting) {
    petClock += dt;
    if (petClock >= 3) {
      petClock = 0;
      petTick();
      cat.emit('heart');
      sfx('purr');
    }
  } else if (ptr && ptr.zone && tool !== 'sponge' && ptr.moved <= 10 && time - ptr.t0 > 0.45) beginPet();
  const calm = !busy && !walk && !ptr && !slide && !s.sleeping && !tool && !fridgeOpen && !wardrobeOpen && cat.anim === 'idle';
  if (calm && (idleIn -= dt) <= 0) {
    idleIn = 7 + Math.random() * 9;
    idleAction(s);
  }
  const quiet = !busy && !s.sleeping && !slide && !ui.modalOpen() && !fridgeOpen && !wardrobeOpen && !tool;
  if (quiet && speech.cat <= 0 && (talkIn -= dt) <= 0) {
    talkIn = 40 + Math.random() * 50;
    speakSolo();
  }
  if (quiet && !ptr && room === 'living' && fr && friendOn() && time - lastInput > 15) {
    sceneIn -= dt;
    if (sceneIn <= 0 && !fr.busy && !fr.hop && !fr.walk) {
      sceneIn = 60 + Math.random() * 60;
      startScene();
    }
  }
  if (s.level > prevLevel) {
    if (prevLevel) levelUp(s);
    prevLevel = s.level;
  }
  if (shower) {
    shower.t += dt;
    if (foam.length && Math.random() < dt * 14) foam.pop();
  }
  if (giftOpen) giftOpen += dt;
  if (giftVisible() !== giftShown) {
    giftShown = !giftShown;
    refreshActions();
  }
  for (const pt of parts) {
    pt.x += pt.vx * dt;
    pt.vy += pt.g * dt;
    pt.y += pt.vy * dt;
    pt.life -= dt;
  }
  parts = parts.filter((pt) => pt.life > 0);
  if ((hudIn -= dt) <= 0) {
    hudIn = 0.5;
    ui.render(s);
  }
  updateFriend(dt);
  updateSpeech(dt);
  cat.update(dt);
}

function drawRoomAt(ctx, name, ox) {
  const cur = name === room;
  ctx.save();
  ctx.translate(ox, 0);
  ctx.drawImage(background(name, H, L, scale), 0, 0, W, H);
  drawLife(ctx, name, L, time, {
    still: reduced.matches,
    tvOn: cur && tvOn,
    fridgeOpen: cur && fridgeOpen,
    dark: cur && lightsOff,
    gift: name === 'living' && (giftVisible() || giftOpen > 0),
    giftOpen,
  });
  if (name === 'kitchen' && !(cur && bowlHidden)) {
    const b = L.kitchen.bowl;
    drawBowl(ctx, b.x, b.y, cur && bowlFood ? iconImage(bowlFood) : null, cur && bowlHot);
  }
  if (name === 'living' && fr && friendOn()) friend.draw(ctx, fr.x, fr.y, { scale: FRIEND_SCALE });
  ctx.restore();
}

function drawParticle(ctx, pt) {
  ctx.globalAlpha = Math.min(1, pt.life * 2);
  ctx.fillStyle = pt.col;
  ctx.beginPath();
  if (pt.kind === 'hearts') {
    ctx.fillStyle = '#f6a5b6';
    const p = new Path2D('M0 3C-3 1-4-.6-4-1.9A2 2 0 0 1 0-2.6 2 2 0 0 1 4-1.9C4-.6 3 1 0 3z');
    ctx.save();
    ctx.translate(pt.x, pt.y);
    ctx.fill(p);
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = '#4b2e1e';
    ctx.stroke(p);
    ctx.restore();
  } else if (pt.kind === 'confetti') {
    ctx.roundRect(pt.x - 1.5, pt.y - 1, 3, 2, 0.8);
    ctx.fill();
  } else {
    ctx.arc(pt.x, pt.y, pt.kind === 'drops' ? 1.3 : 1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function draw(ctx) {
  getL();
  if (slide) {
    const k = 1 - Math.pow(1 - Math.min(1, slide.t / SLIDE), 3);
    drawRoomAt(ctx, slide.from, -slide.dir * k * W);
    drawRoomAt(ctx, room, slide.dir * (1 - k) * W);
  } else drawRoomAt(ctx, room, 0);
  if (!catHidden) cat.draw(ctx, catX, catY);
  for (const f of foam) drawFoam(ctx, catX + f.dx, catY + f.dy, f.s);
  if (screen) drawScreen(ctx, L);
  if (shower) drawShower(ctx, catX, catY - cat.height - 14, catY, time);
  for (const pt of parts) drawParticle(ctx, pt);
  if (tool === 'sponge' && ptr) drawSponge(ctx, ptr.x, ptr.y);
  if (room === 'bedroom' && lightsOff) drawDark(ctx, L, H, time);
}

export function registerRooms() {
  state.on('change', () => {
    if (ui) ui.render(state.get());
  });
  for (const name of ROOMS) {
    register(name, { enter: (p) => enter(name, p), exit, update, draw, pointer, resize: layoutFloor });
  }
}
