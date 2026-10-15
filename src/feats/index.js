import * as memory from './memory.js';
import * as tower from './tower.js';
import * as lightning from './lightning.js';
import * as cipher from './cipher.js';
import * as fermi from './fermi.js';

export const FEATS = { memory, tower, lightning, cipher, fermi };

export function levelsFor(id) {
  return FEATS[id].levels;
}
