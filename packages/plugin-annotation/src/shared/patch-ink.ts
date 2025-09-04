import { PdfAnnotationSubtype, PdfInkAnnoObject } from '@embedpdf/models';
import { ComputePatch } from './patchers';

/**
 * Computes a patch for resizing an ink annotation.
 * - Scales all points in inkList to fit the new rect.
 * - Scales strokeWidth proportionally (using average scale factor).
 * - Handles non-uniform scaling (stretch).
 * - Optionally preserves aspect ratio (set uniform=true).
 *
 * @param original The original ink annotation object.
 * @param newRect The new bounding rect after resize.
 * @param direction The resize handle direction (affects origin adjustments if needed).
 * @param uniform If true, constrains to uniform scaling (uses min scale factor).
 * @returns Partial patch { rect, inkList, strokeWidth } to apply.
 */
export const patchInk: ComputePatch<PdfInkAnnoObject> = (original, ctx) => {
  if (original.type !== PdfAnnotationSubtype.INK) {
    throw new Error('resizeInkAnnotation: original is not an ink annotation');
  }

  const oldRect = original.rect;
  let scaleX = ctx.rect.size.width / oldRect.size.width;
  let scaleY = ctx.rect.size.height / oldRect.size.height;

  // Enforce minimum size to avoid collapse
  const minSize = 10; // Arbitrary PDF units; adjust as needed
  if (ctx.rect.size.width < minSize || ctx.rect.size.height < minSize) {
    // Return empty patch or throw; for now, clamp
    scaleX = Math.max(scaleX, minSize / oldRect.size.width);
    scaleY = Math.max(scaleY, minSize / oldRect.size.height);
    ctx.rect = {
      origin: ctx.rect.origin,
      size: {
        width: oldRect.size.width * scaleX,
        height: oldRect.size.height * scaleY,
      },
    };
  }

  // Optional: Uniform scaling (preserve aspect ratio)
  if (ctx.uniform) {
    const minScale = Math.min(scaleX, scaleY);
    scaleX = minScale;
    scaleY = minScale;
    // Adjust newRect size accordingly (keep origin the same)
    ctx.rect.size = {
      width: oldRect.size.width * minScale,
      height: oldRect.size.height * minScale,
    };
  }

  // Scale points: Normalize relative to old origin, scale, then add new origin
  const newInkList = original.inkList.map((stroke) => ({
    points: stroke.points.map((p) => ({
      x: ctx.rect.origin.x + (p.x - oldRect.origin.x) * scaleX,
      y: ctx.rect.origin.y + (p.y - oldRect.origin.y) * scaleY,
    })),
  }));

  // Scale strokeWidth: Use average scale (preserves "thickness feel")
  // Alternatives: Math.min(scaleX, scaleY) for conservative, or sqrt(scaleX * scaleY) for area-preserving
  const avgScale = (scaleX + scaleY) / 2;
  const newStrokeWidth = Math.round(original.strokeWidth * avgScale);

  // Optional: Adjust based on direction (e.g., if resizing from top-left, points might need flip/recalc, but usually not needed as scaling handles it)

  return {
    rect: ctx.rect,
    inkList: newInkList,
    strokeWidth: newStrokeWidth,
  };
};
