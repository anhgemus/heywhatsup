// Knot Tree: the Tower of Hanoi, solved by shrinking the problem.
import { h } from '../ui.js';
import { play } from '../sfx.js';
import { createTower, canMove, move, isSolved, minMoves, nextMove, currentGoal } from '../logic/hanoi.js';

const POSTS = ['A', 'B', 'C'];

function playTower(n) {
  return (area, finish) => {
    let pegs = createTower(n);
    let history = [];
    let held = null;
    let moves = 0;
    let hints = 0;
    let over = false;
    const board = h('div', { class: 'tower-board', style: `--n:${n}` });
    const status = h('p', { class: 'tower-status', 'aria-live': 'polite' });
    const goal = h('p', { class: 'tower-goal' });
    const counter = h('p', { class: 'tower-count' });

    const postButtons = POSTS.map((label, i) =>
      h('button', { class: 'post', 'aria-label': `Post ${label}`, 'data-sfx': 'off', onclick: () => tap(i) }));

    function paint(highlight = []) {
      postButtons.forEach((btn, i) => {
        btn.replaceChildren(
          h('span', { class: 'post-pole', 'aria-hidden': 'true' }),
          ...pegs[i].map((d, k) => h('span', {
            class: `ring ring-${d}${held === i && k === pegs[i].length - 1 ? ' lifted' : ''}`,
            style: `--d:${d}`,
          })),
          h('span', { class: 'post-label' }, POSTS[i]));
        btn.classList.toggle('hl', highlight.includes(i));
        btn.setAttribute('aria-label', `Post ${POSTS[i]}: ${pegs[i].length ? 'rings ' + pegs[i].join(', ') : 'empty'}${held === i ? ', ring lifted' : ''}`);
      });
      counter.textContent = `Moves: ${moves} · Shortest possible: ${minMoves(n)}`;
    }

    function tap(i) {
      if (over) return;
      if (held === null) {
        if (!pegs[i].length) {
          play('nope');
          return say('That post is empty. Pick a post with a ring on it.');
        }
        play('pick');
        held = i;
        say(`Picked up ring ${pegs[i][pegs[i].length - 1]}. Now tap where it should go.`);
      } else if (held === i) {
        held = null;
        play('drop');
        say('Put it back.');
      } else if (canMove(pegs, held, i)) {
        history.push(pegs);
        pegs = move(pegs, held, i);
        play('drop');
        moves++;
        held = null;
        say('');
        if (isSolved(pegs, n)) {
          over = true;
          paint();
          area.classList.add('finished');
          return finish({
            success: true, score: 1, max: 1,
            detail: moves === minMoves(n)
              ? `${moves} moves: a perfect flight, the shortest way possible.`
              : `You used ${moves} moves. The shortest possible is ${minMoves(n)}. You got there, and that's what counts.`,
          });
        }
      } else {
        const board = postButtons[i];
        board.classList.remove('shake');
        void board.offsetWidth;
        board.classList.add('shake');
        play('nope');
        say("A big ring can't sit on a smaller one. Try another post.");
      }
      paint();
    }

    function say(t) {
      status.textContent = t;
    }

    const shrink = h('button', { class: 'btn', 'data-sfx': 'off' }, 'Shrink hint');
    shrink.addEventListener('click', () => {
      hints++;
      play('sparkle');
      const g = currentGoal(pegs, n);
      if (!g) return;
      held = null;
      goal.textContent = g.smallerTower > 0
        ? `Big goal: ring ${g.disk} needs to get to post ${POSTS[g.to]}. So first, move the smaller tower (${g.smallerTower} ring${g.smallerTower > 1 ? 's' : ''}) onto post ${POSTS[g.smallerTo]}.`
        : `Ring 1 just needs to hop to post ${POSTS[g.to]}.`;
      paint();
    });
    const peek = h('button', { class: 'btn', 'data-sfx': 'off' }, 'Show next move');
    peek.addEventListener('click', () => {
      hints++;
      play('sparkle');
      const m = nextMove(pegs, n);
      if (!m) return;
      held = null;
      say(`Next move: post ${POSTS[m[0]]} → post ${POSTS[m[1]]}.`);
      paint(m);
    });
    const undo = h('button', { class: 'btn btn-quiet' }, 'Undo');
    undo.addEventListener('click', () => {
      if (!history.length) return;
      pegs = history.pop();
      moves--;
      held = null;
      paint();
    });
    const stop = h('button', { class: 'btn btn-quiet' }, 'Stop for now');
    stop.addEventListener('click', () => {
      if (over) return;
      over = true;
      area.classList.add('finished');
      finish({ success: false, score: 0, max: 1, detail: `You made ${moves} moves before stopping. Every move teaches your brain the pattern.` });
    });

    const onKey = (e) => {
      if (over || !area.isConnected) return document.removeEventListener('keydown', onKey);
      if (['1', '2', '3'].includes(e.key) && !e.target.matches('input, textarea')) tap(Number(e.key) - 1);
    };
    document.addEventListener('keydown', onKey);

    board.append(...postButtons);
    area.replaceChildren(
      h('p', { class: 'play-q' }, `Move all ${n} rings from post A to post C. One ring at a time, and never a big ring on a smaller one. (Keys 1, 2, 3 work too.)`),
      board, status, goal, counter,
      h('div', { class: 'row row-wrap row-end' }, stop, undo, shrink, peek));
    paint();
  };
}

export const intro = [
  ['weft', "Welcome to Knot Tree. I'm Weft. I weave nests out of hundreds of strips of grass."],
  ['weft', "People look at a finished nest and think: impossible. But I never build a nest. I only ever tie one knot."],
  ['pip', "I tried this ring puzzle before. I clicked around for ten minutes and got completely stuck. I nearly quit."],
  ['weft', 'Then you learned to shrink it. Show them, Pip. Well, let me show them.'],
];

const levelFor = (n, extra) => ({
  id: `tower${n}`,
  title: `Tower of ${n}`,
  short: `${minMoves(n)} moves if you do it perfectly.`,
  predict: { kind: 'confidence' },
  question: `Can you move a tower of ${n} rings to the last post? How sure are you?`,
  play: playTower(n),
  judge: () => 'The puzzle only counts as solved when every ring is on post C, biggest at the bottom. Hints are allowed. Pros use hints.',
  method: extra,
});

export const levels = [
  levelFor(3, [
    ['weft', 'The rules: move one ring at a time. A big ring can never sit on a smaller ring. Get the whole tower to post C.'],
    ['weft', "Here's the trick. Don't think about rings. Think about towers."],
    ['weft', 'To move a tower of 3: first move the tower of 2 out of the way. Then the big ring can go to C. Then put the tower of 2 back on top.'],
    ['weft', 'And how do you move a tower of 2? Same trick, just smaller. That\'s all there is to it.'],
    ['pip', "When it's stuck, I press Shrink hint. It tells me the smaller tower to move first."],
  ]),
  levelFor(4, [['weft', 'A tower of 4 is a tower of 3, one big ring, and the tower of 3 again. You already know how to move a tower of 3.']]),
  levelFor(5, [
    ['pip', "31 moves. Okay, that one looks hard."],
    ['weft', "Does it? It's a tower of 4 twice, plus one move. You did a tower of 4 a minute ago."],
  ]),
  levelFor(6, [
    ['weft', "63 moves. This is the one most people won't even try."],
    ['weft', 'You already know everything you need. Big goal first, then shrink it. One knot at a time.'],
  ]),
];
