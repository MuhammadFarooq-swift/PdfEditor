import {
  AnnotationDefaults,
  AnnotationState,
  SidebarAnnotationEntry,
  TrackedAnnotation,
} from './types';
import { makeVariantKey } from './variant-key';
import { PdfTextAnnoObject } from '@embedpdf/models';
import { isSidebarAnnotation, isText } from './helpers';

/* ─────────── public selectors ─────────── */

/** All annotations _objects_ on a single page (order preserved). */
export const getAnnotationsByPageIndex = (s: AnnotationState, page: number) =>
  (s.pages[page] ?? []).map((uid) => s.byUid[uid]);

/** Shortcut: every page → list of annotation objects. */
export const getAnnotations = (s: AnnotationState) => {
  const out: Record<number, ReturnType<typeof getAnnotationsByPageIndex>> = {};
  for (const p of Object.keys(s.pages).map(Number)) out[p] = getAnnotationsByPageIndex(s, p);
  return out;
};

/** The full `TrackedAnnotation` for the current selection. */
export const getSelectedAnnotation = (s: AnnotationState) =>
  s.selectedUid ? s.byUid[s.selectedUid] : null;

export const getSelectedAnnotationByPageIndex = (s: AnnotationState, pageIndex: number) => {
  if (!s.selectedUid) return null;

  const pageUids = s.pages[pageIndex] ?? [];

  // Check if the selected UID is on the requested page
  if (pageUids.includes(s.selectedUid)) {
    return s.byUid[s.selectedUid];
  }

  return null;
};

export const isInAnnotationVariant = (s: AnnotationState) => s.activeVariant !== null;
export const getSelectedAnnotationVariant = (s: AnnotationState) => s.activeVariant;

/** Check if a given anno on a page is the current selection. */
export const isAnnotationSelected = (s: AnnotationState, id: string) => s.selectedUid === id;

/**
 * Return the tool-defaults for a given subtype and (optionally) intent.
 * If the exact variant (subtype + intent) is not present, it gracefully
 * falls back to the plain subtype variant.
 *
 * The return type is inferred so that you always get the concrete default
 * interface for the supplied subtype (e.g. `InkDefaults` for `INK`,
 * `CircleDefaults` for `CIRCLE`, …).
 */
export function getToolDefaultsBySubtypeAndIntent<
  S extends AnnotationState,
  TSub extends AnnotationDefaults['subtype'],
>(state: S, subtype: TSub, intent?: string | null): Extract<AnnotationDefaults, { subtype: TSub }> {
  // Build keys
  const variantKey = makeVariantKey(subtype, intent ?? undefined);
  const fallbackKey = makeVariantKey(subtype);

  // Try exact match first, otherwise fall back to plain subtype
  const defaults = state.toolDefaults[variantKey] ?? state.toolDefaults[fallbackKey];

  if (!defaults) {
    throw new Error(
      `No tool defaults found for subtype ${subtype}${intent ? ` and intent ${intent}` : ''}`,
    );
  }

  // Cast is safe because we narrow the union by subtype
  return defaults as Extract<AnnotationDefaults, { subtype: TSub }>;
}

/**
 * Collect every sidebar-eligible annotation and attach its TEXT replies,
 * grouped by page for efficient rendering.
 *
 * Result shape:
 * {
 *   0: [{ page: 0, annotation: <TrackedAnnotation>, replies: [ … ] }, ...],
 *   1: [{ page: 1, annotation: <TrackedAnnotation>, replies: [ … ] }, ...],
 *   …
 * }
 */
export const getSidebarAnnotationsWithRepliesGroupedByPage = (
  s: AnnotationState,
): Record<number, SidebarAnnotationEntry[]> => {
  /* ------------------------------------------------------------
   * 1.  Build an index of TEXT replies keyed by their parent ID
   * ------------------------------------------------------------ */
  const repliesByParent: Record<string, TrackedAnnotation<PdfTextAnnoObject>[]> = {};

  for (const uidList of Object.values(s.pages)) {
    for (const uid of uidList) {
      const ta = s.byUid[uid];
      if (isText(ta)) {
        const parentId = ta.object.inReplyToId;
        if (parentId) (repliesByParent[parentId] ||= []).push(ta);
      }
    }
  }

  /* ------------------------------------------------------------
   * 2.  Gather sidebar annotations and group them by page
   * ------------------------------------------------------------ */
  const out: Record<number, SidebarAnnotationEntry[]> = {};

  for (const [pageStr, uidList] of Object.entries(s.pages)) {
    const page = Number(pageStr);
    const pageAnnotations: SidebarAnnotationEntry[] = [];

    for (const uid of uidList) {
      const ta = s.byUid[uid];
      if (isSidebarAnnotation(ta)) {
        pageAnnotations.push({
          page,
          annotation: ta,
          replies: repliesByParent[ta.object.id] ?? [],
        });
      }
    }

    // Only add pages that have annotations
    if (pageAnnotations.length > 0) {
      out[page] = pageAnnotations;
    }
  }

  return out;
};

/**
 * Collect every sidebar-eligible annotation and attach its TEXT replies.
 *
 * Result shape:
 * [
 *   { page: 0, annotation: <TrackedAnnotation>, replies: [ … ] },
 *   { page: 1, annotation: <TrackedAnnotation>, replies: [ … ] },
 *   …
 * ]
 */
export const getSidebarAnnotationsWithReplies = (s: AnnotationState): SidebarAnnotationEntry[] => {
  const grouped = getSidebarAnnotationsWithRepliesGroupedByPage(s);
  const out: SidebarAnnotationEntry[] = [];

  // Flatten the grouped structure while maintaining page order
  const sortedPages = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b);
  for (const page of sortedPages) {
    out.push(...grouped[page]);
  }

  return out;
};
