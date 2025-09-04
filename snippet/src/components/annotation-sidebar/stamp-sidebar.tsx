import { h } from 'preact';
import { PdfStampAnnoObject } from '@embedpdf/models';
import { SidebarPropsBase } from './common';

export const StampSidebar = (_props: SidebarPropsBase<PdfStampAnnoObject>) => {
  return <div className="text-sm text-gray-500">There are no styles for stamps.</div>;
};
