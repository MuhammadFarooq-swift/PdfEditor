import { BasePluginConfig, EventHook } from '@embedpdf/core';
import {
  PdfAnnotationObject,
  PdfErrorReason,
  Task,
  PdfAnnotationSubtype,
  WebAlphaColor,
  PdfBlendMode,
  PdfAnnotationBorderStyle,
  LineEndings,
  PdfStandardFont,
  PdfTextAlignment,
  PdfVerticalAlignment,
  AnnotationCreateContext,
  PdfTextAnnoObject,
  PdfRenderPageAnnotationOptions,
} from '@embedpdf/models';

/* Metadata tracked per anno */
export type CommitState =
  | 'new' // created locally, not yet written to the PDF
  | 'dirty' // exists remotely, but local fields diverge
  | 'deleted' // deleted locally, not yet written to the PDF
  | 'synced' // identical to the PDF
  | 'ignored'; // managed by a different plugin – never auto-committed

export interface TrackedAnnotation<T extends PdfAnnotationObject = PdfAnnotationObject> {
  /** local commit bookkeeping */
  commitState: CommitState;
  /** the actual annotation object, where `object.id` is the stable string ID */
  object: T;
}

export interface RenderAnnotationOptions {
  pageIndex: number;
  annotation: PdfAnnotationObject;
  options?: PdfRenderPageAnnotationOptions;
}

export interface BaseAnnotationDefaults {
  name: string;
  subtype: PdfAnnotationSubtype;
  interaction: {
    mode: string;
    exclusive: boolean;
    cursor?: string;
  };
  textSelection?: boolean;
  blendMode?: PdfBlendMode;
}

export interface HighlightDefaults extends BaseAnnotationDefaults {
  subtype: PdfAnnotationSubtype.HIGHLIGHT;
  blendMode: PdfBlendMode;
  color: string;
  opacity: number;
}

export interface UnderlineDefaults extends BaseAnnotationDefaults {
  subtype: PdfAnnotationSubtype.UNDERLINE;
  blendMode: PdfBlendMode;
  color: string;
  opacity: number;
}

export interface StrikeoutDefaults extends BaseAnnotationDefaults {
  subtype: PdfAnnotationSubtype.STRIKEOUT;
  blendMode: PdfBlendMode;
  color: string;
  opacity: number;
}

export interface SquigglyDefaults extends BaseAnnotationDefaults {
  subtype: PdfAnnotationSubtype.SQUIGGLY;
  blendMode: PdfBlendMode;
  color: string;
  opacity: number;
}

export interface InkDefaults extends BaseAnnotationDefaults {
  subtype: PdfAnnotationSubtype.INK;
  strokeWidth: number;
  intent?: string;
  color: string;
  opacity: number;
}

export interface TextDefaults extends BaseAnnotationDefaults {
  subtype: PdfAnnotationSubtype.FREETEXT;
  fontSize: number;
  fontColor: string;
  fontFamily: PdfStandardFont;
  textAlign: PdfTextAlignment;
  verticalAlign: PdfVerticalAlignment;
  content: string;
  backgroundColor: string;
  opacity: number;
}

export interface CircleDefaults extends BaseAnnotationDefaults {
  subtype: PdfAnnotationSubtype.CIRCLE;
  strokeWidth: number;
  strokeColor: string;
  strokeStyle: PdfAnnotationBorderStyle;
  strokeDashArray?: number[];
  color: string;
  opacity: number;
}

export interface SquareDefaults extends BaseAnnotationDefaults {
  subtype: PdfAnnotationSubtype.SQUARE;
  strokeWidth: number;
  strokeColor: string;
  strokeStyle: PdfAnnotationBorderStyle;
  strokeDashArray?: number[];
  color: string;
  opacity: number;
}

export interface LineDefaults extends BaseAnnotationDefaults {
  subtype: PdfAnnotationSubtype.LINE;
  intent?: string;
  strokeWidth: number;
  strokeColor: string;
  strokeStyle: PdfAnnotationBorderStyle;
  strokeDashArray?: number[];
  lineEndings?: LineEndings;
  color: string;
  opacity: number;
}

export interface PolylineDefaults extends BaseAnnotationDefaults {
  subtype: PdfAnnotationSubtype.POLYLINE;
  strokeWidth: number;
  strokeColor: string;
  strokeStyle: PdfAnnotationBorderStyle;
  strokeDashArray?: number[];
  lineEndings?: LineEndings;
  color: string;
  opacity: number;
}

export interface PolygonDefaults extends BaseAnnotationDefaults {
  subtype: PdfAnnotationSubtype.POLYGON;
  strokeWidth: number;
  strokeColor: string;
  strokeStyle: PdfAnnotationBorderStyle;
  strokeDashArray?: number[];
  color: string;
  opacity: number;
}

export interface PhotoDefaults extends BaseAnnotationDefaults {
  subtype: PdfAnnotationSubtype.STAMP;
}

export type AnnotationDefaults =
  | HighlightDefaults
  | UnderlineDefaults
  | StrikeoutDefaults
  | SquigglyDefaults
  | InkDefaults
  | TextDefaults
  | CircleDefaults
  | SquareDefaults
  | LineDefaults
  | PolylineDefaults
  | PolygonDefaults
  | PhotoDefaults;

export type ToolDefaultsByMode = {
  [K in string]: AnnotationDefaults;
};

export type ActiveTool =
  | { variantKey: null; defaults: null }
  | { [K in string]: { variantKey: K; defaults: ToolDefaultsByMode[K] } }[string];

export interface AnnotationState {
  pages: Record<number, string[]>; // pageIndex → list of UIDs
  byUid: Record<string, TrackedAnnotation>; // UID → latest object

  selectedUid: string | null;
  activeVariant: string | null;

  toolDefaults: Record<string, AnnotationDefaults>;
  colorPresets: string[];

  hasPendingChanges: boolean;
}

export interface AnnotationPluginConfig extends BasePluginConfig {
  toolDefaults?: Record<string, AnnotationDefaults>;
  colorPresets?: string[];
  /**
   * When `false` mutations are kept in memory and must be
   * flushed with `commitPendingChanges()`.
   */
  autoCommit?: boolean;
  /**
   * Author of the annotation
   */
  annotationAuthor?: string;
}

export interface AnnotationCapability {
  getPageAnnotations: (
    options: GetPageAnnotationsOptions,
  ) => Task<PdfAnnotationObject[], PdfErrorReason>;
  getSelectedAnnotation: () => TrackedAnnotation | null;
  selectAnnotation: (pageIndex: number, annotationId: string) => void;
  deselectAnnotation: () => void;
  getActiveVariant: () => string | null;
  setActiveVariant: (variantKey: string | null) => void;
  /** strongly typed – only sub-types we have defaults for */
  getToolDefaults: (variantKey: string) => AnnotationDefaults;
  getToolDefaultsBySubtypeAndIntent: <Sub extends AnnotationDefaults['subtype']>(
    subtype: Sub,
    intent?: string | null,
  ) => Extract<AnnotationDefaults, { subtype: Sub }>;
  getToolDefaultsBySubtype: <Sub extends AnnotationDefaults['subtype']>(
    subtype: Sub,
  ) => Extract<AnnotationDefaults, { subtype: Sub }>;
  /** Return the subtype and intent for a given variant key */
  getSubtypeAndIntentByVariant: (variantKey: string) => {
    subtype: PdfAnnotationSubtype;
    intent?: string;
  };
  /** Partially patch a single tool’s defaults */
  setToolDefaults: (variantKey: string, patch: Partial<AnnotationDefaults>) => void;
  /** current palette – UI just reads this */
  getColorPresets: () => string[];
  /** append a swatch (deduped by RGBA) */
  addColorPreset: (color: string) => void;
  createAnnotation: <A extends PdfAnnotationObject>(
    pageIndex: number,
    annotation: A,
    ctx?: AnnotationCreateContext<A>,
  ) => void;
  updateAnnotation: (
    pageIndex: number,
    annotationId: string,
    patch: Partial<PdfAnnotationObject>,
  ) => void;
  deleteAnnotation: (pageIndex: number, annotationId: string) => void;
  renderAnnotation: (options: RenderAnnotationOptions) => Task<Blob, PdfErrorReason>;
  /** undo / redo */
  onStateChange: EventHook<AnnotationState>;
  onActiveVariantChange: EventHook<string | null>;
  onActiveToolChange: EventHook<ActiveTool>;
  commit: () => void;
}

export interface GetPageAnnotationsOptions {
  pageIndex: number;
}

export interface UpdateAnnotationColorOptions extends WebAlphaColor {
  pageIndex: number;
  annotationId: string;
}

export interface SidebarAnnotationEntry {
  /** Zero-based page index */
  page: number;
  /** The tracked root annotation shown in the sidebar */
  annotation: TrackedAnnotation;
  /** Any TEXT-type annotations whose `inReplyToId` points to the root */
  replies: TrackedAnnotation<PdfTextAnnoObject>[];
}
