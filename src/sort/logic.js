import { SORT } from '../state/catalog.js';

export const CAP = 4;

export function topRun(tube) {
  if (!tube.length) return null;
  const color = tube[tube.length - 1];
  let n = 1;
  while (n < tube.length && tube[tube.length - 1 - n] === color) n++;
  return { color, n };
}

export function canPour(tubes, from, to) {
  if (from === to || !tubes[from].length || tubes[to].length >= CAP) return false;
  const dest = topRun(tubes[to]);
  return !dest || dest.color === topRun(tubes[from]).color;
}

export function pour(tubes, from, to) {
  if (!canPour(tubes, from, to)) return null;
  const { color, n } = topRun(tubes[from]);
  const moved = Math.min(n, CAP - tubes[to].length);
  const next = tubes.map((t) => t.slice());
  next[from].length -= moved;
  next[to].push(...Array(moved).fill(color));
  return { tubes: next, moved, color };
}

const isUniform = (tube) => tube.every((c) => c === tube[0]);

export const isSolved = (tubes) => tubes.every((t) => !t.length || (t.length === CAP && isUniform(t)));

// перелив однородной баночки в пустую ничего не меняет, поэтому ходом не считается
export function usefulMove(tubes, from, to) {
  return canPour(tubes, from, to) && !(tubes[to].length === 0 && isUniform(tubes[from]));
}

export function hasMoves(tubes) {
  return tubes.some((_, from) => tubes.some((__, to) => usefulMove(tubes, from, to)));
}

export function starsFor(moves, min) {
  if (moves <= min + 2) return 3;
  return moves <= min * 1.5 ? 2 : 1;
}

export function createGame(start) {
  let tubes = start.map((t) => t.slice());
  let extra = false;
  let history = [];

  return {
    get tubes() { return tubes; },
    get moves() { return history.length; },
    get canUndo() { return history.length > 0; },
    get solved() { return isSolved(tubes); },
    get stuck() { return !isSolved(tubes) && !hasMoves(tubes); },
    get extraUsed() { return extra; },
    move(from, to) {
      const r = pour(tubes, from, to);
      if (!r) return null;
      history.push(tubes);
      tubes = r.tubes;
      return { from, to, moved: r.moved, color: r.color };
    },
    undo() {
      if (!history.length) return false;
      tubes = history.pop();
      return true;
    },
    addJar() {
      if (extra) return false;
      extra = true;
      tubes = [...tubes, []];
      history = history.map((h) => [...h, []]);
      return true;
    },
  };
}

export function parseLevel([min, layout]) {
  return { min, tubes: layout.split('/').map((t) => [...t].map((c) => parseInt(c, 16))) };
}

export function startLevel({ unlocked, done }) {
  let level = 1;
  while (level < unlocked && done[level]) level++;
  return Math.min(level, SORT.levels);
}
