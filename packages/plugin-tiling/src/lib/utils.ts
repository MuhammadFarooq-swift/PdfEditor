import { Rect, restoreRect, transformSize } from '@embedpdf/models';
import { CalculateTilesForPageOptions, Tile } from './types';

/**
 * Build a grid where neighbouring tiles overlap by `overlapPx`
 * (screen pixels). Inner tiles keep the full `tileSize`, edge
 * tiles are clipped to the page bounds. All screen-space values
 * are rounded to **integers** to avoid sub-pixel seams.
 */
export function calculateTilesForPage({
  tileSize = 768,
  overlapPx = 2.5,
  extraRings = 0,
  scale,
  rotation,
  page,
  metric,
}: CalculateTilesForPageOptions): Tile[] {
  /* ---- work in screen-pixel space -------------------------------- */
  const pageW = page.size.width * scale; // px
  const pageH = page.size.height * scale; // px

  const step = tileSize - overlapPx; // shift between tiles

  const containerSize = transformSize(page.size, rotation, scale);
  const rotatedVisRect: Rect = {
    origin: { x: metric.scaled.pageX, y: metric.scaled.pageY },
    size: { width: metric.scaled.visibleWidth, height: metric.scaled.visibleHeight },
  };
  const unrotatedVisRect = restoreRect(containerSize, rotatedVisRect, rotation, 1);

  const visLeft = unrotatedVisRect.origin.x;
  const visTop = unrotatedVisRect.origin.y;
  const visRight = visLeft + unrotatedVisRect.size.width;
  const visBottom = visTop + unrotatedVisRect.size.height;

  const maxCol = Math.floor((pageW - 1) / step);
  const maxRow = Math.floor((pageH - 1) / step);

  const startCol = Math.max(0, Math.floor(visLeft / step) - extraRings);
  const endCol = Math.min(maxCol, Math.floor((visRight - 1) / step) + extraRings);
  const startRow = Math.max(0, Math.floor(visTop / step) - extraRings);
  const endRow = Math.min(maxRow, Math.floor((visBottom - 1) / step) + extraRings);

  /* ---- build tiles ---------------------------------------------- */
  const tiles: Tile[] = [];

  for (let col = startCol; col <= endCol; col++) {
    const xScreen = col * step; // px (integer)
    const wScreen = Math.min(tileSize, pageW - xScreen); // px (≤  tileSize)

    const xPage = xScreen / scale; // pt (may be frac.)
    const wPage = wScreen / scale; // pt

    for (let row = startRow; row <= endRow; row++) {
      const yScreen = row * step;
      const hScreen = Math.min(tileSize, pageH - yScreen);

      const yPage = yScreen / scale;
      const hPage = hScreen / scale;

      tiles.push({
        id: `p${page.index}-${scale}-x${xScreen}-y${yScreen}-w${wScreen}-h${hScreen}`,
        col,
        row,
        pageRect: { origin: { x: xPage, y: yPage }, size: { width: wPage, height: hPage } },
        screenRect: {
          origin: { x: xScreen, y: yScreen },
          size: { width: wScreen, height: hScreen },
        },
        status: 'queued',
        srcScale: scale,
        isFallback: false,
      });
    }
  }

  return tiles;
}
