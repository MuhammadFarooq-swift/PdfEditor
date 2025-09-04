import { Reducer } from '@embedpdf/core';
import {
  PdfAnnotationBorderStyle,
  PdfAnnotationLineEnding,
  PdfAnnotationSubtype,
  PdfBlendMode,
  PdfStandardFont,
  PdfTextAlignment,
  PdfVerticalAlignment,
} from '@embedpdf/models';
import {
  ADD_COLOR_PRESET,
  COMMIT_PENDING_CHANGES,
  CREATE_ANNOTATION,
  DESELECT_ANNOTATION,
  PATCH_ANNOTATION,
  DELETE_ANNOTATION,
  SELECT_ANNOTATION,
  SET_ANNOTATIONS,
  UPDATE_TOOL_DEFAULTS,
  AnnotationAction,
  PURGE_ANNOTATION,
  SET_ACTIVE_VARIANT,
} from './actions';
import {
  AnnotationDefaults,
  AnnotationPluginConfig,
  AnnotationState,
  TrackedAnnotation,
} from './types';
import { makeVariantKey } from './variant-key';

/* ─────────── util helpers ─────────── */
const DEFAULT_COLORS = [
  '#E44234',
  '#FF8D00',
  '#FFCD45',
  '#5CC96E',
  '#25D2D1',
  '#597CE2',
  '#C544CE',
  '#7D2E25',
  '#000000',
  '#FFFFFF',
];

/* helper to immutably replace one annotation */
const patchAnno = (
  state: AnnotationState,
  uid: string,
  patch: Partial<TrackedAnnotation['object']>,
): AnnotationState => {
  const prev = state.byUid[uid];
  if (!prev) return state;
  return {
    ...state,
    byUid: {
      ...state.byUid,
      [uid]: {
        ...prev,
        commitState: prev.commitState === 'synced' ? 'dirty' : prev.commitState,
        object: { ...prev.object, ...patch },
      } as TrackedAnnotation,
    },
    hasPendingChanges: true,
  };
};

/* ─────────── initialState ─────────── */
export const initialState = (cfg: AnnotationPluginConfig): AnnotationState => ({
  pages: {},
  byUid: {},
  selectedUid: null,
  activeVariant: null,

  toolDefaults: {
    [makeVariantKey(PdfAnnotationSubtype.HIGHLIGHT)]: {
      name: 'Highlight',
      subtype: PdfAnnotationSubtype.HIGHLIGHT,
      interaction: { mode: 'highlight', exclusive: false },
      textSelection: true,
      color: '#FFCD45',
      opacity: 1,
      blendMode: PdfBlendMode.Multiply,
    },
    [makeVariantKey(PdfAnnotationSubtype.UNDERLINE)]: {
      name: 'Underline',
      subtype: PdfAnnotationSubtype.UNDERLINE,
      interaction: { mode: 'underline', exclusive: false },
      textSelection: true,
      color: '#E44234',
      opacity: 1,
      blendMode: PdfBlendMode.Normal,
    },
    [makeVariantKey(PdfAnnotationSubtype.STRIKEOUT)]: {
      name: 'Strikeout',
      subtype: PdfAnnotationSubtype.STRIKEOUT,
      interaction: { mode: 'strikeout', exclusive: false },
      textSelection: true,
      color: '#E44234',
      opacity: 1,
      blendMode: PdfBlendMode.Normal,
    },
    [makeVariantKey(PdfAnnotationSubtype.SQUIGGLY)]: {
      name: 'Squiggly',
      subtype: PdfAnnotationSubtype.SQUIGGLY,
      interaction: { mode: 'squiggly', exclusive: false },
      textSelection: true,
      color: '#E44234',
      opacity: 1,
      blendMode: PdfBlendMode.Normal,
    },
    [makeVariantKey(PdfAnnotationSubtype.INK)]: {
      name: 'Ink',
      subtype: PdfAnnotationSubtype.INK,
      interaction: { mode: 'ink', exclusive: true, cursor: 'crosshair' },
      color: '#E44234',
      opacity: 1,
      strokeWidth: 11,
      blendMode: PdfBlendMode.Normal,
    },
    [makeVariantKey(PdfAnnotationSubtype.INK, 'InkHighlight')]: {
      name: 'Ink Highlight',
      subtype: PdfAnnotationSubtype.INK,
      intent: 'InkHighlight',
      interaction: { mode: 'inkHighlight', exclusive: true, cursor: 'crosshair' },
      color: '#E44234',
      opacity: 1,
      strokeWidth: 11,
      blendMode: PdfBlendMode.Multiply,
    },
    [makeVariantKey(PdfAnnotationSubtype.CIRCLE)]: {
      name: 'Circle',
      subtype: PdfAnnotationSubtype.CIRCLE,
      interaction: { mode: 'circle', exclusive: true, cursor: 'crosshair' },
      color: 'transparent',
      opacity: 1,
      strokeWidth: 4,
      strokeColor: '#E44234',
      strokeStyle: PdfAnnotationBorderStyle.SOLID,
    },
    [makeVariantKey(PdfAnnotationSubtype.SQUARE)]: {
      name: 'Square',
      subtype: PdfAnnotationSubtype.SQUARE,
      interaction: { mode: 'square', exclusive: true, cursor: 'crosshair' },
      color: 'transparent',
      opacity: 1,
      strokeWidth: 4,
      strokeColor: '#E44234',
      strokeStyle: PdfAnnotationBorderStyle.SOLID,
    },
    [makeVariantKey(PdfAnnotationSubtype.LINE)]: {
      name: 'Line',
      subtype: PdfAnnotationSubtype.LINE,
      interaction: { mode: 'line', exclusive: true, cursor: 'crosshair' },
      color: 'transparent',
      opacity: 1,
      strokeWidth: 4,
      strokeColor: '#E44234',
      strokeStyle: PdfAnnotationBorderStyle.SOLID,
    },
    [makeVariantKey(PdfAnnotationSubtype.LINE, 'LineArrow')]: {
      name: 'Line Arrow',
      subtype: PdfAnnotationSubtype.LINE,
      interaction: { mode: 'lineArrow', exclusive: true, cursor: 'crosshair' },
      color: 'transparent',
      intent: 'LineArrow',
      opacity: 1,
      strokeWidth: 4,
      strokeColor: '#E44234',
      strokeStyle: PdfAnnotationBorderStyle.SOLID,
      lineEndings: {
        start: PdfAnnotationLineEnding.None,
        end: PdfAnnotationLineEnding.OpenArrow,
      },
    },
    [makeVariantKey(PdfAnnotationSubtype.POLYLINE)]: {
      name: 'Polyline',
      subtype: PdfAnnotationSubtype.POLYLINE,
      interaction: { mode: 'polyline', exclusive: true, cursor: 'crosshair' },
      color: 'transparent',
      opacity: 1,
      strokeWidth: 4,
      strokeColor: '#E44234',
      strokeStyle: PdfAnnotationBorderStyle.SOLID,
    },
    [makeVariantKey(PdfAnnotationSubtype.POLYGON)]: {
      name: 'Polygon',
      subtype: PdfAnnotationSubtype.POLYGON,
      interaction: { mode: 'polygon', exclusive: true, cursor: 'crosshair' },
      color: 'transparent',
      opacity: 1,
      strokeWidth: 4,
      strokeColor: '#E44234',
      strokeStyle: PdfAnnotationBorderStyle.SOLID,
    },
    [makeVariantKey(PdfAnnotationSubtype.FREETEXT)]: {
      name: 'Free Text',
      subtype: PdfAnnotationSubtype.FREETEXT,
      interaction: { mode: 'freeText', exclusive: true, cursor: 'crosshair' },
      backgroundColor: 'transparent',
      opacity: 1,
      fontSize: 14,
      fontColor: '#E44234',
      content: 'Insert text here',
      fontFamily: PdfStandardFont.Helvetica,
      textAlign: PdfTextAlignment.Left,
      verticalAlign: PdfVerticalAlignment.Top,
    },
    [makeVariantKey(PdfAnnotationSubtype.STAMP)]: {
      name: 'Photo',
      subtype: PdfAnnotationSubtype.STAMP,
      interaction: { mode: 'stamp', exclusive: true, cursor: 'crosshair' },
    },
    ...cfg.toolDefaults,
  },
  colorPresets: cfg.colorPresets ?? DEFAULT_COLORS,
  hasPendingChanges: false,
});

/* ─────────── reducer ─────────── */
export const reducer: Reducer<AnnotationState, AnnotationAction> = (state, action) => {
  switch (action.type) {
    /* ───── bulk load from engine ───── */
    case SET_ANNOTATIONS: {
      const newPages = { ...state.pages };
      const newByUid = { ...state.byUid };
      for (const [pgStr, list] of Object.entries(action.payload)) {
        const pageIndex = Number(pgStr);
        const oldUidsOnPage = state.pages[pageIndex] || [];
        for (const uid of oldUidsOnPage) {
          delete newByUid[uid];
        }
        const newUidsOnPage = list.map((a) => {
          const uid = a.id;
          newByUid[uid] = { commitState: 'synced', object: a };
          return uid;
        });
        newPages[pageIndex] = newUidsOnPage;
      }
      return { ...state, pages: newPages, byUid: newByUid };
    }

    /* ───── GUI bits ───── */
    case SET_ACTIVE_VARIANT:
      return { ...state, activeVariant: action.payload };
    case SELECT_ANNOTATION:
      return {
        ...state,
        selectedUid: action.payload.id,
      };
    case DESELECT_ANNOTATION:
      return { ...state, selectedUid: null };

    case ADD_COLOR_PRESET:
      return state.colorPresets.includes(action.payload)
        ? state
        : { ...state, colorPresets: [...state.colorPresets, action.payload] };

    case UPDATE_TOOL_DEFAULTS: {
      const { variantKey, patch } = action.payload;
      const prev = state.toolDefaults[variantKey];
      if (!prev) return state;
      return {
        ...state,
        toolDefaults: {
          ...state.toolDefaults,
          [variantKey]: { ...prev, ...patch } as AnnotationDefaults,
        },
      };
    }

    /* ───── create ───── */
    case CREATE_ANNOTATION: {
      const { pageIndex, annotation } = action.payload;
      const uid = annotation.id;

      return {
        ...state,
        pages: { ...state.pages, [pageIndex]: [...(state.pages[pageIndex] ?? []), uid] },
        byUid: {
          ...state.byUid,
          [uid]: { commitState: 'new', object: annotation },
        },
        hasPendingChanges: true,
      };
    }

    /* ───── delete ───── */
    case DELETE_ANNOTATION: {
      const { pageIndex, id: uid } = action.payload;
      if (!state.byUid[uid]) return state;

      /* keep the object but mark it as deleted */
      return {
        ...state,
        pages: {
          ...state.pages,
          [pageIndex]: (state.pages[pageIndex] ?? []).filter((u) => u !== uid),
        },
        byUid: {
          ...state.byUid,
          [uid]: { ...state.byUid[uid], commitState: 'deleted' },
        },
        hasPendingChanges: true,
      };
    }

    /* ───── field edits ───── */
    case PATCH_ANNOTATION: {
      const uid = action.payload.id;
      return patchAnno(state, uid, action.payload.patch);
    }

    /* ───── commit bookkeeping ───── */
    case COMMIT_PENDING_CHANGES: {
      const cleaned: AnnotationState['byUid'] = {};
      for (const [uid, ta] of Object.entries(state.byUid)) {
        cleaned[uid] = {
          ...ta,
          commitState:
            ta.commitState === 'dirty' || ta.commitState === 'new' ? 'synced' : ta.commitState,
        };
      }
      return { ...state, byUid: cleaned, hasPendingChanges: false };
    }

    case PURGE_ANNOTATION: {
      const { uid } = action.payload;
      const { [uid]: _gone, ...rest } = state.byUid;
      return { ...state, byUid: rest };
    }

    default:
      return state;
  }
};
