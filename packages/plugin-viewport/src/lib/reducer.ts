import { Reducer } from '@embedpdf/core';

import {
  SET_VIEWPORT_METRICS,
  SET_VIEWPORT_SCROLL_METRICS,
  SET_VIEWPORT_GAP,
  ViewportAction,
  SET_SCROLL_ACTIVITY,
  SET_SMOOTH_SCROLL_ACTIVITY,
} from './actions';
import { ViewportState } from './types';

export const initialState: ViewportState = {
  viewportGap: 0,
  viewportMetrics: {
    width: 0,
    height: 0,
    scrollTop: 0,
    scrollLeft: 0,
    clientWidth: 0,
    clientHeight: 0,
    scrollWidth: 0,
    scrollHeight: 0,
    relativePosition: {
      x: 0,
      y: 0,
    },
  },
  isScrolling: false,
  isSmoothScrolling: false,
};

export const viewportReducer: Reducer<ViewportState, ViewportAction> = (
  state = initialState,
  action,
) => {
  switch (action.type) {
    case SET_VIEWPORT_GAP:
      return { ...state, viewportGap: action.payload };
    case SET_VIEWPORT_METRICS:
      return {
        ...state,
        viewportMetrics: {
          width: action.payload.width,
          height: action.payload.height,
          scrollTop: action.payload.scrollTop,
          scrollLeft: action.payload.scrollLeft,
          clientWidth: action.payload.clientWidth,
          clientHeight: action.payload.clientHeight,
          scrollWidth: action.payload.scrollWidth,
          scrollHeight: action.payload.scrollHeight,
          relativePosition: {
            x:
              action.payload.scrollWidth <= action.payload.clientWidth
                ? 0
                : action.payload.scrollLeft /
                  (action.payload.scrollWidth - action.payload.clientWidth),
            y:
              action.payload.scrollHeight <= action.payload.clientHeight
                ? 0
                : action.payload.scrollTop /
                  (action.payload.scrollHeight - action.payload.clientHeight),
          },
        },
      };
    case SET_VIEWPORT_SCROLL_METRICS:
      return {
        ...state,
        viewportMetrics: {
          ...state.viewportMetrics,
          scrollTop: action.payload.scrollTop,
          scrollLeft: action.payload.scrollLeft,
        },
        isScrolling: true,
      };
    case SET_SCROLL_ACTIVITY:
      return { ...state, isScrolling: action.payload };
    case SET_SMOOTH_SCROLL_ACTIVITY:
      return { ...state, isSmoothScrolling: action.payload };
    default:
      return state;
  }
};
