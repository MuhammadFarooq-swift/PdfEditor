import { useCapability, usePlugin } from '@embedpdf/core/@framework';
import { AnnotationPlugin } from '@embedpdf/plugin-annotation';

export const useAnnotationPlugin = () => usePlugin<AnnotationPlugin>(AnnotationPlugin.id);
export const useAnnotationCapability = () => useCapability<AnnotationPlugin>(AnnotationPlugin.id);
