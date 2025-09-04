import { useCapability, usePlugin } from '@embedpdf/core/@framework';
import { RedactionPlugin } from '@embedpdf/plugin-redaction';

export const useRedactionPlugin = () => usePlugin<RedactionPlugin>(RedactionPlugin.id);
export const useRedactionCapability = () => useCapability<RedactionPlugin>(RedactionPlugin.id);
