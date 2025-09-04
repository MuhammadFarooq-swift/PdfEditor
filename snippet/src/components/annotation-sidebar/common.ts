import { PdfAnnotationObject } from '@embedpdf/models';
import { SelectedAnnotation } from '@embedpdf/plugin-annotation';

export interface SidebarPropsBase<T extends PdfAnnotationObject = PdfAnnotationObject> {
  selected: SelectedAnnotation<T> | null; // null ⇒ editing tool defaults
  subtype: T['type']; // variant key of current tool
  activeVariant: string | null;
  colorPresets: string[];
  intent?: string;
}
