<script setup lang="ts">
import { ref, watch, useAttrs } from 'vue';

import { useViewportCapability, useViewportRef } from '../hooks';

/* -------------------------------------------------- */
/* props & attrs                                      */
/* -------------------------------------------------- */
const attrs = useAttrs(); // forward class/id/… to <div>

/* -------------------------------------------------- */
/* plugin + reactive viewport gap                     */
/* -------------------------------------------------- */
const { provides: viewportProvides } = useViewportCapability();
const viewportGap = ref(0);

watch(
  viewportProvides,
  (vp) => {
    if (vp) viewportGap.value = vp.getViewportGap();
  },
  { immediate: true },
);

/* -------------------------------------------------- */
/* element ref that wires up scroll / resize logic    */
/* -------------------------------------------------- */
const viewportRef = useViewportRef();
</script>

<template>
  <div
    ref="viewportRef"
    v-bind="attrs"
    :style="{ padding: `${viewportGap}px`, width: '100%', height: '100%', overflow: 'auto' }"
  >
    <slot />
  </div>
</template>
