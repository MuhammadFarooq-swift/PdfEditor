import { ReactNode, useEffect, useState, HTMLAttributes } from '@framework';

import { useViewportCapability } from '../hooks';
import { useViewportRef } from '../hooks/use-viewport-ref';

type ViewportProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Viewport({ children, ...props }: ViewportProps) {
  const [viewportGap, setViewportGap] = useState(0);
  const viewportRef = useViewportRef();
  const { provides: viewportProvides } = useViewportCapability();

  useEffect(() => {
    if (viewportProvides) {
      setViewportGap(viewportProvides.getViewportGap());
    }
  }, [viewportProvides]);

  const { style, ...restProps } = props;
  return (
    <div
      {...restProps}
      ref={viewportRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        ...(typeof style === 'object' ? style : {}),
        padding: `${viewportGap}px`,
      }}
    >
      {children}
    </div>
  );
}
