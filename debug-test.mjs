
import { calculateFaraidh } from './src/features/faraidh/logic/faraidh.service.ts';
import { Heir } from './src/types.ts';
import { initialHeirsState } from './src/features/faraidh/constants.ts';

const state = { ...initialHeirsState, [Heir.FullSister]: 1, [Heir.PaternalAunt]: 1 };
const result = calculateFaraidh(state, 100_000_000);
console.log('=== Results ===');
for (const h of result.heirResults) {
  console.log(`${h.name} | blocked=${h.isBlocked} | value=${h.value} | pct=${h.percentage} | reason=${h.reason}`);
}
console.log('=== Notes ===');
for (const n of result.notes) {
  console.log(n);
}
