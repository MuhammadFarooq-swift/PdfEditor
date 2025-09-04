import { useCapability, usePlugin } from '@embedpdf/core/@framework';
import { UIPlugin } from '@embedpdf/plugin-ui';

export const useUIPlugin = () => usePlugin<UIPlugin>(UIPlugin.id);
export const useUICapability = () => useCapability<UIPlugin>(UIPlugin.id);
