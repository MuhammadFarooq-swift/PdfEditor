import type { BasePlugin } from '@embedpdf/core';
import { computed, type Ref } from 'vue';
import { usePlugin } from './use-plugin';

export interface CapabilityState<C> {
  provides: Ref<C | null>;
  isLoading: Ref<boolean>;
  ready: Ref<Promise<void>>;
}

/**
 * Access the public capability exposed by a plugin.
 *
 * @example
 * const { provides: zoom } = useCapability<ZoomPlugin>(ZoomPlugin.id);
 * zoom.value?.zoomIn();
 */
export function useCapability<T extends BasePlugin>(
  pluginId: T['id'],
): CapabilityState<ReturnType<NonNullable<T['provides']>>> {
  const { plugin, isLoading, ready } = usePlugin<T>(pluginId);

  const provides = computed(() => {
    if (!plugin.value) return null;
    if (!plugin.value.provides) {
      throw new Error(`Plugin ${pluginId} does not implement provides()`);
    }
    return plugin.value.provides() as ReturnType<NonNullable<T['provides']>>;
  });

  return { provides, isLoading, ready };
}
