
import type { HeirInputState } from '../types.ts';
import { Heir } from '../types.ts';
import { initialHeirsState } from '../constants.ts';

type Action =
  | { type: 'INCREMENT'; payload: Heir }
  | { type: 'DECREMENT'; payload: Heir }
  | { type: 'SET_COUNT'; payload: { heir: Heir; count: number } }
  | { type: 'RESET' }
  | { type: 'LOAD_STATE'; payload: HeirInputState };

export function heirsReducer(state: HeirInputState, action: Action): HeirInputState {
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
        } else {
          // Heirs that can only be one person.
          const singleHeirs: Heir[] = [Heir.Husband, Heir.Father, Heir.Mother, Heir.Grandfather, Heir.PaternalGrandmother, Heir.MaternalGrandmother];
          if (singleHeirs.includes(heir)) {
               newState[heir] = Math.min(state[heir] + 1, 1);
          } else {
               newState[heir] = state[heir] + 1;
          }
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
        const { heir, count } = action.payload;
        return {
            ...state,
            [heir]: Math.max(0, count),
        };
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