import type { ZakatState } from "../types.ts";

export const initialZakatState: ZakatState = {
  fitrahPeople: 0,
  fitrahMethod: "money",
  cash: 0,
  savings: 0,
  investments: 0,
  otherAssets: 0,
  debts: 0,
  rikazValue: 0,
  goldWeight: 0,
  silverWeight: 0,
  bizAssets: 0,
  bizInventory: 0,
  bizLiabilities: 0,
  agriHarvest: 0,
  agriMethod: "natural",
  livestockValue: 0,
};

export type ZakatAction =
  | { type: "SET_VALUE"; payload: { key: keyof ZakatState; value: any } }
  | { type: "RESET" }
  | { type: "LOAD_STATE"; payload: ZakatState };

export function zakatReducer(
  state: ZakatState,
  action: ZakatAction
): ZakatState {
  switch (action.type) {
    case "SET_VALUE":
      return { ...state, [action.payload.key]: action.payload.value };
    case "RESET":
      return initialZakatState;
    case "LOAD_STATE":
      return action.payload;
    default:
      return state;
  }
}
