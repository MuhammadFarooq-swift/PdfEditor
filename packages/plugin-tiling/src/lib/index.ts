import { PluginPackage } from '@embedpdf/core';

import { TilingAction } from './actions';
import { manifest, TILING_PLUGIN_ID } from './manifest';
import { initialState, tilingReducer } from './reducer';
import { TilingPlugin } from './tiling-plugin';
import { TilingPluginConfig, TilingState } from './types';

export const TilingPluginPackage: PluginPackage<
  TilingPlugin,
  TilingPluginConfig,
  TilingState,
  TilingAction
> = {
  manifest,
  create: (registry, config) => new TilingPlugin(TILING_PLUGIN_ID, registry, config),
  reducer: (state, action) => tilingReducer(state, action),
  initialState,
};

export * from './tiling-plugin';
export * from './types';
export * from './manifest';
