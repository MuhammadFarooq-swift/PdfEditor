import { BasePlugin, createBehaviorEmitter, PluginRegistry, SET_DOCUMENT } from '@embedpdf/core';
import {
  ignore,
  PdfAnnotationObject,
  PdfDocumentObject,
  PdfErrorReason,
  Task,
  PdfAnnotationSubtype,
  PdfTaskHelper,
  PdfErrorCode,
  PdfBlendMode,
  AnnotationCreateContext,
  uuidV4,
} from '@embedpdf/models';
import {
  ActiveTool,
  AnnotationCapability,
  AnnotationPluginConfig,
  AnnotationState,
  BaseAnnotationDefaults,
  GetPageAnnotationsOptions,
  RenderAnnotationOptions,
  ToolDefaultsByMode,
  TrackedAnnotation,
} from './types';
import {
  setAnnotations,
  selectAnnotation,
  deselectAnnotation,
  AnnotationAction,
  updateToolDefaults,
  addColorPreset,
  createAnnotation,
  patchAnnotation,
  deleteAnnotation,
  commitPendingChanges,
  purgeAnnotation,
  setActiveVariant,
} from './actions';
import {
  InteractionManagerCapability,
  InteractionManagerPlugin,
  InteractionMode,
} from '@embedpdf/plugin-interaction-manager';
import { SelectionPlugin, SelectionCapability } from '@embedpdf/plugin-selection';
import { HistoryPlugin, HistoryCapability, Command } from '@embedpdf/plugin-history';
import { getSelectedAnnotation, getToolDefaultsBySubtypeAndIntent } from './selectors';
import { parseVariantKey } from './variant-key';
import { deriveRect } from './patching';
import { isTextMarkupDefaults } from './helpers';

export class AnnotationPlugin extends BasePlugin<
  AnnotationPluginConfig,
  AnnotationCapability,
  AnnotationState,
  AnnotationAction
> {
  static readonly id = 'annotation' as const;

  private readonly ANNOTATION_HISTORY_TOPIC = 'annotations';

  public readonly config: AnnotationPluginConfig;

  private readonly state$ = createBehaviorEmitter<AnnotationState>();
  private readonly interactionManager: InteractionManagerCapability | null;
  private readonly selection: SelectionCapability | null;
  private readonly history: HistoryCapability | null;

  private readonly modeByVariant = new Map<string, string>();
  private readonly variantByMode = new Map<string, string>();
  private pendingContexts = new Map<string, unknown>();

  private readonly activeVariantChange$ = createBehaviorEmitter<string | null>();
  private readonly activeTool$ = createBehaviorEmitter<ActiveTool>({
    variantKey: null,
    defaults: null,
  });

  constructor(id: string, registry: PluginRegistry, config: AnnotationPluginConfig) {
    super(id, registry);
    this.config = config;

    const selection = registry.getPlugin<SelectionPlugin>('selection');
    this.selection = selection?.provides() ?? null;

    const history = registry.getPlugin<HistoryPlugin>('history');
    this.history = history?.provides() ?? null;

    const interactionManager = registry.getPlugin<InteractionManagerPlugin>('interaction-manager');
    this.interactionManager = interactionManager?.provides() ?? null;

    this.coreStore.onAction(SET_DOCUMENT, (_action, state) => {
      const doc = state.core.document;
      if (doc) {
        this.getAllAnnotations(doc);
      }
    });
  }

  async initialize(): Promise<void> {
    for (const [variantKey, defaults] of Object.entries(this.state.toolDefaults)) {
      this.registerTool(variantKey, defaults);
    }

    this.history?.onHistoryChange((topic) => {
      if (topic === this.ANNOTATION_HISTORY_TOPIC && this.config.autoCommit !== false) {
        this.commit();
      }
    });

    this.interactionManager?.onModeChange((s) => {
      const newVariant = this.variantByMode.get(s.activeMode) ?? null;
      if (newVariant !== this.state.activeVariant) {
        this.dispatch(setActiveVariant(newVariant));
        this.activeVariantChange$.emit(newVariant);
      }
    });

    this.selection?.onEndSelection(() => {
      if (!this.state.activeVariant) return;
      const defaults = this.state.toolDefaults[this.state.activeVariant];
      if (!defaults || !isTextMarkupDefaults(defaults)) return;

      const formattedSelection = this.selection?.getFormattedSelection();
      const selectionText = this.selection?.getSelectedText();
      if (!formattedSelection || !selectionText) return;

      for (const selection of formattedSelection) {
        const rect = selection.rect;
        const segmentRects = selection.segmentRects;
        const subtype = defaults.subtype;
        const color = defaults.color;
        const opacity = defaults.opacity;
        const blendMode = defaults.blendMode ?? PdfBlendMode.Normal;

        selectionText.wait((text) => {
          this.createAnnotation(selection.pageIndex, {
            type: subtype,
            rect,
            segmentRects,
            color,
            opacity,
            flags: ['print'],
            blendMode,
            pageIndex: selection.pageIndex,
            id: uuidV4(),
            author: this.config.annotationAuthor,
            custom: {
              text: text.join('\n'),
            },
          });
        }, ignore);
      }

      this.selection?.clear();
    });
  }

  private registerTool(variantKey: string, defaults: BaseAnnotationDefaults) {
    const modeId = defaults.interaction.mode;
    const interactionMode: InteractionMode = {
      id: modeId,
      scope: 'page',
      exclusive: defaults.interaction.exclusive,
      cursor: defaults.interaction.cursor,
    };

    this.interactionManager?.registerMode(interactionMode);

    if (defaults.textSelection) {
      this.selection?.enableForMode(modeId);
    }

    this.modeByVariant.set(variantKey, modeId);
    this.variantByMode.set(modeId, variantKey);
  }

  protected buildCapability(): AnnotationCapability {
    return {
      getPageAnnotations: (options: GetPageAnnotationsOptions) => {
        return this.getPageAnnotations(options);
      },
      getSelectedAnnotation: () => {
        return getSelectedAnnotation(this.state);
      },
      selectAnnotation: (pageIndex: number, annotationId: string) => {
        this.selectAnnotation(pageIndex, annotationId);
      },
      deselectAnnotation: () => {
        this.dispatch(deselectAnnotation());
      },
      getActiveVariant: () => {
        return this.state.activeVariant;
      },
      setActiveVariant: (variantKey: string | null) => {
        if (variantKey === this.state.activeVariant) return;
        if (variantKey) {
          const mode = this.modeByVariant.get(variantKey);
          if (!mode) throw new Error(`Mode missing for variant ${variantKey}`);
          this.interactionManager?.activate(mode);
        } else {
          this.interactionManager?.activateDefaultMode();
        }
      },
      getSubtypeAndIntentByVariant: (variantKey) => {
        return parseVariantKey(variantKey);
      },
      getToolDefaults: (variantKey) => {
        const defaults = this.state.toolDefaults[variantKey];
        if (!defaults) {
          throw new Error(`No defaults found for variant: ${variantKey}`);
        }
        return defaults;
      },
      getToolDefaultsBySubtypeAndIntent: (subtype, intent) => {
        return getToolDefaultsBySubtypeAndIntent(this.state, subtype, intent);
      },
      getToolDefaultsBySubtype: (subtype) => {
        return getToolDefaultsBySubtypeAndIntent(this.state, subtype);
      },
      setToolDefaults: (variantKey, patch) => {
        this.dispatch(updateToolDefaults(variantKey, patch));
      },
      getColorPresets: () => [...this.state.colorPresets],
      addColorPreset: (color) => this.dispatch(addColorPreset(color)),
      createAnnotation: <A extends PdfAnnotationObject>(
        pageIndex: number,
        annotation: A,
        ctx?: AnnotationCreateContext<A>,
      ) => this.createAnnotation(pageIndex, annotation, ctx),
      updateAnnotation: (pageIndex: number, id: string, patch: Partial<PdfAnnotationObject>) =>
        this.updateAnnotation(pageIndex, id, patch),
      deleteAnnotation: (pageIndex: number, id: string) => this.deleteAnnotation(pageIndex, id),
      renderAnnotation: (options: RenderAnnotationOptions) => this.renderAnnotation(options),
      onStateChange: this.state$.on,
      onActiveVariantChange: this.activeVariantChange$.on,
      onActiveToolChange: this.activeTool$.on,
      commit: () => this.commit(),
    };
  }

  private createActiveTool(mode: string | null, toolDefaults: ToolDefaultsByMode): ActiveTool {
    if (mode === null) {
      return { variantKey: null, defaults: null };
    }
    return { variantKey: mode, defaults: toolDefaults[mode] } as ActiveTool;
  }

  private emitActiveTool(state: AnnotationState) {
    const activeTool = this.createActiveTool(state.activeVariant, state.toolDefaults);
    this.activeTool$.emit(activeTool);
  }

  override onStoreUpdated(prev: AnnotationState, next: AnnotationState): void {
    this.state$.emit(next);
    if (
      prev.activeVariant !== next.activeVariant ||
      prev.toolDefaults[prev.activeVariant ?? PdfAnnotationSubtype.HIGHLIGHT] !==
        next.toolDefaults[next.activeVariant ?? PdfAnnotationSubtype.HIGHLIGHT]
    ) {
      this.emitActiveTool(next);
    }
  }

  private getAllAnnotations(doc: PdfDocumentObject) {
    const task = this.engine.getAllAnnotations(doc);
    task.wait((annotations) => this.dispatch(setAnnotations(annotations)), ignore);
  }

  private getPageAnnotations(
    options: GetPageAnnotationsOptions,
  ): Task<PdfAnnotationObject[], PdfErrorReason> {
    const { pageIndex } = options;

    const doc = this.coreState.core.document;

    if (!doc) {
      return PdfTaskHelper.reject({ code: PdfErrorCode.NotFound, message: 'Document not found' });
    }

    const page = doc.pages.find((p) => p.index === pageIndex);

    if (!page) {
      return PdfTaskHelper.reject({ code: PdfErrorCode.NotFound, message: 'Page not found' });
    }

    return this.engine.getPageAnnotations(doc, page);
  }

  private renderAnnotation({ pageIndex, annotation, options }: RenderAnnotationOptions) {
    const coreState = this.coreState.core;

    if (!coreState.document) {
      throw new Error('document does not open');
    }

    const page = coreState.document.pages.find((page) => page.index === pageIndex);
    if (!page) {
      throw new Error('page does not exist');
    }

    return this.engine.renderPageAnnotation(coreState.document, page, annotation, options);
  }

  private selectAnnotation(pageIndex: number, annotationId: string) {
    this.dispatch(selectAnnotation(pageIndex, annotationId));
  }

  private createAnnotation<A extends PdfAnnotationObject>(
    pageIndex: number,
    annotation: A,
    ctx?: AnnotationCreateContext<A>,
  ) {
    const id = annotation.id;
    const execute = () => {
      this.dispatch(
        createAnnotation(pageIndex, {
          ...annotation,
          author: annotation.author ?? this.config.annotationAuthor,
          flags: ['print'],
        }),
      );
      if (ctx) this.pendingContexts.set(id, ctx);
    };

    if (!this.history) {
      execute();
      if (this.config.autoCommit) this.commit();
      return;
    }
    const command: Command = {
      execute,
      undo: () => {
        this.pendingContexts.delete(id);
        this.dispatch(deselectAnnotation());
        this.dispatch(deleteAnnotation(pageIndex, id));
      },
    };
    this.history.register(command, this.ANNOTATION_HISTORY_TOPIC);
  }

  private buildPatch(original: PdfAnnotationObject, patch: Partial<PdfAnnotationObject>) {
    if ('rect' in patch) return patch;

    const merged = { ...original, ...patch } as PdfAnnotationObject;
    return { ...patch, rect: deriveRect(merged) };
  }

  private updateAnnotation(pageIndex: number, id: string, patch: Partial<PdfAnnotationObject>) {
    const originalObject = this.state.byUid[id].object;
    const finalPatch = this.buildPatch(originalObject, {
      ...patch,
      author: patch.author ?? this.config.annotationAuthor,
    });

    if (!this.history) {
      this.dispatch(patchAnnotation(pageIndex, id, finalPatch));
      if (this.config.autoCommit !== false) {
        this.commit();
      }
      return;
    }
    const originalPatch = Object.fromEntries(
      Object.keys(patch).map((key) => [key, originalObject[key as keyof PdfAnnotationObject]]),
    );
    const command: Command = {
      execute: () => this.dispatch(patchAnnotation(pageIndex, id, finalPatch)),
      undo: () => this.dispatch(patchAnnotation(pageIndex, id, originalPatch)),
    };
    this.history.register(command, this.ANNOTATION_HISTORY_TOPIC);
  }

  private deleteAnnotation(pageIndex: number, id: string) {
    if (!this.history) {
      this.dispatch(deselectAnnotation());
      this.dispatch(deleteAnnotation(pageIndex, id));
      if (this.config.autoCommit !== false) {
        this.commit();
      }
      return;
    }
    const originalAnnotation = this.state.byUid[id].object;
    const command: Command = {
      execute: () => {
        this.dispatch(deselectAnnotation());
        this.dispatch(deleteAnnotation(pageIndex, id));
      },
      undo: () => this.dispatch(createAnnotation(pageIndex, originalAnnotation)),
    };
    this.history.register(command, this.ANNOTATION_HISTORY_TOPIC);
  }

  private commit(): Task<boolean, PdfErrorReason> {
    const task = new Task<boolean, PdfErrorReason>();

    if (!this.state.hasPendingChanges) return PdfTaskHelper.resolve(true);

    const doc = this.coreState.core.document;
    if (!doc)
      return PdfTaskHelper.reject({ code: PdfErrorCode.NotFound, message: 'Document not found' });

    const creations: Task<any, PdfErrorReason>[] = [];
    const updates: Task<any, PdfErrorReason>[] = [];
    const deletions: { ta: TrackedAnnotation; uid: string }[] = [];

    // 1. Group all pending changes by operation type
    for (const [uid, ta] of Object.entries(this.state.byUid)) {
      if (ta.commitState === 'synced') continue;

      const page = doc.pages.find((p) => p.index === ta.object.pageIndex);
      if (!page) continue;

      switch (ta.commitState) {
        case 'new':
          const ctx = this.pendingContexts.get(ta.object.id) as AnnotationCreateContext<
            typeof ta.object
          >;
          const task = this.engine.createPageAnnotation!(doc, page, ta.object, ctx);
          task.wait(() => {
            this.pendingContexts.delete(ta.object.id);
          }, ignore);
          creations.push(task);
          break;
        case 'dirty':
          updates.push(this.engine.updatePageAnnotation!(doc, page, ta.object));
          break;
        case 'deleted':
          deletions.push({ ta, uid });
          break;
      }
    }

    // 2. Create deletion tasks
    const deletionTasks: Task<any, PdfErrorReason>[] = [];
    for (const { ta, uid } of deletions) {
      const page = doc.pages.find((p) => p.index === ta.object.pageIndex)!;
      // Only delete if it was previously synced (i.e., exists in the PDF)
      if (ta.commitState === 'deleted' && ta.object.id) {
        const task = new Task<any, PdfErrorReason>();
        const removeTask = this.engine.removePageAnnotation!(doc, page, ta.object);
        removeTask.wait(() => {
          this.dispatch(purgeAnnotation(uid));
          task.resolve(true);
        }, task.fail);
        deletionTasks.push(task);
      } else {
        // If it was never synced, just remove from state
        this.dispatch(purgeAnnotation(uid));
      }
    }

    // 3. Chain the operations: creations/updates -> deletions -> finalize
    const allWriteTasks = [...creations, ...updates, ...deletionTasks];

    Task.allSettled(allWriteTasks).wait(() => {
      // 4. Finalize the commit by updating the commitState of all items.
      this.dispatch(commitPendingChanges());
      task.resolve(true);
    }, task.fail);

    return task;
  }
}
