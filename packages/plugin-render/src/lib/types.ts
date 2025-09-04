import { BasePluginConfig } from '@embedpdf/core';
import { PdfErrorReason, PdfRenderPageOptions, Rect, Task } from '@embedpdf/models';

export interface RenderPluginConfig extends BasePluginConfig {}

export interface RenderPageRectOptions {
  pageIndex: number;
  rect: Rect;
  options: PdfRenderPageOptions;
}

export interface RenderPageOptions {
  pageIndex: number;
  options: PdfRenderPageOptions;
}

export interface RenderCapability {
  renderPage: (options: RenderPageOptions) => Task<Blob, PdfErrorReason>;
  renderPageRect: (options: RenderPageRectOptions) => Task<Blob, PdfErrorReason>;
}
