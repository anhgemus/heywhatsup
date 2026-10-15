// Small DOM helpers and the shared pieces every screen uses.
import * as store from './store.js';
import { COLORS, PIP, MENTORS, TALKBACKS, FOG_LINES } from './content.js';
import { findEcho } from './logic/stats.js';

export function h(tag, props, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'value') el.value = v;
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  add(el, children);
  return el;
}

export function add(el, children) {
  for (const c of [children].flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

export function fromHTML(markup) {
  const t = document.createElement('template');
  t.innerHTML = markup.trim();
  return t.content.firstElementChild;
}

export const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export function pct(x) {
  return `${Math.round(x * 100)}%`;
}

// ---------- Birds ----------

export function birdMarkup(look, { size = 72, flip = false, label = '' } = {}) {
  const { body, belly, wing, beak, fluffy, longBeak, eyeRing, mask, small } = look;
  const s = small ? 0.86 : 1;
  const beakPath = longBeak ? 'M81 38 L104 44 L81 45 Z' : 'M81 35 L95 41 L81 46 Z';
  return `<svg class="bird" viewBox="-6 0 112 100" width="${size}" height="${size}" role="img" aria-label="${label}">
  <g transform="${flip ? 'translate(100 0) scale(-1 1) ' : ''}translate(50 56) scale(${s}) translate(-50 -56)">
    <path d="M20 60 L2 70 L6 62 L0 56 L18 52 Z" fill="${wing}"/>
    <ellipse cx="48" cy="60" rx="32" ry="27" fill="${body}" class="bird-line"/>
    <ellipse cx="54" cy="70" rx="19" ry="14" fill="${belly}"/>
    <circle cx="64" cy="38" r="20" fill="${body}" class="bird-line"/>
    ${mask ? `<path d="M66 26 Q84 30 82 46 Q72 50 64 42 Z" fill="${wing}"/>` : ''}
    <path d="${beakPath}" fill="${beak}"/>
    ${eyeRing ? '<circle cx="70" cy="34" r="6" fill="#E9EDF3"/>' : ''}
    <circle cx="70" cy="34" r="4.2" fill="#14161C"/>
    <circle cx="71.5" cy="32.6" r="1.4" fill="#FFFFFF"/>
    <path class="bird-wing" d="M26 52 Q48 40 62 58 Q48 76 24 66 Z" fill="${wing}"/>
    ${fluffy ? `<path d="M58 19 q2 -9 6 -2 q3 -8 6 1" fill="none" stroke="${body}" stroke-width="3.5" stroke-linecap="round"/>` : ''}
    <path d="M42 85 v9 M54 85 v9" stroke="${beak}" stroke-width="3.2" stroke-linecap="round"/>
  </g></svg>`;
}

export function playerLook() {
  return COLORS[store.get().color] || COLORS.sky;
}

export function birdFor(who, opts = {}) {
  if (who === 'you') return birdMarkup(playerLook(), { label: store.get().name || 'You', ...opts });
  if (who === 'pip') return birdMarkup(PIP.look, { label: 'Pip', ...opts });
  if (who === 'fog') return fogMarkup(opts.size || 72);
  const m = MENTORS[who];
  return birdMarkup(m.look, { label: m.name, ...opts });
}

function fogMarkup(size) {
  return `<svg class="bird fog-face" viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="The Fog">
    <g fill="var(--paper)" stroke="var(--line)" stroke-width="2"><circle cx="34" cy="56" r="22"/><circle cx="58" cy="44" r="26"/><circle cx="72" cy="62" r="18"/><rect x="18" y="56" width="70" height="22" rx="11"/></g>
    <circle cx="50" cy="52" r="3" fill="var(--ink-soft)"/><circle cx="66" cy="52" r="3" fill="var(--ink-soft)"/>
    <path d="M52 64 q6 -4 12 0" stroke="var(--ink-soft)" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`;
}

export function whoName(who) {
  if (who === 'you') return store.get().name || 'You';
  if (who === 'pip') return 'Pip';
  if (who === 'fog') return 'The Fog';
  return MENTORS[who]?.name || who;
}

// ---------- Feathers ----------

export const FEATHER_FILL = {
  feat: 'var(--feather-feat)',
  sky: 'var(--feather-sky)',
  hop: 'var(--feather-hop)',
  stumble: 'var(--feather-stumble)',
};

export function featherPath(len, wid) {
  return `M0 0 C ${wid} ${-len * 0.18} ${wid * 0.9} ${-len * 0.78} 0 ${-len} C ${-wid * 0.9} ${-len * 0.78} ${-wid} ${-len * 0.18} 0 0 Z`;
}

export function featherIcon(kind = 'feat', size = 28) {
  return `<svg class="feather-icon" viewBox="-14 -46 28 50" width="${size * 0.6}" height="${size}" aria-hidden="true">
    <path d="${featherPath(42, 11)}" fill="${FEATHER_FILL[kind]}"/>
    <path d="M0 4 L0 -40" stroke="var(--quill)" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M0 -12 L7 -20 M0 -22 L-7 -30 M0 -28 L6 -34" stroke="var(--quill)" stroke-width="1" opacity=".55"/></svg>`;
}

// ---------- Speech ----------

export function bubble(who, text, { side } = {}) {
  const right = side ? side === 'right' : who === 'you';
  return h('div', { class: `line ${right ? 'line-right' : ''} line-${who}` },
    h('div', { class: 'line-bird', html: birdFor(who, { size: 56, flip: right }) }),
    h('div', { class: 'line-bubble' },
      h('span', { class: 'line-name' }, whoName(who)),
      h('p', null, text)));
}

// Plays a short conversation one line at a time. Resolves when the player finishes it.
export function dialogue(container, lines, { doneLabel = 'Got it' } = {}) {
  return new Promise((resolve) => {
    const wrap = h('div', { class: 'dialogue', 'aria-live': 'polite' });
    const next = h('button', { class: 'btn btn-primary' }, 'Next');
    const skip = h('button', { class: 'btn btn-quiet' }, 'Skip');
    const bar = h('div', { class: 'row row-end' }, skip, next);
    container.append(wrap, bar);
    let i = 0;
    const finish = () => {
      while (i < lines.length) show();
      bar.remove();
      resolve();
    };
    const show = () => {
      const [who, text] = lines[i++];
      wrap.append(bubble(who, text));
      if (i >= lines.length) next.textContent = doneLabel;
    };
    next.addEventListener('click', () => (i >= lines.length ? finish() : show()));
    skip.addEventListener('click', finish);
    show();
    next.focus({ preventScroll: true });
  });
}

// ---------- Guessing ----------

// The heart of the game: say what you think will happen before you try.
// spec: { kind: 'count', max, unit } or { kind: 'confidence' }. Resolves to a 0..1 guess.
export function guessWidget(container, spec, question) {
  return new Promise((resolve) => {
    const isCount = spec.kind === 'count';
    const max = isCount ? spec.max : 100;
    const start = isCount ? Math.round(max / 2) : 50;
    const id = `guess-${Math.random().toString(36).slice(2, 7)}`;
    const readout = h('output', { class: 'guess-readout', for: id });
    const face = h('span', { class: 'guess-face', 'aria-hidden': 'true' });
    const input = h('input', {
      id, type: 'range', min: 0, max, step: 1, value: start, class: 'guess-range',
      'aria-describedby': `${id}-q`,
    });
    const faces = ['😬', '😟', '🤔', '🙂', '😎'];
    const paint = () => {
      const v = Number(input.value);
      readout.textContent = isCount ? `${v} of ${max}${spec.unit ? ' ' + spec.unit : ''}` : `${v}% sure`;
      face.textContent = faces[Math.min(4, Math.floor((v / max) * 5))];
      input.style.setProperty('--fill', `${(v / max) * 100}%`);
    };
    input.addEventListener('input', paint);
    paint();
    const go = h('button', { class: 'btn btn-primary' }, 'Lock in my guess');
    const card = h('div', { class: 'guess' },
      h('label', { class: 'guess-q', id: `${id}-q`, for: id }, question),
      h('div', { class: 'guess-scale' },
        h('span', null, isCount ? '0' : 'No way'), input, h('span', null, isCount ? String(max) : 'Easy')),
      h('div', { class: 'guess-out' }, face, readout),
      h('p', { class: 'hint' }, 'There is no wrong guess. We just want to see if your guess matches what happens.'),
      h('div', { class: 'row row-end' }, go));
    container.append(card);
    go.addEventListener('click', () => {
      card.classList.add('locked');
      input.disabled = true;
      go.remove();
      resolve(Number(input.value) / max);
    });
  });
}

// When the guess is low, the Fog speaks up. The player answers it back.
export function talkBack(container) {
  return new Promise((resolve) => {
    const fogLine = FOG_LINES[Math.floor(Math.random() * FOG_LINES.length)];
    const box = h('div', { class: 'talkback' });
    box.append(bubble('fog', fogLine));
    const prompt = h('p', { class: 'talkback-q' }, 'That voice is the Fog. It sounds sure of itself, but it is only guessing. What do you say back?');
    const choices = h('div', { class: 'chips' });
    TALKBACKS.forEach((t) => {
      choices.append(h('button', {
        class: 'chip',
        onclick: () => {
          store.update((s) => s.talkbacks.push({ text: t, at: Date.now() }));
          choices.remove();
          prompt.remove();
          box.append(bubble('you', t));
          resolve(t);
        },
      }, t));
    });
    box.append(prompt, choices);
    container.append(box);
  });
}

// Show the player their own evidence at the moment they doubt themselves.
export function echoCard() {
  const echo = findEcho(store.get().feathers);
  if (!echo) return null;
  const when = new Date(echo.at).toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
  return h('aside', { class: 'echo' },
    h('div', { class: 'echo-icon', html: featherIcon(echo.kind, 34) }),
    h('div', null,
      h('p', { class: 'eyebrow' }, 'Remember this?'),
      h('p', null, `On ${when} you guessed ${pct(echo.guess)} about "${echo.title}". You did it.`)));
}

// Guess, then (if doubtful) talk back to the Fog and see past evidence.
export async function guessFlow(container, spec, question) {
  const guess = await guessWidget(container, spec, question);
  if (guess < 0.5) {
    await talkBack(container);
    const echo = echoCard();
    if (echo) container.append(echo);
  }
  return guess;
}

// ---------- Feedback ----------

let audio;
export function chime(kind = 'feather') {
  if (!store.get().settings.sound) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const notes = kind === 'feather' ? [659, 784, 988, 1319] : kind === 'soft' ? [523, 659] : [392, 330];
    notes.forEach((f, i) => {
      const o = audio.createOscillator();
      const g = audio.createGain();
      o.type = 'triangle';
      o.frequency.value = f;
      const t = audio.currentTime + i * 0.09;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.12, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      o.connect(g).connect(audio.destination);
      o.start(t);
      o.stop(t + 0.55);
    });
  } catch {
    // Sound is a bonus.
  }
}

export function toast(text) {
  const t = h('div', { class: 'toast', role: 'status' }, text);
  document.body.append(t);
  setTimeout(() => t.classList.add('out'), 2600);
  setTimeout(() => t.remove(), 3200);
}

export function featherBurst(anchor, kind = 'feat') {
  if (reducedMotion()) return;
  const r = anchor.getBoundingClientRect();
  for (let i = 0; i < 9; i++) {
    const f = h('div', { class: 'burst', html: featherIcon(kind, 26) });
    f.style.left = `${r.left + r.width / 2}px`;
    f.style.top = `${r.top + r.height / 2}px`;
    f.style.setProperty('--dx', `${(Math.random() - 0.5) * 260}px`);
    f.style.setProperty('--dy', `${-80 - Math.random() * 160}px`);
    f.style.setProperty('--rot', `${(Math.random() - 0.5) * 360}deg`);
    document.body.append(f);
    setTimeout(() => f.remove(), 1500);
  }
}

// Guess vs. what happened, drawn as two bars on one scale.
export function compareBars(guess, result, { guessLabel, resultLabel } = {}) {
  const bar = (cls, label, v, text) =>
    h('div', { class: `cmp-row ${cls}` },
      h('span', { class: 'cmp-label' }, label),
      h('div', { class: 'cmp-track' }, h('div', { class: 'cmp-fill', style: `--w:${Math.max(2, v * 100)}%` })),
      h('span', { class: 'cmp-val' }, text));
  return h('div', { class: 'cmp' },
    bar('cmp-guess', 'Your guess', guess, guessLabel || pct(guess)),
    bar('cmp-result', 'What happened', result, resultLabel || pct(result)));
}

export function screenHead(title, sub, back) {
  return h('header', { class: 'screen-head' },
    back || null,
    h('h1', { tabindex: '-1' }, title),
    sub ? h('p', { class: 'lede' }, sub) : null);
}
