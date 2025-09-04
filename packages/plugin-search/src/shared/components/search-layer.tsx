import { useEffect, useState, HTMLAttributes, CSSProperties } from '@framework';
import { SearchResultState } from '@embedpdf/plugin-search';

import { useSearchCapability } from '../hooks';

type SearchLayoutProps = Omit<HTMLAttributes<HTMLDivElement>, 'style'> & {
  pageIndex: number;
  scale: number;
  highlightColor?: string;
  activeHighlightColor?: string;
  style?: CSSProperties;
};

export function SearchLayer({
  pageIndex,
  scale,
  style,
  highlightColor = '#FFFF00',
  activeHighlightColor = '#FFBF00',
  ...props
}: SearchLayoutProps) {
  const { provides: searchProvides } = useSearchCapability();
  const [searchResultState, setSearchResultState] = useState<SearchResultState | null>(null);

  useEffect(() => {
    return searchProvides?.onSearchResultStateChange((state) => {
      setSearchResultState(state);
    });
  }, [searchProvides]);

  if (!searchResultState) {
    return null;
  }

  // Filter results for current page while preserving original indices
  const pageResults = searchResultState.results
    .map((result, originalIndex) => ({ result, originalIndex }))
    .filter(({ result }) => result.pageIndex === pageIndex);

  return (
    <div
      style={{
        ...style,
      }}
      {...props}
    >
      {pageResults.map(({ result, originalIndex }) =>
        result.rects.map((rect) => (
          <div
            style={{
              position: 'absolute',
              top: rect.origin.y * scale,
              left: rect.origin.x * scale,
              width: rect.size.width * scale,
              height: rect.size.height * scale,
              backgroundColor:
                originalIndex === searchResultState.activeResultIndex
                  ? activeHighlightColor
                  : highlightColor,
              mixBlendMode: 'multiply',
              transform: 'scale(1.02)',
              transformOrigin: 'center',
              transition: 'opacity .3s ease-in-out',
              opacity: 1,
            }}
          ></div>
        )),
      )}
    </div>
  );
}
