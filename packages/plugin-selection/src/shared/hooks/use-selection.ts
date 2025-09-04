import { useCapability, usePlugin } from '@embedpdf/core/@framework';
import { SelectionPlugin } from '@embedpdf/plugin-selection';

export const useSelectionCapability = () => useCapability<SelectionPlugin>(SelectionPlugin.id);
export const useSelectionPlugin = () => usePlugin<SelectionPlugin>(SelectionPlugin.id);
