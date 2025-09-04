/** @jsxImportSource preact */
import { h } from 'preact';
import { useAnnotationCapability } from '@embedpdf/plugin-annotation/preact';
import { PdfAnnotationSubtype } from '@embedpdf/models';
import { TrackedAnnotation } from '@embedpdf/plugin-annotation';

import { SidebarPropsBase } from './annotation-sidebar/common';
import { SIDEbars } from './annotation-sidebar/registry';
import { EmptyState } from './annotation-sidebar/empty-state';

// ─────────────────────────────────────────────────────────────────────────
//  Public API (signature unchanged so callers don’t change)
// ─────────────────────────────────────────────────────────────────────────
export function leftPanelAnnotationStyleRenderer({
  selectedAnnotation,
  activeVariant,
  colorPresets,
}: {
  selectedAnnotation: TrackedAnnotation | null;
  activeVariant: string | null;
  colorPresets: string[];
}) {
  const { provides: annotation } = useAnnotationCapability();
  if (!annotation) return null;

  let intent: string | undefined = undefined;
  /* ------------------------------------------------------------
   * 1. Work out which subtype we’re editing (selected note > tool)
   * ------------------------------------------------------------ */
  let subtype: PdfAnnotationSubtype | null = null;

  if (selectedAnnotation) {
    subtype = selectedAnnotation.object.type;
    intent = selectedAnnotation.object.intent;
  } else if (activeVariant) {
    const { subtype: s, intent: i } = annotation.getSubtypeAndIntentByVariant(activeVariant);
    subtype = s;
    intent = i;
  }

  /* ------------------------------------------------------------
   * 2. Dispatch to concrete sidebar or show empty state
   * ------------------------------------------------------------ */
  if (subtype == null) return <EmptyState />;

  const entry = SIDEbars[subtype];
  if (!entry) return <EmptyState />;

  const { component: Sidebar, title } = entry;

  const commonProps: SidebarPropsBase = {
    selected: selectedAnnotation,
    subtype,
    activeVariant,
    colorPresets,
    intent,
  };

  const computedTitle = typeof title === 'function' ? title(commonProps as any) : title;

  return (
    <div class="h-full overflow-y-auto p-4">
      {computedTitle && (
        <h2 class="text-md mb-4 font-medium">
          {computedTitle} {selectedAnnotation ? 'styles' : 'defaults'}
        </h2>
      )}
      <Sidebar {...(commonProps as any)} />
    </div>
  );
}
