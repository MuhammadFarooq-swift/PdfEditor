import { PdfAnnotationSubtype, PdfAnnotationObject } from '@embedpdf/models';
import { SidebarPropsBase } from './common';
import { InkSidebar } from './ink-sidebar';
import { TextMarkupSidebar } from './text-markup-sidebar';
import { ShapeSidebar } from './shape-sidebar';
import { PolygonSidebar } from './polygon-sidebar';
import { LineSidebar } from './line-sidebar';
import { FreeTextSidebar } from './free-text-sidebar';
import { StampSidebar } from './stamp-sidebar';

/* 1.  Component type (unchanged) */
type SidebarComponent<S extends PdfAnnotationSubtype> = (
  p: SidebarPropsBase<Extract<PdfAnnotationObject, { type: S }>>,
) => JSX.Element | null;

/* 2.  A registry entry can now hold extra metadata */
interface SidebarEntry<S extends PdfAnnotationSubtype> {
  component: SidebarComponent<S>;
  /** Shown above the sidebar; may depend on the current props */
  title?: string | ((p: SidebarPropsBase<Extract<PdfAnnotationObject, { type: S }>>) => string);
}

/* 3.  Registry type */
type SidebarRegistry = Partial<{
  [K in PdfAnnotationSubtype]: SidebarEntry<K>;
}>;

/* 4.  Implementation */
export const SIDEbars: SidebarRegistry = {
  /* ───────── Ink / Shapes ───────── */
  [PdfAnnotationSubtype.INK]: { component: InkSidebar, title: 'Ink' },
  [PdfAnnotationSubtype.POLYGON]: { component: PolygonSidebar, title: 'Polygon' },
  [PdfAnnotationSubtype.SQUARE]: { component: ShapeSidebar, title: 'Square' },
  [PdfAnnotationSubtype.CIRCLE]: { component: ShapeSidebar, title: 'Circle' },

  /* ───────── Lines ───────── */
  [PdfAnnotationSubtype.LINE]: {
    component: LineSidebar,
    title: (p) => (p.intent === 'LineArrow' ? 'Arrow line' : 'Line'),
  },
  [PdfAnnotationSubtype.POLYLINE]: { component: LineSidebar, title: 'Polyline' },

  /* ───────── Text-markup ───────── */
  [PdfAnnotationSubtype.HIGHLIGHT]: { component: TextMarkupSidebar, title: 'Highlight' },
  [PdfAnnotationSubtype.UNDERLINE]: { component: TextMarkupSidebar, title: 'Underline' },
  [PdfAnnotationSubtype.STRIKEOUT]: { component: TextMarkupSidebar, title: 'Strike-out' },
  [PdfAnnotationSubtype.SQUIGGLY]: { component: TextMarkupSidebar, title: 'Squiggly' },
  [PdfAnnotationSubtype.FREETEXT]: { component: FreeTextSidebar, title: 'Free text' },
  [PdfAnnotationSubtype.STAMP]: { component: StampSidebar, title: 'Stamp' },
};
