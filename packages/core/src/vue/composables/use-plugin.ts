import { shallowRef, ref, onMounted, watch, type ShallowRef, type Ref } from 'vue';
import type { BasePlugin } from '@embedpdf/core';
import { useRegistry } from './use-registry';

export interface PluginState<T extends BasePlugin> {
  plugin: ShallowRef<T | null>;
  isLoading: Ref<boolean>;
  ready: Ref<Promise<void>>;
}

export function usePlugin<T extends BasePlugin>(pluginId: T['id']): PluginState<T> {
  const { registry } = useRegistry();

  const plugin = shallowRef(null) as ShallowRef<T | null>;

  const isLoading = ref(true);
  const ready = ref<Promise<void>>(new Promise(() => {}));

  const load = () => {
    if (!registry.value) return;

    const p = registry.value.getPlugin<T>(pluginId);
    if (!p) throw new Error(`Plugin ${pluginId} not found`);

    plugin.value = p;
    isLoading.value = false;
    ready.value = p.ready?.() ?? Promise.resolve();
  };

  onMounted(load);
  watch(registry, load);

  return { plugin, isLoading, ready };
}
