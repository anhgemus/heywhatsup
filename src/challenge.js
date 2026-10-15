// The Fledge loop, shared by every island:
// guess -> (talk back to the Fog) -> learn the method -> try -> outside check -> feather.
import * as store from './store.js';
import { go } from './router.js';
import { MENTORS, ISLANDS, STUMBLE_LESSONS } from './content.js';
import { gapMessage } from './logic/stats.js';
import { h, dialogue, guessFlow, compareBars, chime, featherBurst, featherIcon, pct, screenHead } from './ui.js';

export function islandOf(id) {
  return ISLANDS.find((i) => i.id === id);
}

// level: { id, title, short, predict, question, method?: [[who, text]...], play(stage, finish), judge?: text,
//          measureOnly?: bool, resultLines?(res, guess) }
export function runLevel(featId, levels, index) {
  const level = levels[index];
  const island = islandOf(featId);
  const mentor = MENTORS[island.mentor];
  const root = h('section', { class: 'screen challenge' });
  const back = h('button', { class: 'btn btn-quiet back', onclick: () => go('island', { id: featId }) }, '← ' + island.place);
  root.append(screenHead(level.title, level.short, back));
  const stage = h('div', { class: 'stage' });
  root.append(stage);

  (async () => {
    const step = (label) => stage.append(h('p', { class: 'step-label' }, label));

    step('1 · Guess first');
    const guess = await guessFlow(stage, level.predict, level.question);

    if (level.method?.length) {
      step(`2 · ${island.method}`);
      await dialogue(stage, level.method, { doneLabel: "Let's try" });
    }

    step(level.method?.length ? '3 · Your turn' : '2 · Your turn');
    stage.append(h('p', { class: 'hint' }, 'Practice flights never count against you. Mistakes are how this works.'));
    const playArea = h('div', { class: 'play' });
    stage.append(playArea);
    playArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const res = await new Promise((resolve) => level.play(playArea, resolve));
    // res: { score, max, success, detail?, resultLabel? }
    const result = res.max ? res.score / res.max : res.success ? 1 : 0;

    showResult({ stage, featId, levels, index, level, island, mentor, guess, result, res });
  })();

  return root;
}

function showResult({ stage, featId, levels, index, level, island, mentor, guess, result, res }) {
  const card = h('div', { class: 'result', 'aria-live': 'polite' });
  stage.append(card);

  const isCount = level.predict.kind === 'count';
  const guessLabel = isCount ? `${Math.round(guess * level.predict.max)} of ${level.predict.max}` : `${pct(guess)} sure`;
  const resultLabel = res.resultLabel || (isCount ? `${res.score} of ${res.max}` : res.success ? 'Did it!' : 'Not yet');

  card.append(h('h2', null, res.success ? 'You did it.' : level.measureOnly ? 'Measured!' : 'Not this time. Yet.'));
  card.append(compareBars(guess, result, { guessLabel, resultLabel }));

  if (res.detail) card.append(h('p', null, res.detail));
  if (level.judge) card.append(h('p', { class: 'judge' }, h('strong', null, 'Outside check: '), level.judge(res)));

  const gap = gapMessage(guess, result);
  const gapText = {
    higher: 'Your doubt guessed low. You flew higher than you thought you could.',
    match: 'Your guess matched what happened. Good self-knowledge!',
    lower: "This one went lower than your guess. That's useful information, not a verdict about you.",
  }[gap];
  if (!level.measureOnly) card.append(h('p', { class: `gap gap-${gap}` }, gapText));

  const actions = h('div', { class: 'row row-wrap row-end' });

  if (level.measureOnly) {
    chime('measure');
    store.updateFeat(featId, (f) => {
      f.baseline = { score: res.score, max: res.max, guess };
      if (!f.cleared.includes(level.id)) f.cleared.push(level.id);
    });
    card.append(...(level.resultLines?.(res, guess) || []).map((t) => h('p', null, t)));
    actions.append(nextButton(featId, levels, index, 'Learn the method'));
    card.append(actions);
    return;
  }

  if (res.success) {
    const first = store.get().feathers.filter((f) => f.kind !== 'stumble').length === 0;
    store.addFeather({
      kind: 'feat', feat: featId, level: level.id, title: level.title, guess, result, success: true,
    });
    store.updateFeat(featId, (f) => {
      if (!f.cleared.includes(level.id)) f.cleared.push(level.id);
      f.best[level.id] = Math.max(f.best[level.id] || 0, result);
    });
    const earned = h('div', { class: 'earned' },
      h('div', { class: 'earned-icon', html: featherIcon('feat', 54) }),
      h('div', null,
        h('p', { class: 'eyebrow' }, 'New feather'),
        h('p', null, `"${level.title}" is on your wings now. ${first ? 'Your very first one. Look at the map: the fog is thinning.' : ''}`)));
    card.append(earned);
    card.append(...(level.resultLines?.(res, guess) || []).map((t) => h('p', null, t)));
    chime('feather');
    requestAnimationFrame(() => featherBurst(earned.querySelector('.earned-icon'), 'feat'));
    card.append(h('p', { class: 'lesson' }, `${mentor.name}: "${island.lesson}"`));
    if (index + 1 < levels.length) actions.append(nextButton(featId, levels, index, 'Next challenge'));
    actions.prepend(h('button', { class: 'btn', onclick: () => go(first ? 'map' : 'island', { id: featId }) }, first ? 'See the map' : 'Back to ' + island.place));
    card.append(actions);
  } else {
    chime('soft');
    card.append(...(level.resultLines?.(res, guess) || []).map((t) => h('p', null, t)));
    card.append(stumbleReflection(featId, level, guess, result, () => {
      actions.append(
        h('button', { class: 'btn', onclick: () => go('island', { id: featId }) }, 'Back to ' + island.place),
        h('button', { class: 'btn btn-primary', onclick: () => go('level', { id: featId, index }) }, 'Try again'));
      card.append(actions);
    }));
  }
  card.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function nextButton(featId, levels, index, label) {
  return h('button', { class: 'btn btn-primary', onclick: () => go('level', { id: featId, index: index + 1 }) }, label);
}

// A stumble still earns a feather: a learning feather. It asks what to try next.
export function stumbleReflection(featId, level, guess, result, after) {
  const box = h('div', { class: 'reflect' });
  box.append(h('p', null, h('strong', null, 'What will you try next time?'), ' Pick one. A stumble with a plan is a learning feather.'));
  const chips = h('div', { class: 'chips' });
  STUMBLE_LESSONS.forEach((t) =>
    chips.append(h('button', {
      class: 'chip',
      onclick: () => {
        store.addFeather({ kind: 'stumble', feat: featId, level: level.id, title: level.title, guess, result, success: false, note: t });
        chips.replaceWith(h('div', { class: 'earned' },
          h('div', { class: 'earned-icon', html: featherIcon('stumble', 44) }),
          h('p', null, `Learning feather: "${t}". Pros stumble all the time. They just keep their notes.`)));
        after();
      },
    }, t)));
  box.append(chips);
  return box;
}
