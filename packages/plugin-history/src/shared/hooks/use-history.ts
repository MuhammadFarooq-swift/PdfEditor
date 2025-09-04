import { useCapability, usePlugin } from '@embedpdf/core/@framework';
import { HistoryPlugin } from '@embedpdf/plugin-history';

export const useHistoryPlugin = () => usePlugin<HistoryPlugin>(HistoryPlugin.id);
export const useHistoryCapability = () => useCapability<HistoryPlugin>(HistoryPlugin.id);
