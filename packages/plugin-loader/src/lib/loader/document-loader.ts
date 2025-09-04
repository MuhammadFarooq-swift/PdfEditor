import {
  PDFUrlLoadingOptions,
  PDFBufferLoadingOptions,
  PDFLoadingStrategy,
  PDFLoadingOptions,
} from './strategies/loading-strategy';
import { UrlStrategy } from './strategies/url-strategy';
import { BufferStrategy } from './strategies/buffer-strategy';
import { PdfDocumentObject } from '@embedpdf/models';

export type StrategyResolver = (options: PDFLoadingOptions) => PDFLoadingStrategy | undefined;

export class PDFDocumentLoader {
  private strategies: Map<string, PDFLoadingStrategy> = new Map();
  private strategyResolvers: StrategyResolver[] = [];

  constructor() {
    // Set up default strategies
    const bufferStrategy = new BufferStrategy();
    this.registerStrategy('url', new UrlStrategy());
    this.registerStrategy('buffer', bufferStrategy);

    // Add default resolver
    this.addStrategyResolver((options) => {
      if (isPdfUrlLoadingOptions(options)) {
        return this.strategies.get('url');
      }
      return this.strategies.get('buffer');
    });
  }

  public registerStrategy(name: string, strategy: PDFLoadingStrategy): void {
    this.strategies.set(name, strategy);
  }

  public getStrategy(name: string): PDFLoadingStrategy | undefined {
    return this.strategies.get(name);
  }

  public addStrategyResolver(resolver: StrategyResolver): void {
    this.strategyResolvers.push(resolver);
  }

  async loadDocument(options: PDFLoadingOptions): Promise<PdfDocumentObject> {
    try {
      const strategy = this.resolveStrategy(options);
      if (!strategy) {
        throw new Error('No suitable strategy found for the given options');
      }
      return await strategy.load(options);
    } catch (error) {
      console.error('Error loading document:', error);
      throw error;
    }
  }

  private resolveStrategy(options: PDFLoadingOptions): PDFLoadingStrategy | undefined {
    for (const resolver of this.strategyResolvers) {
      const strategy = resolver(options);
      if (strategy) {
        return strategy;
      }
    }
    return undefined;
  }
}

export function isPdfUrlLoadingOptions(
  options: PDFLoadingOptions,
): options is PDFUrlLoadingOptions {
  return options.type === 'url';
}

export function isPdfBufferLoadingOptions(
  options: PDFLoadingOptions,
): options is PDFBufferLoadingOptions {
  return options.type === 'buffer';
}
