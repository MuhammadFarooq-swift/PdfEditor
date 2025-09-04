import { ref, watchEffect } from 'vue';
import { useCapability, usePlugin } from '@embedpdf/core/vue';
import { ScrollPlugin } from '@embedpdf/plugin-scroll';

export const useScrollPlugin = () => usePlugin<ScrollPlugin>(ScrollPlugin.id);
export const useScrollCapability = () => useCapability<ScrollPlugin>(ScrollPlugin.id);

/**
 * Convenience hook that also tracks current / total page.
 */
export function useScroll() {
  const { provides: scroll } = useScrollCapability();

  const currentPage = ref(1);
  const totalPages = ref(1);

  watchEffect((onCleanup) => {
    if (!scroll.value) return;

    const off = scroll.value.onPageChange(({ pageNumber, totalPages: tp }) => {
      currentPage.value = pageNumber;
      totalPages.value = tp;
    });
    onCleanup(off);
  });

  return {
    scroll,
    currentPage,
    totalPages,
  };
}
