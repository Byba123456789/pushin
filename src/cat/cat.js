import { createActor } from './actor.js';
import { PUSHEEN } from './draw.js';

export function createCat() {
  return createActor({ pal: PUSHEEN });
}
