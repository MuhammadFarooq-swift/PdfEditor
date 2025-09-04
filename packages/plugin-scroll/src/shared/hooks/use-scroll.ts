import { useCapability, usePlugin } from '@embedpdf/core/@framework';
import { ScrollPlugin } from '@embedpdf/plugin-scroll';
import { useEffect, useState } from '@framework';

export const useScrollPlugin = () => usePlugin<ScrollPlugin>(ScrollPlugin.id);
export const useScrollCapability = () => useCapability<ScrollPlugin>(ScrollPlugin.id);

export const useScroll = () => {
  const { provides: scroll } = useScrollCapability();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!scroll) return;
    return scroll.onPageChange(({ pageNumber, totalPages }) => {
      setCurrentPage(pageNumber);
      setTotalPages(totalPages);
    });
  }, [scroll]);

  return {
    ...scroll,
    currentPage,
    totalPages,
  };
};
