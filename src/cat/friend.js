import { createActor } from './actor.js';
import { TOMMY } from './draw.js';

const FRIENDS = { tommy: TOMMY };
export function createFriend(id) {
  return createActor({ pal: FRIENDS[id] || TOMMY, size: 1.1, outfits: false });
}
