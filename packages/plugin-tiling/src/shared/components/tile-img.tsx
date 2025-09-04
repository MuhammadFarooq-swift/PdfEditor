import { ignore, PdfErrorCode } from '@embedpdf/models';
import { Tile } from '@embedpdf/plugin-tiling';
import { useEffect, useRef, useState } from '@framework';

import { useTilingCapability, useTilingPlugin } from '../hooks/use-tiling';

interface TileImgProps {
  pageIndex: number;
  tile: Tile;
  dpr: number;
  scale: number;
}

export function TileImg({ pageIndex, tile, dpr, scale }: TileImgProps) {
  const { provides: tilingCapability } = useTilingCapability();
  const { plugin: tilingPlugin } = useTilingPlugin();

  const [url, setUrl] = useState<string>();
  const urlRef = useRef<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const relativeScale = scale / tile.srcScale;

  useEffect(() => {
    if (!tilingPlugin) return;
    return tilingPlugin.onRefreshPages((pages) => {
      if (pages.includes(pageIndex)) {
        setRefreshTick((tick) => tick + 1);
      }
    });
  }, [tilingPlugin]);

  /* kick off render exactly once per tile */
  useEffect(() => {
    if (tile.status === 'ready' && urlRef.current) return; // already done
    if (!tilingCapability) return;
    const task = tilingCapability.renderTile({ pageIndex, tile, dpr });
    task.wait((blob) => {
      const objectUrl = URL.createObjectURL(blob);
      urlRef.current = objectUrl;
      setUrl(objectUrl);
    }, ignore);

    return () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      } else {
        task.abort({
          code: PdfErrorCode.Cancelled,
          message: 'canceled render task',
        });
      }
    };
  }, [pageIndex, tile.id, refreshTick]); // id includes scale, so unique

  const handleImageLoad = () => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  };

  if (!url) return null; // could render a placeholder
  return (
    <img
      src={url}
      onLoad={handleImageLoad}
      style={{
        position: 'absolute',
        left: tile.screenRect.origin.x * relativeScale,
        top: tile.screenRect.origin.y * relativeScale,
        width: tile.screenRect.size.width * relativeScale,
        height: tile.screenRect.size.height * relativeScale,
        display: 'block',
      }}
    />
  );
}
