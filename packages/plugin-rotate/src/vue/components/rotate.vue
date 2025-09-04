<script setup lang="ts">
import { computed } from 'vue';
import type { Size } from '@embedpdf/models';
import { useRotateCapability } from '../hooks';

interface Props {
  pageSize: Size;
}

const props = defineProps<Props>();

const { provides: rotate } = useRotateCapability();

const transformMatrix = computed(() => {
  // If the capability is not yet available, return an identity matrix.
  if (!rotate.value) {
    return 'matrix(1, 0, 0, 1, 0, 0)';
  }

  // Get the CSS transform matrix string from the capability.
  return rotate.value.getMatrix({
    w: props.pageSize.width,
    h: props.pageSize.height,
    asString: true,
  }) as string;
});
</script>

<template>
  <div
    :style="{
      position: 'absolute',
      transformOrigin: '0 0',
      transform: transformMatrix,
    }"
  >
    <slot />
  </div>
</template>
