import { useCapability, usePlugin } from '@embedpdf/core/@framework';
import { RenderPlugin } from '@embedpdf/plugin-render';

export const useRenderPlugin = () => usePlugin<RenderPlugin>(RenderPlugin.id);
export const useRenderCapability = () => useCapability<RenderPlugin>(RenderPlugin.id);
