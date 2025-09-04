import { Tile } from '@embedpdf/plugin-tiling';
import { useEffect, useState, HTMLAttributes, CSSProperties } from '@framework';

import { TileImg } from './tile-img';
import { useTilingCapability } from '../hooks/use-tiling';

type TilingLayoutProps = Omit<HTMLAttributes<HTMLDivElement>, 'style'> & {
  pageIndex: number;
  scale: number;
  style?: CSSProperties;
};

export function TilingLayer({ pageIndex, scale, style, ...props }: TilingLayoutProps) {
  const { provides: tilingProvides } = useTilingCapability();
  const [tiles, setTiles] = useState<Tile[]>([]);

  useEffect(() => {
    if (tilingProvides) {
      return tilingProvides.onTileRendering((tiles) => setTiles(tiles[pageIndex]));
    }
  }, [tilingProvides]);

  return (
    <div
      style={{
        ...style,
      }}
      {...props}
    >
      {tiles?.map((tile) => (
        <TileImg
          key={tile.id}
          pageIndex={pageIndex}
          tile={tile}
          dpr={window.devicePixelRatio}
          scale={scale}
        />
      ))}
    </div>
  );
}
