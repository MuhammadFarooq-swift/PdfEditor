import { Rect } from '@embedpdf/models';
import { ScrollCapability } from '@embedpdf/plugin-scroll';
import { ViewportCapability, ViewportMetrics } from '@embedpdf/plugin-viewport';

export type MenuCoords = { left: number; top: number } | null;

function edgeVisible(
  vr: Rect,
  vp: ViewportMetrics,
  menuHeight: number,
  margin: number,
  vpGap: number,
  isTop: boolean,
) {
  if (isTop) {
    // For top position, check if there's enough space above the rect including margin
    return vr.origin.y + vpGap >= menuHeight + margin;
  } else {
    // For bottom position, check if there's enough space below the rect including margin
    return (
      vr.origin.y + vpGap + vr.size.height + menuHeight + margin <= vp.scrollTop + vp.clientHeight
    );
  }
}

/**
 * Decide where to place the menu for a *multi-page* selection.
 *
 * boundingRects ··· one rect per page
 * scrollCap     ··· converts page-space → viewport-space
 * vpCap         ··· live viewport metrics
 * margin        ··· gap between rect and menu
 */
export function menuPositionForSelection(
  boundingRects: { page: number; rect: Rect }[],
  scrollCap: ScrollCapability,
  vpCap: ViewportCapability,
  margin = 8,
  menuHeight = 40,
): MenuCoords {
  if (!boundingRects.length) return null;

  const vp = vpCap.getMetrics();
  const vpGap = vpCap.getViewportGap();

  // Get the relevant rect(s) for positioning
  const rects =
    boundingRects.length === 1
      ? { first: boundingRects[0], last: boundingRects[0] }
      : { first: boundingRects[0], last: boundingRects[boundingRects.length - 1] };

  const firstVR = scrollCap.getRectPositionForPage(rects.first.page, rects.first.rect);
  const lastVR = scrollCap.getRectPositionForPage(rects.last.page, rects.last.rect);

  if (!firstVR || !lastVR) return null;

  const bottomSpaceAvailable = edgeVisible(lastVR, vp, menuHeight, margin, vpGap, false);
  const topSpaceAvailable = edgeVisible(firstVR, vp, menuHeight, margin, vpGap, true);

  if (bottomSpaceAvailable) {
    return {
      left: lastVR.origin.x + lastVR.size.width / 2,
      top: lastVR.origin.y + lastVR.size.height + margin,
    };
  }
  if (topSpaceAvailable) {
    return {
      left: firstVR.origin.x + firstVR.size.width / 2,
      top: firstVR.origin.y - margin - menuHeight,
    };
  }
  return null;
}

export const formatDate = (dateValue?: string | Date) => {
  if (!dateValue) return '(no date)';
  try {
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return typeof dateValue === 'string' ? dateValue : '(no date)';
  }
};
