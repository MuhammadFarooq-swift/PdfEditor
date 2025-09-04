import { HTMLAttributes, CSSProperties, MouseEvent, TouchEvent } from '@framework';
import { Rect } from '@embedpdf/models';

type StrikeoutProps = Omit<HTMLAttributes<HTMLDivElement>, 'style'> & {
  color?: string;
  opacity?: number;
  rects: Rect[];
  rect?: Rect;
  scale: number;
  onClick?: (e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) => void;
  style?: CSSProperties;
};

export function Strikeout({
  color = '#FFFF00',
  opacity = 0.5,
  rects,
  rect,
  scale,
  onClick,
  style,
  ...props
}: StrikeoutProps) {
  const thickness = 2 * scale;

  return (
    <>
      {rects.map((r, i) => (
        <div
          key={i}
          onPointerDown={onClick}
          onTouchStart={onClick}
          style={{
            position: 'absolute',
            left: (rect ? r.origin.x - rect.origin.x : r.origin.x) * scale,
            top: (rect ? r.origin.y - rect.origin.y : r.origin.y) * scale,
            width: r.size.width * scale,
            height: r.size.height * scale,
            background: 'transparent',
            pointerEvents: onClick ? 'auto' : 'none',
            cursor: onClick ? 'pointer' : 'default',
            zIndex: onClick ? 1 : 0,
            ...style,
          }}
          {...props}
        >
          {/* Visual strikeout line */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: '50%',
              width: '100%',
              height: thickness,
              background: color,
              opacity: opacity,
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
          />
        </div>
      ))}
    </>
  );
}
