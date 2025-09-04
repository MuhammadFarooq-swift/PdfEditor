import { useEffect, useRef, useState, HTMLAttributes, CSSProperties, ReactNode } from '@framework';
import { ThumbMeta, WindowState } from '@embedpdf/plugin-thumbnail';
import { useThumbnailCapability } from '../hooks';

type ThumbnailsProps = Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'children'> & {
  style?: CSSProperties;
  children: (m: ThumbMeta) => ReactNode;
  selectedPage?: number;
  scrollOptions?: ScrollIntoViewOptions;
};

export function ThumbnailsPane({
  style,
  selectedPage,
  scrollOptions = { behavior: 'smooth', block: 'nearest', inline: 'nearest' },
  ...props
}: ThumbnailsProps) {
  const { provides: thumbs } = useThumbnailCapability();
  const viewportRef = useRef<HTMLDivElement>(null);

  const [window, setWindow] = useState<WindowState | null>(null);

  /* 1️⃣  subscribe once to window updates */
  useEffect(() => thumbs?.onWindow(setWindow), [thumbs]);

  /* 2️⃣  keep plugin in sync while the user scrolls */
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const onScroll = () => thumbs?.setViewport(vp.scrollTop, vp.clientHeight);
    vp.addEventListener('scroll', onScroll);
    return () => vp.removeEventListener('scroll', onScroll);
  }, [thumbs]);

  /* 3️⃣  kick-start (or re-kick) after document change */
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp || !thumbs) return;

    if (window?.items.length === 0) {
      thumbs.setViewport(vp.scrollTop, vp.clientHeight);
    }
  }, [window, thumbs]);

  /* 4️⃣ whenever selectedPage or window changes, ensure it’s visible */
  useEffect(() => {
    if (!selectedPage || !window) return;

    const item = window.items.find((it) => it.pageIndex + 1 === selectedPage);
    if (!item) return; // not in current window yet → wait for next update

    const vp = viewportRef.current;
    if (!vp) return;

    // Scroll only if the item is above or below the viewport “padding” zone
    const margin = 8; // px
    if (item.top < vp.scrollTop + margin) {
      vp.scrollTo({ top: item.top, ...scrollOptions });
    } else if (
      item.top + item.wrapperHeight + item.labelHeight >
      vp.scrollTop + vp.clientHeight - margin
    ) {
      vp.scrollTo({
        top: item.top + item.wrapperHeight + item.labelHeight - vp.clientHeight,
        ...scrollOptions,
      });
    }
  }, [selectedPage, window, scrollOptions]);

  return (
    <div ref={viewportRef} style={{ overflowY: 'auto', position: 'relative', ...style }} {...props}>
      {/* spacer keeps correct scroll height even before first window arrives */}
      <div style={{ height: window?.totalHeight ?? 0, position: 'relative' }}>
        {window?.items.map((m) => props.children(m))}
      </div>
    </div>
  );
}
