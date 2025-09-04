import { Rect } from '@embedpdf/models';
import { onMounted, onUnmounted, ref, watch } from 'vue';

import { useViewportPlugin } from './use-viewport';

export function useViewportRef() {
  const { plugin: pluginRef } = useViewportPlugin();
  const containerRef = ref<HTMLDivElement | null>(null);

  // Setup function that runs when both plugin and container are available
  const setupViewport = () => {
    const viewportPlugin = pluginRef.value;
    const container = containerRef.value;

    if (!container || !viewportPlugin) return;

    /* ---------- live rect provider --------------------------------- */
    const provideRect = (): Rect => {
      const r = container.getBoundingClientRect();
      return {
        origin: { x: r.left, y: r.top },
        size: { width: r.width, height: r.height },
      };
    };
    viewportPlugin.registerBoundingRectProvider(provideRect);

    // Example: On scroll, call setMetrics
    const onScroll = () => {
      viewportPlugin.setViewportScrollMetrics({
        scrollTop: container.scrollTop,
        scrollLeft: container.scrollLeft,
      });
    };
    container.addEventListener('scroll', onScroll);

    // Example: On resize, call setMetrics
    const resizeObserver = new ResizeObserver(() => {
      viewportPlugin.setViewportResizeMetrics({
        width: container.offsetWidth,
        height: container.offsetHeight,
        clientWidth: container.clientWidth,
        clientHeight: container.clientHeight,
        scrollTop: container.scrollTop,
        scrollLeft: container.scrollLeft,
        scrollWidth: container.scrollWidth,
        scrollHeight: container.scrollHeight,
      });
    });
    resizeObserver.observe(container);

    const unsubscribeScrollRequest = viewportPlugin.onScrollRequest(
      ({ x, y, behavior = 'auto' }) => {
        requestAnimationFrame(() => {
          container.scrollTo({ left: x, top: y, behavior });
        });
      },
    );

    // Return cleanup function
    return () => {
      viewportPlugin.registerBoundingRectProvider(null);
      container.removeEventListener('scroll', onScroll);
      resizeObserver.disconnect();
      unsubscribeScrollRequest();
    };
  };

  let cleanup: (() => void) | null = null;

  // Watch for changes in the plugin - this is the Vue equivalent of React's dependency array
  watch(
    pluginRef,
    () => {
      // Clean up previous setup if it exists
      if (cleanup) {
        cleanup();
        cleanup = null;
      }

      // Setup new viewport if plugin is available
      cleanup = setupViewport() || null;
    },
    { immediate: true }, // Run immediately if plugin is already available
  );

  // Also watch for container changes (though this is less likely to change)
  watch(
    containerRef,
    () => {
      // Clean up previous setup if it exists
      if (cleanup) {
        cleanup();
        cleanup = null;
      }

      // Setup new viewport if both plugin and container are available
      cleanup = setupViewport() || null;
    },
    { immediate: true },
  );

  onUnmounted(() => {
    if (cleanup) {
      cleanup();
    }
  });

  // Return the ref so your Vue code can attach it to a div
  return containerRef;
}
