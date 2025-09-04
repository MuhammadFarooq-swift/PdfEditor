import { InjectionKey, Ref, ShallowRef } from 'vue';
import type { PluginRegistry } from '@embedpdf/core';

export interface PDFContextState {
  registry: ShallowRef<PluginRegistry | null>;
  isInitializing: Ref<boolean>;
  pluginsReady: Ref<boolean>;
}

export const pdfKey: InjectionKey<PDFContextState> = Symbol('pdfKey');
