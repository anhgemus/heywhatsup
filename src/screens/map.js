// The archipelago. Fog thins as the player's wings grow.
import * as store from '../store.js';
import { go } from '../router.js';
import { ISLANDS, MENTORS } from '../content.js';
import { levelsFor } from '../feats/index.js';
import { h, birdFor, featherIcon, reducedMotion, dialogue } from '../ui.js';
import { doubtStats } from '../logic/stats.js';

export function islandStatus(id) {
  const n = store.featherCount();
  const cleared = store.featState(id).cleared.length;
  const total = levelsFor(id).length;
  const open = id === 'memory' || n >= 1;
  return { open, cleared, total, complete: cleared >= total };
}

export function skyOpen() {
  return store.featherCount() >= 1;
}

// Islands drawn as soft blobs. Each has a small landmark so it reads at a glance.
const LANDMARK = {
  memory: '<path d="M-30 6 Q0 -34 30 6 Z" fill="var(--land-2)"/><path d="M-6 -6 l6 -22 l6 22 Z M10 0 l5 -16 l5 16 Z" fill="var(--pine)"/>',
  tower: '<rect x="-3" y="-30" width="6" height="30" fill="var(--bark)"/><circle cx="0" cy="-34" r="18" fill="var(--pine)"/><ellipse cx="8" cy="-26" rx="5" ry="6" fill="var(--feather-sky)"/>',
  lightning: '<path d="M-24 4 L-14 -26 L4 -26 L14 4 Z" fill="var(--rock)"/><rect x="-7" y="-26" width="9" height="30" fill="var(--water)"/><circle cx="16" cy="-6" r="5" fill="var(--feather-feat)"/>',
  cipher: '<path d="M-26 4 L-18 -20 L-6 -10 L4 -30 L18 -8 L26 4 Z" fill="var(--rock)"/><circle cx="4" cy="-31" r="4" fill="var(--ink)"/>',
  fermi: '<path d="M-30 4 Q0 -8 30 4 Z" fill="var(--sand)"/><path d="M10 -2 l0 -24 l12 8 Z" fill="var(--feather-sky)"/><line x1="10" y1="-2" x2="10" y2="-28" stroke="var(--bark)" stroke-width="2"/>',
};

function islandSVG() {
  const blobs = ISLANDS.map((i) => `<g transform="translate(${i.x * 10} ${i.y * 6.4})">
    <ellipse cx="0" cy="22" rx="74" ry="14" fill="var(--sea-shadow)"/>
    <path d="M-70 10 Q-64 -18 -30 -16 Q-6 -34 26 -20 Q66 -22 70 8 Q60 26 0 24 Q-58 28 -70 10 Z" fill="var(--land)"/>
    <g transform="translate(0 -4)">${LANDMARK[i.id]}</g></g>`).join('');
  return `<svg class="map-art" viewBox="0 0 1000 640" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <g fill="var(--cloud)" opacity=".7"><ellipse cx="500" cy="52" rx="170" ry="34"/><ellipse cx="420" cy="62" rx="80" ry="26"/><ellipse cx="590" cy="64" rx="90" ry="24"/></g>
    ${blobs}
    <g transform="translate(500 330)">
      <ellipse cx="0" cy="26" rx="90" ry="16" fill="var(--sea-shadow)"/>
      <path d="M-86 12 Q-80 -22 -36 -20 Q0 -40 40 -22 Q84 -24 86 10 Q70 30 0 28 Q-70 32 -86 12 Z" fill="var(--land)"/>
      <ellipse cx="-22" cy="-6" rx="28" ry="12" fill="var(--bark)"/><ellipse cx="-22" cy="-10" rx="20" ry="7" fill="var(--nest)"/>
      <path d="M34 0 l8 -14 l8 14 Z" fill="var(--ember)"/><path d="M38 0 l4 -8 l4 8 Z" fill="var(--feather-sky)"/>
    </g></svg>`;
}

// Fog drawn on a canvas, with holes punched where the player has been.
function fogLayer(canvas, getClears) {
  const ctx = canvas.getContext('2d');
  const puffs = Array.from({ length: 46 }, (_, i) => ({
    x: ((i * 137.5) % 100) / 100, y: ((i * 61.8 + 13) % 100) / 100,
    r: 0.1 + ((i * 29) % 10) / 70, s: 0.4 + ((i * 17) % 10) / 12, p: i,
  }));
  let raf = 0;
  let t0 = performance.now();
  const reveal = new Map();

  function draw(now) {
    const w = canvas.clientWidth;
    const hgt = canvas.clientHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(w * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(hgt * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, hgt);
    const fog = getComputedStyle(canvas).getPropertyValue('--fog-rgb').trim() || '255,255,255';
    const density = getClears().density;
    const t = (now - t0) / 1000;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(${fog},${density * 0.78})`;
    ctx.fillRect(0, 0, w, hgt);
    for (const p of puffs) {
      const x = (p.x + Math.sin(t * 0.05 * p.s + p.p) * 0.03) * w;
      const y = (p.y + Math.cos(t * 0.04 * p.s + p.p) * 0.02) * hgt;
      const r = p.r * w;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${fog},${density * 0.7})`);
      g.addColorStop(1, `rgba(${fog},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'destination-out';
    for (const c of getClears().spots) {
      const target = c.r;
      const prev = reveal.get(c.id) ?? (c.fresh ? 0 : target);
      const cur = reducedMotion() ? target : prev + (target - prev) * 0.04;
      reveal.set(c.id, cur);
      const x = c.x * w;
      const y = c.y * hgt;
      const r = cur * w;
      if (r < 1) continue;
      const g = ctx.createRadialGradient(x, y, r * 0.35, x, y, r);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!reducedMotion()) raf = requestAnimationFrame(draw);
  }
  raf = requestAnimationFrame(draw);
  const onVis = () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) raf = requestAnimationFrame(draw);
  };
  document.addEventListener('visibilitychange', onVis);
  const ro = new ResizeObserver(() => reducedMotion() && requestAnimationFrame(draw));
  ro.observe(canvas);
  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    document.removeEventListener('visibilitychange', onVis);
  };
}

export function renderMap(params, ctx) {
  const s = store.get();
  const n = store.featherCount();
  const root = h('section', { class: 'screen map-screen' });

  const lastSeen = s.seen.mapFeathers ?? 0;
  const spots = () => {
    const list = [{ id: 'nest', x: 0.5, y: 0.52, r: 0.12 }];
    ISLANDS.forEach((i) => {
      const st = islandStatus(i.id);
      const r = !st.open ? 0.0 : st.complete ? 0.17 : 0.085 + (st.cleared / st.total) * 0.06;
      list.push({ id: i.id, x: i.x / 100, y: i.y / 100, r, fresh: n > lastSeen });
    });
    if (skyOpen()) list.push({ id: 'sky', x: 0.5, y: 0.09, r: 0.14, fresh: lastSeen === 0 });
    return { spots: list, density: Math.max(0.35, 0.95 - n * 0.025) };
  };

  const stage = h('div', { class: 'map' });
  stage.innerHTML = islandSVG();
  const canvas = h('canvas', { class: 'fog', 'aria-hidden': 'true' });
  stage.append(canvas);

  const pin = (id, x, y, label, sub, open, onclick, extra = '') =>
    h('button', {
      class: `pin ${open ? '' : 'pin-locked'} ${extra}`,
      style: `left:${x}%;top:${y}%`,
      onclick,
      'aria-label': open ? `${label}. ${sub}` : `${label}, hidden in fog. Earn your first feather to fly here.`,
    }, h('span', { class: 'pin-name' }, open ? label : '???'), open && sub ? h('span', { class: 'pin-sub' }, sub) : null);

  ISLANDS.forEach((i) => {
    const st = islandStatus(i.id);
    const sub = st.complete ? 'All feathers ✓' : `${st.cleared}/${st.total} · ${MENTORS[i.mentor].name}`;
    stage.append(pin(i.id, i.x, i.y - 13, i.place, sub, st.open,
      () => (st.open ? go('island', { id: i.id }) : lockedNote()), st.complete ? 'pin-done' : ''));
  });
  stage.append(pin('nest', 50, 40, 'The Nest', 'Campfire stories', true, () => go('campfire')));
  stage.append(pin('sky', 50, 7, 'Big Sky', 'Real-life flights', skyOpen(), () => (skyOpen() ? go('sky') : lockedNote()), 'pin-sky'));

  const you = h('div', { class: 'map-you', html: birdFor('you', { size: 46 }), style: 'left:44%;top:50%' });
  stage.append(you);

  const note = h('p', { class: 'map-note', 'aria-live': 'polite' });
  function lockedNote() {
    note.textContent = 'Too foggy to fly there yet. Earn your first feather on Seed Cache Hill and the fog will thin.';
  }

  const stats = doubtStats(s.feathers);
  const head = h('div', { class: 'map-head' },
    h('div', null,
      h('h1', { tabindex: '-1' }, n ? `Fly on, ${s.name || 'fledgling'}.` : `Welcome, ${s.name || 'fledgling'}.`),
      h('p', { class: 'lede' }, n
        ? stats.doubtedAndDid
          ? `${stats.doubtedAndDid} time${stats.doubtedAndDid > 1 ? 's' : ''} you doubted yourself and did it anyway. The fog is thinning.`
          : 'Every feather is proof. The fog is thinning.'
        : 'The islands are hidden in fog. Start at Seed Cache Hill, where Clove is waiting.')),
    h('button', { class: 'wing-count', onclick: () => go('wings') },
      h('span', { html: featherIcon('feat', 30) }), h('strong', null, String(n)), h('span', null, n === 1 ? 'feather' : 'feathers')));

  const list = h('div', { class: 'island-list' }, ...ISLANDS.map((i) => {
    const st = islandStatus(i.id);
    const m = MENTORS[i.mentor];
    return h('button', {
      class: `island-card ${st.open ? '' : 'locked'} ${st.complete ? 'done' : ''}`,
      onclick: () => (st.open ? go('island', { id: i.id }) : lockedNote()),
    },
      h('span', { class: 'island-bird', html: birdFor(i.mentor, { size: 52 }) }),
      h('span', { class: 'island-text' },
        h('span', { class: 'island-name' }, st.open ? i.place : 'Hidden in fog'),
        h('span', { class: 'island-teaser' }, st.open ? i.teaser : 'Earn your first feather to fly here.'),
        h('span', { class: 'island-meta' }, st.open ? `${m.name} · ${i.method} · ${st.cleared}/${st.total}` : '')),
    );
  }));

  root.append(head, stage, note, h('h2', { class: 'section-title' }, 'Islands'), list);

  if (!s.seen.welcome) {
    const box = h('div', { class: 'welcome' });
    root.insertBefore(box, stage);
    dialogue(box, [
      ['pip', `Oh! A new fledgling! Hi ${s.name || 'there'}, I'm Pip.`],
      ['pip', 'See all that fog around the islands? It grows out of one little word: "can\'t".'],
      ['pip', 'From far away the fog looks like a wall. But when you fly into it, it\'s just air.'],
      ['pip', 'Every time you do something you thought you couldn\'t, you earn a feather. Feathers make wings. And wings clear the fog.'],
      ['pip', 'Clove is waiting on Seed Cache Hill. Let\'s go!'],
    ], { doneLabel: "Let's go" }).then(() => {
      store.markSeen('welcome');
      box.remove();
    });
  }

  ctx.onLeave(fogLayer(canvas, spots));
  store.update((st) => (st.seen.mapFeathers = n));
  return root;
}
