// Your wings: every feather is a piece of evidence about what you can do.
import * as store from '../store.js';
import { go } from '../router.js';
import { h, birdFor, featherPath, FEATHER_FILL, featherIcon, pct, compareBars, screenHead } from '../ui.js';
import { doubtStats } from '../logic/stats.js';

const KIND_NAME = { feat: 'Island feather', sky: 'Big Sky feather', hop: 'Hop feather', stumble: 'Learning feather' };
const PER_ROW = 9;

// Lay out feather slots as two fanned wings. Earlier feathers become the long flight feathers.
function wingSlots(total) {
  const slots = [];
  for (let k = 0; k < total; k++) {
    const side = k % 2 === 0 ? 1 : -1;
    const j = Math.floor(k / 2);
    const row = Math.floor(j / PER_ROW);
    const idx = j % PER_ROW;
    const angle = 18 + (idx / (PER_ROW - 1)) * 100;
    const len = Math.max(48, 168 - row * 36) * (0.86 + 0.14 * Math.sin((idx / (PER_ROW - 1)) * Math.PI));
    const wid = Math.max(9, 17 - row * 2);
    slots.push({ side, row, angle, len, wid });
  }
  return slots;
}

function wingsSVG(feathers, onPick) {
  const total = Math.min(72, Math.max(18, Math.ceil((feathers.length + 4) / 2) * 2));
  const slots = wingSlots(total);
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '-330 -230 660 330');
  svg.setAttribute('class', 'wings-art');
  svg.setAttribute('role', 'group');
  svg.setAttribute('aria-label', `Your wings: ${feathers.length} feathers`);
  // Draw back rows first so the shorter covert feathers sit on top.
  const order = slots.map((s, i) => i).sort((a, b) => slots[a].row - slots[b].row);
  for (const i of order) {
    const s = slots[i];
    const f = feathers[i];
    const g = document.createElementNS(ns, 'g');
    const shoulderX = s.side * 34;
    g.setAttribute('transform', `translate(${shoulderX} -40) scale(${s.side} 1) rotate(${s.angle})`);
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', featherPath(s.len, s.wid));
    if (f) {
      path.setAttribute('fill', FEATHER_FILL[f.kind]);
      path.setAttribute('class', 'wf');
      const quill = document.createElementNS(ns, 'path');
      quill.setAttribute('d', `M0 0 L0 ${-s.len * 0.95}`);
      quill.setAttribute('class', 'wq');
      g.append(path, quill);
      g.setAttribute('tabindex', '0');
      g.setAttribute('role', 'button');
      g.setAttribute('class', 'wfeather');
      g.setAttribute('aria-label', `${KIND_NAME[f.kind]}: ${f.title}`);
      g.addEventListener('click', () => onPick(f, g));
      g.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onPick(f, g)));
    } else {
      path.setAttribute('class', 'wempty');
      g.append(path);
    }
    svg.append(g);
  }
  return svg;
}

function featherDetail(f) {
  const when = new Date(f.at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const box = h('div', { class: 'feather-detail' },
    h('div', { class: 'fd-icon', html: featherIcon(f.kind, 46) }),
    h('div', null,
      h('p', { class: 'eyebrow' }, `${KIND_NAME[f.kind]} · ${when}`),
      h('h3', null, f.title),
      f.note ? h('p', null, f.kind === 'stumble' ? `Next time: ${f.note}` : f.note) : null));
  if (typeof f.guess === 'number' && typeof f.result === 'number') {
    box.append(compareBars(f.guess, f.result));
  }
  return box;
}

export function renderWings() {
  const s = store.get();
  const feathers = s.feathers;
  const stats = doubtStats(feathers);
  const root = h('section', { class: 'screen wings' });
  root.append(screenHead('Your wings', feathers.length
    ? 'Every feather here is a real thing you did. Tap one to see what you guessed before you tried.'
    : 'Empty for now. Every feather you earn will appear here, as proof.'));

  const detail = h('div', { class: 'wings-detail', 'aria-live': 'polite' },
    h('p', { class: 'hint' }, feathers.length ? 'Tap a feather.' : 'Your first feather is waiting on Seed Cache Hill.'));
  let picked = null;
  const art = h('div', { class: 'wings-stage' });
  art.append(wingsSVG(feathers, (f, g) => {
    picked?.classList.remove('picked');
    picked = g;
    g.classList.add('picked');
    detail.replaceChildren(featherDetail(f));
  }));
  art.append(h('div', { class: 'wings-bird', html: birdFor('you', { size: 110 }) }));
  root.append(art, detail);

  const legend = h('ul', { class: 'legend' },
    ...Object.entries(KIND_NAME).map(([k, name]) => h('li', null, h('span', { html: featherIcon(k, 22) }), name)));
  root.append(legend);

  if (stats.count) {
    root.append(h('h2', { class: 'section-title' }, 'What your evidence says'));
    const tiles = h('div', { class: 'tiles' },
      stats.doubted
        ? tile(`${stats.doubtedAndDid} of ${stats.doubted}`, `time${stats.doubted === 1 ? '' : 's'} you doubted yourself (guessed under 50%), you did it anyway`)
        : tile('0', 'times you doubted yourself so far. Try something that makes you guess low!'),
      tile(`${stats.beatGuess} of ${stats.count}`, `tr${stats.count === 1 ? 'y' : 'ies'} where you did better than you guessed`),
      tile(`${pct(stats.avgGuess)} → ${pct(stats.avgResult)}`, 'your average guess, and what actually happened on average'));
    root.append(tiles);
    root.append(h('p', { class: 'insight' }, stats.avgResult > stats.avgGuess + 0.1
      ? 'Your doubt keeps guessing low. That doesn\'t make it a liar, just a bad guesser. Next time it talks, check it against this page.'
      : stats.avgResult < stats.avgGuess - 0.1
        ? 'You aim high. Some flights land lower than you guessed, and that\'s how you find your edge. Keep the learning feathers coming.'
        : 'Your guesses match what happens pretty closely. You know yourself well. Try picking something that feels a little too hard.'));
  }

  if (s.talkbacks.length) {
    const counts = {};
    s.talkbacks.forEach((t) => (counts[t.text] = (counts[t.text] || 0) + 1));
    root.append(h('h2', { class: 'section-title' }, 'What you said back to the Fog'),
      h('ul', { class: 'talkback-list' }, ...Object.entries(counts).sort((a, b) => b[1] - a[1])
        .map(([t, c]) => h('li', null, `"${t}"`, c > 1 ? h('span', { class: 'times' }, ` × ${c}`) : null))));
  }

  if (feathers.length) {
    root.append(h('h2', { class: 'section-title' }, 'Every feather'),
      h('ol', { class: 'feather-list', reversed: true }, ...feathers.slice().reverse().map((f) =>
        h('li', null,
          h('span', { html: featherIcon(f.kind, 22) }),
          h('span', { class: 'fl-title' }, f.title),
          typeof f.guess === 'number' ? h('span', { class: 'fl-gap' }, `guessed ${pct(f.guess)} · ${f.success ? 'did it' : 'learned'}`) : h('span', { class: 'fl-gap' }, KIND_NAME[f.kind])))));
  } else {
    root.append(h('div', { class: 'row' }, h('button', { class: 'btn btn-primary', onclick: () => go('island', { id: 'memory' }) }, 'Go to Seed Cache Hill')));
  }
  return root;
}

function tile(big, small) {
  return h('div', { class: 'tile' }, h('strong', null, big), h('span', null, small));
}
