// Sound effects, synthesized with Web Audio so there are no files to load.
// Browsers keep audio locked until the player taps something, so the context is created and
// resumed inside the first tap or key press, and every sound after that can play.
import * as store from './store.js';

let ctx = null;
let master = null;

function enabled() {
  return store.get().settings.sound !== false;
}

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

// Called from inside a user gesture. Playing one silent sample is what finally unlocks iOS.
let unlocked = false;
function unlock() {
  if (unlocked) return;
  const c = ensure();
  if (!c) return;
  if (c.state === 'running') unlocked = true;
  try {
    const buf = c.createBuffer(1, 1, 22050);
    const src = c.createBufferSource();
    src.buffer = buf;
    src.connect(c.destination);
    src.start(0);
  } catch {
    // ignore
  }
}

export function installUnlock() {
  const once = () => unlock();
  ['pointerdown', 'touchstart', 'keydown', 'click'].forEach((t) =>
    window.addEventListener(t, once, { capture: true, passive: true }));
}

// ---------- Building blocks ----------

function tone(freq, { at = 0, dur = 0.18, type = 'triangle', gain = 0.14, attack = 0.008, slideTo, detune = 0 } = {}) {
  const t = ctx.currentTime + at;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  o.detune.value = detune;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

let noiseBuf = null;
function noise({ at = 0, dur = 0.4, gain = 0.12, from = 400, to = 2400, q = 0.8, type = 'bandpass' } = {}) {
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = ctx.currentTime + at;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.Q.value = q;
  f.frequency.setValueAtTime(from, t);
  f.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t);
  src.stop(t + dur + 0.05);
}

// ---------- The kit ----------

const N = { C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, B5: 987.77, C6: 1046.5, E6: 1318.5, G6: 1568, C4: 261.63, E4: 329.63, G4: 392, A4: 440, F4: 349.23 };

const SOUNDS = {
  // Any button press: a soft wooden tap.
  tap: () => tone(720, { dur: 0.06, type: 'sine', gain: 0.07, slideTo: 520 }),
  // A new line of speech.
  pop: () => { tone(N.G5, { dur: 0.09, type: 'sine', gain: 0.08, slideTo: N.C6 }); },
  // Picking something up / choosing.
  pick: () => tone(N.E5, { dur: 0.1, type: 'triangle', gain: 0.1, slideTo: N.A5 }),
  // Putting something down.
  drop: () => tone(N.A4, { dur: 0.12, type: 'triangle', gain: 0.12, slideTo: N.E4 }),
  // Not allowed: a gentle bonk, never a buzzer.
  nope: () => { tone(220, { dur: 0.12, type: 'square', gain: 0.04 }); tone(196, { at: 0.08, dur: 0.14, type: 'square', gain: 0.04 }); },
  // Typing a letter in the code.
  type: () => tone(1400 + Math.random() * 200, { dur: 0.035, type: 'square', gain: 0.025 }),
  // A memory item appears.
  flip: () => { noise({ dur: 0.12, gain: 0.05, from: 2000, to: 5000, q: 2 }); tone(N.C6, { at: 0.02, dur: 0.12, type: 'sine', gain: 0.06 }); },
  // Locking in a guess.
  lock: () => { tone(N.C5, { dur: 0.08, gain: 0.1 }); tone(N.G5, { at: 0.07, dur: 0.16, gain: 0.1 }); },
  // Right answer.
  correct: () => { tone(N.E5, { dur: 0.12, gain: 0.12 }); tone(N.C6, { at: 0.09, dur: 0.24, gain: 0.12 }); },
  // Wrong answer: soft and falling, not harsh.
  miss: () => { tone(N.E4 * 1.5, { dur: 0.16, type: 'sine', gain: 0.1, slideTo: N.C4 * 1.5 }); },
  // The Fog speaks: a cold whoosh.
  fog: () => { noise({ dur: 0.9, gain: 0.07, from: 300, to: 900, q: 0.6, type: 'lowpass' }); tone(N.A4 / 2, { dur: 0.8, type: 'sine', gain: 0.05, slideTo: N.F4 / 2 }); },
  // Answering the Fog back: a brave little rise.
  brave: () => { [N.C5, N.E5, N.G5].forEach((f, i) => tone(f, { at: i * 0.06, dur: 0.14, gain: 0.1 })); },
  // A clue revealed.
  sparkle: () => { [N.E6, N.G6, N.C6 * 2].forEach((f, i) => tone(f, { at: i * 0.05, dur: 0.2, type: 'sine', gain: 0.05 })); },
  // A feather earned: rising arpeggio with a shimmer on top.
  feather: () => {
    [N.C5, N.E5, N.G5, N.C6, N.E6].forEach((f, i) => tone(f, { at: i * 0.08, dur: 0.45, gain: 0.11 }));
    noise({ at: 0.3, dur: 0.6, gain: 0.04, from: 4000, to: 9000, q: 3 });
  },
  // A learning feather: warm and kind.
  learn: () => { [N.F4, N.A4, N.C5].forEach((f, i) => tone(f, { at: i * 0.1, dur: 0.6, type: 'sine', gain: 0.09 })); },
  // A measurement taken.
  measure: () => { tone(N.G5, { dur: 0.1, gain: 0.1 }); tone(N.G5, { at: 0.14, dur: 0.18, gain: 0.1 }); },
  // Countdown tick (last seconds).
  tick: () => tone(1800, { dur: 0.03, type: 'square', gain: 0.03 }),
  // Timer start / stop bell.
  bell: () => { tone(N.C6, { dur: 0.6, type: 'sine', gain: 0.12 }); tone(N.C6 * 2.01, { dur: 0.4, type: 'sine', gain: 0.04 }); },
  // Wings flap: two quick whooshes.
  flap: () => { noise({ dur: 0.18, gain: 0.08, from: 600, to: 1800, q: 1 }); noise({ at: 0.16, dur: 0.18, gain: 0.07, from: 600, to: 1800, q: 1 }); },
  // Take off: a long rising whoosh.
  takeoff: () => { noise({ dur: 1.1, gain: 0.09, from: 300, to: 4000, q: 0.7 }); tone(N.C5, { at: 0.2, dur: 0.9, type: 'sine', gain: 0.07, slideTo: N.C6 }); },
  // The fog clears on the map.
  reveal: () => { noise({ dur: 1.4, gain: 0.06, from: 2000, to: 300, q: 0.5, type: 'lowpass' }); [N.G5, N.C6, N.E6].forEach((f, i) => tone(f, { at: 0.3 + i * 0.12, dur: 0.6, type: 'sine', gain: 0.06 })); },
};

export function play(name) {
  if (!enabled() || !SOUNDS[name]) return;
  const c = ensure();
  if (!c) return;
  try {
    SOUNDS[name]();
  } catch {
    // Sound is a bonus; never break the game over it.
  }
}

// A soft tap for every button, unless the button makes its own sound.
export function installButtonTaps() {
  document.addEventListener('click', (e) => {
    const b = e.target.closest('button, [role="button"], summary');
    if (!b || b.disabled || b.closest('[data-sfx-off]') || b.dataset.sfx === 'off') return;
    play('tap');
  }, true);
}
