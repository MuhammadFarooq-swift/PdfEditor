import {
  BasePlugin,
  CoreState,
  createBehaviorEmitter,
  createEmitter,
  PluginRegistry,
  REFRESH_PAGES,
  SET_DOCUMENT,
  StoreState,
  Unsubscribe,
} from '@embedpdf/core';
import { ThumbMeta, ThumbnailPluginConfig, WindowState } from './types';
import { ThumbnailCapability } from './types';
import { ignore, PdfErrorReason, Task } from '@embedpdf/models';
import { RenderCapability, RenderPlugin } from '@embedpdf/plugin-render';

export class ThumbnailPlugin extends BasePlugin<ThumbnailPluginConfig, ThumbnailCapability> {
  static readonly id = 'thumbnail' as const;

  private renderCapability: RenderCapability;
  private thumbs: ThumbMeta[] = [];
  private window: WindowState | null = null;
  private readonly emitWindow = createBehaviorEmitter<WindowState>();
  private readonly refreshPages$ = createEmitter<number[]>();
  private readonly taskCache = new Map<number, Task<Blob, PdfErrorReason>>();

  constructor(
    id: string,
    registry: PluginRegistry,
    private cfg: ThumbnailPluginConfig,
  ) {
    super(id, registry);

    this.renderCapability = this.registry.getPlugin<RenderPlugin>('render')!.provides();

    this.coreStore.onAction(SET_DOCUMENT, (_action, state) => {
      this.taskCache.clear();
      this.setWindowState(state);
    });

    this.coreStore.onAction(REFRESH_PAGES, (action) => {
      this.refreshPages$.emit(action.payload);
      for (const pageIdx of action.payload) {
        this.taskCache.delete(pageIdx);
      }
    });
  }

  /* ------------ init ------------------------------------------------ */
  async initialize(): Promise<void> {}

  public onRefreshPages(fn: (pages: number[]) => void): Unsubscribe {
    return this.refreshPages$.on(fn);
  }

  private setWindowState(state: StoreState<CoreState>) {
    const core = state.core;

    if (!core.document) return;

    const W = this.cfg.width ?? 120;
    const L = this.cfg.labelHeight ?? 16; // label
    const GAP = this.cfg.gap ?? 8;

    let offset = 0;
    this.thumbs = core.document.pages.map((p) => {
      const ratio = p.size.height / p.size.width;
      const thumbH = Math.round(W * ratio);
      const wrapH = thumbH + L; // no GAP here

      const meta: ThumbMeta = {
        pageIndex: p.index,
        width: W,
        height: thumbH,
        wrapperHeight: wrapH,
        top: offset,
        labelHeight: L,
      };
      offset += wrapH + GAP; // GAP added *after* wrapper
      return meta;
    });

    this.window = {
      start: -1,
      end: -1,
      items: [],
      totalHeight: offset - GAP, // last item has no gap below
    };
    this.emitWindow.emit(this.window);
  }

  /* ------------ capability ----------------------------------------- */
  protected buildCapability(): ThumbnailCapability {
    return {
      onWindow: this.emitWindow.on,
      setViewport: (y, h) => this.updateWindow(y, h),
      renderThumb: (idx, dpr) => this.renderThumb(idx, dpr),
    };
  }

  /* ------------ windowing math ------------------------------------- */
  private updateWindow(scrollY: number, viewportH: number) {
    const BUF = this.cfg.buffer ?? 3;

    /* -------- find first visible wrapper ---------- */
    let low = 0,
      high = this.thumbs.length - 1,
      first = 0;
    while (low <= high) {
      const mid = (low + high) >> 1;
      const m = this.thumbs[mid];
      if (m.top + m.wrapperHeight < scrollY) low = mid + 1;
      else {
        first = mid;
        high = mid - 1;
      }
    }

    /* -------- find last visible + buffer ---------- */
    let last = first;
    const limit = scrollY + viewportH;
    while (last + 1 < this.thumbs.length && this.thumbs[last].top < limit) last++;
    last = Math.min(this.thumbs.length - 1, last + BUF);

    const start = Math.max(0, first - BUF);
    if (this.window && start === this.window.start && last === this.window.end) return;

    this.window = {
      start,
      end: last,
      items: this.thumbs.slice(start, last + 1),
      totalHeight: this.window!.totalHeight,
    };
    this.emitWindow.emit(this.window);
  }

  /* ------------ thumbnail raster ----------------------------------- */
  private renderThumb(idx: number, dpr: number) {
    if (this.taskCache.has(idx)) return this.taskCache.get(idx)!;

    const core = this.coreState.core;
    const page = core.document!.pages[idx];
    const scale = (this.cfg.width ?? 120) / page.size.width;

    const task = this.renderCapability.renderPageRect({
      pageIndex: idx,
      rect: { origin: { x: 0, y: 0 }, size: page.size },
      options: {
        scaleFactor: scale,
        dpr,
      },
    });

    this.taskCache.set(idx, task);

    task.wait(ignore, () => {
      this.taskCache.delete(idx);
    });

    return task;
  }
}
