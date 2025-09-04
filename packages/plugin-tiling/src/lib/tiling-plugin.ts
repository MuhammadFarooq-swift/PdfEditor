import {
  BasePlugin,
  CoreState,
  createBehaviorEmitter,
  createEmitter,
  PluginRegistry,
  REFRESH_PAGES,
  StoreState,
  Unsubscribe,
} from '@embedpdf/core';
import { ignore } from '@embedpdf/models';
import { RenderCapability, RenderPlugin } from '@embedpdf/plugin-render';
import { ScrollCapability, ScrollMetrics, ScrollPlugin } from '@embedpdf/plugin-scroll';
import { ViewportCapability, ViewportPlugin } from '@embedpdf/plugin-viewport';

import { markTileStatus, updateVisibleTiles } from './actions';
import {
  TilingPluginConfig,
  TilingCapability,
  Tile,
  RenderTileOptions,
  TilingState,
} from './types';
import { calculateTilesForPage } from './utils';

export class TilingPlugin extends BasePlugin<TilingPluginConfig, TilingCapability> {
  static readonly id = 'tiling' as const;

  private readonly tileRendering$ = createBehaviorEmitter<Record<number, Tile[]>>();
  private readonly refreshPages$ = createEmitter<number[]>();

  private config: TilingPluginConfig;
  private renderCapability: RenderCapability;
  private scrollCapability: ScrollCapability;
  private viewportCapability: ViewportCapability;

  constructor(id: string, registry: PluginRegistry, config: TilingPluginConfig) {
    super(id, registry);

    this.config = config;

    this.renderCapability = this.registry.getPlugin<RenderPlugin>('render')!.provides();
    this.scrollCapability = this.registry.getPlugin<ScrollPlugin>('scroll')!.provides();
    this.viewportCapability = this.registry.getPlugin<ViewportPlugin>('viewport')!.provides();

    this.scrollCapability.onScroll((scrollMetrics) => this.calculateVisibleTiles(scrollMetrics), {
      mode: 'throttle',
      wait: 500,
      throttleMode: 'trailing',
    });

    this.coreStore.onAction(REFRESH_PAGES, (action) => {
      this.refreshPages$.emit(action.payload);
    });
  }

  async initialize(): Promise<void> {
    // Fetch dependencies from the registry if needed
  }

  protected onCoreStoreUpdated(
    oldState: StoreState<CoreState>,
    newState: StoreState<CoreState>,
  ): void {
    if (oldState.core.scale !== newState.core.scale) {
      this.calculateVisibleTiles(
        this.scrollCapability.getMetrics(this.viewportCapability.getMetrics()),
      );
    }
  }

  public onRefreshPages(fn: (pages: number[]) => void): Unsubscribe {
    return this.refreshPages$.on(fn);
  }

  private calculateVisibleTiles(scrollMetrics: ScrollMetrics): void {
    if (!this.config.enabled) {
      this.dispatch(updateVisibleTiles([]));
      return;
    }

    const scale = this.coreState.core.scale;
    const rotation = this.coreState.core.rotation;
    const visibleTiles: { [pageIndex: number]: Tile[] } = {};

    for (const scrollMetric of scrollMetrics.pageVisibilityMetrics) {
      const pageIndex = scrollMetric.pageNumber - 1; // Convert to 0-based index
      const page = this.coreState.core.document?.pages[pageIndex];
      if (!page) continue;

      // Calculate tiles for the page using the utility function
      const tiles = calculateTilesForPage({
        page,
        metric: scrollMetric,
        scale,
        rotation,
        tileSize: this.config.tileSize,
        overlapPx: this.config.overlapPx,
        extraRings: this.config.extraRings,
      });

      visibleTiles[pageIndex] = tiles;
    }

    this.dispatch(updateVisibleTiles(visibleTiles));
  }

  override onStoreUpdated(_prevState: TilingState, newState: TilingState): void {
    this.tileRendering$.emit(newState.visibleTiles);
  }

  protected buildCapability(): TilingCapability {
    return {
      renderTile: this.renderTile.bind(this),
      onTileRendering: this.tileRendering$.on,
    };
  }

  private renderTile(options: RenderTileOptions) {
    if (!this.renderCapability) {
      throw new Error('Render capability not available.');
    }

    this.dispatch(markTileStatus(options.pageIndex, options.tile.id, 'rendering'));

    const task = this.renderCapability.renderPageRect({
      pageIndex: options.pageIndex,
      rect: options.tile.pageRect,
      options: {
        scaleFactor: options.tile.srcScale,
        dpr: options.dpr,
      },
    });

    task.wait(() => {
      this.dispatch(markTileStatus(options.pageIndex, options.tile.id, 'ready'));
    }, ignore);

    return task;
  }
}
