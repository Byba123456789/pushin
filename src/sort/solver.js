import { pour, usefulMove, isSolved, topRun } from './logic.js';

const key = (tubes) => tubes.map((t) => t.join('')).sort().join('|');

// каждый ход убирает не больше одной границы цвета, значит эта оценка не завышает
function lowerBound(tubes) {
  const colors = new Set();
  let runs = 0;
  for (const t of tubes) {
    for (let i = 0; i < t.length; i++) {
      colors.add(t[i]);
      if (i === 0 || t[i] !== t[i - 1]) runs++;
    }
  }
  return runs - colors.size;
}

class Heap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  push(item) {
    const a = this.a;
    a.push(item);
    for (let i = a.length - 1; i > 0;) {
      const p = (i - 1) >> 1;
      if (a[p].f <= a[i].f) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.a;
    const top = a[0];
    const last = a.pop();
    if (a.length) {
      a[0] = last;
      for (let i = 0; ;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && a[l].f < a[m].f) m = l;
        if (r < a.length && a[r].f < a[m].f) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top;
  }
}

// weight = 1 даёт кратчайшее решение, больше 1 — быстрое, но возможно длиннее
export function solve(start, { weight = 1, maxNodes = Infinity } = {}) {
  if (isSolved(start)) return [];
  const open = new Heap();
  const best = new Map([[key(start), 0]]);
  open.push({ tubes: start, g: 0, f: weight * lowerBound(start), path: null });
  let nodes = 0;
  while (open.size) {
    const cur = open.pop();
    if (cur.g > best.get(key(cur.tubes))) continue;
    if (isSolved(cur.tubes)) return unwind(cur.path);
    if (++nodes > maxNodes) return null;
    const n = cur.tubes.length;
    for (let from = 0; from < n; from++) {
      const run = topRun(cur.tubes[from]);
      if (!run) continue;
      let emptyTried = false;
      for (let to = 0; to < n; to++) {
        if (!usefulMove(cur.tubes, from, to)) continue;
        if (!cur.tubes[to].length) {
          if (emptyTried) continue;
          emptyTried = true;
        }
        const next = pour(cur.tubes, from, to).tubes;
        const g = cur.g + 1;
        const k = key(next);
        if (best.has(k) && best.get(k) <= g) continue;
        best.set(k, g);
        open.push({ tubes: next, g, f: g + weight * lowerBound(next), path: { from, to, prev: cur.path } });
      }
    }
  }
  return null;
}

function unwind(node) {
  const moves = [];
  for (let p = node; p; p = p.prev) moves.push([p.from, p.to]);
  return moves.reverse();
}
