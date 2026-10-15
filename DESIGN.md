# Fledge: design notes

> A game about finding out you can.

Fledge is a browser game for kids (about 8–13) that builds **self-efficacy**: the belief that
you can do a specific hard thing. It was inspired by Felix Rieseberg's essay
[How to be more ambitious: A tutorial for humans with models](https://felixrieseberg.com/how-to-be-more-ambitious-a-tutorial-for-humans-with-models/).
The essay ends on self-efficacy: "We humans have always been held back by what we believe
possible."

Kids growing up now will have tools that make leaps every few weeks. Often the limit won't be
the tool. It will be what the kid believes they can attempt. Fledge tries to train that belief
with real evidence, not pep talks.

---

## How the idea evolved

**1. A growth-mindset platformer.** Rejected. Lots of these exist, and confidence earned inside
a game mostly stays inside it. Kids give the credit to the game, not to themselves.

**2. A real-life quest tracker.** Closer, because real mastery is the strongest source of
self-efficacy. But it felt like homework, with no moment of delight and nothing that teaches *how*.

**3. Fog island.** "The fog of *can't* looks like a wall from far away. Up close it's just air."
A good metaphor for believing something is impossible, but it didn't connect to the essay.

**4. Fledge (final).** Fledglings leave the nest *before* they can fly. For days they hop,
flap and fall, and their parents keep feeding them. That is a built-in metaphor for permission
to fail, and it ties to the essay (Goya's *Modo de volar*, "new wings"). The fog stayed: the
islands hide in it, and it thins as your wings grow.

Ambition is literally flight:

| Essay | In the game |
|---|---|
| **Altitude**: the goal behind the goal | Big Sky asks "why do you want this, and could it be bigger?" Knot Tree teaches thinking in towers instead of rings. |
| **Depth**: do it the way the best do it | Memory champions' palace, human calculators' tricks. Big Sky asks "how would the best in the world do this?" plus an "unreasonable mode" (10× goal). |
| **Range**: borrow from other fields | Codebreaking with detectives' and linguists' tricks. Physicists' Fermi estimates. In Big Sky you "assemble the crew" and restate your goal as a verb, not a noun. |
| **Speed** | Nectar Falls. Zip says it's the easiest kind, so let's get it out of the way. |
| **Outside judge** | Every challenge is scored by the game, never self-graded. Big Sky asks "who or what will check it, besides you?" |
| **Specific hard goals** (Locke & Latham) | Big Sky won't continue until "I'll know I did it when…" is filled in, with a date. |

## The core loop

Every challenge on every island runs the same loop:

1. **Guess first.** "How many will you remember?" or "How sure are you?" There is no wrong guess.
2. **Talk back to the Fog.** If the guess is under 50%, the doubting voice appears as a
   character (the Fog: "You can't do that. Why even try?"). The kid picks a reply: "Not yet.",
   "Let's find out.", "I've been wrong about this before." This externalizes self-doubt and
   practises answering it.
3. **Echo.** If they've doubted before and done it anyway, the game shows them that exact moment:
   "On October 3 you guessed 20% about *Tower of 5*. You did it."
4. **Watch Pip, learn the method.** Pip is a fellow fledgling who struggles openly (a *coping
   model*). The mentor teaches a real expert method.
5. **Try.** "Practice flights never count against you."
6. **Outside check.** The game judges the result objectively.
7. **Feather.** Success earns a feather. A stumble earns a *learning feather*, but only after
   the kid picks what they'll try differently. Then the result is shown next to the guess.

Over time the **Wings** page turns this into evidence: "You doubted yourself 7 times and did it
anyway 6 times. Your average guess: 38%. What actually happened: 86%."

## The islands

Each challenge is chosen because it **looks impossible to most kids but becomes reliably doable
with an expert's method** in about ten minutes. That's the "I couldn't, and then I could" moment.

| Island | Mentor (a real bird with a matching superpower) | Challenge | Method |
|---|---|---|---|
| Seed Cache Hill | Clove, a Clark's nutcracker (caches tens of thousands of seeds) | Recall 10 → 15 → 20 items in order. Starts with a "before" measurement without the method, so the jump is visible: *same brain, better method*. | Memory palace |
| Knot Tree | Weft, a weaver bird (one knot at a time) | Tower of Hanoi, 3 → 6 rings (63 moves) | Shrink the problem |
| Nectar Falls | Zip, a hummingbird (about 50 wingbeats a second) | 85 × 85 and 76 × 11 in your head | Find the pattern |
| Rookery Rocks | Corvina, a crow (remembers faces for years) | Crack a substitution cipher with no key. The second message tells the true Dantzig story. | Hunt for clues (frequency, one-letter words, THE) |
| Far Shore | Gale, a bar-tailed godwit (13,560 km non-stop at five months old) | Heartbeats in a lifetime, from your own measured pulse. Breaths in a year. The godwit's speed. | Break it into knowns, and track units |

Levels are small, close goals. Bandura and Schunk found that close subgoals build efficacy faster
than one distant goal.

## Big Sky: making it transfer

Game confidence doesn't automatically carry into real life, so Big Sky is where the methods get
used on real goals:

1. **Summit.** Something you'd love to do but aren't sure you can.
2. **Guess.** Same loop, same Fog.
3. **Altitude.** The goal behind the goal, and an invitation to fly higher.
4. **Specific.** How you'll know, by when, and who checks it besides you.
5. **Depth.** Who's the best at this, and what would they do? Plus "unreasonable mode".
6. **Range.** Say it as a verb, then pick up to 3 crew from other fields (scientist, coach,
   detective, friendly critic…), each with a question to answer.
7. **Hops.** Small steps, the first one doable today in 10 minutes. Plus an **if–then plan**
   for the likely obstacle (implementation intentions).
8. **Ready.** A flight plan card, plus an optional **"Ask an AI helper, ambitiously"** prompt
   that applies the essay's techniques for a kid. It asks the model to *coach, not ghost-write*,
   because self-efficacy only grows when the kid does the work.

Each real hop earns a feather, and landing the flight compares the original guess with what
really happened.

## Bandura's four sources, and where each one lives

| Source | Mechanic |
|---|---|
| Mastery experiences | Island challenges with expert methods; real hops in Big Sky |
| Vicarious experience | Pip the coping model; campfire stories (four-minute mile, sub-two-hour marathon) |
| Verbal persuasion | The kid's *own* data: guess-vs-result bars, the Echo, the Wings page |
| Physiological / emotional states | The Fog as an external character; "that racing heart means you're getting ready"; learning feathers |

## The campfire

True stories unlock as the wings grow, each tagged with the efficacy idea it teaches: robin
fledglings, Dantzig's "homework", Bannister and Landy, Linux's "just a hobby", the godwit,
Michelangelo the "sculptor", Sawe's sub-two-hour marathon, and Goya's *A Way of Flying*.

## Principles we kept

- **Never fake evidence.** The game doesn't inflate scores or pretend failures were successes.
  Calibration matters: if a kid's guesses run high, the Wings page says so kindly.
- **Credit goes to method, not talent.** Every success names the method that did it.
- **Stumbles are information.** A learning feather always comes with a plan.
- **No accounts, no tracking.** Everything lives in the browser's localStorage, with a
  backup code in Settings.
