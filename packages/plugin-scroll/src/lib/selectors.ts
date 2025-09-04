import { ScrollerLayout, ScrollState } from './types';

export const getScrollerLayout = (state: ScrollState, scale: number): ScrollerLayout => {
  return {
    startSpacing: state.startSpacing,
    endSpacing: state.endSpacing,
    totalWidth: state.totalContentSize.width * scale,
    totalHeight: state.totalContentSize.height * scale,
    pageGap: state.pageGap * scale,
    strategy: state.strategy,
    items: state.renderedPageIndexes.map((idx) => {
      return {
        ...state.virtualItems[idx],
        pageLayouts: state.virtualItems[idx].pageLayouts.map((layout) => {
          return {
            ...layout,
            rotatedWidth: layout.rotatedWidth * scale,
            rotatedHeight: layout.rotatedHeight * scale,
            width: layout.width * scale,
            height: layout.height * scale,
          };
        }),
      };
    }),
  };
};
