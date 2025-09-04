import {
  RedactionPluginConfig,
  RedactionCapability,
  RedactionState,
  RegisterMarqueeOnPageOptions,
  RedactionItem,
  SelectedRedaction,
} from './types';
import {
  BasePlugin,
  createBehaviorEmitter,
  PluginRegistry,
  refreshDocument,
  refreshPages,
  Unsubscribe,
} from '@embedpdf/core';
import {
  ignore,
  PdfEngine,
  PdfErrorCode,
  PdfErrorReason,
  PdfTask,
  PdfTaskHelper,
  Rect,
  Task,
  uuidV4,
} from '@embedpdf/models';
import {
  FormattedSelection,
  SelectionCapability,
  SelectionPlugin,
} from '@embedpdf/plugin-selection';
import {
  InteractionManagerCapability,
  InteractionManagerPlugin,
} from '@embedpdf/plugin-interaction-manager';
import {
  addPending,
  clearPending,
  deselectPending,
  endRedaction,
  removePending,
  selectPending,
  startRedaction,
} from './actions';
import { createMarqueeHandler } from './handlers';

export class RedactionPlugin extends BasePlugin<
  RedactionPluginConfig,
  RedactionCapability,
  RedactionState
> {
  static readonly id = 'redaction' as const;
  private config: RedactionPluginConfig;

  private selectionCapability: SelectionCapability | undefined;
  private interactionManagerCapability: InteractionManagerCapability | undefined;

  private readonly redactionSelection$ = createBehaviorEmitter<FormattedSelection[]>();
  private readonly pending$ = createBehaviorEmitter<Record<number, RedactionItem[]>>();
  private readonly selected$ = createBehaviorEmitter<SelectedRedaction | null>();

  private readonly unsubscribeSelectionChange: Unsubscribe | undefined;
  private readonly unsubscribeEndSelection: Unsubscribe | undefined;
  private readonly unsubscribeModeChange: Unsubscribe | undefined;

  constructor(id: string, registry: PluginRegistry, config: RedactionPluginConfig) {
    super(id, registry);
    this.config = config;

    this.selectionCapability = this.registry.getPlugin<SelectionPlugin>('selection')?.provides();
    this.interactionManagerCapability = this.registry
      .getPlugin<InteractionManagerPlugin>('interaction-manager')
      ?.provides();

    if (this.interactionManagerCapability) {
      this.interactionManagerCapability.registerMode({
        id: 'marqueeRedact',
        scope: 'page',
        exclusive: true,
        cursor: 'crosshair',
      });
    }

    if (this.interactionManagerCapability && this.selectionCapability) {
      this.interactionManagerCapability.registerMode({
        id: 'redactSelection',
        scope: 'page',
        exclusive: false,
      });
      this.selectionCapability.enableForMode('redactSelection');
    }

    this.unsubscribeModeChange = this.interactionManagerCapability?.onModeChange((state) => {
      if (state.activeMode === 'redactSelection' || state.activeMode === 'marqueeRedact')
        this.dispatch(startRedaction());
      else this.dispatch(endRedaction());
    });

    this.unsubscribeSelectionChange = this.selectionCapability?.onSelectionChange(() => {
      if (!this.selectionCapability) return;
      if (!this.state.isRedacting) return;
      const formattedSelection = this.selectionCapability.getFormattedSelection();
      this.redactionSelection$.emit(formattedSelection);
    });

    this.unsubscribeEndSelection = this.selectionCapability?.onEndSelection(() => {
      if (!this.selectionCapability) return;
      if (!this.state.isRedacting) return;

      const formattedSelection = this.selectionCapability.getFormattedSelection();

      const items: RedactionItem[] = formattedSelection.map((s) => ({
        id: uuidV4(),
        kind: 'text',
        page: s.pageIndex,
        boundingRect: s.rect,
        rects: s.segmentRects,
      }));

      this.dispatch(addPending(items));
      this.redactionSelection$.emit([]);
      this.selectionCapability.clear();
      this.pending$.emit(this.state.pending);
      if (items.length) {
        this.selectPending(items[items.length - 1].page, items[items.length - 1].id);
      }
    });
  }

  async initialize(_config: RedactionPluginConfig): Promise<void> {}

  protected buildCapability(): RedactionCapability {
    return {
      onRedactionSelectionChange: this.redactionSelection$.on,

      queueCurrentSelectionAsPending: () => this.queueCurrentSelectionAsPending(),

      enableMarqueeRedact: () => this.enableMarqueeRedact(),
      toggleMarqueeRedact: () => this.toggleMarqueeRedact(),
      isMarqueeRedactActive: () =>
        this.interactionManagerCapability?.getActiveMode() === 'marqueeRedact',

      enableRedactSelection: () => this.enableRedactSelection(),
      toggleRedactSelection: () => this.toggleRedactSelection(),
      isRedactSelectionActive: () =>
        this.interactionManagerCapability?.getActiveMode() === 'redactSelection',

      onPendingChange: this.pending$.on,
      removePending: (page, id) => {
        this.dispatch(removePending(page, id));
        this.pending$.emit(this.state.pending);
      },
      clearPending: () => {
        this.dispatch(clearPending());
        this.pending$.emit(this.state.pending);
      },
      commitAllPending: () => this.commitAllPending(),
      commitPending: (page, id) => this.commitPendingOne(page, id),

      endRedaction: () => this.endRedaction(),
      startRedaction: () => this.startRedaction(),

      onSelectionChange: this.selected$.on,
      selectPending: (page, id) => this.selectPending(page, id),
      deselectPending: () => this.deselectPending(),

      registerMarqueeOnPage: (opts) => this.registerMarqueeOnPage(opts),
    };
  }

  private selectPending(page: number, id: string) {
    this.dispatch(selectPending(page, id));
    this.selectionCapability?.clear();
    this.selected$.emit(this.state.selected);
  }
  private deselectPending() {
    this.dispatch(deselectPending());
    this.selected$.emit(this.state.selected);
  }

  private enableRedactSelection() {
    this.interactionManagerCapability?.activate('redactSelection');
  }
  private toggleRedactSelection() {
    if (this.interactionManagerCapability?.getActiveMode() === 'redactSelection')
      this.interactionManagerCapability?.activateDefaultMode();
    else this.interactionManagerCapability?.activate('redactSelection');
  }

  private enableMarqueeRedact() {
    this.interactionManagerCapability?.activate('marqueeRedact');
  }
  private toggleMarqueeRedact() {
    if (this.interactionManagerCapability?.getActiveMode() === 'marqueeRedact')
      this.interactionManagerCapability?.activateDefaultMode();
    else this.interactionManagerCapability?.activate('marqueeRedact');
  }

  private startRedaction() {
    this.interactionManagerCapability?.activate('redactSelection');
  }
  private endRedaction() {
    this.interactionManagerCapability?.activateDefaultMode();
  }

  public registerMarqueeOnPage(opts: RegisterMarqueeOnPageOptions) {
    if (!this.interactionManagerCapability) {
      this.logger.warn(
        'RedactionPlugin',
        'MissingDependency',
        'Interaction manager plugin not loaded, marquee redaction disabled',
      );
      return () => {};
    }

    const document = this.coreState.core.document;
    if (!document) {
      this.logger.warn('RedactionPlugin', 'DocumentNotFound', 'Document not found');
      return () => {};
    }

    const page = document.pages[opts.pageIndex];
    if (!page) {
      this.logger.warn('RedactionPlugin', 'PageNotFound', `Page ${opts.pageIndex} not found`);
      return () => {};
    }

    const handlers = createMarqueeHandler({
      pageSize: page.size,
      scale: opts.scale,
      onPreview: opts.callback.onPreview,
      onCommit: (r) => {
        const item: RedactionItem = {
          id: uuidV4(),
          kind: 'area',
          page: opts.pageIndex,
          rect: r,
        };
        this.dispatch(addPending([item]));
        this.pending$.emit(this.state.pending);
        opts.callback.onCommit?.(r);
        this.enableRedactSelection();
        this.selectPending(opts.pageIndex, item.id);
      },
    });

    const off = this.interactionManagerCapability.registerAlways({
      handlers: {
        onPointerDown: (_, evt) => {
          if (evt.target === evt.currentTarget) {
            this.deselectPending();
          }
        },
      },
      scope: {
        type: 'page',
        pageIndex: opts.pageIndex,
      },
    });

    const off2 = this.interactionManagerCapability.registerHandlers({
      modeId: 'marqueeRedact',
      handlers,
      pageIndex: opts.pageIndex,
    });

    return () => {
      off();
      off2();
    };
  }

  private queueCurrentSelectionAsPending(): Task<boolean, PdfErrorReason> {
    if (!this.selectionCapability)
      return PdfTaskHelper.reject({
        code: PdfErrorCode.NotFound,
        message: '[RedactionPlugin] selection plugin required',
      });

    const doc = this.coreState.core.document;
    if (!doc)
      return PdfTaskHelper.reject({ code: PdfErrorCode.NotFound, message: 'Document not found' });

    const formatted = this.selectionCapability.getFormattedSelection();
    if (!formatted.length) return PdfTaskHelper.resolve(true);

    const id = uuidV4();

    const items: RedactionItem[] = formatted.map((s) => ({
      id,
      kind: 'text',
      page: s.pageIndex,
      boundingRect: s.rect,
      rects: s.segmentRects,
    }));

    this.enableRedactSelection();
    this.dispatch(addPending(items));
    this.pending$.emit(this.state.pending);
    // optional: auto-select the last one added
    const last = items[items.length - 1];
    this.selectPending(last.page, last.id);

    // clear live UI selection
    this.redactionSelection$.emit([]);
    this.selectionCapability?.clear();

    return PdfTaskHelper.resolve(true);
  }

  private commitPendingOne(page: number, id: string): Task<boolean, PdfErrorReason> {
    const doc = this.coreState.core.document;
    if (!doc)
      return PdfTaskHelper.reject({ code: PdfErrorCode.NotFound, message: 'Document not found' });

    const item = (this.state.pending[page] ?? []).find((it) => it.id === id);
    if (!item) return PdfTaskHelper.resolve(true);

    const rects: Rect[] = item.kind === 'text' ? item.rects : [item.rect];
    const pdfPage = doc.pages[page];
    if (!pdfPage)
      return PdfTaskHelper.reject({ code: PdfErrorCode.NotFound, message: 'Page not found' });

    const task = new Task<boolean, PdfErrorReason>();
    this.engine
      .redactTextInRects(doc, pdfPage, rects, {
        drawBlackBoxes: this.config.drawBlackBoxes,
      })
      .wait(
        () => {
          this.dispatch(removePending(page, id));
          this.pending$.emit(this.state.pending);
          this.dispatchCoreAction(refreshPages([page]));
          task.resolve(true);
        },
        () => task.reject({ code: PdfErrorCode.Unknown, message: 'Failed to commit redactions' }),
      );

    return task;
  }

  private commitAllPending(): Task<boolean, PdfErrorReason> {
    const doc = this.coreState.core.document;
    if (!doc)
      return PdfTaskHelper.reject({ code: PdfErrorCode.NotFound, message: 'Document not found' });

    // group rects per page
    const perPage = new Map<number, Rect[]>();
    for (const [page, items] of Object.entries(this.state.pending)) {
      const p = Number(page);
      const list = perPage.get(p) ?? [];
      for (const it of items) {
        if (it.kind === 'text') list.push(...it.rects);
        else list.push(it.rect);
      }
      perPage.set(p, list);
    }

    const pagesToRefresh = Array.from(perPage.entries())
      .filter(([_, rects]) => rects.length > 0)
      .map(([pageIndex]) => pageIndex);

    const tasks: PdfTask<boolean>[] = [];
    for (const [pageIndex, rects] of perPage) {
      const page = doc.pages[pageIndex];
      if (!page) continue;
      if (!rects.length) continue;
      tasks.push(
        this.engine.redactTextInRects(doc, page, rects, {
          drawBlackBoxes: this.config.drawBlackBoxes,
        }),
      );
    }

    const task = new Task<boolean, PdfErrorReason>();
    Task.all(tasks).wait(
      () => {
        this.dispatch(clearPending());
        this.dispatchCoreAction(refreshPages(pagesToRefresh));
        this.pending$.emit(this.state.pending);
        task.resolve(true);
      },
      () => task.reject({ code: PdfErrorCode.Unknown, message: 'Failed to commit redactions' }),
    );

    return task;
  }

  override onStoreUpdated(_: RedactionState, newState: RedactionState): void {
    // keep external listeners in sync
    this.pending$.emit(newState.pending);
    this.selected$.emit(newState.selected);
  }

  async destroy(): Promise<void> {
    this.redactionSelection$.clear();
    this.pending$.clear();

    this.unsubscribeSelectionChange?.();
    this.unsubscribeEndSelection?.();
    this.unsubscribeModeChange?.();

    await super.destroy();
  }
}
