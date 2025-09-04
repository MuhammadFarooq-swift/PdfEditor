import { useCapability, usePlugin } from '@embedpdf/core/vue';
import { RedactionPlugin } from '@embedpdf/plugin-redaction';

export const useRedactionPlugin = () => usePlugin<RedactionPlugin>(RedactionPlugin.id);
export const useRedactionCapability = () => useCapability<RedactionPlugin>(RedactionPlugin.id);
