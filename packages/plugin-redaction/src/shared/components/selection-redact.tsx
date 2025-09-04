import { Rect } from '@embedpdf/models';

import { useEffect, useState } from '@framework';
import { useRedactionCapability } from '../hooks';
import { Highlight } from './highlight';

interface SelectionRedactProps {
  pageIndex: number;
  scale: number;
}

export function SelectionRedact({ pageIndex, scale }: SelectionRedactProps) {
  const { provides: redactionProvides } = useRedactionCapability();
  const [rects, setRects] = useState<Array<Rect>>([]);
  const [boundingRect, setBoundingRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (!redactionProvides) return;

    return redactionProvides.onRedactionSelectionChange((formattedSelection) => {
      const selection = formattedSelection.find((s) => s.pageIndex === pageIndex);
      setRects(selection?.segmentRects ?? []);
      setBoundingRect(selection?.rect ?? null);
    });
  }, [redactionProvides, pageIndex]);

  if (!boundingRect) return null;

  return (
    <div
      style={{
        mixBlendMode: 'normal',
        pointerEvents: 'none',
        position: 'absolute',
        inset: 0,
      }}
    >
      <Highlight
        color={'transparent'}
        opacity={1}
        rects={rects}
        scale={scale}
        border="1px solid red"
      />
    </div>
  );
}
