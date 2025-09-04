import { HTMLAttributes, CSSProperties } from '@framework';
import { Annotations } from './annotations';
import { TextMarkup } from './text-markup';
import { InkPaint } from './annotations/ink-paint';
import { SelectionMenu } from '../types';
import { CirclePaint } from './annotations/circle-paint';
import { SquarePaint } from './annotations/square-paint';
import { PolylinePaint } from './annotations/polyline-paint';
import { LinePaint } from './annotations/line-paint';
import { PolygonPaint } from './annotations/polygon-paint';
import { FreeTextPaint } from './annotations/free-text-paint';
import { StampPaint } from './annotations/stamp-paint';

type AnnotationLayerProps = Omit<HTMLAttributes<HTMLDivElement>, 'style'> & {
  pageIndex: number;
  scale: number;
  pageWidth: number;
  pageHeight: number;
  rotation: number;
  selectionMenu?: SelectionMenu;
  style?: CSSProperties;
};

export function AnnotationLayer({
  pageIndex,
  scale,
  pageWidth,
  pageHeight,
  rotation,
  selectionMenu,
  style,
  ...props
}: AnnotationLayerProps) {
  return (
    <div
      style={{
        ...style,
      }}
      {...props}
    >
      <Annotations
        selectionMenu={selectionMenu}
        pageIndex={pageIndex}
        scale={scale}
        rotation={rotation}
        pageWidth={pageWidth}
        pageHeight={pageHeight}
      />
      <TextMarkup pageIndex={pageIndex} scale={scale} />
      <InkPaint pageIndex={pageIndex} scale={scale} pageWidth={pageWidth} pageHeight={pageHeight} />
      <CirclePaint
        pageIndex={pageIndex}
        scale={scale}
        pageWidth={pageWidth}
        pageHeight={pageHeight}
      />
      <SquarePaint
        pageIndex={pageIndex}
        scale={scale}
        pageWidth={pageWidth}
        pageHeight={pageHeight}
      />
      <PolygonPaint
        pageIndex={pageIndex}
        scale={scale}
        pageWidth={pageWidth}
        pageHeight={pageHeight}
      />
      <PolylinePaint
        pageIndex={pageIndex}
        scale={scale}
        pageWidth={pageWidth}
        pageHeight={pageHeight}
      />
      <LinePaint
        pageIndex={pageIndex}
        scale={scale}
        pageWidth={pageWidth}
        pageHeight={pageHeight}
      />
      <FreeTextPaint
        pageIndex={pageIndex}
        scale={scale}
        pageWidth={pageWidth}
        pageHeight={pageHeight}
      />
      <StampPaint
        pageIndex={pageIndex}
        scale={scale}
        pageWidth={pageWidth}
        pageHeight={pageHeight}
      />
    </div>
  );
}
