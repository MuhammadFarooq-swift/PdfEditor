import { MouseEvent, TouchEvent, useEffect, useRef } from '@framework';
import {
  PdfFreeTextAnnoObject,
  PdfVerticalAlignment,
  standardFontCss,
  textAlignmentToCss,
} from '@embedpdf/models';
import { useAnnotationCapability } from '../..';
import { TrackedAnnotation } from '@embedpdf/plugin-annotation';

interface FreeTextProps {
  isSelected: boolean;
  isEditing: boolean;
  annotation: TrackedAnnotation<PdfFreeTextAnnoObject>;
  pageIndex: number;
  scale: number;
  onClick?: (e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) => void;
}

export function FreeText({
  isSelected,
  isEditing,
  annotation,
  pageIndex,
  scale,
  onClick,
}: FreeTextProps) {
  const editorRef = useRef<HTMLSpanElement>(null);
  const { provides: annotationProvides } = useAnnotationCapability();

  useEffect(() => {
    if (isEditing && editorRef.current) {
      const editor = editorRef.current;
      editor.focus();

      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, [isEditing]);

  const handleBlur = () => {
    if (!annotationProvides) return;
    if (!editorRef.current) return;

    annotationProvides.updateAnnotation(pageIndex, annotation.object.id, {
      contents: editorRef.current.innerText,
    });
  };

  return (
    <div
      style={{
        position: 'absolute',
        width: annotation.object.rect.size.width * scale,
        height: annotation.object.rect.size.height * scale,
        cursor: isSelected && !isEditing ? 'move' : 'default',
        pointerEvents: isSelected && !isEditing ? 'none' : 'auto',
        zIndex: 2,
      }}
      onPointerDown={onClick}
      onTouchStart={onClick}
    >
      <span
        ref={editorRef}
        onBlur={handleBlur}
        style={{
          color: annotation.object.fontColor,
          fontSize: annotation.object.fontSize * scale,
          fontFamily: standardFontCss(annotation.object.fontFamily),
          textAlign: textAlignmentToCss(annotation.object.textAlign),
          flexDirection: 'column',
          justifyContent:
            annotation.object.verticalAlign === PdfVerticalAlignment.Top
              ? 'flex-start'
              : annotation.object.verticalAlign === PdfVerticalAlignment.Middle
                ? 'center'
                : 'flex-end',
          display: 'flex',
          backgroundColor: annotation.object.backgroundColor,
          opacity: annotation.object.opacity,
          width: '100%',
          height: '100%',
          lineHeight: '1.18',
          overflow: 'hidden',
          cursor: isEditing ? 'text' : 'pointer',
        }}
        contentEditable={isEditing}
      >
        {annotation.object.contents}
      </span>
    </div>
  );
}
