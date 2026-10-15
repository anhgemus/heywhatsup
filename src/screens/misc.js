// Title screen, campfire stories, the grown-ups guide, and settings.
import * as store from '../store.js';
import { go } from '../router.js';
import { COLORS, STORIES } from '../content.js';
import { h, birdMarkup, birdFor, screenHead, toast } from '../ui.js';

// ---------- Title / onboarding ----------

export function renderStart() {
  const s = store.get();
  const root = h('section', { class: 'screen start' });
  let color = s.color || 'sky';
  const portrait = h('div', { class: 'start-bird' });
  const paintBird = () => (portrait.innerHTML = birdMarkup({ ...COLORS[color], fluffy: true }, { size: 168, label: 'Your fledgling' }));
  paintBird();

  const nameInput = h('input', { id: 'name', maxlength: 24, autocomplete: 'off', placeholder: 'e.g. Robin', value: s.name });
  const swatches = h('div', { class: 'swatches', role: 'radiogroup', 'aria-label': 'Feather colour' },
    ...Object.entries(COLORS).map(([key, c]) => h('button', {
      type: 'button',
      class: `swatch ${key === color ? 'on' : ''}`,
      role: 'radio',
      'aria-checked': key === color ? 'true' : 'false',
      'aria-label': c.label,
      style: `--c:${c.body}`,
      onclick: (e) => {
        color = key;
        swatches.querySelectorAll('.swatch').forEach((b) => { b.classList.remove('on'); b.setAttribute('aria-checked', 'false'); });
        e.currentTarget.classList.add('on');
        e.currentTarget.setAttribute('aria-checked', 'true');
        paintBird();
      },
    })));

  const form = h('form', { class: 'start-form' },
    h('div', { class: 'field' }, h('label', { for: 'name' }, 'What should we call your fledgling?'), nameInput),
    h('div', { class: 'field' }, h('span', { class: 'label' }, 'Pick a feather colour'), swatches),
    h('button', { class: 'btn btn-primary btn-big', type: 'submit' }, 'Leave the nest'));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    store.update((st) => {
      st.name = nameInput.value.trim() || 'Fledgling';
      st.color = color;
    });
    go('map');
  });

  root.append(
    h('div', { class: 'start-hero' },
      portrait,
      h('div', { class: 'start-copy' },
        h('h1', { class: 'wordmark', tabindex: '-1' }, 'Fledge'),
        h('p', { class: 'start-tag' }, 'A game about finding out you can.'),
        h('p', null, 'Young birds leave the nest before they can really fly. They hop, flap and tumble, and that\'s how flying gets learned.'),
        h('p', null, 'Here, every time you do something you thought you couldn\'t, you earn a feather. Feathers make wings.'))),
    form,
    h('p', { class: 'start-foot' }, 'For explorers about 8 to 13. Grown-ups: ', h('button', { class: 'linklike', onclick: () => go('grownups') }, 'read how it works'), '.'));
  return root;
}

// ---------- Campfire ----------

export function renderCampfire({ id } = {}) {
  const n = store.featherCount();
  if (id) {
    const story = STORIES.find((x) => x.id === id);
    store.update((s) => !s.storiesRead.includes(id) && s.storiesRead.push(id));
    const i = STORIES.indexOf(story);
    const next = STORIES[i + 1];
    return h('section', { class: 'screen story' },
      h('button', { class: 'btn btn-quiet back', onclick: () => go('campfire') }, '← Campfire'),
      h('p', { class: 'eyebrow' }, story.tag),
      h('h1', { tabindex: '-1' }, story.title),
      h('div', { class: 'story-body' }, ...story.body.map((p) => h('p', null, p))),
      h('div', { class: 'row row-end' },
        next && n >= next.unlock
          ? h('button', { class: 'btn btn-primary', onclick: () => go('campfire', { id: next.id }) }, `Next: ${next.title}`)
          : h('button', { class: 'btn', onclick: () => go('campfire') }, 'Back to the fire')));
  }
  const read = store.get().storiesRead;
  const root = h('section', { class: 'screen campfire' });
  root.append(screenHead('The campfire', 'True stories about people (and birds) who did things that looked impossible. A new story unlocks as your wings grow.'));
  root.append(h('div', { class: 'fire', 'aria-hidden': 'true' },
    h('span', { class: 'flame f1' }), h('span', { class: 'flame f2' }), h('span', { class: 'flame f3' }),
    h('span', { class: 'fire-birds', html: birdFor('pip', { size: 64 }) + birdFor('gale', { size: 64, flip: true }) })));
  root.append(h('ol', { class: 'stories' }, ...STORIES.map((st) => {
    const open = n >= st.unlock;
    return h('li', null, h('button', {
      class: `story-card ${open ? '' : 'locked'} ${read.includes(st.id) ? 'read' : ''}`,
      disabled: !open,
      onclick: () => go('campfire', { id: st.id }),
    },
      h('span', { class: 'story-title' }, open ? st.title : 'A story still in the fog'),
      h('span', { class: 'story-tag' }, open ? st.tag : `Unlocks at ${st.unlock} feather${st.unlock === 1 ? '' : 's'}`),
      open && !read.includes(st.id) ? h('span', { class: 'new' }, 'New') : null));
  })));
  return root;
}

// ---------- Grown-ups ----------

export function renderGrownups() {
  const root = h('section', { class: 'screen grownups' });
  const back = store.get().name ? null : h('button', { class: 'btn btn-quiet back', onclick: () => go('start') }, '← Back');
  root.append(screenHead('For grown-ups', 'What Fledge is trying to grow, and how you can help it along.', back));
  const sec = (title, ...kids) => h('section', { class: 'guide-sec' }, h('h2', null, title), ...kids);
  root.append(
    sec('The idea',
      h('p', null, 'Psychologists call it self-efficacy: your belief that you can do a specific hard thing. People with more of it try harder things, stick with them longer, and recover faster from setbacks. Albert Bandura, who named it, found it is built from four sources. Fledge is built around all four.'),
      h('p', null, 'The game also borrows a frame from Felix Rieseberg\'s essay "How to be more ambitious": ambition comes in kinds. Altitude (aim at the goal behind the goal), Depth (do it the way the best do it), Range (borrow from other fields), and Speed. Children who grow up with AI helpers will be able to attempt far more than we could. The limit will often be what they believe is possible.')),
    sec('How the game builds it',
      h('dl', { class: 'guide-dl' },
        h('dt', null, 'Mastery experiences (the strongest source)'),
        h('dd', null, 'Each island is a challenge that looks impossible to most children (20 items in order, a 63-move puzzle, a code with no key) but is reliably doable once you learn an expert\'s method. The child experiences "I couldn\'t, and then I could" in about ten minutes. Levels are small proximal goals, which research shows build efficacy faster than one distant goal.'),
        h('dt', null, 'Watching someone like you'),
        h('dd', null, 'Pip, a fellow fledgling, is a "coping model": Pip openly struggles, nearly quits, then succeeds. Studies with children have found that coping models can raise efficacy more than flawless experts do. The campfire stories (the four-minute mile, the sub-two-hour marathon) add the "once someone did it" effect.'),
        h('dt', null, 'Persuasion, from the most credible source: their own data'),
        h('dd', null, 'Before every challenge the child guesses how they will do. Afterwards the game shows the guess next to the result. Over time, the Wings page shows how often their doubt guessed low. When they doubt themselves again, the game shows them a specific past moment where they doubted and did it anyway.'),
        h('dt', null, 'Feelings, reinterpreted'),
        h('dd', null, 'The doubting voice is personified as the Fog, and children practise answering it ("Not yet", "Let\'s find out"). Racing hearts before timed rounds are reframed as excitement. Stumbles earn "learning feathers", but only together with a plan for next time. Failing is information, not a verdict.'))),
    sec('Big Sky: real life',
      h('p', null, 'Game confidence doesn\'t automatically transfer. Big Sky is where the child plans a real-life goal, using techniques with good evidence: specific, hard goals (Locke & Latham\'s 35 years of research), an outside check rather than self-judgment, small first steps, and if–then plans for obstacles (implementation intentions). Real "hops" earn feathers too, so the wings start filling with real-life evidence.'),
      h('p', null, 'The optional "Ask an AI helper" card builds an ambitious prompt that asks the AI to coach rather than do the work. Doing it yourself is what builds efficacy. We recommend using it together.')),
    sec('How you can help',
      h('ul', { class: 'guide-list' },
        h('li', null, h('strong', null, 'Praise the method, not the talent. '), '"You shrank the problem!" beats "You\'re so smart." Talent praise teaches children to avoid things that might show they lack it.'),
        h('li', null, h('strong', null, 'Ask for their guess. '), 'Before they try something real, ask "How sure are you?" Afterwards, compare. Let the evidence do the persuading.'),
        h('li', null, h('strong', null, 'Tell your own coping stories. '), 'Children rarely see adults struggle. Tell them about something you thought you couldn\'t do, and how you figured it out.'),
        h('li', null, h('strong', null, 'Don\'t rescue too early. '), 'Wait a little longer than feels comfortable. Offer a hint about method ("What would Weft do?"), not the answer.'),
        h('li', null, h('strong', null, 'Be the outside check. '), 'For Big Sky flights, be the person who watches the song, eats the dinner, or reads the comic.'),
        h('li', null, h('strong', null, 'Look at the wings together. '), 'Ask about a feather. "What did you guess? What happened?"'))),
    sec('Privacy',
      h('p', null, 'Fledge has no accounts, no ads, and sends nothing anywhere. Progress is saved only in this browser. You can make a backup code in Settings.')),
  );
  root.append(h('p', { class: 'source' }, 'Inspired by ', h('a', { href: 'https://felixrieseberg.com/how-to-be-more-ambitious-a-tutorial-for-humans-with-models/', target: '_blank', rel: 'noopener' }, 'How to be more ambitious: A tutorial for humans with models'), '.'));
  return root;
}

// ---------- Settings ----------

export function renderSettings() {
  const s = store.get();
  const root = h('section', { class: 'screen settings' });
  root.append(screenHead('Settings'));

  const sound = h('input', { id: 'sound', type: 'checkbox' });
  sound.checked = s.settings.sound;
  sound.addEventListener('change', () => store.update((st) => (st.settings.sound = sound.checked)));

  const name = h('input', { id: 'set-name', maxlength: 24, value: s.name, autocomplete: 'off' });
  name.addEventListener('change', () => store.update((st) => (st.name = name.value.trim() || st.name)));

  const code = h('textarea', { id: 'backup', rows: 3, readonly: true });
  const makeCode = h('button', { class: 'btn' }, 'Make a backup code');
  makeCode.addEventListener('click', () => {
    code.value = store.exportCode();
    code.select();
    navigator.clipboard?.writeText(code.value).then(() => toast('Backup code copied'), () => {});
  });

  const restore = h('textarea', { id: 'restore', rows: 3, placeholder: 'Paste a backup code here' });
  const restoreBtn = h('button', { class: 'btn' }, 'Restore');
  const restoreMsg = h('p', { class: 'hint', role: 'status' });
  restoreBtn.addEventListener('click', () => {
    try {
      store.importCode(restore.value);
      toast('Progress restored');
      go('map');
    } catch {
      restoreMsg.textContent = "That code didn't work. Check that you pasted the whole thing.";
    }
  });

  const resetBtn = h('button', { class: 'btn btn-danger' }, 'Start over');
  const resetBox = h('div', { class: 'row row-wrap' }, resetBtn);
  resetBtn.addEventListener('click', () => {
    resetBox.replaceChildren(
      h('p', null, 'This removes every feather and flight plan in this browser. Sure?'),
      h('button', { class: 'btn', onclick: () => go('settings') }, 'Keep my wings'),
      h('button', { class: 'btn btn-danger', onclick: () => { store.reset(); go('start'); } }, 'Yes, start over'));
  });

  root.append(
    h('div', { class: 'field' }, h('label', { for: 'set-name' }, 'Fledgling name'), name),
    h('div', { class: 'field field-check' }, sound, h('label', { for: 'sound' }, 'Sounds')),
    h('h2', { class: 'section-title' }, 'Backup'),
    h('p', { class: 'help' }, 'Progress is saved in this browser only. A backup code lets you move it to another device.'),
    h('div', { class: 'field' }, h('label', { for: 'backup' }, 'Your backup code'), code), h('div', { class: 'row' }, makeCode),
    h('div', { class: 'field' }, h('label', { for: 'restore' }, 'Restore from a code'), restore), h('div', { class: 'row' }, restoreBtn), restoreMsg,
    h('h2', { class: 'section-title' }, 'Start over'), resetBox);
  return root;
}
