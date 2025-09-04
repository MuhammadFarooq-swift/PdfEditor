import { Action } from '@embedpdf/core';

import { ViewportInputMetrics, ViewportScrollMetrics } from './types';

export const SET_VIEWPORT_METRICS = 'SET_VIEWPORT_METRICS';
export const SET_VIEWPORT_SCROLL_METRICS = 'SET_VIEWPORT_SCROLL_METRICS';
export const SET_VIEWPORT_GAP = 'SET_VIEWPORT_GAP';
export const SET_SCROLL_ACTIVITY = 'SET_SCROLL_ACTIVITY';
export const SET_SMOOTH_SCROLL_ACTIVITY = 'SET_SMOOTH_SCROLL_ACTIVITY';

export interface SetViewportMetricsAction extends Action {
  type: typeof SET_VIEWPORT_METRICS;
  payload: ViewportInputMetrics;
}

export interface SetViewportScrollMetricsAction extends Action {
  type: typeof SET_VIEWPORT_SCROLL_METRICS;
  payload: ViewportScrollMetrics;
}

export interface SetViewportGapAction extends Action {
  type: typeof SET_VIEWPORT_GAP;
  payload: number;
}

export interface SetScrollActivityAction extends Action {
  type: typeof SET_SCROLL_ACTIVITY;
  payload: boolean;
}

export interface SetSmoothScrollActivityAction extends Action {
  type: typeof SET_SMOOTH_SCROLL_ACTIVITY;
  payload: boolean;
}

export type ViewportAction =
  | SetViewportMetricsAction
  | SetViewportScrollMetricsAction
  | SetViewportGapAction
  | SetScrollActivityAction
  | SetSmoothScrollActivityAction;

export function setViewportGap(viewportGap: number): SetViewportGapAction {
  return {
    type: SET_VIEWPORT_GAP,
    payload: viewportGap,
  };
}

export function setViewportMetrics(
  viewportMetrics: ViewportInputMetrics,
): SetViewportMetricsAction {
  return {
    type: SET_VIEWPORT_METRICS,
    payload: viewportMetrics,
  };
}

export function setViewportScrollMetrics(
  scrollMetrics: ViewportScrollMetrics,
): SetViewportScrollMetricsAction {
  return {
    type: SET_VIEWPORT_SCROLL_METRICS,
    payload: scrollMetrics,
  };
}

export function setScrollActivity(isScrolling: boolean): SetScrollActivityAction {
  return { type: SET_SCROLL_ACTIVITY, payload: isScrolling };
}

export function setSmoothScrollActivity(isSmoothScrolling: boolean): SetSmoothScrollActivityAction {
  return { type: SET_SMOOTH_SCROLL_ACTIVITY, payload: isSmoothScrolling };
}
