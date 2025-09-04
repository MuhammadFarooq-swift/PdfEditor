import { useCapability, usePlugin } from '@embedpdf/core/@framework';
import { TilingPlugin } from '@embedpdf/plugin-tiling';

export const useTilingPlugin = () => usePlugin<TilingPlugin>(TilingPlugin.id);
export const useTilingCapability = () => useCapability<TilingPlugin>(TilingPlugin.id);
