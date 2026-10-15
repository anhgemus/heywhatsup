// Mental-math tricks that human calculators use. Each problem carries its own worked steps.

function pick(min, max, rand) {
  return min + Math.floor(rand() * (max - min + 1));
}

// 35 x 35: take the 3, times the next number up (4) = 12, then write 25 -> 1225.
export function squareFive(rand = Math.random, tens = pick(1, 9, rand)) {
  const n = tens * 10 + 5;
  const front = tens * (tens + 1);
  return {
    kind: 'square5',
    prompt: `${n} × ${n}`,
    answer: n * n,
    steps: [
      `Take the front digit: ${tens}`,
      `Times the next number up: ${tens} × ${tens + 1} = ${front}`,
      `Stick 25 on the end: ${front}25`,
    ],
  };
}

// 52 x 11: split the digits, put their sum in the middle -> 5 (5+2) 2 = 572. Carry if the sum is 10+.
export function timesEleven(rand = Math.random, x = pick(12, 98, rand)) {
  const a = Math.floor(x / 10);
  const b = x % 10;
  const s = a + b;
  const steps = [`Split ${x} apart: ${a} _ ${b}`, `Add them for the middle: ${a} + ${b} = ${s}`];
  if (s < 10) steps.push(`Put it in the middle: ${a}${s}${b}`);
  else steps.push(`${s} is too big, so carry the 1: ${a}+1 = ${a + 1}, middle ${s - 10} → ${a + 1}${s - 10}${b}`);
  return { kind: 'times11', prompt: `${x} × 11`, answer: x * 11, steps };
}

export function makeRound(kind, count, rand = Math.random) {
  const makers = {
    square5: () => squareFive(rand),
    times11: () => timesEleven(rand),
    mixed: () => (rand() < 0.5 ? squareFive(rand) : timesEleven(rand)),
  };
  const seen = new Set();
  const round = [];
  let guard = 0;
  while (round.length < count && guard++ < 500) {
    const p = makers[kind]();
    if (seen.has(p.prompt)) continue;
    seen.add(p.prompt);
    round.push(p);
  }
  return round;
}

export function checkAnswer(problem, input) {
  const n = Number(String(input).replace(/[^\d]/g, ''));
  return String(input).trim() !== '' && n === problem.answer;
}
