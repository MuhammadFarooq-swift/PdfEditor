import { useCapability, usePlugin } from '@embedpdf/core/vue';
import { TilingPlugin } from '@embedpdf/plugin-tiling';

/** Get the plugin instance itself (e.g. to read config) */
export const useTilingPlugin = () => usePlugin<TilingPlugin>(TilingPlugin.id);
/** Get the *capability* the plugin exposes (renderTile, onTileRendering) */
export const useTilingCapability = () => useCapability<TilingPlugin>(TilingPlugin.id);
