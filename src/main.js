import { go } from './core/engine.js';
import * as state from './state/state.js';
import { registerRooms } from './rooms/rooms.js';
import { registerNyan } from './nyan/nyan.js';

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
