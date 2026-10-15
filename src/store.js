// Game state, kept in this browser only.

const KEY = 'fledge.v1';
const listeners = new Set();

function fresh() {
  return {
    v: 1,
    name: '',
    color: 'sky',
    createdAt: Date.now(),
    feathers: [],
    feats: {},
    plans: [],
    skyDraft: null,
    talkbacks: [],
    storiesRead: [],
    seen: {},
    settings: { sound: true },
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh();
    return { ...fresh(), ...JSON.parse(raw) };
  } catch {
    return fresh();
  }
}

let state = load();

export function get() {
  return state;
}

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private mode, blocked site data). The game still runs.
  }
  listeners.forEach((fn) => fn(state));
}

export function update(fn) {
  fn(state);
  save();
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// kind: 'feat' | 'stumble' | 'sky' | 'hop'
export function addFeather(feather) {
  const f = { id: uid(), at: Date.now(), ...feather };
  update((s) => s.feathers.push(f));
  return f;
}

export function featState(id) {
  return state.feats[id] || { cleared: [], best: {}, introSeen: false };
}

export function updateFeat(id, fn) {
  update((s) => {
    const f = s.feats[id] || { cleared: [], best: {}, introSeen: false };
    fn(f);
    s.feats[id] = f;
  });
}

export function markSeen(key) {
  update((s) => (s.seen[key] = Date.now()));
}

export function featherCount() {
  return state.feathers.filter((f) => f.kind !== 'stumble').length;
}

export function exportCode() {
  return btoa(unescape(encodeURIComponent(JSON.stringify(state))));
}

export function importCode(code) {
  const parsed = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
  if (!parsed || parsed.v !== 1 || !Array.isArray(parsed.feathers)) throw new Error('not a Fledge code');
  state = { ...fresh(), ...parsed };
  save();
}

export function reset() {
  state = fresh();
  save();
}
