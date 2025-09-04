import { SpreadMode } from './types';

export const SET_SPREAD_MODE = 'SET_SPREAD_MODE';

export interface SetSpreadModeAction {
  type: typeof SET_SPREAD_MODE;
  payload: SpreadMode;
}

export type SpreadAction = SetSpreadModeAction;

export function setSpreadMode(mode: SpreadMode): SetSpreadModeAction {
  return {
    type: SET_SPREAD_MODE,
    payload: mode,
  };
}
