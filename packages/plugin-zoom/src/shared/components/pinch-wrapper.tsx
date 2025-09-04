import { ReactNode, HTMLAttributes, CSSProperties } from '@framework';

import { usePinch } from '../hooks';

type PinchWrapperProps = Omit<HTMLAttributes<HTMLDivElement>, 'style'> & {
  children: ReactNode;
  style?: CSSProperties;
};

export function PinchWrapper({ children, style, ...props }: PinchWrapperProps) {
  const { elementRef } = usePinch();

  return (
    <div
      ref={elementRef}
      {...props}
      style={{
        ...style,
        display: 'block',
        width: 'fit-content',
        overflow: 'visible',
        boxSizing: 'border-box',
        margin: '0px auto',
      }}
    >
      {children}
    </div>
  );
}
