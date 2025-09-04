import { createContext } from '@framework';
import type { PluginRegistry } from '@embedpdf/core';

export interface PDFContextState {
  registry: PluginRegistry | null;
  isInitializing: boolean;
  pluginsReady: boolean;
}

export const PDFContext = createContext<PDFContextState>({
  registry: null,
  isInitializing: true,
  pluginsReady: false,
});
