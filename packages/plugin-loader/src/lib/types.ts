import { BasePluginConfig, EventHook } from '@embedpdf/core';
import { PdfDocumentObject } from '@embedpdf/models';
import { PDFLoadingStrategy, PDFLoadingOptions } from './loader/strategies/loading-strategy';
import { StrategyResolver } from './loader';

export interface LoaderPluginConfig extends BasePluginConfig {
  defaultStrategies?: { [key: string]: PDFLoadingStrategy };
  loadingOptions?: Omit<PDFLoadingOptions, 'engine'>;
}

export interface LoaderEvent {
  type: 'start' | 'complete' | 'error';
  documentId?: string;
  error?: Error;
}

export interface LoaderCapability {
  onLoaderEvent: EventHook<LoaderEvent>;
  onDocumentLoaded: EventHook<PdfDocumentObject>;
  onOpenFileRequest: EventHook<'open'>;
  loadDocument(options: Omit<PDFLoadingOptions, 'engine'>): Promise<PdfDocumentObject>;
  registerStrategy(name: string, strategy: PDFLoadingStrategy): void;
  getDocument(): PdfDocumentObject | undefined;
  addStrategyResolver(resolver: StrategyResolver): void;
  openFileDialog: () => void;
}
