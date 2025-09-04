import { BasePlugin, PluginRegistry } from '@embedpdf/core';
import { PdfBookmarkObject, PdfEngine, PdfErrorReason, Task } from '@embedpdf/models';

import { BookmarkCapability, BookmarkPluginConfig } from './types';

export class BookmarkPlugin extends BasePlugin<BookmarkPluginConfig, BookmarkCapability> {
  static readonly id = 'bookmark' as const;

  constructor(id: string, registry: PluginRegistry) {
    super(id, registry);
  }

  async initialize(_: BookmarkPluginConfig): Promise<void> {}

  protected buildCapability(): BookmarkCapability {
    return {
      getBookmarks: this.getBookmarks.bind(this),
    };
  }

  private getBookmarks(): Task<{ bookmarks: PdfBookmarkObject[] }, PdfErrorReason> {
    const doc = this.coreState.core.document;
    if (!doc) throw new Error('Document not open');

    return this.engine.getBookmarks(doc);
  }
}
