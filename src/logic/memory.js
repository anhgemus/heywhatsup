// The memory palace (method of loci): the trick memory champions use.
import { shuffle } from './cipher.js';

export const ITEMS = [
  { e: '🍌', n: 'banana' }, { e: '🐸', n: 'frog' }, { e: '🎈', n: 'balloon' }, { e: '🚲', n: 'bike' },
  { e: '🍩', n: 'donut' }, { e: '🦒', n: 'giraffe' }, { e: '🎸', n: 'guitar' }, { e: '🧀', n: 'cheese' },
  { e: '🚀', n: 'rocket' }, { e: '🐙', n: 'octopus' }, { e: '🌵', n: 'cactus' }, { e: '🎩', n: 'top hat' },
  { e: '🍕', n: 'pizza' }, { e: '🐧', n: 'penguin' }, { e: '🔑', n: 'key' }, { e: '🦖', n: 'dinosaur' },
  { e: '🍉', n: 'watermelon' }, { e: '⚽', n: 'football' }, { e: '🧲', n: 'magnet' }, { e: '🐝', n: 'bee' },
  { e: '🦆', n: 'duck' }, { e: '🍿', n: 'popcorn' }, { e: '🧸', n: 'teddy bear' }, { e: '🐌', n: 'snail' },
  { e: '🥨', n: 'pretzel' }, { e: '🎺', n: 'trumpet' }, { e: '🦔', n: 'hedgehog' }, { e: '🍄', n: 'mushroom' },
  { e: '⏰', n: 'alarm clock' }, { e: '🧦', n: 'sock' }, { e: '🐳', n: 'whale' }, { e: '🌈', n: 'rainbow' },
];

// A walk through a house. The order of the walk is the order of the list.
export const LOCI = [
  { e: '🚪', n: 'front door' }, { e: '🟫', n: 'doormat' }, { e: '🧥', n: 'coat hook' }, { e: '🪜', n: 'stairs' },
  { e: '🚰', n: 'kitchen sink' }, { e: '🧊', n: 'fridge' }, { e: '🔥', n: 'oven' }, { e: '🍽️', n: 'table' },
  { e: '🛋️', n: 'sofa' }, { e: '📺', n: 'TV' }, { e: '📚', n: 'bookshelf' }, { e: '🛁', n: 'bathtub' },
  { e: '🪥', n: 'toothbrush cup' }, { e: '🪞', n: 'mirror' }, { e: '🛏️', n: 'bed' }, { e: '💤', n: 'pillow' },
  { e: '👕', n: 'wardrobe' }, { e: '🪟', n: 'window' }, { e: '✏️', n: 'desk' }, { e: '💡', n: 'lamp' },
];

const ACTIONS = [
  'is dancing on', 'is stuck to', 'is taking a bath in', 'sneezed all over', 'is fast asleep on',
  'is juggling three', 'is singing loudly to', 'is wearing', 'is bouncing on', 'is hiding inside',
  'is painting', 'is having a picnic on', 'is trying to eat', 'is high-fiving',
];

export function makeList(count, rand = Math.random) {
  return shuffle(ITEMS, rand).slice(0, count);
}

// Answer choices: every target plus some decoys, shuffled.
export function makePool(targets, decoys, rand = Math.random) {
  const names = new Set(targets.map((t) => t.n));
  const others = shuffle(ITEMS.filter((i) => !names.has(i.n)), rand).slice(0, decoys);
  return shuffle([...targets, ...others], rand);
}

// How many answers are in the right spot.
export function scoreOrdered(answers, targets) {
  return targets.reduce((sum, t, i) => sum + (answers[i] && answers[i].n === t.n ? 1 : 0), 0);
}

export function sillyScene(item, locus, rand = Math.random) {
  const action = ACTIONS[Math.floor(rand() * ACTIONS.length)];
  const plural = action.endsWith('three');
  const thing = plural ? `${locus.n}s` : `the ${locus.n}`;
  return `A giant ${item.n} ${action} ${thing}!`;
}
