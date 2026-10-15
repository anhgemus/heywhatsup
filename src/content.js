// Words and characters. Kept in one place so grown-ups can read and adjust them.

export const COLORS = {
  sky: { body: '#8FB8DE', belly: '#EAF2FA', wing: '#4F7FAE', beak: '#F2A33A', label: 'Sky blue' },
  ember: { body: '#F08A5D', belly: '#FCE3D3', wing: '#B9532B', beak: '#F7C948', label: 'Ember' },
  moss: { body: '#7DBE7A', belly: '#E6F4E2', wing: '#3E7F43', beak: '#F2A33A', label: 'Moss' },
  plum: { body: '#A98BD6', belly: '#F0E9FA', wing: '#6C4FA3', beak: '#F7C948', label: 'Plum' },
  sun: { body: '#F2C94C', belly: '#FFF5D6', wing: '#C08A1E', beak: '#E2683C', label: 'Sunbeam' },
  rose: { body: '#E77FA6', belly: '#FBE4EE', wing: '#A84A72', beak: '#F7C948', label: 'Rose' },
};

export const PIP = { name: 'Pip', look: { body: '#B7C7D9', belly: '#F2F5F9', wing: '#7D93AD', beak: '#F2A33A', fluffy: true } };

export const MENTORS = {
  clove: {
    name: 'Clove', species: "Clark's nutcracker",
    look: { body: '#8E8C88', belly: '#D6D2CB', wing: '#2E2E33', beak: '#2E2E33' },
    fact: 'Real nutcrackers hide tens of thousands of pine seeds every autumn, in thousands of secret spots, and find most of them again months later, even under snow.',
  },
  weft: {
    name: 'Weft', species: 'weaver bird',
    look: { body: '#F2C230', belly: '#F8E08A', wing: '#7A6424', beak: '#3A3020', mask: true },
    fact: 'Weaver birds build nests from hundreds of strips of grass and tie real knots with their beaks, one strip at a time.',
  },
  zip: {
    name: 'Zip', species: 'hummingbird',
    look: { body: '#2FA36B', belly: '#E3F1E7', wing: '#1F6F4B', beak: '#2A2A2A', longBeak: true, small: true },
    fact: "A ruby-throated hummingbird beats its wings about 50 times every second. Its heart can beat more than 1,000 times a minute.",
  },
  corvina: {
    name: 'Corvina', species: 'crow',
    look: { body: '#2A2F3A', belly: '#3D4556', wing: '#171B23', beak: '#171B23', eyeRing: true },
    fact: 'Crows can recognize a single human face and remember it for years. Some crows solve puzzles with three or more steps in a row.',
  },
  gale: {
    name: 'Gale', species: 'bar-tailed godwit',
    look: { body: '#C98A4E', belly: '#EBC79C', wing: '#7A5232', beak: '#D99C88', longBeak: true },
    fact: 'In 2022 a five-month-old godwit flew 13,560 km from Alaska to Tasmania without landing once. It was its first big migration.',
  },
};

// The islands. `kind` is which way of flying (ambition) the island trains.
export const ISLANDS = [
  {
    id: 'memory', mentor: 'clove', place: 'Seed Cache Hill', x: 22, y: 30,
    method: 'The Memory Palace', kind: 'Depth',
    lesson: 'Method beats talent.',
    teaser: 'Remember 20 things in order.',
  },
  {
    id: 'tower', mentor: 'weft', place: 'Knot Tree', x: 78, y: 27,
    method: 'Shrink the problem', kind: 'Altitude',
    lesson: 'Every big thing is a few small things in a row.',
    teaser: 'Move a tower of 6 rings, 63 moves without a slip.',
  },
  {
    id: 'lightning', mentor: 'zip', place: 'Nectar Falls', x: 82, y: 70,
    method: 'Find the pattern', kind: 'Speed',
    lesson: "\"I'm not a math person\" is usually \"nobody showed me the trick.\"",
    teaser: 'Work out 85 × 85 in your head in 10 seconds.',
  },
  {
    id: 'cipher', mentor: 'corvina', place: 'Rookery Rocks', x: 18, y: 72,
    method: 'Hunt for clues', kind: 'Range',
    lesson: 'Borrow tricks from detectives and language experts.',
    teaser: 'Crack a secret code with no key.',
  },
  {
    id: 'fermi', mentor: 'gale', place: 'Far Shore', x: 50, y: 88,
    method: 'Break it into knowns', kind: 'Range',
    lesson: "You don't need the answer. You need pieces of it.",
    teaser: 'Work out how many times your heart beats in a lifetime.',
  },
];

export const KINDS = {
  Altitude: 'Fly higher: aim at the goal behind the goal.',
  Depth: 'Dive deeper: do it the way the very best do it.',
  Range: 'Fly farther: borrow tricks from other fields.',
  Speed: 'Fly faster: the same thing in less time.',
};

export const TALKBACKS = [
  'Not yet.',
  "Let's find out.",
  "I've been wrong about this before.",
  "I'll learn how.",
  'Practice flights don’t count.',
];

export const FOG_LINES = [
  'Pfff. That looks way too hard for you.',
  "You can't do that. Why even try?",
  'Other birds can. Not you.',
  "You'll mess it up.",
];

export const STUMBLE_LESSONS = [
  'Try a different way',
  'Make the step smaller',
  'Ask someone for a tip',
  'Practice a bit more first',
  'Take a break and come back',
  'Use a hint, like pros do',
];

export const STORIES = [
  {
    id: 'hop', unlock: 0, title: 'Hopping before flying', tag: 'Permission to fail',
    body: [
      "Lots of young songbirds, like robins, leave the nest before they can really fly. They're called fledglings.",
      'For a few days they hop around on the ground. They flap, flutter and fall over. It looks a bit silly.',
      "Their parents don't put them back in the nest. They keep feeding them while they practice.",
      "That isn't failing. That's how flying gets learned.",
    ],
  },
  {
    id: 'dantzig', unlock: 1, title: "The homework that wasn't", tag: 'Believe it might be possible',
    body: [
      'In 1939, a student named George Dantzig arrived late to his statistics class at Berkeley. Two problems were written on the board. He copied them down, thinking they were homework.',
      'They seemed harder than usual. It took him a few days. He handed them in and said sorry for being late.',
      "Six weeks later his professor knocked on his door, very excited. Those problems weren't homework. They were two famous problems that nobody had ever solved.",
      "Dantzig solved them partly because nobody had told him they were impossible.",
    ],
  },
  {
    id: 'mile', unlock: 2, title: 'The four-minute mile', tag: 'Watch someone do it',
    body: [
      'For years, runners tried to run a mile in under four minutes. Many people thought it might be impossible.',
      'On 6 May 1954, a medical student named Roger Bannister did it: 3 minutes 59.4 seconds.',
      'Just 46 days later, another runner, John Landy, did it too, and even faster.',
      "Once people saw that it could be done, it got easier to believe they could do it too. That's why watching Pip matters.",
    ],
  },
  {
    id: 'linux', unlock: 4, title: 'Just a hobby', tag: 'Start small, let it be messy',
    body: [
      'In 1991, a 21-year-old student in Finland called Linus Torvalds posted a message online. He was building a computer operating system, he wrote, "just a hobby, won\'t be big and professional."',
      'He called his project Linux.',
      'Today Linux runs inside every Android phone, most of the internet, and all of the most powerful supercomputers in the world.',
      'He gave himself permission to make something small and imperfect. It grew.',
    ],
  },
  {
    id: 'godwit', unlock: 6, title: 'The longest flight', tag: 'Nobody said it was too far',
    body: [
      'In October 2022, a young bar-tailed godwit, only five months old, took off from Alaska.',
      'It flew over the Pacific Ocean for 11 days without landing once, and arrived in Tasmania, 13,560 km away.',
      "It's the longest non-stop bird flight ever recorded. And it was this bird's very first big migration.",
      'Gale likes to say: nobody told it the trip was too far.',
    ],
  },
  {
    id: 'michelangelo', unlock: 8, title: 'The sculptor and the ceiling', tag: "You're more than one thing",
    body: [
      'Michelangelo thought of himself as a sculptor. He carved statues from marble.',
      'In 1508, the Pope asked him to paint the ceiling of the Sistine Chapel. He tried to get out of it. Painting wasn\'t his thing, he said.',
      'He did it anyway. It took him about four years, working high up on scaffolding.',
      'Today it is one of the most famous paintings in the world, painted by someone who said he wasn\'t a painter.',
    ],
  },
  {
    id: 'marathon', unlock: 10, title: 'Under two hours', tag: 'Watch someone do it',
    body: [
      'A marathon is 42.195 km. For a long time, running one in under two hours seemed out of reach.',
      'In April 2026, at the London Marathon, Sabastian Sawe ran the first official marathon under two hours.',
      'In the very same race, the runner who came second broke two hours too.',
      'Sometimes the hardest part of an impossible thing is being the first to believe it.',
    ],
  },
  {
    id: 'goya', unlock: 12, title: 'A way of flying', tag: "Today's impossible is tomorrow's normal",
    body: [
      'About 200 years ago, the Spanish artist Francisco Goya made a print called "Modo de volar", which means "A way of flying".',
      'It shows people strapped into huge wings, flapping through a dark sky. Back then, people flying was a wild dream.',
      'In 1903, the Wright brothers flew. Today, millions of people fly every single day.',
      'Your wings are made of the things you did that you once thought you couldn\'t.',
    ],
  },
];

export const SKY_IDEAS = [
  'Cook a whole meal for my family',
  'Learn to do a cartwheel',
  'Write and finish a comic',
  'Learn a song on an instrument',
  'Swim a full length of the pool',
  'Build something that moves',
  'Give a talk in front of my class',
  'Learn 50 words in another language',
  'Make a short film',
  'Code a tiny game',
  'Run a stall and sell something I made',
  'Read a really long book',
];

export const CREW = [
  { id: 'scientist', name: 'Scientist', verb: 'tests', q: 'How can I test it and measure if it worked?' },
  { id: 'coach', name: 'Coach', verb: 'trains', q: 'What can I practice a little bit every day?' },
  { id: 'artist', name: 'Artist', verb: 'surprises', q: 'How could I make it beautiful or surprising?' },
  { id: 'engineer', name: 'Engineer', verb: 'builds', q: 'What are the parts, and which part comes first?' },
  { id: 'detective', name: 'Detective', verb: 'investigates', q: 'What clues did people who already did this leave behind?' },
  { id: 'storyteller', name: 'Storyteller', verb: 'moves people', q: 'Who is this for, and what should they feel?' },
  { id: 'explorer', name: 'Explorer', verb: 'ventures', q: "What's the first small step into the unknown?" },
  { id: 'chef', name: 'Chef', verb: 'prepares', q: 'What do I need ready, and in what order?' },
  { id: 'inventor', name: 'Inventor', verb: 'tinkers', q: 'What tool or trick could make this much easier?' },
  { id: 'teacher', name: 'Teacher', verb: 'explains', q: 'Who could I teach this to once I can do it?' },
  { id: 'gardener', name: 'Gardener', verb: 'grows', q: 'What can I plant today that grows over time?' },
  { id: 'redteam', name: 'Friendly critic', verb: 'pokes holes', q: 'What could go wrong, and how do I get ready for it?' },
];
