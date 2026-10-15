// Rookery Rocks: crack a substitution cipher with the clues detectives and linguists use.
import { h } from '../ui.js';
import { play } from '../sfx.js';
import { ALPHABET, makeKey, encode, invert, frequencies, assign, wrongGuesses, isSolved, nextHint, lettersIn } from '../logic/cipher.js';

function playCipher(message, { give = [] } = {}) {
  return (area, finish) => {
    const key = makeKey();
    const inv = invert(key);
    const cipher = encode(message, key);
    let guesses = {};
    give.forEach((p) => (guesses[key[p]] = p));
    const locked = new Set(give.map((p) => key[p]));
    let selected = null;
    let hints = 0;
    let checks = 0;
    let wrongShown = new Set();
    let over = false;

    const text = h('div', { class: 'cipher-text', 'aria-label': 'Coded message' });
    const status = h('p', { class: 'cipher-status', 'aria-live': 'polite' });
    const keys = h('div', { class: 'keys', role: 'group', 'aria-label': 'Pick a real letter' });
    const freq = h('div', { class: 'freq', 'aria-label': 'How often each code letter appears' });

    function cell(c) {
      if (!/[A-Z]/.test(c)) return h('span', { class: 'punct' }, c);
      const g = guesses[c];
      const cls = ['cell', selected === c && 'sel', locked.has(c) && 'given', wrongShown.has(c) && 'wrong', g && 'has'].filter(Boolean).join(' ');
      return h('button', {
        class: cls,
        'data-sfx': 'off',
        'aria-label': `Code letter ${c}${g ? ', you think it is ' + g : ''}`,
        onclick: () => select(c),
      }, h('span', { class: 'cell-guess' }, g || '·'), h('span', { class: 'cell-code' }, c));
    }

    function paint() {
      text.replaceChildren(...cipher.split(' ').map((word) => h('span', { class: 'word' }, ...word.split('').map(cell))));
      const used = new Set(Object.values(guesses));
      keys.replaceChildren(
        ...ALPHABET.split('').map((L) => h('button', {
          class: `key${used.has(L) ? ' used' : ''}`,
          'data-sfx': 'off',
          disabled: !selected || locked.has(selected),
          onclick: () => put(L),
        }, L)),
        h('button', { class: 'key key-wide', disabled: !selected || locked.has(selected) || !guesses[selected], onclick: () => put(null) }, 'Clear'));
      const fr = frequencies(cipher);
      const top = fr[0].count;
      freq.replaceChildren(...fr.map(({ letter, count }) =>
        h('button', { class: `freq-bar${selected === letter ? ' sel' : ''}`, onclick: () => select(letter), 'aria-label': `${letter} appears ${count} times` },
          h('span', { class: 'freq-fill', style: `--h:${(count / top) * 100}%` }),
          h('span', { class: 'freq-letter' }, letter),
          h('span', { class: 'freq-n' }, count))));
      const solvedCount = lettersIn(cipher).filter((c) => guesses[c]).length;
      status.textContent = selected
        ? locked.has(selected) ? `${selected} is a free letter: it's ${guesses[selected]}.` : `Code letter ${selected} is selected. What real letter is it? (You can type it.)`
        : `${solvedCount} of ${lettersIn(cipher).length} code letters guessed. Tap a code letter to start.`;
    }

    function select(c) {
      play('pick');
      selected = c;
      paint();
    }

    function put(L) {
      if (over || !selected || locked.has(selected)) return;
      guesses = assign(guesses, selected, L);
      play('type');
      wrongShown.delete(selected);
      if (isSolved(cipher, guesses, key)) {
        over = true;
        paint();
        area.classList.add('finished');
        return finish({
          success: true, score: 1, max: 1,
          detail: `Cracked it, with ${hints} clue${hints === 1 ? '' : 's'} and ${checks} check${checks === 1 ? '' : 's'}. The message: "${message}"`,
        });
      }
      // Hop to the next unguessed letter to keep momentum.
      const nextOpen = frequencies(cipher).find(({ letter }) => !guesses[letter]);
      if (L && nextOpen) selected = nextOpen.letter;
      paint();
    }

    const onKey = (e) => {
      if (over || !area.isConnected) return document.removeEventListener('keydown', onKey);
      if (e.target.matches('input, textarea')) return;
      const L = e.key.toUpperCase();
      if (/^[A-Z]$/.test(L) && selected) put(L);
      if ((e.key === 'Backspace' || e.key === 'Delete') && selected) put(null);
    };
    document.addEventListener('keydown', onKey);

    const check = h('button', { class: 'btn', 'data-sfx': 'off' }, 'Check my work');
    check.addEventListener('click', () => {
      checks++;
      const wrong = wrongGuesses(guesses, key);
      wrongShown = new Set(wrong);
      play(wrong.length ? 'nope' : 'correct');
      paint();
      status.textContent = wrong.length
        ? `${wrong.length} guess${wrong.length > 1 ? 'es are' : ' is'} off (marked in red). Everything else is right!`
        : 'Everything you\'ve guessed so far is right. Keep going!';
    });
    const clue = h('button', { class: 'btn', 'data-sfx': 'off' }, 'Give me a clue');
    clue.addEventListener('click', () => {
      const hnt = nextHint(cipher, guesses, key);
      if (!hnt) return;
      hints++;
      play('sparkle');
      selected = hnt.cipher;
      put(hnt.plain);
      if (area.isConnected && !isSolved(cipher, guesses, key)) status.textContent = `Clue: code letter ${hnt.cipher} is really ${hnt.plain}. Clues are tools. Detectives use them too.`;
    });
    const stop = h('button', { class: 'btn btn-quiet' }, 'Stop for now');
    stop.addEventListener('click', () => {
      if (over) return;
      over = true;
      area.classList.add('finished');
      const right = lettersIn(cipher).filter((c) => guesses[c] === inv[c]).length;
      finish({ success: false, score: 0, max: 1, detail: `You had ${right} of ${lettersIn(cipher).length} letters right. The message was: "${message}"` });
    });

    area.replaceChildren(
      h('p', { class: 'play-q' }, 'Tap a code letter, then pick the real letter you think it stands for. Change your mind any time.'),
      text, status, keys,
      h('details', { class: 'freq-wrap' }, h('summary', null, 'Letter counter (the detective\'s tool)'), freq),
      h('div', { class: 'row row-wrap row-end' }, stop, clue, check));
    paint();
  };
}

export const intro = [
  ['corvina', "Caw. I'm Corvina. Crows remember faces for years. I also remember patterns."],
  ['corvina', 'Every secret code leaves clues behind. Detectives and language experts use the same clues. Today you borrow their tricks.'],
  ['pip', 'The first code I saw looked like total nonsense. I almost gave up on the first word.'],
  ['pip', 'Then I found the word THE. And then I couldn\'t stop.'],
];

const M1 = 'THE FOG IS NOT A WALL. FLY IN AND SEE WHAT IS REALLY THERE.';
const M2 = 'A STUDENT ONCE SOLVED TWO FAMOUS PUZZLES THAT NOBODY COULD SOLVE. HE THOUGHT THE PUZZLES WERE JUST HOMEWORK.';

export const levels = [
  {
    id: 'code1', title: 'The first code', short: 'A secret message, no key. One free letter.',
    predict: { kind: 'confidence' },
    question: 'Here is a message in secret code. Nobody gives you the key. Can you crack the whole thing?',
    method: [
      ['corvina', 'Clue 1: a word with just one letter is almost always A or I.'],
      ['corvina', 'Clue 2: the most common letter in English is E. Open the letter counter and look for the tallest bar.'],
      ['corvina', 'Clue 3: the most common three-letter word is THE. Find a three-letter word that shows up more than once.'],
      ['corvina', "I'll give you E for free. Use the clues to find the rest. Wrong guesses are fine. Just change them."],
    ],
    play: playCipher(M1, { give: ['E'] }),
    judge: () => 'The game only counts it as cracked when every single letter matches the real message.',
  },
  {
    id: 'code2', title: 'The famous code', short: 'Longer, no free letters. A true story is hidden inside.',
    predict: { kind: 'confidence' },
    question: 'No free letters this time, and it is twice as long. How sure are you that you can crack it?',
    method: [
      ['corvina', 'Same clues as before. And one more: double letters are often LL, EE, SS, OO or ZZ.'],
      ['corvina', 'This message tells a true story. Ask about it at the campfire when you are done.'],
    ],
    play: playCipher(M2),
    judge: () => 'The game only counts it as cracked when every letter matches the real message.',
  },
];
