import { PluginPackage } from '@embedpdf/core';
import { manifest, ROTATE_PLUGIN_ID } from './manifest';
import { RotatePluginConfig } from './types';
import { RotatePlugin } from './rotate-plugin';

export const RotatePluginPackage: PluginPackage<RotatePlugin, RotatePluginConfig> = {
  manifest,
  create: (registry, config) => new RotatePlugin(ROTATE_PLUGIN_ID, registry, config),
  reducer: () => {},
  initialState: {},
};

export * from './rotate-plugin';
export * from './types';
export * from './manifest';
