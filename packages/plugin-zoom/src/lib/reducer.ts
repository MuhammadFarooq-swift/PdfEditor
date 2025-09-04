import { Reducer } from '@embedpdf/core';

import { SET_INITIAL_ZOOM_LEVEL, SET_ZOOM_LEVEL, ZoomAction } from './actions';
import { ZoomState, ZoomMode } from './types';

export const initialState: ZoomState = {
  zoomLevel: ZoomMode.Automatic,
  currentZoomLevel: 1,
};

export const zoomReducer: Reducer<ZoomState, ZoomAction> = (state = initialState, action) => {
  switch (action.type) {
    case SET_ZOOM_LEVEL:
      return {
        ...state,
        zoomLevel: action.payload.zoomLevel,
        currentZoomLevel: action.payload.currentZoomLevel,
      };
    case SET_INITIAL_ZOOM_LEVEL:
      return {
        ...state,
        zoomLevel: action.payload.zoomLevel,
      };
    default:
      return state;
  }
};
