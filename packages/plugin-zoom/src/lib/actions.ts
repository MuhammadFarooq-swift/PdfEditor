import { Action } from '@embedpdf/core';

import { ZoomLevel } from './types';

// Action Types
export const SET_ZOOM_LEVEL = 'SET_ZOOM_LEVEL';
export const SET_INITIAL_ZOOM_LEVEL = 'SET_INITIAL_ZOOM_LEVEL';

// Action Interfaces
export interface SetZoomLevelAction extends Action {
  type: typeof SET_ZOOM_LEVEL;
  payload: {
    zoomLevel: ZoomLevel;
    currentZoomLevel: number;
  };
}

export interface SetInitialZoomLevelAction extends Action {
  type: typeof SET_INITIAL_ZOOM_LEVEL;
  payload: {
    zoomLevel: ZoomLevel;
  };
}

// Union Type for All Actions
export type ZoomAction = SetZoomLevelAction | SetInitialZoomLevelAction;

// Action Creators
export function setZoomLevel(zoomLevel: ZoomLevel, currentZoomLevel: number): SetZoomLevelAction {
  return {
    type: SET_ZOOM_LEVEL,
    payload: { zoomLevel, currentZoomLevel },
  };
}

export function setInitialZoomLevel(zoomLevel: ZoomLevel): SetInitialZoomLevelAction {
  return {
    type: SET_INITIAL_ZOOM_LEVEL,
    payload: { zoomLevel },
  };
}
