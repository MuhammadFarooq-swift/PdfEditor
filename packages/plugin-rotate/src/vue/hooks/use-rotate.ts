import { useCapability, usePlugin } from '@embedpdf/core/vue';
import { RotatePlugin } from '@embedpdf/plugin-rotate';

/**
 * Hook to get the raw rotate plugin instance.
 */
export const useRotatePlugin = () => usePlugin<RotatePlugin>(RotatePlugin.id);

/**
 * Hook to get the rotate plugin's capability API.
 * This provides methods for rotating the document.
 */
export const useRotateCapability = () => useCapability<RotatePlugin>(RotatePlugin.id);
