// Seed Cache Hill: the memory palace.
import * as store from '../store.js';
import { h, wait } from '../ui.js';
import { makeList, makePool, scoreOrdered, sillyScene, LOCI } from '../logic/memory.js';

const SHOW_MS = 5000;

function showSequence(area, items, { palace, scenes }) {
  return new Promise((resolve) => {
    const counter = h('p', { class: 'mem-count' });
    const card = h('div', { class: 'mem-card' });
    const timer = h('div', { class: 'mem-timer' }, h('div', { class: 'mem-timer-fill' }));
    const next = h('button', { class: 'btn' }, 'Next →');
    area.replaceChildren(counter, card, timer, h('div', { class: 'row row-end' }, next));
    let i = 0;
    let t;
    const show = () => {
      if (i >= items.length) {
        clearTimeout(t);
        resolve();
        return;
      }
      const item = items[i];
      counter.textContent = `${i + 1} / ${items.length}`;
      card.replaceChildren();
      if (palace) {
        const locus = LOCI[i];
        card.append(
          h('div', { class: 'mem-pair' },
            h('span', { class: 'mem-emoji', 'aria-hidden': 'true' }, item.e),
            h('span', { class: 'mem-on', 'aria-hidden': 'true' }, '→'),
            h('span', { class: 'mem-emoji mem-place', 'aria-hidden': 'true' }, locus.e)),
          h('p', { class: 'mem-name' }, `${item.n} at the ${locus.n}`),
          h('p', { class: 'mem-scene' }, scenes ? sillyScene(item, locus) : 'Make up your own silly picture!'));
      } else {
        card.append(
          h('span', { class: 'mem-emoji mem-big', 'aria-hidden': 'true' }, item.e),
          h('p', { class: 'mem-name' }, item.n));
      }
      const fill = timer.firstChild;
      fill.style.animation = 'none';
      void fill.offsetWidth;
      fill.style.animation = `drain ${SHOW_MS}ms linear forwards`;
      i++;
      clearTimeout(t);
      t = setTimeout(show, SHOW_MS);
    };
    next.addEventListener('click', show);
    show();
  });
}

function poolButton(item, onPick) {
  return h('button', { class: 'pool-item', 'aria-label': item.n, onclick: () => onPick(item) },
    h('span', { 'aria-hidden': 'true' }, item.e), h('small', null, item.n));
}

// Recall without the method: tap the things in the order you saw them.
function orderedRecall(area, targets) {
  return new Promise((resolve) => {
    const pool = makePool(targets, 6);
    const answers = [];
    const slots = h('ol', { class: 'slots' });
    const grid = h('div', { class: 'pool' });
    const undo = h('button', { class: 'btn btn-quiet' }, 'Undo');
    const done = h('button', { class: 'btn btn-primary' }, "I'm done");
    const paint = () => {
      slots.replaceChildren(...targets.map((_, i) =>
        h('li', { class: answers[i] ? 'slot filled' : 'slot' }, answers[i] ? answers[i].e : String(i + 1))));
      grid.querySelectorAll('.pool-item').forEach((b) => {
        b.disabled = answers.some((a) => a.n === b.getAttribute('aria-label')) || answers.length >= targets.length;
      });
    };
    pool.forEach((item) => grid.append(poolButton(item, (it) => { answers.push(it); paint(); })));
    undo.addEventListener('click', () => { answers.pop(); paint(); });
    done.addEventListener('click', () => resolve(answers));
    area.replaceChildren(
      h('p', { class: 'play-q' }, 'Tap them in the order you saw them. Skip any you forgot by tapping "I\'m done".'),
      slots, grid, h('div', { class: 'row row-end' }, undo, done));
    paint();
  });
}

// Recall with the method: walk the house and look in each spot.
function palaceRecall(area, targets) {
  return new Promise((resolve) => {
    const pool = makePool(targets, 6);
    const answers = [];
    const ask = () => {
      const i = answers.length;
      if (i >= targets.length) return resolve(answers);
      const locus = LOCI[i];
      const path = h('ol', { class: 'path', 'aria-label': 'Your walk through the house' },
        ...targets.map((_, k) => h('li', { class: k < i ? 'done' : k === i ? 'here' : '' }, LOCI[k].e)));
      const grid = h('div', { class: 'pool' });
      pool.forEach((item) => grid.append(poolButton(item, (it) => { answers.push(it); ask(); })));
      area.replaceChildren(
        path,
        h('p', { class: 'play-q' }, h('span', { class: 'mem-emoji', 'aria-hidden': 'true' }, locus.e), ` Walk to the ${locus.n}. What's there?`),
        grid,
        h('div', { class: 'row row-end' }, h('button', { class: 'btn btn-quiet', onclick: () => { answers.push(null); ask(); } }, "Can't remember, keep walking")));
    };
    ask();
  });
}

function playMemory({ count, palace, scenes, pass }) {
  return async (area, finish) => {
    const items = makeList(count);
    area.replaceChildren(
      h('p', null, palace
        ? `You'll see ${count} things, each placed somewhere in a house. About 5 seconds each. Picture it hard!`
        : `You'll see ${count} things, one at a time, about 5 seconds each. Just try to remember them in order.`),
      h('div', { class: 'row row-end' }, h('button', { class: 'btn btn-primary', id: 'mem-start' }, 'Ready'))
    );
    await new Promise((r) => area.querySelector('#mem-start').addEventListener('click', r));
    await showSequence(area, items, { palace, scenes });
    area.replaceChildren(h('p', { class: 'play-q' }, 'Okay, hidden! Take a breath…'));
    await wait(1200);
    const answers = palace ? await palaceRecall(area, items) : await orderedRecall(area, items);
    const score = scoreOrdered(answers, items);
    area.replaceChildren(h('div', { class: 'mem-review' },
      ...items.map((it, i) => h('span', { class: answers[i]?.n === it.n ? 'ok' : 'miss', title: it.n }, it.e))));
    finish({ score, max: count, success: pass ? score >= pass : true });
  };
}

export const intro = [
  ['clove', "Welcome to Seed Cache Hill! I'm Clove. I hide seeds all autumn and find them again in winter."],
  ['pip', "Hi! I'm Pip. I'm learning to fly too. I'm, um, not very good yet."],
  ['clove', 'First, let\'s measure how your memory works right now. Scientists always measure "before".'],
];

export const levels = [
  {
    id: 'before10', title: 'Before: 10 things', short: 'Just look and remember. No tricks yet.',
    predict: { kind: 'count', max: 10, unit: 'in order' },
    question: "You'll see 10 things, one at a time. How many do you think you'll remember in the right order?",
    measureOnly: true,
    play: playMemory({ count: 10, palace: false }),
    judge: () => 'The game checked each answer against the real list.',
    resultLines: () => [
      'Most people remember about 4 to 7 things this way. That is your "before".',
      "Now let's see what happens to the same brain with a better method.",
    ],
  },
  {
    id: 'palace10', title: 'The palace: 10 things', short: 'Same brain. New method.',
    predict: { kind: 'count', max: 10, unit: 'in order' },
    question: "Now with Clove's trick. How many of 10 do you think you'll remember in order?",
    method: [
      ['clove', "Here's my secret. I don't remember seeds. I remember places."],
      ['clove', 'Picture a house you know really well. We will walk through it: front door, doormat, coat hook, stairs, kitchen…'],
      ['clove', 'Put each thing in one spot, and make the picture silly. A giant banana dancing on the front door. Silly pictures stick.'],
      ['pip', 'I thought it sounded too easy. Then I tried it and remembered 9!'],
      ['clove', 'When it is time to remember, just walk through the house again and look around. Memory champions use this exact trick.'],
    ],
    play: playMemory({ count: 10, palace: true, scenes: true, pass: 7 }),
    judge: () => 'The game checked each answer against the real list. 7 or more is a feather.',
    resultLines: (res) => {
      const base = store.featState('memory').baseline;
      return base
        ? [`Before the method: ${base.score} of 10. With the method: ${res.score} of 10. Same brain. Better method.`]
        : [];
    },
  },
  {
    id: 'palace15', title: 'The palace: 15 things', short: 'More rooms. You make the silly pictures.',
    predict: { kind: 'count', max: 15, unit: 'in order' },
    question: 'Fifteen things this time, and you invent the silly pictures yourself. How many will you remember?',
    method: [['clove', 'Same walk, more rooms. This time I won\'t write the silly picture for you. Make it up. The weirder, the better.']],
    play: playMemory({ count: 15, palace: true, scenes: false, pass: 10 }),
    judge: () => 'Checked against the real list. 10 or more is a feather.',
  },
  {
    id: 'palace20', title: 'Champion: 20 things', short: 'Twenty things in order. Like a memory athlete.',
    predict: { kind: 'count', max: 20, unit: 'in order' },
    question: 'Twenty things in order. A month ago, would you have believed you could? How many now?',
    method: [
      ['pip', 'Twenty?! That\'s… a lot of rooms.'],
      ['clove', "It's the same trick, Pip. Twenty rooms is just ten rooms, twice."],
    ],
    play: playMemory({ count: 20, palace: true, scenes: false, pass: 14 }),
    judge: () => 'Checked against the real list. 14 or more is a feather.',
  },
];
