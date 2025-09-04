import { BasePlugin, createBehaviorEmitter, PluginRegistry } from '@embedpdf/core';
import {
  MatchFlag,
  PdfDocumentObject,
  SearchAllPagesResult,
  PdfEngine,
  PdfTask,
  PdfPageSearchProgress,
  PdfTaskHelper,
} from '@embedpdf/models';
import { SearchPluginConfig, SearchCapability, SearchState, SearchResultState } from './types';
import { LoaderCapability, LoaderEvent, LoaderPlugin } from '@embedpdf/plugin-loader';
import {
  startSearchSession,
  stopSearchSession,
  setSearchFlags,
  setShowAllResults,
  startSearch,
  setSearchResults,
  setActiveResultIndex,
  appendSearchResults,
  SearchAction,
} from './actions';

export class SearchPlugin extends BasePlugin<
  SearchPluginConfig,
  SearchCapability,
  SearchState,
  SearchAction
> {
  static readonly id = 'search' as const;
  private loader: LoaderCapability;
  private currentDocument?: PdfDocumentObject;

  private readonly searchStop$ = createBehaviorEmitter();
  private readonly searchStart$ = createBehaviorEmitter();
  private readonly searchResult$ = createBehaviorEmitter<SearchAllPagesResult>();
  private readonly searchActiveResultChange$ = createBehaviorEmitter<number>();
  private readonly searchResultState$ = createBehaviorEmitter<SearchResultState>();
  private readonly searchState$ = createBehaviorEmitter<SearchState>();

  // keep reference to current running task (optional abort handling if your PdfTask supports it)
  private currentTask?: ReturnType<PdfEngine['searchAllPages']>;

  constructor(id: string, registry: PluginRegistry) {
    super(id, registry);
    this.loader = this.registry.getPlugin<LoaderPlugin>('loader')!.provides();

    this.loader.onDocumentLoaded(this.handleDocumentLoaded.bind(this));
    this.loader.onLoaderEvent(this.handleLoaderEvent.bind(this));
  }

  private handleDocumentLoaded(doc: PdfDocumentObject): void {
    this.currentDocument = doc;
    if (this.state.active) {
      this.startSearchSession();
    }
  }

  private handleLoaderEvent(event: LoaderEvent): void {
    if (event.type === 'error' || (event.type === 'start' && this.currentDocument)) {
      if (this.state.active) {
        this.stopSearchSession();
      }
      this.currentDocument = undefined;
    }
  }

  async initialize(config: SearchPluginConfig): Promise<void> {
    this.dispatch(setSearchFlags(config.flags || []));
    this.dispatch(
      setShowAllResults(config.showAllResults !== undefined ? config.showAllResults : true),
    );
  }

  override onStoreUpdated(_prevState: SearchState, newState: SearchState): void {
    this.searchResultState$.emit({
      results: newState.results,
      activeResultIndex: newState.activeResultIndex,
      showAllResults: newState.showAllResults,
      active: newState.active,
    });
    this.searchState$.emit(newState);
  }

  protected buildCapability(): SearchCapability {
    return {
      startSearch: this.startSearchSession.bind(this),
      stopSearch: this.stopSearchSession.bind(this),
      searchAllPages: this.searchAllPages.bind(this),
      nextResult: this.nextResult.bind(this),
      previousResult: this.previousResult.bind(this),
      goToResult: this.goToResult.bind(this),
      setShowAllResults: (showAll) => this.dispatch(setShowAllResults(showAll)),
      getShowAllResults: () => this.state.showAllResults,
      onSearchResult: this.searchResult$.on,
      onSearchStart: this.searchStart$.on,
      onSearchStop: this.searchStop$.on,
      onActiveResultChange: this.searchActiveResultChange$.on,
      onSearchResultStateChange: this.searchResultState$.on,
      onStateChange: this.searchState$.on,
      getFlags: () => this.state.flags,
      setFlags: (flags) => this.setFlags(flags),
      getState: () => this.state,
    };
  }

  private setFlags(flags: MatchFlag[]): void {
    this.dispatch(setSearchFlags(flags));
    if (this.state.active) {
      this.searchAllPages(this.state.query, true);
    }
  }

  private notifySearchStart(): void {
    this.searchStart$.emit();
  }

  private notifySearchStop(): void {
    this.searchStop$.emit();
  }

  private notifyActiveResultChange(index: number): void {
    this.searchActiveResultChange$.emit(index);
  }

  private startSearchSession(): void {
    if (!this.currentDocument) return;
    this.dispatch(startSearchSession());
    this.notifySearchStart();
  }

  private stopSearchSession(): void {
    if (!this.currentDocument || !this.state.active) return;
    // optional: abort current task if PdfTask supports it
    try {
      // @ts-expect-error: optional abort if available
      this.currentTask?.abort?.({ type: 'abort', code: 'cancelled', message: 'search stopped' });
    } catch {}
    this.currentTask = undefined;

    this.dispatch(stopSearchSession());
    this.notifySearchStop();
  }

  private searchAllPages(
    keyword: string,
    force: boolean = false,
  ): PdfTask<SearchAllPagesResult, PdfPageSearchProgress> {
    const trimmedKeyword = keyword.trim();

    if (this.state.query === trimmedKeyword && !force) {
      return PdfTaskHelper.resolve<SearchAllPagesResult, PdfPageSearchProgress>({
        results: this.state.results,
        total: this.state.total,
      });
    }

    // stop previous task if still running
    if (this.currentTask) {
      try {
        // @ts-expect-error: optional abort if available
        this.currentTask.abort?.({ type: 'abort', code: 'superseded', message: 'new search' });
      } catch {}
      this.currentTask = undefined;
    }

    this.dispatch(startSearch(trimmedKeyword));

    if (!trimmedKeyword || !this.currentDocument) {
      this.dispatch(setSearchResults([], 0, -1));
      return PdfTaskHelper.resolve<SearchAllPagesResult, PdfPageSearchProgress>({
        results: [],
        total: 0,
      });
    }

    if (!this.state.active) {
      this.startSearchSession();
    }

    const task = (this.currentTask = this.engine.searchAllPages(
      this.currentDocument!,
      trimmedKeyword,
      { flags: this.state.flags },
    ));

    task.onProgress((p) => {
      if (p?.results?.length) {
        this.dispatch(appendSearchResults(p.results));
        // set first active result as soon as we have something
        if (this.state.activeResultIndex === -1) {
          this.dispatch(setActiveResultIndex(0));
          this.notifyActiveResultChange(0);
        }
      }
    });

    task.wait(
      (results) => {
        this.currentTask = undefined;
        const activeResultIndex = results.total > 0 ? 0 : -1;
        this.dispatch(setSearchResults(results.results, results.total, activeResultIndex));
        this.searchResult$.emit(results);
        if (results.total > 0) {
          this.notifyActiveResultChange(0);
        }
      },
      (error) => {
        this.currentTask = undefined;
        console.error('Error during search:', error);
        this.dispatch(setSearchResults([], 0, -1));
      },
    );

    return task;
  }

  private nextResult(): number {
    if (this.state.results.length === 0) return -1;
    const nextIndex =
      this.state.activeResultIndex >= this.state.results.length - 1
        ? 0
        : this.state.activeResultIndex + 1;
    return this.goToResult(nextIndex);
  }

  private previousResult(): number {
    if (this.state.results.length === 0) return -1;
    const prevIndex =
      this.state.activeResultIndex <= 0
        ? this.state.results.length - 1
        : this.state.activeResultIndex - 1;
    return this.goToResult(prevIndex);
  }

  private goToResult(index: number): number {
    if (this.state.results.length === 0 || index < 0 || index >= this.state.results.length) {
      return -1;
    }
    this.dispatch(setActiveResultIndex(index));
    this.notifyActiveResultChange(index);
    return index;
  }

  async destroy(): Promise<void> {
    if (this.state.active && this.currentDocument) {
      this.stopSearchSession();
    }
    this.searchResult$.clear();
    this.searchStart$.clear();
    this.searchStop$.clear();
    this.searchActiveResultChange$.clear();
    this.searchResultState$.clear();
    this.searchState$.clear();
  }
}
