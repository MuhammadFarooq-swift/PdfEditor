import { PdfAnnotationSubtype, PdfAnnotationObject } from '@embedpdf/models';
import {
  TrackedAnnotation,
  AnnotationDefaults,
  ToolDefaultsByMode,
  HighlightDefaults,
  UnderlineDefaults,
  StrikeoutDefaults,
  SquigglyDefaults,
} from './types';

/* ------------------------------------------------------------------ */
/* 1. Generic “subtype‑to‑object” mapper                              */
/* ------------------------------------------------------------------ */

export type AnnoOf<S extends PdfAnnotationSubtype> = Extract<PdfAnnotationObject, { type: S }>;

export type TextMarkupSubtype =
  | PdfAnnotationSubtype.HIGHLIGHT
  | PdfAnnotationSubtype.UNDERLINE
  | PdfAnnotationSubtype.STRIKEOUT
  | PdfAnnotationSubtype.SQUIGGLY;
export type SidebarSubtype =
  | TextMarkupSubtype
  | PdfAnnotationSubtype.INK
  | PdfAnnotationSubtype.SQUARE
  | PdfAnnotationSubtype.CIRCLE
  | PdfAnnotationSubtype.POLYGON
  | PdfAnnotationSubtype.LINE
  | PdfAnnotationSubtype.POLYLINE
  | PdfAnnotationSubtype.FREETEXT
  | PdfAnnotationSubtype.STAMP;

/* ------------------------------------------------------------------ */
/* 2. Narrowing type‑guards (add more as needed)                      */
/* ------------------------------------------------------------------ */

/** True when `a.object.type === INK` – and narrows the generic. */
export function isInk(
  a: TrackedAnnotation,
): a is TrackedAnnotation<AnnoOf<PdfAnnotationSubtype.INK>> {
  return a.object.type === PdfAnnotationSubtype.INK;
}

/** Example for Circle – create similar ones for Square, Line, etc. */
export function isCircle(
  a: TrackedAnnotation,
): a is TrackedAnnotation<AnnoOf<PdfAnnotationSubtype.CIRCLE>> {
  return a.object.type === PdfAnnotationSubtype.CIRCLE;
}

export function isPolygon(
  a: TrackedAnnotation,
): a is TrackedAnnotation<AnnoOf<PdfAnnotationSubtype.POLYGON>> {
  return a.object.type === PdfAnnotationSubtype.POLYGON;
}

export function isSquare(
  a: TrackedAnnotation,
): a is TrackedAnnotation<AnnoOf<PdfAnnotationSubtype.SQUARE>> {
  return a.object.type === PdfAnnotationSubtype.SQUARE;
}

export function isLine(
  a: TrackedAnnotation,
): a is TrackedAnnotation<AnnoOf<PdfAnnotationSubtype.LINE>> {
  return a.object.type === PdfAnnotationSubtype.LINE;
}

export function isPolyline(
  a: TrackedAnnotation,
): a is TrackedAnnotation<AnnoOf<PdfAnnotationSubtype.POLYLINE>> {
  return a.object.type === PdfAnnotationSubtype.POLYLINE;
}

export function isHighlight(
  a: TrackedAnnotation,
): a is TrackedAnnotation<AnnoOf<PdfAnnotationSubtype.HIGHLIGHT>> {
  return a.object.type === PdfAnnotationSubtype.HIGHLIGHT;
}

export function isUnderline(
  a: TrackedAnnotation,
): a is TrackedAnnotation<AnnoOf<PdfAnnotationSubtype.UNDERLINE>> {
  return a.object.type === PdfAnnotationSubtype.UNDERLINE;
}

export function isStrikeout(
  a: TrackedAnnotation,
): a is TrackedAnnotation<AnnoOf<PdfAnnotationSubtype.STRIKEOUT>> {
  return a.object.type === PdfAnnotationSubtype.STRIKEOUT;
}

export function isSquiggly(
  a: TrackedAnnotation,
): a is TrackedAnnotation<AnnoOf<PdfAnnotationSubtype.SQUIGGLY>> {
  return a.object.type === PdfAnnotationSubtype.SQUIGGLY;
}

export function isTextMarkup(
  a: TrackedAnnotation,
): a is TrackedAnnotation<AnnoOf<TextMarkupSubtype>> {
  return isHighlight(a) || isUnderline(a) || isStrikeout(a) || isSquiggly(a);
}

export function isFreeText(
  a: TrackedAnnotation,
): a is TrackedAnnotation<AnnoOf<PdfAnnotationSubtype.FREETEXT>> {
  return a.object.type === PdfAnnotationSubtype.FREETEXT;
}

export function isStamp(
  a: TrackedAnnotation,
): a is TrackedAnnotation<AnnoOf<PdfAnnotationSubtype.STAMP>> {
  return a.object.type === PdfAnnotationSubtype.STAMP;
}

export function isText(
  a: TrackedAnnotation,
): a is TrackedAnnotation<AnnoOf<PdfAnnotationSubtype.TEXT>> {
  return a.object.type === PdfAnnotationSubtype.TEXT;
}

export function isSidebarAnnotation(
  a: TrackedAnnotation,
): a is TrackedAnnotation<AnnoOf<SidebarSubtype>> {
  return (
    isTextMarkup(a) ||
    isInk(a) ||
    isSquare(a) ||
    isCircle(a) ||
    isPolygon(a) ||
    isLine(a) ||
    isPolyline(a) ||
    isFreeText(a) ||
    isStamp(a)
  );
}

/* ------------------------------------------------------------------ */
/* 3. Helpers for defaults and tool defaults                           */
/* ------------------------------------------------------------------ */

export function isHighlightDefaults(defaults: AnnotationDefaults): defaults is HighlightDefaults {
  return defaults.subtype === PdfAnnotationSubtype.HIGHLIGHT;
}

export function isUnderlineDefaults(defaults: AnnotationDefaults): defaults is UnderlineDefaults {
  return defaults.subtype === PdfAnnotationSubtype.UNDERLINE;
}

export function isStrikeoutDefaults(defaults: AnnotationDefaults): defaults is StrikeoutDefaults {
  return defaults.subtype === PdfAnnotationSubtype.STRIKEOUT;
}

export function isSquigglyDefaults(defaults: AnnotationDefaults): defaults is SquigglyDefaults {
  return defaults.subtype === PdfAnnotationSubtype.SQUIGGLY;
}

export function isTextMarkupDefaults(
  defaults: AnnotationDefaults,
): defaults is HighlightDefaults | UnderlineDefaults | StrikeoutDefaults | SquigglyDefaults {
  return (
    isHighlightDefaults(defaults) ||
    isUnderlineDefaults(defaults) ||
    isStrikeoutDefaults(defaults) ||
    isSquigglyDefaults(defaults)
  );
}
