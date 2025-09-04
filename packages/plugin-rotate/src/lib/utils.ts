import { Rotation } from '@embedpdf/models';

/**
 * Returns the 6-tuple you can drop straight into
 * `matrix(a,b,c,d,e,f)` or a ready-made CSS string.
 * Rotation is clockwise, origin = top-left (0 0).
 *
 * ── Note on e,f ───────────────────────────────
 * For 0°/180° no translation is needed.
 * For 90°/270° you may want to pass the page
 * height / width so the page stays in positive
 * coordinates.  Keep them 0 and handle layout
 * elsewhere if that’s what you do today.
 */
export function rotationMatrix(
  rotation: Rotation,
  w: number,
  h: number,
  asString = true,
): [number, number, number, number, number, number] | string {
  let a = 1,
    b = 0,
    c = 0,
    d = 1,
    e = 0,
    f = 0;

  switch (rotation) {
    case 1: // 90°
      a = 0;
      b = 1;
      c = -1;
      d = 0;
      e = h;
      break;
    case 2: // 180°
      a = -1;
      b = 0;
      c = 0;
      d = -1;
      e = w;
      f = h;
      break;
    case 3: // 270°
      a = 0;
      b = -1;
      c = 1;
      d = 0;
      f = w;
      break;
  }
  return asString ? `matrix(${a},${b},${c},${d},${e},${f})` : [a, b, c, d, e, f];
}
