import { PluginPackage } from '@embedpdf/core';
import { manifest, THUMBNAIL_PLUGIN_ID } from './manifest';
import { ThumbnailPluginConfig } from './types';
import { ThumbnailPlugin } from './thumbnail-plugin';

export const ThumbnailPluginPackage: PluginPackage<ThumbnailPlugin, ThumbnailPluginConfig> = {
  manifest,
  create: (registry, config) => new ThumbnailPlugin(THUMBNAIL_PLUGIN_ID, registry, config),
  reducer: () => {},
  initialState: {},
};

export * from './thumbnail-plugin';
export * from './types';
export * from './manifest';
