import { FOOD, OUTFITS, FRIENDS, GIFT, xpToNext, xpAtLevel } from '../state/catalog.js';
import { svg } from './icons.js';
import { t, itemName, friendLabel, lang, isDev } from './strings.js';

const NEEDS = ['food', 'clean', 'energy', 'fun', 'potty'];
const NEED_COLOR = { food: '#ffb36b', clean: '#7cc6f2', energy: '#ffcf3f', fun: '#b99cf0', potty: '#6fcfae' };
const RED = [242, 107, 107];
const SLOTS = ['head', 'eyes', 'body'];
const GEAR = `<svg class="rm-ico" viewBox="0 0 32 32" aria-hidden="true" focusable="false" stroke="#4b2e1e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3.5v4M16 24.5v4M3.5 16h4M24.5 16h4M7.2 7.2l2.8 2.8M22 22l2.8 2.8M24.8 7.2L22 10M10 22l-2.8 2.8" fill="none" stroke-width="3.6"/><circle cx="16" cy="16" r="8" fill="#fff"/><circle cx="16" cy="16" r="3" fill="#ffd66b"/></svg>`;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

if (!document.getElementById('rooms-css')) {
  const link = document.createElement('link');
  link.id = 'rooms-css';
  link.rel = 'stylesheet';
  link.href = new URL('./rooms.css' + new URL(import.meta.url).search, import.meta.url).href;
  document.head.appendChild(link);
}

function needColor(n, v) {
  const hex = NEED_COLOR[n];
  const base = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const k = Math.max(0, Math.min(1, (45 - v) / 30));
  return `rgb(${base.map((b, i) => Math.round(b + (RED[i] - b) * k)).join(',')})`;
}

const navButton = (room) => `<button type="button" class="rm-navbtn" data-room="${room}">${svg(room, 'rm-navico')}<span>${t(room)}</span></button>`;

const devButton = (cmd, label, cls = '') => `<button type="button" class="rm-buy ${cls}" data-dev="${cmd}">${label}</button>`;

const foodButton = (f) => `<button type="button" class="rm-food" data-food="${f.id}" aria-label="${itemName(f)}, ${t('price', { n: f.price })}">${svg(f.id, 'rm-foodico')}<span class="rm-tag">${svg('coin', 'rm-tagico')}${f.price}</span><span class="rm-fname">${itemName(f)}</span></button>`;

export function createUI(h) {
  const el = document.createElement('div');
  el.className = 'rm';
  el.lang = lang;
  el.innerHTML = `
<header class="rm-hud">
  <div class="rm-top">
    <div class="rm-pill rm-coins" role="img">${svg('coin', 'rm-pillico')}<b></b></div>
    <div class="rm-pill rm-level" role="img"><span class="rm-lv">${svg('star', 'rm-lvico')}<b></b></span><span class="rm-cap rm-xp"><i></i></span></div>
    <button type="button" class="rm-roundbtn rm-sound"></button>
    ${isDev ? `<button type="button" class="rm-roundbtn rm-gear" data-dev="toggle" aria-label="${t('dev')}">${GEAR}</button>` : ''}
  </div>
  <div class="rm-needs">${NEEDS.map((n) => `<button type="button" class="rm-need" data-need="${n}"><span class="rm-cap"><i></i></span><span class="rm-nico">${svg(n)}</span></button>`).join('')}</div>
</header>
<div class="rm-mid">
  <div class="rm-toast" role="status" aria-live="polite"></div>
  <section class="rm-panel rm-fridge" hidden aria-labelledby="rm-ft">
    <div class="rm-phead"><h2 id="rm-ft">${svg('fridge')}${t('fridge')}</h2><button type="button" class="rm-x" data-action="fridge" aria-label="${t('close')}">${svg('close')}</button></div>
    <div class="rm-shelves"><div class="rm-shelf">${FOOD.slice(0, 4).map(foodButton).join('')}</div><div class="rm-shelf">${FOOD.slice(4).map(foodButton).join('')}</div></div>
    <p class="rm-hint">${t('dragFood')}</p>
  </section>
  <section class="rm-panel rm-wardrobe" hidden aria-labelledby="rm-wt">
    <div class="rm-phead"><h2 id="rm-wt">${svg('wardrobe')}${t('wardrobe')}</h2><button type="button" class="rm-x" data-action="wardrobe" aria-label="${t('close')}">${svg('close')}</button></div>
    <div class="rm-tabs rm-who" role="tablist" aria-label="${t('whoAria')}" hidden>
      <button type="button" role="tab" class="rm-tab" data-who="cat"></button><button type="button" role="tab" class="rm-tab" data-who="friend"></button>
    </div>
    <div class="rm-namebar" hidden>
      <button type="button" class="rm-buy rm-namebtn" data-name="toggle">${t('giveName')}</button>
      <form class="rm-nameform" hidden><input class="rm-nameinput" type="text" maxlength="16" autocomplete="off" aria-label="${t('nameLabel')}"><button type="submit" class="rm-buy rm-mint">${t('nameDone')}</button></form>
    </div>
    <div class="rm-tabs" role="tablist">${SLOTS.map((s, i) => `<button type="button" role="tab" class="rm-tab" data-slot="${s}" aria-selected="${i === 0}">${t(s)}</button>`).join('')}</div>
    <div class="rm-items" role="tabpanel"></div>
  </section>
  ${isDev ? `<section class="rm-panel rm-dev" hidden aria-labelledby="rm-dt">
    <div class="rm-phead"><h2 id="rm-dt">${GEAR}${t('dev')}</h2><button type="button" class="rm-x" data-dev="close" aria-label="${t('close')}">${svg('close')}</button></div>
    <div class="rm-devgrid">
      ${devButton('coins', t('devCoins'), 'rm-accent')}${devButton('inf', t('devInf'), 'rm-infbtn')}
      <div class="rm-devlevel"><span>${t('devLevel')}</span><button type="button" class="rm-buy" data-dev="down" aria-label="${t('devLevelDown')}">−</button><input class="rm-lvinput" type="number" inputmode="numeric" min="1" max="50" aria-label="${t('devLevel')}"><button type="button" class="rm-buy" data-dev="up" aria-label="${t('devLevelUp')}">+</button></div>
      ${devButton('unlock', t('devUnlock'))}${devButton('fill', t('devFill'))}
      ${devButton('gift', t('devGift'))}${devButton('friend', t('devFriend', { name: itemName(FRIENDS[0]) }))}
      <div class="rm-devreset">${devButton('ask', t('devReset'))}
        <div class="rm-sure" hidden><p>${t('devSure')}</p>${devButton('yes', t('devYes'), 'rm-danger')}${devButton('no', t('devNo'))}</div>
      </div>
    </div>
  </section>` : ''}
  <div class="rm-say" data-say="cat" aria-live="polite" hidden></div>
  <div class="rm-say rm-say2" data-say="friend" aria-live="polite" hidden></div>
  <button type="button" class="rm-invite" hidden>${svg('invite', 'rm-invico')}<span></span></button>
</div>
<div class="rm-bottom">
  <div class="rm-actions"></div>
  <nav class="rm-nav" aria-label="${t('rooms')}">
    ${navButton('living')}${navButton('kitchen')}
    <button type="button" class="rm-play" aria-label="${t('playAria')}"><span class="rm-playbtn">${svg('play', 'rm-playico')}</span><span>${t('play')}</span></button>
    ${navButton('bath')}${navButton('bedroom')}
  </nav>
</div>
<div class="rm-modal" hidden><div class="rm-card" role="dialog" aria-modal="true" aria-labelledby="rm-mt">
  <div class="rm-badge" aria-hidden="true"></div><p class="rm-msub"></p><h2 id="rm-mt"></h2><p class="rm-mtext"></p>
  <button type="button" class="rm-ok"></button>
</div></div>`;
  document.getElementById('ui').appendChild(el);

  const $ = (s) => el.querySelector(s);
  const needEls = {};
  for (const n of NEEDS) needEls[n] = el.querySelector(`[data-need="${n}"]`);
  const fridge = $('.rm-fridge');
  const wardrobe = $('.rm-wardrobe');
  const items = $('.rm-items');
  const dev = $('.rm-dev');
  const nameForm = $('.rm-nameform');
  const nameInput = $('.rm-nameinput');
  const modal = $('.rm-modal');
  const invite = $('.rm-invite');
  const queue = [];
  let slot = 'head';
  let who = 'cat';
  let toastTimer = 0;
  let lastFocus = null;
  let lastState = null;
  let wardrobeSig = '';
  let drag = null;
  let dragged = false;

  el.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || b.disabled) return;
    if (b.dataset.dev) devClick(b.dataset.dev);
    else if (b.dataset.who) {
      who = b.dataset.who;
      renderWardrobe(lastState, true);
    } else if (b.dataset.name) toggleNameForm();
    else if (b.dataset.room) h.nav(b.dataset.room);
    else if (b.dataset.need) h.need(b.dataset.need);
    else if (b.dataset.action) h.action(b.dataset.action);
    else if (b.dataset.slot) {
      slot = b.dataset.slot;
      renderWardrobe(lastState, true);
    } else if (b.dataset.outfit) h.outfit(OUTFITS.find((o) => o.id === b.dataset.outfit), b.dataset.do, who);
    else if (b.dataset.food) {
      if (!dragged) h.foodTap(FOOD.find((f) => f.id === b.dataset.food), b.getBoundingClientRect());
    } else if (b.classList.contains('rm-play')) h.play();
    else if (b.classList.contains('rm-sound')) h.mute();
    else if (b === invite) h.invite();
    else if (b.classList.contains('rm-ok')) closeModal();
  });

  nameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    h.rename(nameInput.value);
    nameForm.hidden = true;
  });

  function toggleNameForm() {
    nameForm.hidden = !nameForm.hidden;
    if (nameForm.hidden) return;
    nameInput.value = lastState.friend.name || '';
    nameInput.placeholder = itemName(FRIENDS[0]);
    nameInput.focus();
  }

  function setDev(open) {
    if (!dev) return;
    dev.hidden = !open;
    $('.rm-sure').hidden = true;
    $('[data-dev="ask"]').hidden = false;
  }

  function devClick(cmd) {
    if (cmd === 'toggle' || cmd === 'close') {
      const open = cmd === 'toggle' && dev.hidden;
      setDev(open);
      if (open) h.dev('open');
    } else if (cmd === 'ask' || cmd === 'no') {
      $('.rm-sure').hidden = cmd === 'no';
      $('[data-dev="ask"]').hidden = cmd === 'ask';
    } else {
      h.dev(cmd);
      if (cmd === 'yes') setDev(false);
    }
  }

  if (dev) $('.rm-lvinput').addEventListener('change', (e) => h.dev('level', Number(e.target.value)));

  function ghost(id) {
    const g = document.createElement('div');
    g.className = 'rm-ghost';
    g.innerHTML = svg(id, 'rm-ghostico');
    el.appendChild(g);
    return g;
  }

  const place = (g, x, y, s = 1) => {
    g.style.transform = `translate(${x - 28}px, ${y - 28}px) scale(${s})`;
  };

  const shelves = $('.rm-shelves');
  shelves.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('[data-food]');
    if (!b || drag) return;
    dragged = false;
    drag = { b, id: e.pointerId, x: e.clientX, y: e.clientY, on: false, item: FOOD.find((f) => f.id === b.dataset.food) };
  });
  shelves.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.on && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8) {
      drag.on = true;
      dragged = true;
      drag.b.setPointerCapture(e.pointerId);
      drag.b.classList.add('rm-dragging');
      drag.g = ghost(drag.item.id);
      h.foodDrag(drag.item, 'start', e.clientX, e.clientY);
    }
    if (drag.on) {
      place(drag.g, e.clientX, e.clientY, 1.15);
      h.foodDrag(drag.item, 'move', e.clientX, e.clientY);
    }
  });
  const endDrag = (e, phase) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (drag.on) {
      drag.b.classList.remove('rm-dragging');
      drag.g.remove();
      h.foodDrag(drag.item, phase, e.clientX, e.clientY);
    }
    drag = null;
  };
  shelves.addEventListener('pointerup', (e) => endDrag(e, 'drop'));
  shelves.addEventListener('pointercancel', (e) => endDrag(e, 'cancel'));

  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Tab') {
      e.preventDefault();
      $('.rm-ok').focus();
    }
  });

  function showModal() {
    const m = queue[0];
    $('#rm-mt').textContent = m.title;
    $('.rm-mtext').textContent = m.text || '';
    $('.rm-msub').textContent = m.sub || '';
    $('.rm-ok').textContent = m.btn || t('ok');
    $('.rm-badge').innerHTML = svg(m.icon || 'heart', 'rm-badgeico');
    const card = $('.rm-card');
    card.classList.toggle('rm-gift', !!m.gift);
    card.style.animation = 'none';
    void card.offsetWidth;
    card.style.animation = '';
    if (modal.hidden) lastFocus = document.activeElement;
    modal.hidden = false;
    $('.rm-ok').focus();
  }

  function closeModal() {
    const m = queue.shift();
    if (m && m.onClose) m.onClose();
    if (queue.length) showModal();
    else {
      modal.hidden = true;
      if (lastFocus && lastFocus.isConnected) lastFocus.focus();
    }
  }

  function renderWardrobe(s, force) {
    if (!s || wardrobe.hidden) return;
    const withFriend = h.friendOn();
    if (!withFriend) who = 'cat';
    const mine = who === 'cat';
    const worn = mine ? s.equipped : s.friend.equipped;
    const sig = [slot, who, withFriend, s.level, s.coins, s.owned.join(), SLOTS.map((k) => worn[k]).join(), friendLabel(s.friend)].join('|');
    if (sig === wardrobeSig && !force) return;
    wardrobeSig = sig;
    const focused = document.activeElement && document.activeElement.dataset.outfit;
    $('.rm-who').hidden = !withFriend;
    $('.rm-namebar').hidden = mine;
    if (mine) nameForm.hidden = true;
    for (const tab of el.querySelectorAll('[data-who]')) {
      tab.textContent = tab.dataset.who === 'cat' ? GIFT.catName : friendLabel(s.friend);
      tab.setAttribute('aria-selected', String(tab.dataset.who === who));
    }
    for (const tab of el.querySelectorAll('[data-slot]')) tab.setAttribute('aria-selected', String(tab.dataset.slot === slot));
    const list = OUTFITS.filter((o) => o.slot === slot && (mine || s.owned.includes(o.id)));
    if (!list.length) {
      items.innerHTML = `<p class="rm-hint">${t('noOwned', { name: friendLabel(s.friend) })}</p>`;
      return;
    }
    items.innerHTML = list.map((o) => {
      const owned = s.owned.includes(o.id);
      const on = worn[o.slot] === o.id;
      let btn;
      if (mine && s.level < o.level) btn = `<button type="button" class="rm-buy rm-lockbtn" disabled>${svg('lock', 'rm-tagico')}${t('lockedFrom', { n: o.level })}</button>`;
      else if (!owned) btn = `<button type="button" class="rm-buy rm-accent" data-outfit="${o.id}" data-do="buy" aria-label="${t('buy')} ${itemName(o)}, ${t('price', { n: o.price })}">${svg('coin', 'rm-tagico')}${o.price}</button>`;
      else if (on) btn = `<button type="button" class="rm-buy" data-outfit="${o.id}" data-do="off">${t('takeOff')}</button>`;
      else btn = `<button type="button" class="rm-buy rm-mint" data-outfit="${o.id}" data-do="wear">${t('wear')}</button>`;
      return `<div class="rm-item${on ? ' rm-on' : ''}${mine && s.level < o.level ? ' rm-locked' : ''}"><span class="rm-itemico">${svg(o.id, 'rm-foodico')}</span><span class="rm-fname">${itemName(o)}</span>${btn}</div>`;
    }).join('');
    const again = focused && items.querySelector(`[data-outfit="${focused}"]`);
    if (again) again.focus();
  }

  const ro = new ResizeObserver(() => h.layout());
  ro.observe($('.rm-bottom'));

  return {
    setRoom(room, sleeping) {
      for (const b of el.querySelectorAll('.rm-navbtn')) {
        if (b.dataset.room === room) b.setAttribute('aria-current', 'page');
        else b.removeAttribute('aria-current');
        b.classList.toggle('rm-dim', sleeping && b.dataset.room !== room);
      }
      $('.rm-play').classList.toggle('rm-dim', sleeping);
    },
    setActions(list) {
      $('.rm-actions').innerHTML = list.map((a) => `<button type="button" class="rm-act${a.pressed ? ' rm-pressed' : ''}" data-action="${a.id}"${a.pressed === undefined ? '' : ` aria-pressed="${a.pressed}"`}>${svg(a.icon, 'rm-actico')}<span>${a.label}</span></button>`).join('');
    },
    render(s) {
      lastState = s;
      for (const n of NEEDS) {
        const v = Math.round(Math.max(0, Math.min(100, s.needs[n])));
        const b = needEls[n];
        const bar = b.querySelector('i');
        bar.style.width = `calc(14px + (100% - 14px) * ${v / 100})`;
        bar.style.backgroundColor = needColor(n, v);
        b.classList.toggle('rm-urgent', v <= 20);
        b.setAttribute('aria-label', t('needValue', { name: t(n), v }));
      }
      const coins = $('.rm-coins');
      const money = s.infCoins ? '∞' : s.coins;
      coins.querySelector('b').textContent = money;
      coins.setAttribute('aria-label', t('coinsAria', { n: money }));
      const xp = Math.max(0, s.xp - xpAtLevel(s.level));
      const need = xpToNext(s.level);
      const lvl = $('.rm-level');
      lvl.querySelector('b').textContent = s.level;
      lvl.querySelector('i').style.width = `${Math.min(100, Math.max(8, (xp / need) * 100))}%`;
      lvl.setAttribute('aria-label', t('levelAria', { n: s.level, xp, max: need }));
      if (dev) {
        $('.rm-infbtn').setAttribute('aria-pressed', String(s.infCoins));
        const input = $('.rm-lvinput');
        if (document.activeElement !== input) input.value = s.level;
      }
      renderWardrobe(s);
    },
    setMuted(m) {
      const b = $('.rm-sound');
      b.innerHTML = svg(m ? 'soundOff' : 'soundOn');
      b.setAttribute('aria-label', m ? t('soundOn') : t('soundOff'));
    },
    toast(text) {
      const n = $('.rm-toast');
      n.textContent = text;
      n.classList.add('rm-show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => n.classList.remove('rm-show'), 2800);
    },
    modal(m) {
      queue.push(m);
      if (queue.length === 1) showModal();
    },
    modalOpen: () => !modal.hidden,
    fridge(open) {
      fridge.hidden = !open;
    },
    dev: setDev,
    wardrobe(open) {
      wardrobe.hidden = !open;
      if (open) {
        renderWardrobe(lastState, true);
        $('.rm-tab[aria-selected="true"]').focus();
      }
    },
    invite(text) {
      invite.hidden = !text;
      if (text) invite.querySelector('span').textContent = text;
    },
    fly(id, from, to, done) {
      const g = ghost(id);
      place(g, from.left + from.width / 2, from.top + from.height / 2);
      if (reduced.matches) {
        g.remove();
        done();
        return;
      }
      requestAnimationFrame(() => {
        g.classList.add('rm-flying');
        place(g, to.x, to.y, 0.7);
      });
      setTimeout(() => {
        g.remove();
        done();
      }, 480);
    },
    speech(id, text) {
      const b = el.querySelector(`[data-say="${id}"]`);
      if (!text) {
        b.classList.remove('rm-show');
        b.hidden = true;
        return;
      }
      b.textContent = text;
      b.hidden = false;
      b.classList.remove('rm-show');
      void b.offsetWidth;
      b.classList.add('rm-show');
    },
    placeSpeech(id, cx, cy) {
      const b = el.querySelector(`[data-say="${id}"]`);
      if (b.hidden) return;
      const w = b.offsetWidth;
      const hgt = b.offsetHeight;
      const top = Math.min(Math.max(cy - hgt - 12, $('.rm-hud').getBoundingClientRect().bottom + 8), $('.rm-bottom').getBoundingClientRect().top - hgt - 8);
      const left = Math.min(Math.max(cx - w / 2, 8), window.innerWidth - w - 8);
      b.style.transform = `translate(${left}px, ${top}px)`;
      b.style.setProperty('--tail', `${Math.min(Math.max(cx - left, 18), w - 18)}px`);
    },
    bottomTop: () => $('.rm-bottom').getBoundingClientRect().top,
    destroy() {
      ro.disconnect();
      clearTimeout(toastTimer);
      el.remove();
    },
  };
}
