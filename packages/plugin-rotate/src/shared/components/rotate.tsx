import { ReactNode, HTMLAttributes, CSSProperties } from '@framework';
import { Size } from '@embedpdf/models';

import { useRotateCapability } from '../hooks';

type RotateProps = Omit<HTMLAttributes<HTMLDivElement>, 'style'> & {
  children: ReactNode;
  pageSize: Size;
  style?: CSSProperties;
};

export function Rotate({ children, pageSize, style, ...props }: RotateProps) {
  const { provides: rotate } = useRotateCapability();
  const matrix =
    (rotate?.getMatrix({
      w: pageSize.width,
      h: pageSize.height,
    }) as string) || 'matrix(1, 0, 0, 1, 0, 0)';

  return (
    <div
      {...props}
      style={{
        position: 'absolute',
        transformOrigin: '0 0',
        transform: matrix,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
