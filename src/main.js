import * as store from './store.js';
import { register, go, currentRoute } from './router.js';
import { h, featherIcon, birdFor } from './ui.js';
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
      h('button', { class: 'feathers-pill', onclick: () => go('wings'), 'aria-label': `${store.featherCount()} feathers. Open your wings.` },
        h('span', { html: featherIcon('feat', 22) }), String(store.featherCount()))));
}

document.addEventListener('fledge:route', topbar);
store.subscribe(topbar);

go(store.get().name ? 'map' : 'start');
