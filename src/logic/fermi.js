// Fermi estimation: the physicist's trick for "impossible" questions.
// Break a big unknown into a chain of small knowns, tracking units as you go.

export const UNIT_NAMES = {
  second: 'second', minute: 'minute', hour: 'hour', day: 'day', week: 'week', year: 'year', life: 'lifetime',
  trip: 'whole trip', month: 'month',
};

// Each card turns one unit into another. "per" cards multiply a rate; "split" cards divide a total.
export function applyCard(chain, card) {
  if (card.from !== chain.unit) {
    return {
      ok: false,
      message: `That card turns ${card.fromLabel || 'per ' + UNIT_NAMES[card.from]} into ${card.toLabel || 'per ' + UNIT_NAMES[card.to]}. Right now you have ${chain.label}.`,
    };
  }
  const value = card.op === 'divide' ? chain.value / card.factor : chain.value * card.factor;
  return { ok: true, chain: { value, unit: card.to, label: card.resultLabel, steps: [...chain.steps, card] } };
}

export function formatBig(n) {
  if (!Number.isFinite(n)) return '—';
  const abs = Math.abs(n);
  const fmt = (x) => (x >= 100 ? Math.round(x).toString() : x.toFixed(1).replace(/\.0$/, ''));
  if (abs >= 1e9) return `${fmt(n / 1e9)} billion`;
  if (abs >= 1e6) return `${fmt(n / 1e6)} million`;
  if (abs >= 1e4) return Math.round(n).toLocaleString('en-US');
  if (abs >= 100) return Math.round(n).toLocaleString('en-US');
  return (Math.round(n * 10) / 10).toString();
}

export function withinRange(value, [lo, hi]) {
  return value >= lo && value <= hi;
}
