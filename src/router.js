// A tiny screen switcher. Screens are functions that return an element and may set a cleanup.

const routes = {};
let cleanup = null;
let current = null;

export function register(name, render) {
  routes[name] = render;
}

export function currentRoute() {
  return current;
}

export function go(name, params = {}) {
  const view = document.getElementById('view');
  if (cleanup) {
    try {
      cleanup();
    } catch {
      // ignore
    }
    cleanup = null;
  }
  current = { name, params };
  view.replaceChildren();
  const ctx = { onLeave: (fn) => (cleanup = fn) };
  const el = routes[name](params, ctx);
  view.append(el);
  document.dispatchEvent(new CustomEvent('fledge:route', { detail: current }));
  window.scrollTo({ top: 0 });
  const heading = view.querySelector('h1');
  heading?.focus({ preventScroll: true });
}
