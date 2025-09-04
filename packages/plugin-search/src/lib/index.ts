import { PluginPackage } from '@embedpdf/core';
import { SearchPlugin } from './search-plugin';
import { manifest, SEARCH_PLUGIN_ID } from './manifest';
import { SearchPluginConfig, SearchState } from './types';
import { searchReducer, initialState } from './reducer';
import { SearchAction } from './actions';

export const SearchPluginPackage: PluginPackage<
  SearchPlugin,
  SearchPluginConfig,
  SearchState,
  SearchAction
> = {
  manifest,
  create: (registry) => new SearchPlugin(SEARCH_PLUGIN_ID, registry),
  reducer: searchReducer,
  initialState,
};

export * from './search-plugin';
export * from './types';
export * from './manifest';
export { initialState };
