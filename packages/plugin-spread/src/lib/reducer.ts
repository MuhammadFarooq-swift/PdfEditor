import { Reducer } from '@embedpdf/core';
import { SpreadState, SpreadMode } from './types';
import { SET_SPREAD_MODE, SetSpreadModeAction } from './actions';

export const initialState: SpreadState = {
  spreadMode: SpreadMode.None,
};

export const spreadReducer: Reducer<SpreadState, SetSpreadModeAction> = (
  state = initialState,
  action,
) => {
  switch (action.type) {
    case SET_SPREAD_MODE:
      return {
        ...state,
        spreadMode: action.payload,
      };
    default:
      return state;
  }
};
