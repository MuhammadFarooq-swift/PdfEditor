import { useEffect, useState } from '@framework';
import { Rect } from '@embedpdf/models';

import { useRedactionPlugin } from '../hooks/use-redaction';

interface MarqueeRedactProps {
  /** Index of the page this layer lives on */
  pageIndex: number;
  /** Scale of the page */
  scale: number;
  /** Optional CSS class applied to the marquee rectangle */
  className?: string;
  /** Stroke / fill colours (defaults below) */
  stroke?: string;
  fill?: string;
}

export const MarqueeRedact = ({
  pageIndex,
  scale,
  className,
  stroke = 'red',
  fill = 'transparent',
}: MarqueeRedactProps) => {
  const { plugin: redactionPlugin } = useRedactionPlugin();

  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (!redactionPlugin) return;
    return redactionPlugin.registerMarqueeOnPage({
      pageIndex,
      scale,
      callback: {
        onPreview: setRect,
      },
    });
  }, [redactionPlugin, pageIndex]);

  if (!rect) return null;

  return (
    <div
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        left: rect.origin.x * scale,
        top: rect.origin.y * scale,
        width: rect.size.width * scale,
        height: rect.size.height * scale,
        border: `1px solid ${stroke}`,
        background: fill,
        boxSizing: 'border-box',
      }}
      className={className}
    />
  );
};
