import { Reducer } from '@embedpdf/core';
import {
  ACTIVATE_MODE,
  SET_DEFAULT_MODE,
  InteractionManagerAction,
  PAUSE_INTERACTION,
  RESUME_INTERACTION,
  SET_CURSOR,
} from './actions';
import { InteractionManagerState } from './types';

export const initialState: InteractionManagerState = {
  activeMode: 'pointerMode',
  defaultMode: 'pointerMode',
  cursor: 'auto',
  paused: false,
};

export const reducer: Reducer<InteractionManagerState, InteractionManagerAction> = (
  state,
  action,
) => {
  switch (action.type) {
    case ACTIVATE_MODE:
      return {
        ...state,
        activeMode: action.payload.mode,
      };
    case SET_CURSOR:
      return {
        ...state,
        cursor: action.payload.cursor,
      };
    case PAUSE_INTERACTION:
      return {
        ...state,
        paused: true,
      };
    case RESUME_INTERACTION:
      return {
        ...state,
        paused: false,
      };
    case SET_DEFAULT_MODE:
      return {
        ...state,
        defaultMode: action.payload.mode,
      };
    default:
      return state;
  }
};
