import { PluginPackage } from '@embedpdf/core';

import { AttachmentPlugin } from './attachment-plugin';
import { manifest, ATTACHMENT_PLUGIN_ID } from './manifest';
import { AttachmentPluginConfig } from './types';

export const AttachmentPluginPackage: PluginPackage<AttachmentPlugin, AttachmentPluginConfig> = {
  manifest,
  create: (registry) => new AttachmentPlugin(ATTACHMENT_PLUGIN_ID, registry),
  reducer: () => {},
  initialState: {},
};

export * from './attachment-plugin';
export * from './types';
export * from './manifest';
