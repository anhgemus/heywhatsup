import * as store from './store.js';
import { register, go, currentRoute } from './router.js';
import { h, featherIcon, birdFor } from './ui.js';
import { installUnlock, installButtonTaps, play } from './sfx.js';
import { renderMap } from './screens/map.js';
import { renderIsland, renderLevel } from './screens/island.js';
import { renderWings } from './screens/wings.js';
import { renderSky, renderPlan, renderFlight } from './screens/sky.js';
import { renderStart, renderCampfire, renderGrownups, renderSettings } from './screens/misc.js';

register('start', renderStart);
register('map', renderMap);
register('island', renderIsland);
register('level', renderLevel);
register('wings', renderWings);
register('sky', renderSky);
register('plan', renderPlan);
register('flight', renderFlight);
register('campfire', renderCampfire);
register('grownups', renderGrownups);
register('settings', renderSettings);

const NAV = [
  ['map', 'Map'],
  ['wings', 'Wings'],
  ['sky', 'Big Sky'],
  ['campfire', 'Campfire'],
  ['grownups', 'Grown-ups'],
  ['settings', 'Settings'],
];
const SECTION = { island: 'map', level: 'map', plan: 'sky', flight: 'sky' };

function topbar() {
  const bar = document.getElementById('topbar');
  const route = currentRoute()?.name;
  const s = store.get();
  if (route === 'start' || !s.name) {
    bar.hidden = true;
    return;
  }
  bar.hidden = false;
  const active = SECTION[route] || route;
  bar.replaceChildren(
    h('div', { class: 'topbar-inner' },
      h('button', { class: 'brand', onclick: () => go('map'), 'aria-label': 'Fledge, back to the map' },
        h('span', { class: 'brand-bird', html: birdFor('you', { size: 34 }) }), h('span', null, 'Fledge')),
      h('nav', { 'aria-label': 'Main' }, ...NAV.map(([id, label]) =>
        h('button', { class: `nav-btn ${active === id ? 'on' : ''}`, 'aria-current': active === id ? 'page' : null, onclick: () => go(id) }, label))),
      h('button', {
        class: `sound-btn ${s.settings.sound ? '' : 'muted'}`,
        'data-sfx': 'off',
        'aria-pressed': s.settings.sound ? 'true' : 'false',
        'aria-label': s.settings.sound ? 'Sound on. Tap to mute.' : 'Sound off. Tap to turn on.',
        title: s.settings.sound ? 'Mute sounds' : 'Turn sounds on',
        onclick: () => {
          store.update((st) => (st.settings.sound = !st.settings.sound));
          play('pop');
        },
        html: speakerIcon(s.settings.sound),
      }),
      h('button', { class: 'feathers-pill', onclick: () => go('wings'), 'aria-label': `${store.featherCount()} feathers. Open your wings.` },
        h('span', { html: featherIcon('feat', 22) }), String(store.featherCount()))));
}

function speakerIcon(on) {
  return `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/>
    ${on ? '<path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>' : '<path d="M17 9l5 6M22 9l-5 6"/>'}</svg>`;
}

installUnlock();
installButtonTaps();
document.addEventListener('fledge:route', topbar);
store.subscribe(topbar);

go(store.get().name ? 'map' : 'start');
