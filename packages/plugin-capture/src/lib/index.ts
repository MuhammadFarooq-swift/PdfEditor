import { PluginPackage } from '@embedpdf/core';
import { manifest, CAPTURE_PLUGIN_ID } from './manifest';
import { CapturePluginConfig } from './types';
import { CapturePlugin } from './capture-plugin';

export const CapturePluginPackage: PluginPackage<CapturePlugin, CapturePluginConfig> = {
  manifest,
  create: (registry, config) => new CapturePlugin(CAPTURE_PLUGIN_ID, registry, config),
  reducer: () => {},
  initialState: {},
};

export * from './capture-plugin';
export * from './types';
export * from './manifest';
