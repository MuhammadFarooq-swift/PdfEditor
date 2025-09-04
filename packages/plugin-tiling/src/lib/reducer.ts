import { Reducer } from '@embedpdf/core';

import { UPDATE_VISIBLE_TILES, MARK_TILE_STATUS, TilingAction } from './actions';
import { Tile, TilingState } from './types';

export const initialState: TilingState = {
  visibleTiles: {},
};

export const tilingReducer: Reducer<TilingState, TilingAction> = (state, action) => {
  switch (action.type) {
    case UPDATE_VISIBLE_TILES: {
      const incoming = action.payload; // Record<number, Tile[]>
      const nextPages = { ...state.visibleTiles };

      for (const key in incoming) {
        const pageIndex = Number(key);
        const newTiles = incoming[pageIndex]; // all isFallback=false
        const prevTiles = nextPages[pageIndex] ?? [];

        const prevScale = prevTiles.find((t) => !t.isFallback)?.srcScale;
        const newScale = newTiles[0].srcScale;
        const zoomChanged = prevScale !== undefined && prevScale !== newScale;

        if (zoomChanged) {
          /* 1️⃣  ready tiles from the old zoom → new fallback */
          const promoted = prevTiles
            .filter((t) => !t.isFallback && t.status === 'ready')
            .map((t) => ({ ...t, isFallback: true }));

          /* 2️⃣  decide which fallback tiles to keep           */
          const fallbackToCarry = promoted.length > 0 ? [] : prevTiles.filter((t) => t.isFallback);

          /* 3️⃣  final list = (maybe-kept fallback) + promoted + newTiles */
          nextPages[pageIndex] = [...fallbackToCarry, ...promoted, ...newTiles];
        } else {
          /* same zoom → keep current fallback, replace visible */
          const newIds = new Set(newTiles.map((t) => t.id));
          const keepers: Tile[] = []; // where we’ll collect surviving tiles
          const seenIds = new Set<string>();

          /* 2️⃣  loop prevTiles once */
          for (const t of prevTiles) {
            if (t.isFallback) {
              keepers.push(t); // always keep fallback
              seenIds.add(t.id);
            } else if (newIds.has(t.id)) {
              keepers.push(t); // keep old visible tile (preserves status)
              seenIds.add(t.id);
            }
          }

          /* 3️⃣  append *brand-new* tiles (not yet kept) */
          for (const t of newTiles) {
            if (!seenIds.has(t.id)) keepers.push(t);
          }

          /* 4️⃣  store result */
          nextPages[pageIndex] = keepers;
        }
      }

      return { ...state, visibleTiles: nextPages };
    }

    case MARK_TILE_STATUS: {
      const { pageIndex, tileId, status } = action.payload;
      const tiles =
        state.visibleTiles[pageIndex]?.map((t) =>
          t.id === tileId ? ({ ...t, status } as Tile) : t,
        ) ?? [];

      const newTiles = tiles.filter((t) => !t.isFallback);
      const allReady = newTiles.every((t) => t.status === 'ready');
      const finalTiles = allReady ? newTiles : tiles;

      return {
        ...state,
        visibleTiles: { ...state.visibleTiles, [pageIndex]: finalTiles },
      };
    }

    default:
      return state;
  }
};
