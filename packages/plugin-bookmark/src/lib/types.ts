import { BasePluginConfig } from '@embedpdf/core';
import { Task } from '@embedpdf/models';
import { PdfBookmarkObject } from '@embedpdf/models';
import { PdfErrorReason } from '@embedpdf/models';

export interface BookmarkPluginConfig extends BasePluginConfig {}

export interface BookmarkCapability {
  getBookmarks: () => Task<
    {
      bookmarks: PdfBookmarkObject[];
    },
    PdfErrorReason
  >;
}
