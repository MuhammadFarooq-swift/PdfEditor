import { ref, onMounted, onBeforeUnmount } from 'vue';
import { arePropsEqual, type CoreState } from '@embedpdf/core';
import { useRegistry } from './use-registry';

export function useCoreState() {
  const { registry } = useRegistry();
  const core = ref<CoreState>();

  onMounted(() => {
    const store = registry.value!.getStore();
    core.value = store.getState().core;

    const unsub = store.subscribe((action, newSt, oldSt) => {
      if (store.isCoreAction(action) && !arePropsEqual(newSt.core, oldSt.core)) {
        core.value = newSt.core;
      }
    });
    onBeforeUnmount(unsub);
  });

  return core;
}
