# Fledge

**A game about finding out you can.**

Fledge is a browser game for kids (about 8–13) that builds **self-efficacy**, the belief that
you can do a hard thing, out of real evidence. Before each challenge you guess how you'll do.
Then you learn an expert's method, try it, and see your guess next to what actually happened.
Every time you do something you thought you couldn't, you earn a feather. Feathers make wings,
and your wings clear the fog off the map.

Inspired by Felix Rieseberg's
[How to be more ambitious: A tutorial for humans with models](https://felixrieseberg.com/how-to-be-more-ambitious-a-tutorial-for-humans-with-models/)
and its four kinds of ambition: Speed, Altitude, Depth and Range.

- **Five islands.** Remember 20 things in order (memory palace), solve a 63-move Tower of Hanoi
  (shrink the problem), square 85 in your head (find the pattern), crack a cipher with no key
  (hunt for clues), and estimate your lifetime heartbeats from your own pulse (Fermi estimates).
- **Big Sky.** Plan a real-life goal with Altitude, Depth and Range, small "hops", an if–then
  plan, an outside check, and an optional prompt for asking an AI helper to coach you rather than
  do it for you.
- **Wings.** Every feather is evidence. See how often your doubt guessed low.
- **The Fog.** The doubting voice, as a character you learn to answer back.
- **Campfire.** True stories: Dantzig's "homework", the four-minute mile, the five-month-old
  godwit that flew 13,560 km without landing, and more.
- **For grown-ups.** The psychology behind it and how to help.

See [DESIGN.md](DESIGN.md) for how the idea evolved and how each mechanic maps to the research.

## Run it

No build step and no dependencies. It's plain HTML, CSS and JavaScript modules. Serve the
folder with any static server:

```sh
npm start            # npx serve on http://localhost:5173
# or
python3 -m http.server 5173
```

Opening `index.html` straight from disk won't work, because browsers block ES modules on
`file://`.

## Test

```sh
npm test
```

Unit tests cover the game logic: the Hanoi solver and hints, cipher generation and checking,
the mental-math tricks, memory scoring, Fermi unit chains, and the doubt-gap statistics.

## Layout

```
index.html, styles.css
src/
  main.js, router.js, store.js, ui.js, content.js, challenge.js
  logic/     pure game logic (tested)
  feats/     the five islands
  screens/   map, island, wings, Big Sky, campfire, grown-ups, settings
tests/
```

Progress is stored only in the browser (localStorage). Nothing is sent anywhere.
