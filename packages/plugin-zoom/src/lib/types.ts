import { BasePluginConfig, EventHook } from '@embedpdf/core';
import { Rect } from '@embedpdf/models';
import { ViewportMetrics } from '@embedpdf/plugin-viewport';

/* ------------------------------------------------------------------ */
/* public                                                               */
/* ------------------------------------------------------------------ */

export enum ZoomMode {
  Automatic = 'automatic',
  FitPage = 'fit-page',
  FitWidth = 'fit-width',
}

export type ZoomLevel = ZoomMode | number;

export interface Point {
  vx: number;
  vy: number;
}

export interface ZoomChangeEvent {
  /** old and new *actual* scale factors */
  oldZoom: number;
  newZoom: number;

  /** level used to obtain the newZoom (number | mode) */
  level: ZoomLevel;

  /** viewport point kept under the finger / mouse‑wheel focus */
  center: Point;

  /** where the viewport should scroll to after the scale change */
  desiredScrollLeft: number;
  desiredScrollTop: number;

  /** metrics at the moment the zoom was requested                    */
  viewport: ViewportMetrics;
}

export interface MarqueeZoomCallback {
  onPreview?: (rect: Rect | null) => void;
  onCommit?: (rect: Rect) => void;
  onSmallDrag?: () => void;
}

export interface RegisterMarqueeOnPageOptions {
  pageIndex: number;
  scale: number;
  callback: MarqueeZoomCallback;
}

export interface ZoomCapability {
  /** subscribe – returns the unsubscribe function */
  onZoomChange: EventHook<ZoomChangeEvent>;
  /** subscribe – returns the unsubscribe function */
  onStateChange: EventHook<ZoomState>;

  /** absolute requests -------------------------------------------------- */
  requestZoom(level: ZoomLevel, center?: Point): void;
  /** relative requests -------------------------------------------------- */
  requestZoomBy(delta: number, center?: Point): void;

  /** absolute requests -------------------------------------------------- */
  zoomIn(): void;
  zoomOut(): void;

  zoomToArea(pageIndex: number, rect: Rect): void;

  /** zoom in on an area -------------------------------------------------- */
  enableMarqueeZoom(): void;
  disableMarqueeZoom(): void;
  toggleMarqueeZoom(): void;
  isMarqueeZoomActive(): boolean;

  /** register a marquee handler on a page -------------------------------- */
  registerMarqueeOnPage: (opts: RegisterMarqueeOnPageOptions) => () => void;

  getState(): ZoomState;
  getPresets(): ZoomPreset[];
}

/* ------------------------------------------------------------------ */
/* config / store                                                      */
/* ------------------------------------------------------------------ */

export interface ZoomRangeStep {
  min: number;
  max: number;
  step: number;
}

export interface ZoomPreset {
  name: string;
  value: ZoomLevel;
  icon?: string;
}

export interface ZoomPluginConfig extends BasePluginConfig {
  defaultZoomLevel: ZoomLevel;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  zoomRanges?: ZoomRangeStep[]; // Define different step sizes for different zoom ranges
  presets?: ZoomPreset[]; // Preset zoom options for dropdown
}

export interface ZoomState {
  zoomLevel: ZoomLevel; // last **requested** level
  currentZoomLevel: number; // actual numeric factor
}

export enum VerticalZoomFocus {
  Center,
  Top,
}

export interface ZoomRequest {
  level: ZoomLevel;
  delta?: number;
  center?: Point;
  focus?: VerticalZoomFocus;
  /** Scroll so that the focal point ends up …
   *  ▸ `"keep"`   (default) at the same viewport coords
   *  ▸ `"center"` centred in the viewport  */
  align?: 'keep' | 'center';
}
