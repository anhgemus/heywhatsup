// What the evidence says. A "guess" and a "result" are both 0..1.

export const DOUBT_LINE = 0.5;

export function measured(feathers) {
  return feathers.filter((f) => typeof f.guess === 'number' && typeof f.result === 'number');
}

export function doubtStats(feathers) {
  const m = measured(feathers);
  const doubted = m.filter((f) => f.guess < DOUBT_LINE);
  const doubtedAndDid = doubted.filter((f) => f.success);
  const beatGuess = m.filter((f) => f.result > f.guess + 0.05);
  const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  return {
    count: m.length,
    avgGuess: avg(m.map((f) => f.guess)),
    avgResult: avg(m.map((f) => f.result)),
    doubted: doubted.length,
    doubtedAndDid: doubtedAndDid.length,
    beatGuess: beatGuess.length,
  };
}

// The most recent time the player doubted themselves and did it anyway.
export function findEcho(feathers) {
  const hits = measured(feathers).filter((f) => f.guess < DOUBT_LINE && f.success);
  return hits.length ? hits[hits.length - 1] : null;
}

export function gapMessage(guess, result) {
  const gap = result - guess;
  if (gap >= 0.15) return 'higher';
  if (gap <= -0.15) return 'lower';
  return 'match';
}
