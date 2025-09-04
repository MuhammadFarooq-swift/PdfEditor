<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, toRaw, computed } from 'vue';
import { ignore, PdfErrorCode, PdfErrorReason, Task } from '@embedpdf/models';
import type { StyleValue } from 'vue';

import type { Tile } from '@embedpdf/plugin-tiling';
import { useTilingCapability } from '../hooks';

interface Props {
  pageIndex: number;
  tile: Tile;
  scale: number;
  dpr?: number;
  style?: StyleValue;
}

const props = withDefaults(defineProps<Props>(), {
  dpr: () => window.devicePixelRatio,
});

const { provides: tilingCapability } = useTilingCapability();

const url = ref<string>();
let blobUrl: string | null = null;
let renderTask: Task<Blob, PdfErrorReason> | null = null;

/* -------------------------------------------------- */
/* Helper functions                                   */
/* -------------------------------------------------- */
function revoke() {
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl);
    blobUrl = null;
  }
}

function abortCurrentTask() {
  if (renderTask && !blobUrl) {
    renderTask.abort({
      code: PdfErrorCode.Cancelled,
      message: 'canceled tile render',
    });
  }
}

/* -------------------------------------------------- */
/* start one render task when component mounts        */
/* -------------------------------------------------- */
onMounted(() => {
  if (!tilingCapability.value) return;

  const task = tilingCapability.value.renderTile({
    pageIndex: props.pageIndex,
    tile: toRaw(props.tile),
    dpr: props.dpr,
  });

  renderTask = task;
  task.wait((blob) => {
    blobUrl = URL.createObjectURL(blob);
    url.value = blobUrl;
    renderTask = null; // Task completed
  }, ignore);
});

/* -------------------------------------------------- */
/* cleanup                                            */
/* -------------------------------------------------- */
onBeforeUnmount(() => {
  abortCurrentTask();
  revoke();
});

/* -------------------------------------------------- */
/* helpers                                            */
/* -------------------------------------------------- */
const relScale = computed(() => props.scale / props.tile.srcScale);
</script>

<template>
  <img
    v-if="url"
    :src="url"
    :style="[
      {
        position: 'absolute',
        left: tile.screenRect.origin.x * relScale + 'px',
        top: tile.screenRect.origin.y * relScale + 'px',
        width: tile.screenRect.size.width * relScale + 'px',
        height: tile.screenRect.size.height * relScale + 'px',
        display: 'block',
      },
      props.style,
    ]"
    @load="revoke"
  />
</template>
