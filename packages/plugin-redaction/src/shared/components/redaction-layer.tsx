import { Fragment } from '@framework';
import { MarqueeRedact } from './marquee-redact';
import { SelectionRedact } from './selection-redact';
import { PendingRedactions } from './pending-redactions';
import { Rotation } from '@embedpdf/models';
import { SelectionMenuProps } from './types';

interface RedactionLayerProps {
  pageIndex: number;
  scale: number;
  rotation: Rotation;
  selectionMenu?: (props: SelectionMenuProps) => JSX.Element;
}

export const RedactionLayer = ({
  pageIndex,
  scale,
  rotation = Rotation.Degree0,
  selectionMenu,
}: RedactionLayerProps) => {
  return (
    <Fragment>
      <PendingRedactions
        pageIndex={pageIndex}
        scale={scale}
        rotation={rotation}
        selectionMenu={selectionMenu}
      />
      <MarqueeRedact pageIndex={pageIndex} scale={scale} />
      <SelectionRedact pageIndex={pageIndex} scale={scale} />
    </Fragment>
  );
};
