import { useCapability, usePlugin } from '@embedpdf/core/vue';
import {
  initialState,
  InteractionManagerPlugin,
  InteractionManagerState,
  PointerEventHandlersWithLifecycle,
} from '@embedpdf/plugin-interaction-manager';
import { ref, watchEffect, readonly } from 'vue';

export const useInteractionManagerPlugin = () =>
  usePlugin<InteractionManagerPlugin>(InteractionManagerPlugin.id);
export const useInteractionManagerCapability = () =>
  useCapability<InteractionManagerPlugin>(InteractionManagerPlugin.id);

export function useInteractionManager() {
  const { provides } = useInteractionManagerCapability();
  const state = ref<InteractionManagerState>(initialState);

  watchEffect((onCleanup) => {
    if (provides.value) {
      // onStateChange is a BehaviorEmitter, so it emits the current state upon subscription
      const unsubscribe = provides.value.onStateChange((newState) => {
        state.value = newState;
      });
      onCleanup(unsubscribe);
    }
  });

  return {
    provides,
    state: readonly(state),
  };
}

export function useCursor() {
  const { provides } = useInteractionManagerCapability();
  return {
    setCursor: (token: string, cursor: string, prio = 0) => {
      provides.value?.setCursor(token, cursor, prio);
    },
    removeCursor: (token: string) => {
      provides.value?.removeCursor(token);
    },
  };
}

interface UsePointerHandlersOptions {
  modeId?: string | string[];
  pageIndex?: number;
}

export function usePointerHandlers({ modeId, pageIndex }: UsePointerHandlersOptions) {
  const { provides } = useInteractionManagerCapability();
  return {
    register: (
      handlers: PointerEventHandlersWithLifecycle,
      options?: { modeId?: string | string[]; pageIndex?: number },
    ) => {
      // Use provided options or fall back to hook-level options
      const finalModeId = options?.modeId ?? modeId;
      const finalPageIndex = options?.pageIndex ?? pageIndex;

      if (!provides.value) return;

      return finalModeId
        ? provides.value.registerHandlers({
            modeId: finalModeId,
            handlers,
            pageIndex: finalPageIndex,
          })
        : provides.value.registerAlways({
            scope:
              finalPageIndex !== undefined
                ? { type: 'page', pageIndex: finalPageIndex }
                : { type: 'global' },
            handlers,
          });
    },
  };
}

export function useIsPageExclusive() {
  const { provides: cap } = useInteractionManagerCapability();
  const isPageExclusive = ref<boolean>(false);

  watchEffect((onCleanup) => {
    if (cap.value) {
      const mode = cap.value.getActiveInteractionMode();
      isPageExclusive.value = mode?.scope === 'page' && !!mode?.exclusive;

      const unsubscribe = cap.value.onModeChange(() => {
        if (!cap.value) return;
        const newMode = cap.value.getActiveInteractionMode();
        isPageExclusive.value = newMode?.scope === 'page' && !!newMode?.exclusive;
      });
      onCleanup(unsubscribe);
    }
  });

  return readonly(isPageExclusive);
}
