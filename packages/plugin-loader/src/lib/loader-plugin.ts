import {
  BasePlugin,
  IPlugin,
  PluginRegistry,
  createEmitter,
  createBehaviorEmitter,
  loadDocument,
  setDocument,
} from '@embedpdf/core';
import { PdfDocumentObject, PdfEngine } from '@embedpdf/models';
import { PDFDocumentLoader } from './loader';
import { PDFLoadingOptions } from './loader/strategies/loading-strategy';
import { LoaderCapability, LoaderEvent, LoaderPluginConfig } from './types';

export class LoaderPlugin extends BasePlugin<LoaderPluginConfig, LoaderCapability> {
  static readonly id = 'loader' as const;

  private readonly loaderHandlers$ = createBehaviorEmitter<LoaderEvent>();
  private readonly documentLoadedHandlers$ = createBehaviorEmitter<PdfDocumentObject>();
  private readonly openFileRequest$ = createEmitter<'open'>();

  private documentLoader: PDFDocumentLoader;
  private loadingOptions?: Omit<PDFLoadingOptions, 'engine'>;
  private loadedDocument?: PdfDocumentObject;

  constructor(
    public readonly id: string,
    registry: PluginRegistry,
  ) {
    super(id, registry);
    this.documentLoader = new PDFDocumentLoader();
  }

  protected buildCapability(): LoaderCapability {
    return {
      onLoaderEvent: this.loaderHandlers$.on,
      onDocumentLoaded: this.documentLoadedHandlers$.on,
      onOpenFileRequest: this.openFileRequest$.on,
      openFileDialog: () => this.openFileRequest$.emit('open'),
      loadDocument: (options) => this.loadDocument(options),
      registerStrategy: (name, strategy) => this.documentLoader.registerStrategy(name, strategy),
      getDocument: () => this.loadedDocument,
      addStrategyResolver: (resolver) => this.documentLoader.addStrategyResolver(resolver),
    };
  }

  async initialize(config: LoaderPluginConfig): Promise<void> {
    // Register any custom strategies provided in config
    if (config.defaultStrategies) {
      Object.entries(config.defaultStrategies).forEach(([name, strategy]) => {
        this.documentLoader.registerStrategy(name, strategy);
      });
    }

    if (config.loadingOptions) {
      this.loadingOptions = config.loadingOptions;
    }
  }

  async postInitialize(): Promise<void> {
    if (this.loadingOptions) {
      await this.loadDocument(this.loadingOptions);
    }
  }

  private async loadDocument(
    options: Omit<PDFLoadingOptions, 'engine'>,
  ): Promise<PdfDocumentObject> {
    try {
      this.loaderHandlers$.emit({ type: 'start', documentId: options.pdfFile.id });
      this.dispatchCoreAction(loadDocument());
      const document = await this.documentLoader.loadDocument({
        ...options,
        engine: this.engine,
      } as PDFLoadingOptions);
      this.dispatchCoreAction(setDocument(document));
      this.loadedDocument = document;

      this.loaderHandlers$.emit({ type: 'complete', documentId: options.pdfFile.id });
      this.documentLoadedHandlers$.emit(document);
      return document;
    } catch (error) {
      const errorEvent: LoaderEvent = {
        type: 'error',
        documentId: options.pdfFile.id,
        error: error instanceof Error ? error : new Error(String(error)),
      };
      this.loaderHandlers$.emit(errorEvent);
      throw error;
    }
  }

  async destroy(): Promise<void> {
    this.loaderHandlers$.clear();
    this.documentLoadedHandlers$.clear();
    this.openFileRequest$.clear();
    super.destroy();
  }
}
