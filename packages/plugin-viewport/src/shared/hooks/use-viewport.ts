import { useCapability, usePlugin } from '@embedpdf/core/@framework';
import { ViewportPlugin } from '@embedpdf/plugin-viewport';

export const useViewportPlugin = () => usePlugin<ViewportPlugin>(ViewportPlugin.id);
export const useViewportCapability = () => useCapability<ViewportPlugin>(ViewportPlugin.id);
