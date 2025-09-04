import { BasePluginConfig, EventHook } from '@embedpdf/core';
import { PdfErrorReason, Rect, Task } from '@embedpdf/models';
import { FormattedSelection } from '@embedpdf/plugin-selection';

export interface SelectedRedaction {
  page: number;
  id: string | null;
}

export interface RedactionState {
  isRedacting: boolean;
  pending: Record<number, RedactionItem[]>;
  selected: SelectedRedaction | null;
}

export type RedactionItem =
  | {
      id: string;
      kind: 'text';
      page: number;
      boundingRect: Rect;
      rects: Rect[]; // inner segments
    }
  | {
      id: string;
      kind: 'area';
      page: number;
      rect: Rect;
    };

export interface MarqueeRedactCallback {
  onPreview?: (rect: Rect | null) => void;
  onCommit?: (rect: Rect) => void;
}

export interface RegisterMarqueeOnPageOptions {
  pageIndex: number;
  scale: number;
  callback: MarqueeRedactCallback;
}

export interface RedactionPluginConfig extends BasePluginConfig {
  drawBlackBoxes: boolean;
}

export interface RedactionCapability {
  queueCurrentSelectionAsPending: () => Task<boolean, PdfErrorReason>;

  enableMarqueeRedact: () => void;
  toggleMarqueeRedact: () => void;
  isMarqueeRedactActive: () => boolean;

  enableRedactSelection: () => void;
  toggleRedactSelection: () => void;
  isRedactSelectionActive: () => boolean;

  onRedactionSelectionChange: EventHook<FormattedSelection[]>;

  onPendingChange: EventHook<Record<number, RedactionItem[]>>;
  removePending: (page: number, id: string) => void;
  clearPending: () => void;
  commitAllPending: () => Task<boolean, PdfErrorReason>;
  commitPending: (page: number, id: string) => Task<boolean, PdfErrorReason>;

  endRedaction: () => void;
  startRedaction: () => void;

  onSelectionChange: EventHook<SelectedRedaction | null>;
  selectPending: (page: number, id: string) => void;
  deselectPending: () => void;

  // keep the single entry point to wire marquee on a page
  registerMarqueeOnPage(opts: RegisterMarqueeOnPageOptions): () => void;
}
