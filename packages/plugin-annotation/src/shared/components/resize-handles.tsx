import { ResizeDirection } from '../types';
import { PointerEvent } from '@framework';

interface Props {
  rotation: number;
  outlineOffset?: number;
  startResize: (d: ResizeDirection) => (e: PointerEvent<HTMLDivElement>) => void;
}

const commonStyle = (o: number) => ({
  position: 'absolute' as const,
  width: 13,
  height: 13,
  background: 'red',
  borderRadius: '50%',
});

export function ResizeHandles({ rotation, outlineOffset = 1, startResize }: Props) {
  const o = outlineOffset;
  return (
    <>
      <div
        style={{
          ...commonStyle(o),
          top: -7 - o,
          left: -7 - o,
          cursor: rotation % 2 ? 'nesw-resize' : 'nwse-resize',
        }}
        onPointerDown={startResize('top-left')}
      />
      <div
        style={{
          ...commonStyle(o),
          top: -7 - o,
          right: -7 - o,
          cursor: rotation % 2 ? 'nwse-resize' : 'nesw-resize',
        }}
        onPointerDown={startResize('top-right')}
      />
      <div
        style={{
          ...commonStyle(o),
          bottom: -7 - o,
          left: -7 - o,
          cursor: rotation % 2 ? 'nwse-resize' : 'nesw-resize',
        }}
        onPointerDown={startResize('bottom-left')}
      />
      <div
        style={{
          ...commonStyle(o),
          bottom: -7 - o,
          right: -7 - o,
          cursor: rotation % 2 ? 'nesw-resize' : 'nwse-resize',
        }}
        onPointerDown={startResize('bottom-right')}
      />
    </>
  );
}
