import { BasePluginConfig, EventHook } from '@embedpdf/core';
import {
  MatchFlag,
  SearchResult,
  SearchTarget,
  SearchAllPagesResult,
  PdfTask,
  PdfPageSearchProgress,
} from '@embedpdf/models';

export interface SearchPluginConfig extends BasePluginConfig {
  flags?: MatchFlag[];
  /**
   * Whether to show all search results or only the active one
   * @default true
   */
  showAllResults?: boolean;
}

export interface SearchResultState {
  /**
   * Current search results from last search operation
   */
  results: SearchResult[];
  /**
   * Current active result index (0-based)
   */
  activeResultIndex: number;
  /**
   * Whether to show all search results or only the active one
   */
  showAllResults: boolean;
  /**
   * Whether search is currently active
   */
  active: boolean;
}

export interface SearchState {
  flags: MatchFlag[];
  /**
   * Current search results from last search operation
   */
  results: SearchResult[];
  /**
   * Total number of search results
   */
  total: number;
  /**
   * Current active result index (0-based)
   */
  activeResultIndex: number;
  /**
   * Whether to show all search results or only the active one
   */
  showAllResults: boolean;
  /**
   * Current search query
   */
  query: string;
  /**
   * Whether a search operation is in progress
   */
  loading: boolean;
  /**
   * Whether search is currently active
   */
  active: boolean;
}

export interface SearchCapability {
  /**
   * Start a search session
   */
  startSearch: () => void;

  /**
   * Stop the active search session
   */
  stopSearch: () => void;

  /**
   * Search for all occurrences of the keyword throughout the document
   * @param keyword - Text to search for
   * @returns Promise that resolves to all search results or empty result if none found
   */
  searchAllPages: (keyword: string) => PdfTask<SearchAllPagesResult, PdfPageSearchProgress>;

  /**
   * Navigate to the next search result
   * @returns The new active result index
   */
  nextResult: () => number;

  /**
   * Navigate to the previous search result
   * @returns The new active result index
   */
  previousResult: () => number;

  /**
   * Go to a specific search result by index
   * @param index - The index of the result to go to
   * @returns The new active result index
   */
  goToResult: (index: number) => number;

  /**
   * Toggle visibility of all search results
   * @param showAll - Whether to show all results or only the active one
   */
  setShowAllResults: (showAll: boolean) => void;

  /**
   * Get current state of search results visibility
   * @returns Whether all results are visible
   */
  getShowAllResults: () => boolean;

  /**
   * Subscribe to search results
   * @param handler - Handler function to receive search results
   * @returns Function to unsubscribe the handler
   */
  onSearchResult: EventHook<SearchAllPagesResult>;

  /**
   * Subscribe to search session start events
   * @param handler - Handler function called when search session starts
   * @returns Function to unsubscribe the handler
   */
  onSearchStart: EventHook;

  /**
   * Subscribe to search session stop events
   * @param handler - Handler function called when search session stops
   * @returns Function to unsubscribe the handler
   */
  onSearchStop: EventHook;

  /**
   * Subscribe to active result change events
   * @param handler - Handler function called when active result changes
   * @returns Function to unsubscribe the handler
   */
  onActiveResultChange: EventHook<number>;

  /**
   * Subscribe to search result state change events
   * @param handler - Handler function called when search state changes
   * @returns Function to unsubscribe the handler
   */
  onSearchResultStateChange: EventHook<SearchResultState>;

  /**
   * Get the current search flags
   * @returns Array of active search flags
   */
  getFlags: () => MatchFlag[];

  /**
   * Set the search flags
   * @param flags - Array of search flags to use
   */
  setFlags: (flags: MatchFlag[]) => void;

  /**
   * Subscribe to state change events
   * @param handler - Handler function called when state changes
   * @returns Function to unsubscribe the handler
   */
  onStateChange: EventHook<SearchState>;

  /**
   * Get the current search state
   * @returns The current search state
   */
  getState: () => SearchState;
}
