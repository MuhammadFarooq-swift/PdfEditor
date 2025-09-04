import { blendModeToCss, PdfBlendMode } from '@embedpdf/models';
import {
  getAnnotationsByPageIndex,
  getSelectedAnnotationByPageIndex,
  isHighlight,
  isInk,
  isSquiggly,
  isCircle,
  isStrikeout,
  isUnderline,
  TrackedAnnotation,
  isSquare,
  isLine,
  isPolyline,
  isPolygon,
  isFreeText,
  isStamp,
} from '@embedpdf/plugin-annotation';
import { PointerEventHandlers } from '@embedpdf/plugin-interaction-manager';
import { usePointerHandlers } from '@embedpdf/plugin-interaction-manager/@framework';
import { useSelectionCapability } from '@embedpdf/plugin-selection/@framework';
import {
  useMemo,
  useState,
  useEffect,
  useCallback,
  MouseEvent,
  Fragment,
  TouchEvent,
} from '@framework';

import { useAnnotationCapability } from '../hooks';
import { AnnotationContainer } from './annotation-container';
import { Highlight } from './text-markup/highlight';
import { Underline } from './text-markup/underline';
import { Strikeout } from './text-markup/strikeout';
import { Squiggly } from './text-markup/squiggly';
import { Ink } from './annotations/ink';
import { Square } from './annotations/square';
import { SelectionMenu } from '../types';
import { Circle } from './annotations/circle';
import { patchInk } from '../patch-ink';
import { Line } from './annotations/line';
import { Polyline } from './annotations/polyline';
import { Polygon } from './annotations/polygon';
import { patchLine, patchPolygon, patchPolyline } from '../vertex-patchers';
import { FreeText } from './annotations/free-text';
import { Stamp } from './annotations/stamp';

interface AnnotationsProps {
  pageIndex: number;
  scale: number;
  rotation: number;
  pageWidth: number;
  pageHeight: number;
  selectionMenu?: SelectionMenu;
}

export function Annotations(annotationsProps: AnnotationsProps) {
  const { pageIndex, scale, selectionMenu } = annotationsProps;
  const { provides: annotationProvides } = useAnnotationCapability();
  const { provides: selectionProvides } = useSelectionCapability();
  const [annotations, setAnnotations] = useState<TrackedAnnotation[]>([]);
  const { register } = usePointerHandlers({ pageIndex });
  const [selectionState, setSelectionState] = useState<TrackedAnnotation | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (annotationProvides) {
      annotationProvides.onStateChange((state) => {
        setAnnotations(getAnnotationsByPageIndex(state, pageIndex));
        setSelectionState(getSelectedAnnotationByPageIndex(state, pageIndex));
      });
    }
  }, [annotationProvides]);

  const handlers = useMemo(
    (): PointerEventHandlers<MouseEvent> => ({
      onPointerDown: (_, pe) => {
        // Only deselect if clicking directly on the layer (not on an annotation)
        if (pe.target === pe.currentTarget && annotationProvides) {
          annotationProvides.deselectAnnotation();
          setEditingId(null);
        }
      },
    }),
    [annotationProvides],
  );

  const handleClick = useCallback(
    (e: MouseEvent | TouchEvent, annotation: TrackedAnnotation) => {
      e.stopPropagation();
      if (annotationProvides && selectionProvides) {
        annotationProvides.selectAnnotation(pageIndex, annotation.object.id);
        selectionProvides.clear();
        setEditingId(null);
      }
    },
    [annotationProvides, selectionProvides, pageIndex],
  );

  useEffect(() => {
    return register(handlers);
  }, [register, handlers]);

  return (
    <>
      {annotations.map((annotation) => {
        const isSelected = selectionState?.object.id === annotation.object.id;
        const isEditing = editingId === annotation.object.id;

        if (isInk(annotation)) {
          return (
            <AnnotationContainer
              key={annotation.object.id}
              trackedAnnotation={annotation}
              isSelected={isSelected}
              isDraggable={true}
              isResizable={true}
              selectionMenu={selectionMenu}
              computePatch={patchInk}
              style={{
                mixBlendMode: blendModeToCss(annotation.object.blendMode ?? PdfBlendMode.Normal),
              }}
              {...annotationsProps}
            >
              {(obj) => (
                <Ink
                  isSelected={isSelected}
                  color={obj.color}
                  opacity={obj.opacity}
                  strokeWidth={obj.strokeWidth}
                  inkList={obj.inkList}
                  rect={obj.rect}
                  scale={scale}
                  onClick={(e) => handleClick(e, annotation)}
                />
              )}
            </AnnotationContainer>
          );
        }

        if (isSquare(annotation)) {
          return (
            <AnnotationContainer
              key={annotation.object.id}
              trackedAnnotation={annotation}
              isSelected={isSelected}
              isDraggable={true}
              isResizable={true}
              selectionMenu={selectionMenu}
              style={{
                mixBlendMode: blendModeToCss(annotation.object.blendMode ?? PdfBlendMode.Normal),
              }}
              {...annotationsProps}
            >
              {(obj) => (
                <Square
                  isSelected={isSelected}
                  rect={obj.rect}
                  color={obj.color}
                  opacity={obj.opacity}
                  strokeWidth={obj.strokeWidth}
                  strokeColor={obj.strokeColor}
                  strokeStyle={obj.strokeStyle}
                  strokeDashArray={obj.strokeDashArray}
                  scale={scale}
                  onClick={(e) => handleClick(e, annotation)}
                />
              )}
            </AnnotationContainer>
          );
        }

        if (isCircle(annotation)) {
          return (
            <AnnotationContainer
              key={annotation.object.id}
              trackedAnnotation={annotation}
              isSelected={isSelected}
              isDraggable={true}
              isResizable={true}
              selectionMenu={selectionMenu}
              style={{
                mixBlendMode: blendModeToCss(annotation.object.blendMode ?? PdfBlendMode.Normal),
              }}
              {...annotationsProps}
            >
              {(obj) => (
                <Circle
                  isSelected={isSelected}
                  rect={obj.rect}
                  color={obj.color}
                  opacity={obj.opacity}
                  strokeWidth={obj.strokeWidth}
                  strokeColor={obj.strokeColor}
                  strokeStyle={obj.strokeStyle}
                  strokeDashArray={obj.strokeDashArray}
                  scale={scale}
                  onClick={(e) => handleClick(e, annotation)}
                />
              )}
            </AnnotationContainer>
          );
        }

        if (isUnderline(annotation)) {
          return (
            <AnnotationContainer
              key={annotation.object.id}
              trackedAnnotation={annotation}
              isSelected={isSelected}
              isDraggable={false}
              isResizable={false}
              selectionMenu={selectionMenu}
              style={{
                mixBlendMode: blendModeToCss(annotation.object.blendMode ?? PdfBlendMode.Normal),
              }}
              {...annotationsProps}
            >
              {(obj) => (
                <Underline
                  rect={obj.rect}
                  color={obj.color}
                  opacity={obj.opacity}
                  rects={obj.segmentRects}
                  scale={scale}
                  onClick={(e) => handleClick(e, annotation)}
                />
              )}
            </AnnotationContainer>
          );
        }

        if (isStrikeout(annotation)) {
          return (
            <AnnotationContainer
              key={annotation.object.id}
              trackedAnnotation={annotation}
              isSelected={isSelected}
              isDraggable={false}
              isResizable={false}
              selectionMenu={selectionMenu}
              style={{
                mixBlendMode: blendModeToCss(annotation.object.blendMode ?? PdfBlendMode.Normal),
              }}
              {...annotationsProps}
            >
              {(obj) => (
                <Strikeout
                  rect={obj.rect}
                  color={obj.color}
                  opacity={obj.opacity}
                  rects={obj.segmentRects}
                  scale={scale}
                  onClick={(e) => handleClick(e, annotation)}
                />
              )}
            </AnnotationContainer>
          );
        }

        if (isSquiggly(annotation)) {
          return (
            <AnnotationContainer
              key={annotation.object.id}
              trackedAnnotation={annotation}
              isSelected={isSelected}
              isDraggable={false}
              isResizable={false}
              selectionMenu={selectionMenu}
              style={{
                mixBlendMode: blendModeToCss(annotation.object.blendMode ?? PdfBlendMode.Normal),
              }}
              {...annotationsProps}
            >
              {(obj) => (
                <Squiggly
                  color={obj.color}
                  opacity={obj.opacity}
                  rects={obj.segmentRects}
                  rect={obj.rect}
                  scale={scale}
                  onClick={(e) => handleClick(e, annotation)}
                />
              )}
            </AnnotationContainer>
          );
        }

        if (isHighlight(annotation)) {
          return (
            <AnnotationContainer
              key={annotation.object.id}
              trackedAnnotation={annotation}
              isSelected={isSelected}
              isDraggable={false}
              isResizable={false}
              selectionMenu={selectionMenu}
              style={{
                mixBlendMode: blendModeToCss(annotation.object.blendMode ?? PdfBlendMode.Multiply),
              }}
              {...annotationsProps}
            >
              {(obj) => (
                <Highlight
                  color={obj.color}
                  opacity={obj.opacity}
                  rects={obj.segmentRects}
                  scale={scale}
                  rect={obj.rect}
                  onClick={(e) => handleClick(e, annotation)}
                />
              )}
            </AnnotationContainer>
          );
        }

        if (isLine(annotation)) {
          return (
            <AnnotationContainer
              key={annotation.object.id}
              trackedAnnotation={annotation}
              isSelected={isSelected}
              isDraggable={true}
              isResizable={false}
              selectionMenu={selectionMenu}
              computePatch={patchLine}
              computeVertices={(annotation) => [
                annotation.linePoints.start,
                annotation.linePoints.end,
              ]}
              style={{
                mixBlendMode: blendModeToCss(annotation.object.blendMode ?? PdfBlendMode.Normal),
              }}
              {...annotationsProps}
            >
              {(obj) => (
                <Fragment>
                  <Line
                    isSelected={isSelected}
                    rect={obj.rect}
                    color={obj.color}
                    opacity={obj.opacity}
                    linePoints={obj.linePoints}
                    lineEndings={obj.lineEndings}
                    strokeWidth={obj.strokeWidth}
                    strokeColor={obj.strokeColor}
                    strokeStyle={obj.strokeStyle}
                    strokeDashArray={obj.strokeDashArray}
                    scale={scale}
                    onClick={(e) => handleClick(e, annotation)}
                  />
                </Fragment>
              )}
            </AnnotationContainer>
          );
        }

        if (isPolyline(annotation)) {
          return (
            <AnnotationContainer
              key={annotation.object.id}
              trackedAnnotation={annotation}
              isSelected={isSelected}
              isDraggable={true}
              isResizable={false}
              selectionMenu={selectionMenu}
              computePatch={patchPolyline}
              computeVertices={(annotation) => annotation.vertices}
              style={{
                mixBlendMode: blendModeToCss(annotation.object.blendMode ?? PdfBlendMode.Normal),
              }}
              {...annotationsProps}
            >
              {(obj) => (
                <Fragment>
                  <Polyline
                    isSelected={isSelected}
                    rect={obj.rect}
                    color={obj.color}
                    opacity={obj.opacity}
                    vertices={obj.vertices}
                    lineEndings={obj.lineEndings}
                    strokeWidth={obj.strokeWidth}
                    strokeColor={obj.strokeColor}
                    scale={scale}
                    onClick={(e) => handleClick(e, annotation)}
                  />
                </Fragment>
              )}
            </AnnotationContainer>
          );
        }

        if (isPolygon(annotation)) {
          return (
            <AnnotationContainer
              key={annotation.object.id}
              trackedAnnotation={annotation}
              isSelected={isSelected}
              isDraggable={true}
              isResizable={false}
              selectionMenu={selectionMenu}
              computeVertices={(annotation) => annotation.vertices}
              computePatch={patchPolygon}
              style={{
                mixBlendMode: blendModeToCss(annotation.object.blendMode ?? PdfBlendMode.Normal),
              }}
              {...annotationsProps}
            >
              {(obj) => (
                <Fragment>
                  <Polygon
                    isSelected={isSelected}
                    rect={obj.rect}
                    color={obj.color}
                    opacity={obj.opacity}
                    vertices={obj.vertices}
                    strokeWidth={obj.strokeWidth}
                    strokeColor={obj.strokeColor}
                    strokeStyle={obj.strokeStyle}
                    strokeDashArray={obj.strokeDashArray}
                    scale={scale}
                    onClick={(e) => handleClick(e, annotation)}
                  />
                </Fragment>
              )}
            </AnnotationContainer>
          );
        }

        if (isFreeText(annotation)) {
          return (
            <AnnotationContainer
              key={annotation.object.id}
              trackedAnnotation={annotation}
              isSelected={isSelected}
              isDraggable={true}
              isResizable={true}
              selectionMenu={selectionMenu}
              outlineOffset={6}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditingId(annotation.object.id);
              }}
              style={{
                mixBlendMode: blendModeToCss(annotation.object.blendMode ?? PdfBlendMode.Normal),
              }}
              {...annotationsProps}
            >
              {(object) => (
                <FreeText
                  isSelected={isSelected}
                  isEditing={isEditing}
                  annotation={{
                    ...annotation,
                    object,
                  }}
                  pageIndex={pageIndex}
                  scale={scale}
                  onClick={(e) => handleClick(e, annotation)}
                />
              )}
            </AnnotationContainer>
          );
        }

        if (isStamp(annotation)) {
          return (
            <AnnotationContainer
              key={annotation.object.id}
              trackedAnnotation={annotation}
              isSelected={isSelected}
              isDraggable={true}
              isResizable={true}
              selectionMenu={selectionMenu}
              lockAspectRatio={true}
              style={{
                mixBlendMode: blendModeToCss(annotation.object.blendMode ?? PdfBlendMode.Normal),
              }}
              {...annotationsProps}
            >
              {(_object) => (
                <Stamp
                  isSelected={isSelected}
                  annotation={annotation}
                  pageIndex={pageIndex}
                  scale={scale}
                  onClick={(e) => handleClick(e, annotation)}
                />
              )}
            </AnnotationContainer>
          );
        }

        /* --------- fallback: an unsupported subtype --------------- */
        return null;
      })}
    </>
  );
}
