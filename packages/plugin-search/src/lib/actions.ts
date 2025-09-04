import { Action } from '@embedpdf/core';
import { MatchFlag, SearchResult } from '@embedpdf/models';

// Action Types
export const START_SEARCH_SESSION = 'START_SEARCH_SESSION';
export const STOP_SEARCH_SESSION = 'STOP_SEARCH_SESSION';
export const SET_SEARCH_FLAGS = 'SET_SEARCH_FLAGS';
export const SET_SHOW_ALL_RESULTS = 'SET_SHOW_ALL_RESULTS';
export const START_SEARCH = 'START_SEARCH';
export const SET_SEARCH_RESULTS = 'SET_SEARCH_RESULTS';
export const APPEND_SEARCH_RESULTS = 'APPEND_SEARCH_RESULTS';
export const SET_ACTIVE_RESULT_INDEX = 'SET_ACTIVE_RESULT_INDEX';

// Action Interfaces
export interface StartSearchSessionAction extends Action {
  type: typeof START_SEARCH_SESSION;
}

export interface StopSearchSessionAction extends Action {
  type: typeof STOP_SEARCH_SESSION;
}

export interface SetSearchFlagsAction extends Action {
  type: typeof SET_SEARCH_FLAGS;
  payload: MatchFlag[];
}

export interface SetShowAllResultsAction extends Action {
  type: typeof SET_SHOW_ALL_RESULTS;
  payload: boolean;
}

export interface StartSearchAction extends Action {
  type: typeof START_SEARCH;
  payload: string;
}

export interface SetSearchResultsAction extends Action {
  type: typeof SET_SEARCH_RESULTS;
  payload: {
    results: SearchResult[];
    total: number;
    activeResultIndex: number;
  };
}

export interface AppendSearchResultsAction extends Action {
  type: typeof APPEND_SEARCH_RESULTS;
  payload: {
    results: SearchResult[];
  };
}

export interface SetActiveResultIndexAction extends Action {
  type: typeof SET_ACTIVE_RESULT_INDEX;
  payload: number;
}

// Union Type for All Actions
export type SearchAction =
  | StartSearchSessionAction
  | StopSearchSessionAction
  | SetSearchFlagsAction
  | SetShowAllResultsAction
  | StartSearchAction
  | SetSearchResultsAction
  | AppendSearchResultsAction
  | SetActiveResultIndexAction;

// Action Creators
export function startSearchSession(): StartSearchSessionAction {
  return { type: START_SEARCH_SESSION };
}

export function stopSearchSession(): StopSearchSessionAction {
  return { type: STOP_SEARCH_SESSION };
}

export function setSearchFlags(flags: MatchFlag[]): SetSearchFlagsAction {
  return { type: SET_SEARCH_FLAGS, payload: flags };
}

export function setShowAllResults(showAll: boolean): SetShowAllResultsAction {
  return { type: SET_SHOW_ALL_RESULTS, payload: showAll };
}

export function startSearch(query: string): StartSearchAction {
  return { type: START_SEARCH, payload: query };
}

export function setSearchResults(
  results: SearchResult[],
  total: number,
  activeResultIndex: number,
): SetSearchResultsAction {
  return { type: SET_SEARCH_RESULTS, payload: { results, total, activeResultIndex } };
}

export function appendSearchResults(results: SearchResult[]): AppendSearchResultsAction {
  return { type: APPEND_SEARCH_RESULTS, payload: { results } };
}

export function setActiveResultIndex(index: number): SetActiveResultIndexAction {
  return { type: SET_ACTIVE_RESULT_INDEX, payload: index };
}
