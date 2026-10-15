// Tower of Hanoi. Pegs are arrays of disk sizes, bottom to top (largest = n).

export function createTower(n) {
  return [Array.from({ length: n }, (_, i) => n - i), [], []];
}

export function minMoves(n) {
  return 2 ** n - 1;
}

export function canMove(pegs, from, to) {
  if (from === to) return false;
  const src = pegs[from];
  if (!src || src.length === 0) return false;
  const dst = pegs[to];
  if (!dst) return false;
  return dst.length === 0 || dst[dst.length - 1] > src[src.length - 1];
}

export function move(pegs, from, to) {
  if (!canMove(pegs, from, to)) return null;
  const next = pegs.map((p) => p.slice());
  next[to].push(next[from].pop());
  return next;
}

export function isSolved(pegs, n, target = 2) {
  return pegs[target].length === n;
}

function positions(pegs) {
  const pos = [];
  pegs.forEach((peg, i) => peg.forEach((d) => (pos[d] = i)));
  return pos;
}

// The next move on the shortest path from any legal position to "all disks on target".
// Returns [from, to] or null when solved.
export function nextMove(pegs, n, target = 2) {
  const pos = positions(pegs);
  function solve(k, t) {
    if (k === 0) return null;
    if (pos[k] === t) return solve(k - 1, t);
    const spare = 3 - pos[k] - t;
    return solve(k - 1, spare) || [pos[k], t];
  }
  return solve(n, target);
}

// The "shrink the problem" view of the current position: the biggest disk that still has to
// move, where it is going, and where the smaller tower above it has to go first.
export function currentGoal(pegs, n, target = 2) {
  const pos = positions(pegs);
  let t = target;
  for (let k = n; k >= 1; k--) {
    if (pos[k] !== t) {
      const spare = 3 - pos[k] - t;
      return { disk: k, from: pos[k], to: t, smallerTower: k - 1, smallerTo: spare };
    }
  }
  return null;
}
