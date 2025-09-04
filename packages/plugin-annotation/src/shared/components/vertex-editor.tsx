import { JSX, Fragment, PointerEvent, useState, useRef } from '@framework';
import { Position, Rect, restoreOffset } from '@embedpdf/models';

export interface VertexEditorProps {
  /** Bounding box (PDF units) of the annotation            */
  rect: Rect;
  /** Page rotation (0-3)                                    */
  rotation: number;
  /** Current zoom factor                                   */
  scale: number;
  /** Array of vertices in PDF units                        */
  vertices: Position[];
  /** Called *every* drag frame with new vertices           */
  onEdit: (v: Position[]) => void;
  /** Called once at end of drag to commit changes          */
  onCommit: (v: Position[]) => void;
  /** Size of handle in CSS px                              */
  handleSize?: number;
}

/*
 * Renders N absolutely-positioned <div> handles *inside*
 * the already-counter-rotated AnnotationContainer.  Each
 * handle captures pointer-events and updates the vertex
 * array in PDF units via restoreOffset().
 */
export function VertexEditor({
  rect,
  rotation,
  scale,
  vertices,
  onEdit,
  onCommit,
  handleSize = 12,
}: VertexEditorProps): JSX.Element {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const startScreen = useRef<{ x: number; y: number } | null>(null);
  const startVerts = useRef<Position[]>([]);

  const applyDelta = (deltaScreen: { x: number; y: number }): Position[] => {
    const deltaPdf = restoreOffset(deltaScreen, rotation, scale);
    const next = [...startVerts.current];
    if (dragIdx !== null) {
      next[dragIdx] = {
        x: next[dragIdx].x + deltaPdf.x,
        y: next[dragIdx].y + deltaPdf.y,
      };
    }
    return next;
  };

  // ─── pointer handlers ───────────────────────────────────────
  const handleDown = (idx: number) => (e: PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setDragIdx(idx);
    startScreen.current = { x: e.clientX, y: e.clientY };
    startVerts.current = vertices;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragIdx === null || !startScreen.current) return;
    const deltaRaw = {
      x: e.clientX - startScreen.current.x,
      y: e.clientY - startScreen.current.y,
    };
    onEdit(applyDelta(deltaRaw));
  };

  const handleUp = (e: PointerEvent<HTMLDivElement>) => {
    if (dragIdx === null || !startScreen.current) return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    const deltaRaw = {
      x: e.clientX - startScreen.current.x,
      y: e.clientY - startScreen.current.y,
    };
    onCommit(applyDelta(deltaRaw));
    setDragIdx(null);
  };

  // ─── render handles ─────────────────────────────────────────
  return (
    <Fragment>
      {vertices.map((v, i) => {
        const left = (v.x - rect.origin.x) * scale - handleSize / 2;
        const top = (v.y - rect.origin.y) * scale - handleSize / 2;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left,
              top,
              width: handleSize,
              height: handleSize,
              borderRadius: '50%',
              background: '#2196f3',
              cursor: 'pointer',
              pointerEvents: 'auto',
              zIndex: 4,
            }}
            onPointerDown={handleDown(i)}
            onPointerMove={handleMove}
            onPointerUp={handleUp}
          />
        );
      })}
    </Fragment>
  );
}
