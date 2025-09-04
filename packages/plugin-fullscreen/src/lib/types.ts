import { BasePluginConfig, EventHook } from '@embedpdf/core';

export interface FullscreenState {
  isFullscreen: boolean;
}

export interface FullscreenPluginConfig extends BasePluginConfig {}

export interface FullscreenCapability {
  isFullscreen: () => boolean;
  enableFullscreen: () => void;
  exitFullscreen: () => void;
  toggleFullscreen: () => void;
  onRequest: EventHook<'enter' | 'exit'>;
  onStateChange: EventHook<FullscreenState>;
}
