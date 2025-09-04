import {
  PdfAnnotationSubtype,
  PdfAnnotationObject,
  Rect,
  Position,
  expandRect,
  rectFromPoints,
} from '@embedpdf/models';

import { lineRectWithEndings } from './patch-utils';

/* ---------- helpers ---------- */

/** Bounding box for arbitrary vertices (+ stroke). */
const vertsRect = (verts: Position[], sw: number): Rect =>
  expandRect(rectFromPoints(verts), sw / 2);

/* ---------- dispatcher ---------- */

export function deriveRect(a: PdfAnnotationObject): Rect {
  switch (a.type) {
    /* mark‑ups already carry their real rect */
    case PdfAnnotationSubtype.HIGHLIGHT:
    case PdfAnnotationSubtype.UNDERLINE:
    case PdfAnnotationSubtype.STRIKEOUT:
    case PdfAnnotationSubtype.SQUIGGLY:
    case PdfAnnotationSubtype.SQUARE:
    case PdfAnnotationSubtype.CIRCLE:
      return a.rect;

    /* ink */
    case PdfAnnotationSubtype.INK: {
      const pts = a.inkList.flatMap((s) => s.points);
      return vertsRect(pts, a.strokeWidth);
    }

    /* one‑segment */
    case PdfAnnotationSubtype.LINE:
      return lineRectWithEndings(
        [a.linePoints.start, a.linePoints.end],
        a.strokeWidth,
        a.lineEndings,
      );

    /* multi‑segment */
    case PdfAnnotationSubtype.POLYLINE:
      return lineRectWithEndings(a.vertices, a.strokeWidth, a.lineEndings);

    case PdfAnnotationSubtype.POLYGON:
      return vertsRect(a.vertices, a.strokeWidth);

    default:
      return a.rect; // fallback – unchanged
  }
}
