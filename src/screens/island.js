// One island: meet the mentor, then climb its branches (levels) one by one.
import * as store from '../store.js';
import { go } from '../router.js';
import { ISLANDS, MENTORS, KINDS } from '../content.js';
import { FEATS } from '../feats/index.js';
import { runLevel } from '../challenge.js';
import { h, birdFor, dialogue, featherIcon, pct } from '../ui.js';

export function renderIsland({ id }) {
  const island = ISLANDS.find((i) => i.id === id);
  const feat = FEATS[id];
  const mentor = MENTORS[island.mentor];
  const fs = store.featState(id);
  const root = h('section', { class: 'screen island' });

  root.append(
    h('button', { class: 'btn btn-quiet back', onclick: () => go('map') }, '← Map'),
    h('header', { class: 'island-head' },
      h('div', { class: 'island-portrait', html: birdFor(island.mentor, { size: 120 }) }),
      h('div', null,
        h('p', { class: 'eyebrow' }, `${mentor.name} the ${mentor.species}`),
        h('h1', { tabindex: '-1' }, island.place),
        h('p', { class: 'lede' }, island.teaser),
        h('p', { class: 'kind-chip' }, h('strong', null, island.kind), ` · ${KINDS[island.kind]}`))),
  );

  const talk = h('div', { class: 'island-talk' });
  root.append(talk);

  const branches = h('ol', { class: 'branches' });
  feat.levels.forEach((lvl, i) => {
    const cleared = fs.cleared.includes(lvl.id);
    const open = i === 0 || fs.cleared.includes(feat.levels[i - 1].id);
    const best = fs.best[lvl.id];
    const tries = store.get().feathers.filter((f) => f.feat === id && f.level === lvl.id);
    branches.append(h('li', { class: `branch ${cleared ? 'cleared' : ''} ${open ? '' : 'locked'}` },
      h('span', { class: 'branch-mark', html: cleared ? featherIcon(lvl.measureOnly ? 'hop' : 'feat', 30) : '' }, cleared ? '' : String(i + 1)),
      h('div', { class: 'branch-text' },
        h('h3', null, lvl.title),
        h('p', null, lvl.short),
        tries.length ? h('p', { class: 'branch-meta' }, `${tries.length} tr${tries.length > 1 ? 'ies' : 'y'}${best ? ` · best ${pct(best)}` : ''}`) : null),
      h('button', {
        class: `btn ${open && !cleared ? 'btn-primary' : ''}`,
        disabled: !open,
        onclick: () => go('level', { id, index: i }),
      }, !open ? 'Locked' : cleared ? 'Again' : 'Start')));
  });

  const finished = fs.cleared.length >= feat.levels.length;
  root.append(
    h('h2', { class: 'section-title' }, 'Branches'),
    branches,
    h('aside', { class: 'fact' }, h('p', { class: 'eyebrow' }, `True fact about ${mentor.species}s`), h('p', null, mentor.fact)),
    finished ? h('p', { class: 'lesson' }, `${mentor.name}: "${island.lesson}" You found every feather here.`) : null);

  if (!fs.introSeen) {
    branches.inert = true;
    dialogue(talk, feat.intro, { doneLabel: 'Show me the branches' }).then(() => {
      store.updateFeat(id, (f) => (f.introSeen = true));
      branches.inert = false;
      branches.querySelector('.btn-primary')?.focus();
    });
  }

  return root;
}

export function renderLevel({ id, index }) {
  return runLevel(id, FEATS[id].levels, index);
}
