import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import type { CoreState, StoreState } from '@embedpdf/core';
import { useRegistry } from './use-registry';

/**
 * Reactive getter for the *entire* global store.
 * Re‑emits whenever any slice changes.
 *
 * @example
 * const state = useStoreState();              // Ref<StoreState<CoreState>>
 * console.log(state.value.core.scale);
 */
export function useStoreState<T = CoreState>() {
  const { registry } = useRegistry();
  const state = ref<StoreState<T>>();

  function attach() {
    if (!registry.value) return () => {};

    // initial snapshot
    state.value = registry.value.getStore().getState() as StoreState<T>;

    // live updates
    return registry.value
      .getStore()
      .subscribe((_action, newState) => (state.value = newState as StoreState<T>));
  }

  /* attach now and re‑attach if registry instance ever changes */
  let unsubscribe = attach();
  watch(registry, () => {
    unsubscribe?.();
    unsubscribe = attach();
  });

  onBeforeUnmount(() => unsubscribe?.());

  return state;
}
