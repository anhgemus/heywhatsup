// Nectar Falls: mental-math tricks. Speed, the kind of ambition that's easiest to learn.
import { h } from '../ui.js';
import { makeRound, checkAnswer, squareFive, timesEleven } from '../logic/lightning.js';

function practice(area, problem) {
  return new Promise((resolve) => {
    const steps = h('ol', { class: 'steps' }, ...problem.steps.map((s) => h('li', null, s)));
    area.replaceChildren(
      h('p', { class: 'eyebrow' }, 'Practice one together'),
      h('p', { class: 'big-problem' }, problem.prompt),
      steps,
      h('p', { class: 'big-problem' }, `= ${problem.answer.toLocaleString('en-US')}`),
      h('div', { class: 'row row-end' }, h('button', { class: 'btn btn-primary', onclick: resolve }, "Got it. I'm ready")));
  });
}

function playRound(kind, count, seconds, pass, sample) {
  return async (area, finish) => {
    await practice(area, sample());
    const round = makeRound(kind, count);
    let score = 0;
    const log = h('ol', { class: 'math-log' });
    for (let i = 0; i < round.length; i++) {
      const p = round[i];
      const ok = await ask(area, p, i, round.length, seconds, log);
      if (ok) score++;
    }
    area.replaceChildren(log);
    finish({ score, max: count, success: score >= pass });
  };
}

function ask(area, p, i, total, seconds, log) {
  return new Promise((resolve) => {
    const id = `ans-${i}`;
    const input = h('input', { id, class: 'answer', inputmode: 'numeric', autocomplete: 'off', 'aria-label': `Answer to ${p.prompt}` });
    const bar = h('div', { class: 'mem-timer' }, h('div', { class: 'mem-timer-fill', style: `animation: drain ${seconds}s linear forwards` }));
    const form = h('form', { class: 'math-q' },
      h('p', { class: 'mem-count' }, `${i + 1} / ${total}`),
      h('label', { class: 'big-problem', for: id }, `${p.prompt} =`),
      input, bar,
      h('div', { class: 'row row-end' }, h('button', { class: 'btn btn-primary', type: 'submit' }, 'Answer')));
    let done = false;
    const end = (value) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      const ok = checkAnswer(p, value);
      log.append(h('li', { class: ok ? 'ok' : 'miss' },
        `${p.prompt} = ${p.answer.toLocaleString('en-US')} `,
        ok ? '✓' : h('span', { class: 'why' }, `· ${value ? 'you said ' + value + '. ' : 'time ran out. '}${p.steps[p.steps.length - 1]}`)));
      area.replaceChildren(h('p', { class: ok ? 'flash ok' : 'flash miss', role: 'status' }, ok ? 'Yes!' : `It's ${p.answer.toLocaleString('en-US')}.`));
      setTimeout(() => resolve(ok), ok ? 600 : 1600);
    };
    const timer = setTimeout(() => end(input.value.trim()), seconds * 1000);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      end(input.value.trim());
    });
    area.replaceChildren(form);
    input.focus();
  });
}

export const intro = [
  ['zip', "Hi hi hi! I'm Zip! My wings beat about fifty times a second!"],
  ['zip', "Speed is the easiest kind of ambition. Doing the same thing faster. So let's get it out of the way, fast."],
  ['pip', "I'm not a math bird. That's what I used to say, anyway."],
  ['zip', "Most \"math birds\" just know tricks. Tricks can be learned. Watch."],
];

export const levels = [
  {
    id: 'square5', title: 'Squares that end in 5', short: 'Like 65 × 65, in your head.',
    predict: { kind: 'count', max: 5, unit: 'right' },
    question: 'Five problems like 65 × 65, 15 seconds each, no paper. How many will you get right?',
    method: [
      ['zip', 'Watch: 35 × 35. Take the front digit, 3. Times the next number up, 4. That makes 12.'],
      ['zip', 'Now stick 25 on the end: 1225. Done!'],
      ['pip', "Wait. That's it?!"],
      ['zip', "That's it. It works for every number that ends in 5. 85 × 85? 8 × 9 = 72. Then 25. 7225."],
    ],
    play: playRound('square5', 5, 15, 4, () => squareFive(Math.random, 4)),
    judge: () => 'The game checked every answer. 4 out of 5 is a feather.',
  },
  {
    id: 'times11', title: 'Times 11', short: 'Any two-digit number times 11.',
    predict: { kind: 'count', max: 5, unit: 'right' },
    question: 'Five problems like 52 × 11, 15 seconds each. How many will you get right?',
    method: [
      ['zip', 'New trick. 52 × 11. Split the digits apart: 5 _ 2.'],
      ['zip', 'Add them: 5 + 2 = 7. Put it in the middle: 572.'],
      ['pip', 'What if the middle is bigger than 9?'],
      ['zip', 'Great question! 75 × 11: 7 + 5 = 12. Keep the 2 in the middle, carry the 1 onto the 7. 825.'],
    ],
    play: playRound('times11', 5, 15, 4, () => timesEleven(Math.random, 75)),
    judge: () => 'The game checked every answer. 4 out of 5 is a feather.',
  },
  {
    id: 'mixed', title: 'Lightning round', short: 'Both tricks, mixed up, 10 seconds each.',
    predict: { kind: 'count', max: 8, unit: 'right' },
    question: 'Eight problems, both tricks mixed, only 10 seconds each. How many will you get?',
    method: [
      ['zip', 'Both tricks, mixed up, faster. First spot which trick it is, then use it.'],
      ['zip', 'Your heart might be racing. Good! That feeling means your body is getting ready. Tell yourself: "I\'m excited."'],
    ],
    play: playRound('mixed', 8, 10, 6, () => squareFive(Math.random, 9)),
    judge: () => 'The game checked every answer. 6 out of 8 is a feather.',
  },
];
