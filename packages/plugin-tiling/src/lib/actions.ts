import { Tile, TileStatus } from './types';

export const UPDATE_VISIBLE_TILES = 'UPDATE_VISIBLE_TILES';
export const MARK_TILE_STATUS = 'MARK_TILE_STATUS';

export type UpdateVisibleTilesAction = {
  type: typeof UPDATE_VISIBLE_TILES;
  payload: Record<number, Tile[]>;
};

export type MarkTileStatusAction = {
  type: typeof MARK_TILE_STATUS;
  payload: { pageIndex: number; tileId: string; status: TileStatus };
};

export type TilingAction = UpdateVisibleTilesAction | MarkTileStatusAction;

export const updateVisibleTiles = (tiles: Record<number, Tile[]>): UpdateVisibleTilesAction => ({
  type: UPDATE_VISIBLE_TILES,
  payload: tiles,
});

export const markTileStatus = (
  pageIndex: number,
  tileId: string,
  status: TileStatus,
): MarkTileStatusAction => ({ type: MARK_TILE_STATUS, payload: { pageIndex, tileId, status } });
