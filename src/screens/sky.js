// Big Sky: real-life flights. The islands teach the methods; this is where they get used.
// Altitude (the goal behind the goal), Depth (how the best do it), Range (assemble a crew),
// then small hops, an if-then plan, and an outside check.
import * as store from '../store.js';
import { go } from '../router.js';
import { SKY_IDEAS, CREW, STUMBLE_LESSONS } from '../content.js';
import { h, guessFlow, compareBars, chime, featherBurst, featherIcon, pct, screenHead, bubble } from '../ui.js';

function blankDraft() {
  return {
    summit: '', guess: null, beyond: '', higher: '', measure: '', by: '', judge: '',
    expert: '', expertMove: '', tenX: '', verb: '', crew: [], crewNotes: {},
    hops: ['', '', ''], obstacle: '', ifThen: '',
  };
}

export function renderSky() {
  const s = store.get();
  const root = h('section', { class: 'screen sky' });
  root.append(screenHead('Big Sky', 'The islands are practice. Big Sky is your real life. Plan a flight toward something you\'d love to do but aren\'t sure you can.'));

  const flying = s.plans.filter((p) => p.status === 'flying');
  const landed = s.plans.filter((p) => p.status !== 'flying');

  root.append(h('div', { class: 'row row-wrap' },
    h('button', { class: 'btn btn-primary', onclick: () => go('plan', { step: 0 }) }, s.skyDraft ? 'Keep planning my flight' : 'Plan a new flight'),
    s.skyDraft ? h('button', { class: 'btn btn-quiet', onclick: () => { store.update((st) => (st.skyDraft = null)); go('sky'); } }, 'Throw away the draft') : null));

  if (flying.length) {
    root.append(h('h2', { class: 'section-title' }, 'In the air'),
      h('div', { class: 'plans' }, ...flying.map(planCard)));
  }
  if (landed.length) {
    root.append(h('h2', { class: 'section-title' }, 'Landed'),
      h('div', { class: 'plans' }, ...landed.map(planCard)));
  }
  if (!s.plans.length) {
    root.append(h('div', { class: 'example' },
      h('p', { class: 'eyebrow' }, 'Example flight plan'),
      h('h3', null, 'Cook a whole dinner for my family'),
      h('ul', null,
        h('li', null, h('strong', null, 'Goal behind the goal: '), 'Show my family I can take care of them.'),
        h('li', null, h('strong', null, 'Done means: '), 'Everyone eats a meal I made, start to finish, by Sunday.'),
        h('li', null, h('strong', null, 'Like the best: '), 'A chef tastes everything and preps it all before cooking.'),
        h('li', null, h('strong', null, 'Crew: '), 'Chef, Scientist, Storyteller.'),
        h('li', null, h('strong', null, 'First hop: '), 'Pick a recipe with my dad tonight (10 minutes).'))));
  }
  return root;
}

function planCard(p) {
  const done = p.hops.filter((x) => x.status === 'done').length;
  return h('button', { class: `plan-card plan-${p.status}`, onclick: () => go('flight', { id: p.id }) },
    h('span', { class: 'eyebrow' }, p.status === 'flying' ? `${done}/${p.hops.length} hops` : p.outcome === 'yes' ? 'Summit reached' : p.outcome === 'partly' ? 'Partly there' : 'Learning flight'),
    h('span', { class: 'plan-title' }, p.summit),
    h('span', { class: 'plan-meta' }, `Guessed ${pct(p.guess)}${p.by ? ` · by ${niceDate(p.by)}` : ''}`));
}

// ---------- The planning wizard ----------

const STEPS = [
  { key: 'summit', title: 'Your summit', render: stepSummit },
  { key: 'guess', title: 'Your guess', render: stepGuess },
  { key: 'altitude', title: 'Altitude', render: stepAltitude },
  { key: 'specific', title: 'Make it specific', render: stepSpecific },
  { key: 'depth', title: 'Depth', render: stepDepth },
  { key: 'range', title: 'Range', render: stepRange },
  { key: 'hops', title: 'Hops', render: stepHops },
  { key: 'ready', title: 'Ready', render: stepReady },
];

export function renderPlan({ step = 0 }) {
  const s = store.get();
  if (!s.skyDraft) store.update((st) => (st.skyDraft = blankDraft()));
  const draft = store.get().skyDraft;
  const save = () => store.save();
  const def = STEPS[step];

  const root = h('section', { class: 'screen plan' });
  const progress = h('ol', { class: 'progress', 'aria-label': `Step ${step + 1} of ${STEPS.length}` },
    ...STEPS.map((st, i) => h('li', { class: i < step ? 'done' : i === step ? 'here' : '' }, h('span', null, st.title))));
  root.append(h('button', { class: 'btn btn-quiet back', onclick: () => go('sky') }, '← Big Sky'), progress);

  const body = h('div', { class: 'plan-body' });
  const nav = h('div', { class: 'row row-wrap row-end plan-nav' });
  root.append(body, nav);

  const ctl = {
    draft, save,
    next: () => go('plan', { step: step + 1 }),
    setCanNext(ok, reason = '') {
      nextBtn.disabled = !ok;
      why.textContent = ok ? '' : reason;
    },
  };
  const why = h('p', { class: 'hint' });
  const nextBtn = h('button', { class: 'btn btn-primary', onclick: () => ctl.next() }, step === STEPS.length - 2 ? 'Review my plan' : 'Next');
  if (step > 0 && step < STEPS.length - 1) nav.append(h('button', { class: 'btn', onclick: () => go('plan', { step: step - 1 }) }, 'Back'));
  if (step < STEPS.length - 1) nav.append(why, nextBtn);
  def.render(body, ctl);
  return root;
}

function field(id, label, value, onInput, { multiline = false, placeholder = '', type = 'text', help } = {}) {
  const input = multiline
    ? h('textarea', { id, rows: 2, placeholder })
    : h('input', { id, type, placeholder, autocomplete: 'off' });
  input.value = value || '';
  input.addEventListener('input', () => onInput(input.value));
  return h('div', { class: 'field' }, h('label', { for: id }, label), help ? h('p', { class: 'help' }, help) : null, input);
}

function stepSummit(body, ctl) {
  const d = ctl.draft;
  body.append(
    h('h1', { tabindex: '-1' }, 'What\'s your summit?'),
    h('p', { class: 'lede' }, 'Something you would really love to do, but you\'re not sure you can. Not too small! The islands showed you that your doubt guesses low.'));
  const f = field('summit', 'My summit', d.summit, (v) => { d.summit = v; ctl.save(); check(); }, { placeholder: 'e.g. Learn a song on the guitar' });
  const chips = h('div', { class: 'chips' }, ...SKY_IDEAS.map((idea) =>
    h('button', { class: 'chip', onclick: () => { d.summit = idea; f.querySelector('input').value = idea; ctl.save(); check(); } }, idea)));
  body.append(f, h('p', { class: 'help' }, 'Need an idea? Tap one, then make it yours.'), chips);
  const check = () => ctl.setCanNext(d.summit.trim().length > 2, 'Write your summit first.');
  check();
}

async function stepGuess(body, ctl) {
  const d = ctl.draft;
  body.append(h('h1', { tabindex: '-1' }, 'How sure are you?'), h('p', { class: 'lede' }, `"${d.summit}"`));
  ctl.setCanNext(d.guess != null, 'Lock in a guess first.');
  if (d.guess != null) {
    body.append(h('p', null, `You guessed ${pct(d.guess)}. We'll compare it with what really happens when you land.`),
      h('button', { class: 'btn btn-quiet', onclick: () => { d.guess = null; ctl.save(); go('plan', { step: 1 }); } }, 'Guess again'));
    return;
  }
  const area = h('div');
  body.append(area);
  d.guess = await guessFlow(area, { kind: 'confidence' }, 'Right now, how sure are you that you can reach this summit?');
  ctl.save();
  ctl.setCanNext(true);
}

function stepAltitude(body, ctl) {
  const d = ctl.draft;
  body.append(
    h('p', { class: 'eyebrow kind' }, 'Altitude · fly higher'),
    h('h1', { tabindex: '-1' }, 'What\'s the goal behind the goal?'),
    h('p', { class: 'lede' }, 'Zoom out. Why do you want this? What do you hope happens after?'),
    field('beyond', 'I want this because…', d.beyond, (v) => { d.beyond = v; ctl.save(); }, { multiline: true, placeholder: 'e.g. I want to play songs with my friends' }),
    field('higher', 'Now that you know why: could your summit be even bigger? (optional)', d.higher, (v) => { d.higher = v; ctl.save(); }, {
      placeholder: 'e.g. Play a song at the school concert',
      help: 'Flying higher is allowed. You can also keep your summit just as it is.',
    }));
  ctl.setCanNext(true);
}

function stepSpecific(body, ctl) {
  const d = ctl.draft;
  body.append(
    h('h1', { tabindex: '-1' }, 'Make it specific'),
    h('p', { class: 'lede' }, 'Scientists studied goal-setting for over 35 years. People with a specific, hard goal do better than people who just "try their best".'),
    field('measure', 'I\'ll know I did it when…', d.measure, (v) => { d.measure = v; ctl.save(); check(); }, { placeholder: 'e.g. I can play the whole song without stopping' }),
    field('by', 'By when?', d.by, (v) => { d.by = v; ctl.save(); }, { type: 'date' }),
    field('judge', 'Who or what will check it, besides you?', d.judge, (v) => { d.judge = v; ctl.save(); }, {
      placeholder: 'e.g. I\'ll play it for my grandma',
      help: 'Your own inner critic is a terrible judge. Find an outside check: a person, a recording, a timer, a test.',
    }));
  const check = () => ctl.setCanNext(d.measure.trim().length > 2, 'Say how you\'ll know you did it.');
  check();
}

function stepDepth(body, ctl) {
  const d = ctl.draft;
  body.append(
    h('p', { class: 'eyebrow kind' }, 'Depth · dive deeper'),
    h('h1', { tabindex: '-1' }, 'How would the very best do it?'),
    h('p', { class: 'lede' }, 'Clove\'s palace, Weft\'s shrinking, Zip\'s tricks: the best use special methods. What would the best in the world do here?'),
    field('expert', 'Who is the best at this kind of thing? (a job, a person, anyone)', d.expert, (v) => { d.expert = v; ctl.save(); }, { placeholder: 'e.g. a professional guitarist' }),
    field('expertMove', 'What would they do that you haven\'t thought of?', d.expertMove, (v) => { d.expertMove = v; ctl.save(); }, {
      multiline: true, placeholder: 'e.g. Practice the hardest part slowly first, then speed up',
      help: 'Not sure? Ask a grown-up, look it up, or watch how a pro does it.',
    }),
    field('tenX', 'Unreasonable mode: what if your goal were 10 times bigger? What would you have to do differently? (optional)', d.tenX, (v) => { d.tenX = v; ctl.save(); }, {
      multiline: true, placeholder: 'e.g. Learn 10 songs: I\'d need a practice routine every single day',
    }));
  ctl.setCanNext(true);
}

function stepRange(body, ctl) {
  const d = ctl.draft;
  body.append(
    h('p', { class: 'eyebrow kind' }, 'Range · fly farther'),
    h('h1', { tabindex: '-1' }, 'Assemble your crew'),
    h('p', { class: 'lede' }, 'Every heist movie starts by putting together a crew with different skills. Borrow tricks from other fields.'),
    field('verb', 'First, say what you\'re really doing, as a doing word', d.verb, (v) => { d.verb = v; ctl.save(); }, {
      placeholder: 'e.g. making people smile with music',
      help: 'It\'s not "a guitar song". It\'s "making people smile with music". Doing words help you spot which crew could help.',
    }));
  const notes = h('div', { class: 'crew-notes' });
  const grid = h('div', { class: 'crew' });
  const paint = () => {
    grid.replaceChildren(...CREW.map((c) => {
      const on = d.crew.includes(c.id);
      return h('button', {
        class: `crew-card ${on ? 'on' : ''}`,
        'aria-pressed': on ? 'true' : 'false',
        onclick: () => {
          if (on) d.crew = d.crew.filter((x) => x !== c.id);
          else if (d.crew.length < 3) d.crew = [...d.crew, c.id];
          ctl.save();
          paint();
        },
      }, h('strong', null, c.name), h('span', null, c.q));
    }));
    notes.replaceChildren(...d.crew.map((id) => {
      const c = CREW.find((x) => x.id === id);
      return field(`crew-${id}`, `${c.name}: ${c.q}`, d.crewNotes[id], (v) => { d.crewNotes[id] = v; ctl.save(); }, { multiline: true });
    }));
    ctl.setCanNext(d.crew.length > 0, 'Pick at least one crew member.');
  };
  body.append(h('p', { class: 'help' }, 'Pick up to 3.'), grid, notes);
  paint();
}

function stepHops(body, ctl) {
  const d = ctl.draft;
  body.append(
    h('h1', { tabindex: '-1' }, 'Hops before flying'),
    h('p', { class: 'lede' }, 'Fledglings hop before they fly. Break your summit into small hops. Make the first one so small you could do it today in 10 minutes.'));
  const list = h('div', { class: 'hops-edit' });
  const paint = () => {
    list.replaceChildren(...d.hops.map((hop, i) => field(`hop-${i}`, i === 0 ? 'Hop 1 (today, 10 minutes)' : `Hop ${i + 1}`, hop, (v) => { d.hops[i] = v; ctl.save(); check(); }, {
      placeholder: ['e.g. Watch one video on how to hold a guitar', 'e.g. Learn the first 3 chords', 'e.g. Play the chorus slowly'][i] || '',
    })));
  };
  const more = h('button', { class: 'btn btn-quiet', onclick: () => { if (d.hops.length < 8) { d.hops.push(''); ctl.save(); paint(); } } }, '+ Add a hop');
  body.append(list, more,
    h('h2', { class: 'section-title' }, 'If–then plan'),
    h('p', { class: 'help' }, 'Plans with an "if this happens, then I will…" part are much more likely to work. Get ready for the bump before it happens.'),
    field('obstacle', 'What might get in the way?', d.obstacle, (v) => { d.obstacle = v; ctl.save(); }, { placeholder: 'e.g. My fingers hurt and I want to quit' }),
    field('ifThen', 'If that happens, then I will…', d.ifThen, (v) => { d.ifThen = v; ctl.save(); }, { placeholder: 'e.g. take a 5-minute break, then play one more time' }));
  const check = () => ctl.setCanNext(d.hops.some((x) => x.trim()), 'Write at least your first hop.');
  paint();
  check();
}

export function askPrompt(d) {
  const crew = d.crew.map((id) => CREW.find((c) => c.id === id)?.name.toLowerCase()).filter(Boolean);
  const summit = (d.higher || d.summit).trim();
  const lines = [
    `I'm a kid and I want to: ${summit}.`,
    d.beyond.trim() ? `The goal behind the goal: ${d.beyond.trim()}.` : null,
    d.measure.trim() ? `I'll know I did it when ${d.measure.trim()}${d.by ? `, by ${niceDate(d.by)}` : ''}.` : null,
    '',
    'Please be my coach, not my ghost-writer. Help me do it myself:',
    `1. Tell me what ${d.expert ? `the best ${d.expert.trim()}` : 'the best people at this'} would do that I haven't thought of.`,
    crew.length ? `2. Give me one idea each from a ${crew.join(', a ')}.` : '2. Give me ideas from other fields that could help.',
    '3. Check my first hops and help me make them small enough to start today.',
    '4. Tell me how I can check it worked, without just asking you.',
    d.hops.filter((x) => x.trim()).length ? `\nMy hops so far: ${d.hops.filter((x) => x.trim()).join('; ')}.` : null,
  ];
  return lines.filter((l) => l != null).join('\n').trim();
}

function stepReady(body) {
  const d = store.get().skyDraft;
  const crew = d.crew.map((id) => CREW.find((c) => c.id === id)?.name).filter(Boolean);
  body.append(
    h('h1', { tabindex: '-1' }, 'Your flight plan'),
    h('div', { class: 'flightplan' },
      h('p', { class: 'eyebrow' }, 'Summit'),
      h('h2', null, d.higher || d.summit),
      d.higher ? h('p', { class: 'help' }, `(Started as: ${d.summit})`) : null,
      h('dl', null,
        dl('Your guess', d.guess != null ? pct(d.guess) : '—'),
        d.beyond && dl('Goal behind the goal', d.beyond),
        dl('Done means', d.measure + (d.by ? ` · by ${niceDate(d.by)}` : '')),
        d.judge && dl('Outside check', d.judge),
        d.expertMove && dl('How the best do it', d.expert ? `${d.expertMove} (like a ${d.expert})` : d.expertMove),
        crew.length && dl('Crew', crew.join(', ')),
        d.obstacle && dl('If–then', `If ${d.obstacle}, then ${d.ifThen || '…'}`)),
      h('p', { class: 'eyebrow' }, 'Hops'),
      h('ol', null, ...d.hops.filter((x) => x.trim()).map((x) => h('li', null, x)))));

  const prompt = askPrompt(d);
  const pre = h('pre', { class: 'prompt', tabindex: '0' }, prompt);
  const copy = h('button', { class: 'btn' }, 'Copy');
  copy.addEventListener('click', () => {
    navigator.clipboard?.writeText(prompt).then(() => (copy.textContent = 'Copied'), () => selectText(pre));
    if (!navigator.clipboard) selectText(pre);
  });
  body.append(h('details', { class: 'ask' },
    h('summary', null, 'Ask an AI helper, ambitiously (with a grown-up)'),
    h('p', null, 'AI helpers can do a lot more than answer quiz questions. Ask it to coach you, not to do it for you. Doing it yourself is what grows your wings.'),
    pre, h('div', { class: 'row row-end' }, copy)));

  body.append(h('div', { class: 'row row-wrap row-end' },
    h('button', { class: 'btn', onclick: () => go('plan', { step: STEPS.length - 2 }) }, 'Back'),
    h('button', {
      class: 'btn btn-primary btn-big', onclick: () => {
        const plan = {
          id: store.uid(), created: Date.now(), status: 'flying',
          summit: (d.higher || d.summit).trim(), original: d.summit.trim(),
          guess: d.guess ?? 0.5, beyond: d.beyond, measure: d.measure, by: d.by, judge: d.judge,
          expert: d.expert, expertMove: d.expertMove, tenX: d.tenX, verb: d.verb,
          crew: d.crew, crewNotes: d.crewNotes,
          hops: d.hops.filter((x) => x.trim()).map((text) => ({ id: store.uid(), text: text.trim(), status: 'todo' })),
          obstacle: d.obstacle, ifThen: d.ifThen,
        };
        store.update((s) => { s.plans.unshift(plan); s.skyDraft = null; });
        chime('takeoff');
        go('flight', { id: plan.id, fresh: true });
      },
    }, 'Take off')));
}

export function niceDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' });
}

function dl(term, value) {
  return [h('dt', null, term), h('dd', null, value)];
}

function selectText(el) {
  const r = document.createRange();
  r.selectNodeContents(el);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(r);
}

// ---------- A flight in progress ----------

export function renderFlight({ id, fresh }) {
  const plan = store.get().plans.find((p) => p.id === id);
  if (!plan) return renderSky();
  const root = h('section', { class: 'screen flight' });
  root.append(h('button', { class: 'btn btn-quiet back', onclick: () => go('sky') }, '← Big Sky'));
  root.append(screenHead(plan.summit, plan.status === 'flying'
    ? `In the air. You guessed ${pct(plan.guess)} when you took off.`
    : `Landed. You guessed ${pct(plan.guess)} when you took off.`));

  if (fresh) {
    root.append(h('div', { class: 'dialogue' },
      bubble('pip', 'You took off! Now do Hop 1. Tiny hops count. Come back here and tick each one off.')));
  }

  const crew = plan.crew.map((cid) => CREW.find((c) => c.id === cid)?.name).filter(Boolean);
  root.append(h('div', { class: 'flight-facts' },
    h('p', null, h('strong', null, 'Done means: '), plan.measure + (plan.by ? ` · by ${niceDate(plan.by)}` : '')),
    plan.judge ? h('p', null, h('strong', null, 'Outside check: '), plan.judge) : null,
    crew.length ? h('p', null, h('strong', null, 'Crew: '), crew.join(', ')) : null,
    plan.obstacle ? h('p', null, h('strong', null, 'If–then: '), `If ${plan.obstacle}, then ${plan.ifThen || '…'}`) : null));

  const hopsBox = h('ol', { class: 'hops' });
  const paintHops = () => {
    hopsBox.replaceChildren(...plan.hops.map((hop) => {
      const li = h('li', { class: `hop hop-${hop.status}` },
        h('span', { class: 'hop-mark', html: hop.status === 'done' ? featherIcon('hop', 26) : hop.status === 'stumble' ? featherIcon('stumble', 26) : '' }),
        h('div', { class: 'hop-text' }, h('p', null, hop.text), hop.note ? h('p', { class: 'help' }, `Next time: ${hop.note}`) : null));
      if (plan.status === 'flying' && hop.status !== 'done') {
        li.append(h('div', { class: 'hop-actions' },
          h('button', { class: 'btn btn-primary', onclick: (e) => hopDone(hop, e.currentTarget) }, 'Did it'),
          hop.status !== 'stumble' ? h('button', { class: 'btn btn-quiet', onclick: () => hopStumble(hop, li) }, 'Stumbled') : null));
      }
      return li;
    }));
  };
  function hopDone(hop, btn) {
    store.update(() => (hop.status = 'done'));
    store.addFeather({ kind: 'hop', title: `${hop.text} (${plan.summit})`, plan: plan.id });
    chime('feather');
    featherBurst(btn, 'hop');
    paintHops();
  }
  function hopStumble(hop, li) {
    if (li.querySelector('.reflect')) return;
    const chips = h('div', { class: 'chips' }, ...STUMBLE_LESSONS.map((t) => h('button', {
      class: 'chip', onclick: () => {
        store.update(() => { hop.status = 'stumble'; hop.note = t; });
        paintHops();
      },
    }, t)));
    li.append(h('div', { class: 'reflect' }, h('p', null, 'Stumbles are part of flying. What will you try next time?'), chips));
  }
  paintHops();

  const addId = 'new-hop';
  const addInput = h('input', { id: addId, placeholder: 'Another small hop', autocomplete: 'off' });
  const addForm = h('form', { class: 'add-hop' },
    h('label', { for: addId, class: 'visually-hidden' }, 'Add a hop'), addInput,
    h('button', { class: 'btn', type: 'submit' }, 'Add hop'));
  addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const t = addInput.value.trim();
    if (!t) return;
    store.update(() => plan.hops.push({ id: store.uid(), text: t, status: 'todo' }));
    addInput.value = '';
    paintHops();
  });

  root.append(h('h2', { class: 'section-title' }, 'Hops'), hopsBox);
  if (plan.status === 'flying') {
    root.append(addForm, h('h2', { class: 'section-title' }, 'Landing'), landing(plan, root));
  } else {
    root.append(h('h2', { class: 'section-title' }, 'How it landed'),
      compareBars(plan.guess, plan.result ?? 0, { resultLabel: { yes: 'Did it!', partly: 'Partly', not: 'Not yet' }[plan.outcome] }),
      plan.reflection ? h('p', null, h('strong', null, 'What helped: '), plan.reflection) : null);
  }
  return root;
}

function landing(plan) {
  const box = h('div', { class: 'landing' });
  box.append(h('p', null, 'When it\'s time, land your flight. Did you reach your summit? Be honest. Every answer earns a feather.'));
  const choose = (outcome) => {
    const result = { yes: 1, partly: 0.5, not: 0 }[outcome];
    box.replaceChildren(
      compareBars(plan.guess, result, { resultLabel: { yes: 'Did it!', partly: 'Partly', not: 'Not yet' }[outcome] }),
      h('p', null, outcome === 'yes'
        ? `When you took off, you guessed ${pct(plan.guess)}. Look what happened.`
        : outcome === 'partly'
          ? 'Partly there is still higher than not starting. What helped?'
          : 'Not yet. Some flights are learning flights. What did you learn?'));
    const id = 'reflection';
    const ta = h('textarea', { id, rows: 2, placeholder: outcome === 'not' ? 'e.g. I needed smaller hops' : 'e.g. Practicing the hard part slowly' });
    const done = h('button', { class: 'btn btn-primary' }, 'Land it');
    box.append(h('div', { class: 'field' }, h('label', { for: id }, outcome === 'not' ? 'What did you learn? What will you try next?' : 'What helped most?'), ta),
      h('div', { class: 'row row-end' }, done));
    done.addEventListener('click', () => {
      store.update(() => {
        plan.status = 'landed';
        plan.outcome = outcome;
        plan.result = result;
        plan.reflection = ta.value.trim();
        plan.landedAt = Date.now();
      });
      store.addFeather({
        kind: outcome === 'not' ? 'stumble' : 'sky', title: plan.summit, guess: plan.guess, result,
        success: outcome !== 'not', note: ta.value.trim(), plan: plan.id,
      });
      chime(outcome === 'not' ? 'soft' : 'feather');
      featherBurst(done, outcome === 'not' ? 'stumble' : 'sky');
      go('flight', { id: plan.id });
    });
  };
  box.append(h('div', { class: 'row row-wrap' },
    h('button', { class: 'btn btn-primary', onclick: () => choose('yes') }, 'I did it!'),
    h('button', { class: 'btn', onclick: () => choose('partly') }, 'Partly'),
    h('button', { class: 'btn', onclick: () => choose('not') }, 'Not this time')));
  return box;
}
