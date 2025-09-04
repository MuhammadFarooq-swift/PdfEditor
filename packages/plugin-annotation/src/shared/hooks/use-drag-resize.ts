import { PointerEvent, TouchEvent, useState, useRef, useEffect } from '@framework';
import { PdfAnnotationObject, Position, Rect, restoreOffset } from '@embedpdf/models';
import { TrackedAnnotation } from '@embedpdf/plugin-annotation';
import { ResizeDirection } from '../types';
import { ComputePatch } from '../patchers';

interface UseDragResizeOpts<T extends PdfAnnotationObject> {
  /* invariants */
  scale: number;
  pageWidth: number;
  pageHeight: number;
  rotation: number;

  /* annotation info */
  tracked: TrackedAnnotation<T>;

  /* config */
  isSelected: boolean;
  isDraggable: boolean;
  isResizable: boolean;
  computePatch?: ComputePatch<T>;
  computeVertices?: (a: T) => Position[];
  lockAspectRatio?: boolean;

  /* state held by caller */
  currentRect: Rect;
  setCurrentRect: (r: Rect) => void;
  setCurrentVertices: (v: Position[]) => void;
  setPreviewObject: (p: Partial<T> | null) => void;

  /* commit */
  commit: (patch: Partial<T>) => void;
}

type Point = { x: number; y: number };
type DragState = 'idle' | 'dragging' | 'resizing';

export function useDragResize<T extends PdfAnnotationObject>({
  scale,
  pageWidth,
  pageHeight,
  rotation,
  tracked,
  isSelected,
  isDraggable,
  isResizable,
  computePatch,
  computeVertices,
  lockAspectRatio = false,
  currentRect,
  setCurrentRect,
  setCurrentVertices,
  setPreviewObject,
  commit,
}: UseDragResizeOpts<T>) {
  /* ── local refs ─────────────────────────────────────────── */
  const drag = useRef<DragState>('idle');
  const dir = useRef<ResizeDirection>('none');
  const startPos = useRef<Point | null>(null);
  const startRect = useRef<Rect | null>(null);

  /* ── helpers ────────────────────────────────────────────── */
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
  const pageW = pageWidth / scale;
  const pageH = pageHeight / scale;

  /* ── core maths shared by drag + resize ─────────────────── */
  const applyDelta = (dx: number, dy: number) => {
    if (!startRect.current) return currentRect;

    let { origin, size } = startRect.current;

    let ox = origin.x;
    let oy = origin.y;
    let w = size.width;
    let h = size.height;

    if (drag.current === 'dragging') {
      ox += dx;
      oy += dy;
    } else if (drag.current === 'resizing') {
      if (dir.current.includes('right')) w += dx;
      else if (dir.current.includes('left')) {
        ox += dx;
        w -= dx;
      }
      if (dir.current.includes('bottom')) h += dy;
      else if (dir.current.includes('top')) {
        oy += dy;
        h -= dy;
      }

      /* maintain aspect ratio if requested */
      if (lockAspectRatio && startRect.current) {
        const ratio = startRect.current.size.width / startRect.current.size.height;

        /* store anchors before adjusting (so we can restore them later) */
        const anchorRight = ox + w;
        const anchorBottom = oy + h;

        /* decide the primary axis once, based on the resize handle */
        const horizontalPrimary = dir.current.includes('left') || dir.current.includes('right');
        if (horizontalPrimary) {
          // width is changing → derive height from width
          h = w / ratio;
        } else {
          // height is changing → derive width from height
          w = h * ratio;
        }

        /* adjust origin to preserve anchors for left/top sides */
        if (dir.current.includes('left')) {
          ox = anchorRight - w;
        }
        if (dir.current.includes('top')) {
          oy = anchorBottom - h;
        }
      }
    }
    /* prevent negative dimensions */
    if (w < 1 || h < 1) return currentRect;

    /* clamp to page */
    w = clamp(w, 1, pageW);
    h = clamp(h, 1, pageH);
    ox = clamp(ox, 0, pageW - w);
    oy = clamp(oy, 0, pageH - h);

    return { origin: { x: ox, y: oy }, size: { width: w, height: h } };
  };

  /* ── helpers inside the hook ────────────────────────────── */
  const beginDrag = (kind: DragState, clientX: number, clientY: number) => {
    drag.current = kind;
    startPos.current = { x: clientX, y: clientY };
    startRect.current = currentRect;
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (drag.current === 'idle' || !startPos.current) return;
    const disp = {
      x: clientX - startPos.current.x,
      y: clientY - startPos.current.y,
    };
    const { x, y } = restoreOffset(disp, rotation, scale);
    const nextRect = applyDelta(x, y);

    /* build preview patch */
    let patch: Partial<T> = { rect: nextRect } as Partial<T>;
    if (computePatch) {
      patch = computePatch(tracked.object, {
        rect: nextRect,
        direction: drag.current === 'resizing' ? dir.current : 'bottom-right',
      });
      if (computeVertices) setCurrentVertices(computeVertices({ ...tracked.object, ...patch }));
    }
    setCurrentRect(patch.rect ?? nextRect);
    setPreviewObject(patch);
  };

  const finishDragInternal = () => {
    if (drag.current === 'idle') return;

    const usedDir = dir.current || 'bottom-right';
    drag.current = 'idle';

    /* final patch */
    let patch: Partial<T> = { rect: currentRect } as Partial<T>;
    if (computePatch) {
      patch = computePatch(tracked.object, {
        rect: currentRect,
        direction: usedDir,
      });
    }
    commit(patch);

    /* cleanup */
    startPos.current = null;
    startRect.current = null;
    dir.current = 'none';
    setPreviewObject(null);
  };

  /* ── pointer handlers for the container ─────────────────── */
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!isSelected || !isDraggable) return;
    e.stopPropagation();
    e.preventDefault();
    beginDrag('dragging', e.clientX, e.clientY);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => handleMove(e.clientX, e.clientY);

  const onPointerUp = (e?: PointerEvent<HTMLDivElement>) => {
    finishDragInternal();
    if (e?.currentTarget && e.pointerId !== undefined) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* ignore – we might have already lost capture */
      }
    }
  };

  /* ── handle pointer-down from resize handles ────────────── */
  const startResize = (direction: ResizeDirection) => (e: PointerEvent<HTMLDivElement>) => {
    if (!isSelected || !isResizable) return;
    e.stopPropagation();
    e.preventDefault();
    dir.current = direction;
    beginDrag('resizing', e.clientX, e.clientY);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  /* ── touch handlers (mobile fallback) ───────────────────── */
  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (!isSelected || !isDraggable) return;
    e.stopPropagation();
    e.preventDefault();
    const t = e.touches[0];
    if (!t) return;
    beginDrag('dragging', t.clientX, t.clientY);
  };

  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    if (!t) return;
    handleMove(t.clientX, t.clientY);
  };

  const onTouchEnd = () => finishDragInternal();

  /* reset when annotation changes */
  useEffect(() => {
    drag.current = 'idle';
    dir.current = 'none';
    startPos.current = null;
    startRect.current = null;
  }, [tracked]);

  /* ── public surface ─────────────────────────────────────── */
  return {
    rootHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: () => onPointerUp(),
      onLostPointerCapture: () => onPointerUp(),

      /* mobile touch fallback */
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onTouchCancel: onTouchEnd,
    },
    startResize,
  };
}
