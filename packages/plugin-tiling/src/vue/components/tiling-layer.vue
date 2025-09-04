<script setup lang="ts">
import type { Tile } from '@embedpdf/plugin-tiling';
import { ref, onMounted, onBeforeUnmount } from 'vue';
import type { StyleValue } from 'vue';

import { useTilingCapability } from '../hooks';
import TileImg from './tile-img.vue';

interface Props {
  pageIndex: number;
  scale: number;
  style?: StyleValue;
}

const props = defineProps<Props>();

const tiles = ref<Tile[]>([]);
const { provides: tilingProvides } = useTilingCapability();

let unsubscribe: (() => void) | undefined;

onMounted(() => {
  if (tilingProvides.value) {
    unsubscribe = tilingProvides.value.onTileRendering((tilesMap) => {
      tiles.value = tilesMap[props.pageIndex] ?? [];
    });
  }
});

onBeforeUnmount(() => {
  unsubscribe?.();
});
</script>

<template>
  <div :style="style" v-bind="$attrs">
    <TileImg
      v-for="tile in tiles"
      :key="tile.id"
      :pageIndex="pageIndex"
      :tile="tile"
      :scale="scale"
    />
  </div>
</template>
