<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { createPointerProvider } from '../../shared/utils';
import { useInteractionManagerCapability } from '../hooks';

const divRef = ref<HTMLDivElement | null>(null);
const { provides: cap } = useInteractionManagerCapability();

// watchEffect automatically handles setup and teardown when capability or element is ready
watchEffect((onCleanup) => {
  if (cap.value && divRef.value) {
    const cleanup = createPointerProvider(cap.value, { type: 'global' }, divRef.value);
    onCleanup(cleanup);
  }
});
</script>

<template>
  <div
    ref="divRef"
    :style="{
      width: '100%',
      height: '100%',
    }"
  >
    <slot />
  </div>
</template>
