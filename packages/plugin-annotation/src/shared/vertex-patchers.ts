import {
  PdfAnnotationSubtype,
  PdfAnnotationObject,
  PdfLineAnnoObject,
  PdfPolylineAnnoObject,
  PdfPolygonAnnoObject,
  Rect,
  Position,
  expandRect,
  rectFromPoints,
} from '@embedpdf/models';
import { patching } from '@embedpdf/plugin-annotation';

export interface PatchContext {
  rect: Rect;
  vertices?: Position[];
}

export type PatchFn<T extends PdfAnnotationObject> = (original: T, ctx: PatchContext) => Partial<T>;

export const patchLine: PatchFn<PdfLineAnnoObject> = (orig, ctx) => {
  /* ---------- vertex edit ------------------------------------------------ */
  if (ctx.vertices && ctx.vertices.length >= 2) {
    const rect = patching.lineRectWithEndings(ctx.vertices, orig.strokeWidth, orig.lineEndings);
    return {
      rect,
      linePoints: { start: ctx.vertices[0], end: ctx.vertices[1] },
    };
  }

  /* ---------- rect drag -------------------------------------------------- */
  const dx = ctx.rect.origin.x - orig.rect.origin.x;
  const dy = ctx.rect.origin.y - orig.rect.origin.y;
  return {
    rect: ctx.rect,
    linePoints: {
      start: { x: orig.linePoints.start.x + dx, y: orig.linePoints.start.y + dy },
      end: { x: orig.linePoints.end.x + dx, y: orig.linePoints.end.y + dy },
    },
  };
};

export const patchPolyline: PatchFn<PdfPolylineAnnoObject> = (orig, ctx) => {
  /* vertex update */
  if (ctx.vertices && ctx.vertices.length) {
    return {
      rect: patching.lineRectWithEndings(ctx.vertices, orig.strokeWidth, orig.lineEndings),
      vertices: ctx.vertices,
    };
  }

  /* rect move */
  const dx = ctx.rect.origin.x - orig.rect.origin.x;
  const dy = ctx.rect.origin.y - orig.rect.origin.y;
  const moved = orig.vertices.map((p) => ({ x: p.x + dx, y: p.y + dy }));
  return {
    rect: ctx.rect,
    vertices: moved,
  };
};

export const patchPolygon: PatchFn<PdfPolygonAnnoObject> = (orig, ctx) => {
  if (ctx.vertices && ctx.vertices.length) {
    const pad = orig.strokeWidth / 2;
    return {
      rect: expandRect(rectFromPoints(ctx.vertices), pad),
      vertices: ctx.vertices,
    };
  }

  const dx = ctx.rect.origin.x - orig.rect.origin.x;
  const dy = ctx.rect.origin.y - orig.rect.origin.y;
  const moved = orig.vertices.map((p) => ({ x: p.x + dx, y: p.y + dy }));
  return {
    rect: ctx.rect,
    vertices: moved,
  };
};

export function getPatchFn(type: PdfAnnotationSubtype) {
  switch (type) {
    case PdfAnnotationSubtype.LINE:
      return patchLine;
    case PdfAnnotationSubtype.POLYLINE:
      return patchPolyline;
    case PdfAnnotationSubtype.POLYGON:
      return patchPolygon;
    default:
      return undefined;
  }
}
