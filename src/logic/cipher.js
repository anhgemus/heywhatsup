// Substitution ciphers, the kind detectives and code-breakers crack with letter clues.

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function shuffle(list, rand = Math.random) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// A key maps each plain letter to a cipher letter. No letter maps to itself.
export function makeKey(rand = Math.random) {
  const letters = ALPHABET.split('');
  let perm;
  do {
    perm = shuffle(letters, rand);
  } while (perm.some((c, i) => c === letters[i]));
  const key = {};
  letters.forEach((p, i) => (key[p] = perm[i]));
  return key;
}

export function invert(key) {
  const inv = {};
  for (const [p, c] of Object.entries(key)) inv[c] = p;
  return inv;
}

export function encode(text, key) {
  return text.toUpperCase().replace(/[A-Z]/g, (c) => key[c]);
}

export function lettersIn(text) {
  return [...new Set(text.toUpperCase().replace(/[^A-Z]/g, '').split(''))];
}

// Cipher letters in the message, most frequent first.
export function frequencies(cipherText) {
  const counts = {};
  for (const c of cipherText.replace(/[^A-Z]/g, '')) counts[c] = (counts[c] || 0) + 1;
  return Object.entries(counts)
    .map(([letter, count]) => ({ letter, count }))
    .sort((a, b) => b.count - a.count || a.letter.localeCompare(b.letter));
}

// guesses: cipher letter -> plain letter the player thinks it is.
// Assigning a plain letter that is already used elsewhere moves it here.
export function assign(guesses, cipherLetter, plainLetter) {
  const next = { ...guesses };
  if (!plainLetter) {
    delete next[cipherLetter];
    return next;
  }
  for (const [c, p] of Object.entries(next)) if (p === plainLetter) delete next[c];
  next[cipherLetter] = plainLetter;
  return next;
}

export function wrongGuesses(guesses, key) {
  const inv = invert(key);
  return Object.entries(guesses)
    .filter(([c, p]) => inv[c] !== p)
    .map(([c]) => c);
}

export function isSolved(cipherText, guesses, key) {
  const inv = invert(key);
  return lettersIn(cipherText).every((c) => guesses[c] === inv[c]);
}

// The best clue to give next: the most frequent cipher letter the player hasn't got right yet.
export function nextHint(cipherText, guesses, key) {
  const inv = invert(key);
  const open = frequencies(cipherText).find(({ letter }) => guesses[letter] !== inv[letter]);
  return open ? { cipher: open.letter, plain: inv[open.letter] } : null;
}
