import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as hanoi from '../src/logic/hanoi.js';
import * as cipher from '../src/logic/cipher.js';
import * as lightning from '../src/logic/lightning.js';
import * as memory from '../src/logic/memory.js';
import * as fermi from '../src/logic/fermi.js';
import * as stats from '../src/logic/stats.js';

// Deterministic random numbers for repeatable tests.
function seeded(seed = 42) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

test('hanoi: following nextMove solves in the minimum number of moves', () => {
  for (let n = 1; n <= 7; n++) {
    let pegs = hanoi.createTower(n);
    let moves = 0;
    let m;
    while ((m = hanoi.nextMove(pegs, n))) {
      pegs = hanoi.move(pegs, m[0], m[1]);
      assert.ok(pegs, `illegal hint move at n=${n}`);
      moves++;
    }
    assert.ok(hanoi.isSolved(pegs, n));
    assert.equal(moves, hanoi.minMoves(n));
  }
});

test('hanoi: nextMove recovers from a messy position', () => {
  let pegs = hanoi.createTower(5);
  const rand = seeded(7);
  for (let i = 0; i < 40; i++) {
    const from = Math.floor(rand() * 3);
    const to = Math.floor(rand() * 3);
    pegs = hanoi.move(pegs, from, to) || pegs;
  }
  let guard = 0;
  let m;
  while ((m = hanoi.nextMove(pegs, 5)) && guard++ < 100) pegs = hanoi.move(pegs, m[0], m[1]);
  assert.ok(hanoi.isSolved(pegs, 5));
  assert.ok(guard <= 31);
});

test('hanoi: rules reject a big ring on a small one', () => {
  const pegs = [[3, 2], [1], []];
  assert.equal(hanoi.canMove(pegs, 0, 1), false);
  assert.equal(hanoi.canMove(pegs, 1, 0), true);
  assert.equal(hanoi.move(pegs, 0, 1), null);
});

test('hanoi: currentGoal names the smaller tower to move first', () => {
  const g = hanoi.currentGoal(hanoi.createTower(4), 4);
  assert.deepEqual(g, { disk: 4, from: 0, to: 2, smallerTower: 3, smallerTo: 1 });
  assert.equal(hanoi.currentGoal([[], [], [2, 1]], 2), null);
});

test('cipher: keys are derangements and decode correctly', () => {
  const rand = seeded(3);
  for (let i = 0; i < 20; i++) {
    const key = cipher.makeKey(rand);
    for (const [p, c] of Object.entries(key)) assert.notEqual(p, c);
    assert.equal(new Set(Object.values(key)).size, 26);
  }
  const key = cipher.makeKey(rand);
  const msg = 'THE FOG IS NOT A WALL.';
  const enc = cipher.encode(msg, key);
  assert.notEqual(enc, msg);
  assert.equal(enc.length, msg.length);
  const inv = cipher.invert(key);
  assert.equal(enc.replace(/[A-Z]/g, (c) => inv[c]), msg);
});

test('cipher: assigning moves a letter, solving needs every letter right', () => {
  const key = cipher.makeKey(seeded(9));
  const msg = 'SEE THE SEA';
  const enc = cipher.encode(msg, key);
  let g = {};
  g = cipher.assign(g, key.S, 'E');
  g = cipher.assign(g, key.E, 'E');
  assert.equal(g[key.S], undefined, 'E moved off the first letter');
  assert.deepEqual(cipher.wrongGuesses(g, key), []);
  for (const p of ['S', 'T', 'H', 'A']) g = cipher.assign(g, key[p], p);
  assert.ok(cipher.isSolved(enc, g, key));
  g = cipher.assign(g, key.A, null);
  assert.equal(cipher.isSolved(enc, g, key), false);
  assert.deepEqual(cipher.nextHint(enc, g, key), { cipher: key.A, plain: 'A' });
});

test('cipher: frequencies are sorted, most common first', () => {
  const f = cipher.frequencies('AAB BCA');
  assert.deepEqual(f, [{ letter: 'A', count: 3 }, { letter: 'B', count: 2 }, { letter: 'C', count: 1 }]);
});

test('lightning: worked steps reach the right answer', () => {
  for (let t = 1; t <= 9; t++) {
    const p = lightning.squareFive(Math.random, t);
    const n = t * 10 + 5;
    assert.equal(p.answer, n * n);
    assert.ok(p.steps.at(-1).endsWith(String(n * n)), p.steps.at(-1));
  }
  for (let x = 12; x <= 98; x++) {
    const p = lightning.timesEleven(Math.random, x);
    assert.equal(p.answer, x * 11);
    assert.ok(p.steps.at(-1).endsWith(String(x * 11)), `${x}: ${p.steps.at(-1)}`);
  }
});

test('lightning: rounds have unique problems and answers are checked leniently', () => {
  const round = lightning.makeRound('mixed', 8, seeded(1));
  assert.equal(round.length, 8);
  assert.equal(new Set(round.map((p) => p.prompt)).size, 8);
  const p = lightning.squareFive(Math.random, 3);
  assert.ok(lightning.checkAnswer(p, '1225'));
  assert.ok(lightning.checkAnswer(p, '1,225'));
  assert.ok(!lightning.checkAnswer(p, ''));
  assert.ok(!lightning.checkAnswer(p, '1226'));
});

test('memory: lists, pools and ordered scoring', () => {
  const rand = seeded(5);
  const list = memory.makeList(20, rand);
  assert.equal(new Set(list.map((i) => i.n)).size, 20);
  assert.ok(memory.LOCI.length >= 20);
  const pool = memory.makePool(list.slice(0, 10), 6, rand);
  assert.equal(pool.length, 16);
  for (const t of list.slice(0, 10)) assert.ok(pool.some((p) => p.n === t.n));
  const targets = list.slice(0, 4);
  assert.equal(memory.scoreOrdered(targets, targets), 4);
  assert.equal(memory.scoreOrdered([targets[1], targets[0], targets[2], null], targets), 1);
  assert.match(memory.sillyScene(targets[0], memory.LOCI[0], rand), /^A giant /);
});

test('fermi: unit chains multiply and divide, and refuse the wrong unit', () => {
  let chain = { value: 80, unit: 'minute', label: 'beats per minute', steps: [] };
  const bad = fermi.applyCard(chain, { from: 'day', to: 'year', op: 'multiply', factor: 365 });
  assert.equal(bad.ok, false);
  assert.match(bad.message, /beats per minute/);
  for (const [from, to, factor] of [['minute', 'hour', 60], ['hour', 'day', 24], ['day', 'year', 365], ['year', 'life', 80]]) {
    const r = fermi.applyCard(chain, { from, to, factor, op: 'multiply', resultLabel: to });
    assert.ok(r.ok);
    chain = r.chain;
  }
  assert.equal(chain.value, 80 * 60 * 24 * 365 * 80);
  assert.ok(fermi.withinRange(chain.value, [1.5e9, 7e9]));
  const trip = fermi.applyCard({ value: 13560, unit: 'trip', label: 'km', steps: [] }, { from: 'trip', to: 'day', factor: 11, op: 'divide' });
  const speed = fermi.applyCard(trip.chain, { from: 'day', to: 'hour', factor: 24, op: 'divide' });
  assert.ok(Math.abs(speed.chain.value - 51.36) < 0.01);
});

test('fermi: big numbers read like words', () => {
  assert.equal(fermi.formatBig(3363840000), '3.4 billion');
  assert.equal(fermi.formatBig(10512000), '10.5 million');
  assert.equal(fermi.formatBig(4800), '4,800');
  assert.equal(fermi.formatBig(51.36), '51.4');
});

test('stats: the doubt gap and the echo', () => {
  const feathers = [
    { kind: 'feat', guess: 0.2, result: 1, success: true, title: 'Tower of 5', at: 1 },
    { kind: 'feat', guess: 0.3, result: 0.9, success: true, title: 'Palace', at: 2 },
    { kind: 'stumble', guess: 0.8, result: 0, success: false, title: 'Code', at: 3 },
    { kind: 'hop', title: 'Watch a video', at: 4 },
  ];
  const s = stats.doubtStats(feathers);
  assert.equal(s.count, 3);
  assert.equal(s.doubted, 2);
  assert.equal(s.doubtedAndDid, 2);
  assert.equal(s.beatGuess, 2);
  assert.ok(Math.abs(s.avgGuess - (0.2 + 0.3 + 0.8) / 3) < 1e-9);
  assert.equal(stats.findEcho(feathers).title, 'Palace');
  assert.equal(stats.findEcho([]), null);
  assert.equal(stats.gapMessage(0.2, 1), 'higher');
  assert.equal(stats.gapMessage(0.5, 0.55), 'match');
  assert.equal(stats.gapMessage(0.9, 0), 'lower');
});
