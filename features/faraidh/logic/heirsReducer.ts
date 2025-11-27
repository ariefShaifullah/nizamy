
import type { HeirInputState } from '../../../types.ts';
import { Heir } from '../../../types.ts';
import { initialHeirsState } from '../constants.ts';

export type FaraidhAction =
  | { type: 'INCREMENT'; payload: Heir }
  | { type: 'DECREMENT'; payload: Heir }
  | { type: 'SET_COUNT'; payload: { heir: Heir; count: number } }
  | { type: 'RESET' }
  | { type: 'LOAD_STATE'; payload: HeirInputState };

// Heirs that represent a specific single biological position (cannot be > 1)
const SINGLE_HEIRS: Heir[] = [
  Heir.Husband, 
  Heir.Father, 
  Heir.Mother, 
  Heir.Grandfather, 
  Heir.PaternalGrandmother, 
  Heir.MaternalGrandmother
];

export function heirsReducer(state: HeirInputState, action: FaraidhAction): HeirInputState {
  switch (action.type) {
    case 'INCREMENT': {
        const heir = action.payload;
        const newState = { ...state };
        
        // Logic for spouse: Husband and Wife are mutually exclusive.
        if(heir === Heir.Husband && newState[Heir.Wife] > 0) newState[Heir.Wife] = 0;
        if(heir === Heir.Wife && newState[Heir.Husband] > 0) newState[Heir.Husband] = 0;

        if (heir === Heir.Wife) {
          // In Islam, a man can have up to 4 wives.
          newState[heir] = Math.min(state[heir] + 1, 4);
        } else if (SINGLE_HEIRS.includes(heir)) {
          // Strict limit of 1 for single heirs
          newState[heir] = Math.min(state[heir] + 1, 1);
        } else {
          // Other heirs (Children, Siblings) have no strict theoretical limit
          newState[heir] = state[heir] + 1;
        }
        return newState;
    }
    case 'DECREMENT': {
        const heir = action.payload;
        return {
            ...state,
            [heir]: Math.max(0, state[heir] - 1),
        };
    }
    case 'SET_COUNT': {
        let { heir, count } = action.payload;
        
        // 1. Basic Sanity Check
        count = Math.max(0, count);

        // 2. Apply Max Limits
        if (heir === Heir.Wife) {
            count = Math.min(count, 4);
        } else if (SINGLE_HEIRS.includes(heir)) {
            count = Math.min(count, 1);
        }

        const newState = {
            ...state,
            [heir]: count,
        };

        // 3. Apply Mutual Exclusivity (Spouse)
        if (count > 0) {
            if (heir === Heir.Husband) newState[Heir.Wife] = 0;
            if (heir === Heir.Wife) newState[Heir.Husband] = 0;
        }

        return newState;
    }
    case 'RESET': {
      return initialHeirsState;
    }
    case 'LOAD_STATE':
        return action.payload;
    default:
      return state;
  }
}
