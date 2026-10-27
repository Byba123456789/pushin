import { go } from './core/engine.js';
import * as state from './state/state.js';
import { registerRooms } from './rooms/rooms.js';
import { registerNyan } from './nyan/nyan.js';

const RELOAD_KEY = 'pushin_reload_to';

async function reloadIfOutdated() {
  const current = new URL(import.meta.url).searchParams.get('v');
  try {
    const res = await fetch('version.json', { cache: 'no-store' });
    const { v } = await res.json();
    if (!current || v === current || sessionStorage.getItem(RELOAD_KEY) === v) return false;
    sessionStorage.setItem(RELOAD_KEY, v);
    const url = new URL(location.href);
    url.searchParams.set('v', v);
    location.replace(url);
    return true;
  } catch {
    return false;
  }
}

if (!(await reloadIfOutdated())) {
  const tg = window.Telegram && window.Telegram.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
    if (tg.disableVerticalSwipes) tg.disableVerticalSwipes();
  }

  await state.load();
  registerRooms();
  registerNyan();
  go('living');
}
