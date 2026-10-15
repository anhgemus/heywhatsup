// Far Shore: Fermi estimates. Break an "impossible" question into pieces you can find out.
import { h } from '../ui.js';
import { play } from '../sfx.js';
import { applyCard, formatBig, withinRange } from '../logic/fermi.js';

const CARDS = {
  minToHour: { label: '× 60', note: 'minutes in an hour', op: 'multiply', factor: 60, from: 'minute', to: 'hour' },
  hourToDay: { label: '× 24', note: 'hours in a day', op: 'multiply', factor: 24, from: 'hour', to: 'day' },
  dayToWeek: { label: '× 7', note: 'days in a week', op: 'multiply', factor: 7, from: 'day', to: 'week' },
  dayToYear: { label: '× 365', note: 'days in a year', op: 'multiply', factor: 365, from: 'day', to: 'year' },
  weekToYear: { label: '× 52', note: 'weeks in a year', op: 'multiply', factor: 52, from: 'week', to: 'year' },
  monthToYear: { label: '× 12', note: 'months in a year', op: 'multiply', factor: 12, from: 'month', to: 'year' },
  yearToLife: { label: '× 80', note: 'years in a long life', op: 'multiply', factor: 80, from: 'year', to: 'life' },
};

const per = (thing) => ({
  minute: `${thing} per minute`, hour: `${thing} per hour`, day: `${thing} per day`,
  week: `${thing} per week`, year: `${thing} per year`, life: `${thing} in a whole life`,
});

function cardsFor(thing, ids) {
  const labels = per(thing);
  return ids.map((id) => ({ ...CARDS[id], id, resultLabel: labels[CARDS[id].to] }));
}

function measure(area, { what, seconds, howTo, fallback, unitWord }) {
  return new Promise((resolve) => {
    const id = 'measure-count';
    const input = h('input', { id, class: 'answer', inputmode: 'numeric', autocomplete: 'off' });
    const clock = h('p', { class: 'clock', 'aria-live': 'polite' }, `${seconds}s`);
    const start = h('button', { class: 'btn btn-primary', 'data-sfx': 'off' }, `Start the ${seconds}-second timer`);
    const use = h('button', { class: 'btn', type: 'submit' }, 'Use my count');
    const typical = h('button', { class: 'btn btn-quiet', type: 'button' }, `I can't measure it. Use a typical kid's number (${fallback * (60 / seconds)} ${unitWord} a minute)`);
    let t;
    start.addEventListener('click', () => {
      let left = seconds;
      play('bell');
      start.disabled = true;
      clock.classList.add('running');
      t = setInterval(() => {
        left--;
        clock.textContent = left > 0 ? `${left}s` : 'Stop! How many did you count?';
        if (left <= 0) {
          clearInterval(t);
          play('bell');
          clock.classList.remove('running');
          input.focus();
        }
      }, 1000);
    });
    const form = h('form', { class: 'measure' },
      h('p', null, howTo), clock, h('div', { class: 'row' }, start),
      h('label', { for: id }, `How many ${what} did you count in ${seconds} seconds?`), input,
      h('div', { class: 'row row-wrap row-end' }, typical, use));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const n = Number(input.value);
      if (!n || n < 1 || n > 200) {
        input.setCustomValidity('Type the number you counted, like 20.');
        input.reportValidity();
        return;
      }
      clearInterval(t);
      resolve(n * (60 / seconds));
    });
    input.addEventListener('input', () => input.setCustomValidity(''));
    typical.addEventListener('click', () => {
      clearInterval(t);
      resolve(fallback * (60 / seconds));
    });
    area.replaceChildren(form);
  });
}

function chainBuilder(area, { start, goal, goalLabel, cards, range, finishLabel }) {
  return new Promise((resolve) => {
    let chain = { ...start, steps: [] };
    const history = [];
    const now = h('div', { class: 'chain-now', 'aria-live': 'polite' });
    const steps = h('ol', { class: 'chain-steps' });
    const msg = h('p', { class: 'chain-msg', role: 'status' });
    const deck = h('div', { class: 'deck' });
    const undo = h('button', { class: 'btn btn-quiet' }, 'Undo');
    const doneRow = h('div', { class: 'row row-end' });

    function paint() {
      now.replaceChildren(
        h('span', { class: 'chain-value' }, formatBig(chain.value)),
        h('span', { class: 'chain-unit' }, chain.label));
      steps.replaceChildren(
        h('li', null, `Start: ${formatBig(start.value)} ${start.label}`),
        ...chain.steps.map((c) => h('li', null, `${c.label} (${c.note}) → ${c.resultLabel}`)));
      deck.replaceChildren(...cards.map((c) => h('button', {
        class: 'card-btn',
        'data-sfx': 'off',
        onclick: () => playCard(c),
      }, h('span', { class: 'card-op' }, c.label), h('span', { class: 'card-note' }, c.note))));
      doneRow.replaceChildren();
      if (chain.unit === goal) {
        doneRow.append(h('button', {
          class: 'btn btn-primary',
          onclick: () => resolve({ value: chain.value, ok: withinRange(chain.value, range) }),
        }, finishLabel));
        msg.textContent = `You reached ${goalLabel}. Ready for the outside check?`;
      }
    }

    function playCard(card) {
      const r = applyCard(chain, card);
      if (!r.ok) {
        play('nope');
        msg.textContent = r.message;
        return;
      }
      play(r.chain.unit === goal ? 'measure' : 'pick');
      history.push(chain);
      chain = r.chain;
      msg.textContent = '';
      paint();
    }

    undo.addEventListener('click', () => {
      if (!history.length) return;
      chain = history.pop();
      msg.textContent = '';
      paint();
    });

    area.replaceChildren(
      h('p', { class: 'play-q' }, `Goal: ${goalLabel}. Pick the card that takes you one step closer.`),
      now, steps, msg, deck, h('div', { class: 'row row-end' }, undo), doneRow);
    paint();
  });
}

export const intro = [
  ['gale', "Hello. I'm Gale, a godwit. When I was five months old, I flew from Alaska to Tasmania without stopping."],
  ['pip', 'How did you know you could make it that far?'],
  ['gale', "I didn't. I just knew how far one hour of flying was. And then I did another hour."],
  ['gale', "Here we answer questions that sound impossible. The trick: you don't need the answer. You need pieces of it."],
];

export const levels = [
  {
    id: 'heart', title: 'Every heartbeat', short: 'How many times will your heart beat in your whole life?',
    predict: { kind: 'confidence' },
    question: 'Could you work out roughly how many times your heart beats in a whole life, with no internet? How sure are you?',
    method: [
      ['pip', "That's impossible! Nobody counts every heartbeat."],
      ['gale', 'Right, nobody can count them all. But you can count some of them.'],
      ['gale', 'Piece one: count your own heartbeats for 15 seconds. Two fingers on the side of your neck, or on your wrist below the thumb.'],
      ['gale', 'Then multiply your way up: minutes to hours, hours to days, all the way to a lifetime.'],
      ['gale', 'Scientists call this a Fermi estimate, after the physicist Enrico Fermi, who loved questions like this.'],
    ],
    play: async (area, finish) => {
      const bpm = await measure(area, {
        what: 'heartbeats', seconds: 15, unitWord: 'beats', fallback: 22,
        howTo: 'Find your pulse (side of your neck, or wrist below the thumb). Press start, and count the beats until the timer stops.',
      });
      const r = await chainBuilder(area, {
        start: { value: bpm, unit: 'minute', label: 'beats per minute' },
        goal: 'life', goalLabel: 'heartbeats in a whole life',
        cards: cardsFor('beats', ['dayToWeek', 'minToHour', 'yearToLife', 'monthToYear', 'hourToDay', 'dayToYear']),
        range: [1.5e9, 7e9], finishLabel: 'Check my estimate',
      });
      finish({ success: r.ok, score: r.ok ? 1 : 0, max: 1, resultLabel: `≈ ${formatBig(r.value)}` });
    },
    judge: (res) => `Scientists estimate a heart beats around 3 billion times in a long life. Getting within about two times of that is a great estimate. Yours: ${res.resultLabel}.`,
    resultLines: () => ["You just worked out a number in the billions, with no internet, from one 15-second count. That's the trick."],
  },
  {
    id: 'breath', title: 'Every breath', short: 'How many breaths do you take in a year? You build the chain.',
    predict: { kind: 'confidence' },
    question: 'How many breaths do you take in a whole year? This time you build the chain yourself. How sure are you?',
    method: [
      ['gale', 'Same idea, but this time I won\'t tell you the order. Count your breaths for 30 seconds, then build your own chain to a year.'],
      ['gale', 'Watch the units. Breaths per minute can only become breaths per hour. There is more than one good path.'],
    ],
    play: async (area, finish) => {
      const bpm = await measure(area, {
        what: 'breaths', seconds: 30, unitWord: 'breaths', fallback: 10,
        howTo: 'Breathe normally. Press start and count each time you breathe in, until the timer stops.',
      });
      const r = await chainBuilder(area, {
        start: { value: bpm, unit: 'minute', label: 'breaths per minute' },
        goal: 'year', goalLabel: 'breaths in a year',
        cards: cardsFor('breaths', ['weekToYear', 'hourToDay', 'monthToYear', 'dayToYear', 'minToHour', 'dayToWeek']),
        range: [3e6, 2.2e7], finishLabel: 'Check my estimate',
      });
      finish({ success: r.ok, score: r.ok ? 1 : 0, max: 1, resultLabel: `≈ ${formatBig(r.value)}` });
    },
    judge: (res) => `Resting kids breathe about 15 to 30 times a minute, which comes to roughly 8 to 16 million breaths a year. Yours: ${res.resultLabel}.`,
  },
  {
    id: 'godwit', title: "Gale's flight", short: 'How fast did a baby godwit fly across the Pacific?',
    predict: { kind: 'confidence' },
    question: 'A young godwit flew 13,560 km in 11 days without stopping. Could you work out its speed in km per hour?',
    method: [
      ['gale', 'My trip: 13,560 km, 11 days, no landing. How fast was that, in km per hour, like a car?'],
      ['gale', 'This time you divide, to break a big total into small pieces.'],
    ],
    play: async (area, finish) => {
      const r = await chainBuilder(area, {
        start: { value: 13560, unit: 'trip', label: 'km for the whole trip' },
        goal: 'hour', goalLabel: 'km per hour',
        cards: [
          { id: 'w', label: '÷ 7', note: 'days in a week', op: 'divide', factor: 7, from: 'week', to: 'day', resultLabel: 'km per day' },
          { id: 'd', label: '÷ 11', note: 'days in the trip', op: 'divide', factor: 11, from: 'trip', to: 'day', resultLabel: 'km per day' },
          { id: 'm', label: '÷ 60', note: 'minutes in an hour', op: 'divide', factor: 60, from: 'hour', to: 'minute', resultLabel: 'km per minute' },
          { id: 'h', label: '÷ 24', note: 'hours in a day', op: 'divide', factor: 24, from: 'day', to: 'hour', resultLabel: 'km per hour' },
        ],
        range: [45, 60], finishLabel: 'Check my answer',
      });
      finish({ success: r.ok, score: r.ok ? 1 : 0, max: 1, resultLabel: `≈ ${formatBig(r.value)} km/h` });
    },
    judge: () => '13,560 km in 11 days is about 51 km per hour: the speed of a car driving through a town, day and night, for 11 days.',
  },
];
