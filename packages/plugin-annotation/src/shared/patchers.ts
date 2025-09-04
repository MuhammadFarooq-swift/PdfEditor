import { PdfAnnotationObject, Rect, Position } from '@embedpdf/models';
import { ResizeDirection } from './types';

export interface PatchContext {
  rect: Rect; // current bbox
  vertices?: Position[]; // optional new vertices
  direction?: ResizeDirection; // which resize handle, if any
  uniform?: boolean; // if true, constrains to uniform scaling (uses min scale factor)
}

export type ComputePatch<T extends PdfAnnotationObject> = (
  original: T,
  ctx: PatchContext,
) => Partial<T>;
