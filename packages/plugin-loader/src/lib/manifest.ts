import { PluginManifest } from '@embedpdf/core';
import { LoaderPluginConfig } from './types';

export const LOADER_PLUGIN_ID = 'loader';

export const manifest: PluginManifest<LoaderPluginConfig> = {
  id: LOADER_PLUGIN_ID,
  name: 'Loader Plugin',
  version: '1.0.0',
  provides: ['loader'],
  requires: [],
  optional: [],
  metadata: {
    name: 'Loader Plugin',
    description: 'A plugin for loading PDF documents',
    version: '1.0.0',
    author: 'EmbedPDF',
    license: 'MIT',
  },
  defaultConfig: {
    enabled: true,
  },
};
