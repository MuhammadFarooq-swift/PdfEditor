<script setup lang="ts">
/* ------------------------------------------------------------------ */
/* imports                                                            */
/* ------------------------------------------------------------------ */
import { computed, onMounted, ref, watchEffect, useAttrs } from 'vue';
import type { StyleValue } from 'vue';

import { useScrollCapability, useScrollPlugin } from '../hooks';
import { ScrollStrategy, type ScrollerLayout, type PageLayout } from '@embedpdf/plugin-scroll';
import { useRegistry } from '@embedpdf/core/vue';
import type { PdfDocumentObject, Rotation } from '@embedpdf/models';

/* ------------------------------------------------------------------ */
/* props – pure layout; page content comes from the *slot*            */
/* ------------------------------------------------------------------ */
const props = withDefaults(
  defineProps<{
    style?: StyleValue;
    overlayElements?: any[];
  }>(),
  { overlayElements: () => [] },
);

const attrs = useAttrs();

/* ------------------------------------------------------------------ */
/* plugin + reactive state                                            */
/* ------------------------------------------------------------------ */
const { provides: scrollProvides } = useScrollCapability();
const { plugin: scrollPlugin } = useScrollPlugin();
const { registry } = useRegistry(); // shallowRef<PluginRegistry|null>

const layout = ref<ScrollerLayout | null>(null);

/* subscribe to scroller‑layout updates */
watchEffect((onCleanup) => {
  if (!scrollProvides.value) return;

  layout.value = scrollProvides.value.getScrollerLayout();
  const off = scrollProvides.value.onScrollerData((l) => (layout.value = l));
  onCleanup(off);
});

/* inform plugin once the DOM is ready */
onMounted(() => {
  scrollPlugin.value?.setLayoutReady();
});

/* ------------------------------------------------------------------ */
/* helpers                                                            */
/* ------------------------------------------------------------------ */
interface PageSlotProps extends PageLayout {
  rotation: Rotation;
  scale: number;
  document: PdfDocumentObject | null;
}

/** Build the prop object that we’ll forward into the default slot */
function pageSlotProps(pl: PageLayout): PageSlotProps {
  const core = registry.value!.getStore().getState().core;
  return {
    ...pl,
    rotation: core.rotation,
    scale: core.scale,
    document: core.document,
  };
}

/* ------------------------------------------------------------------ */
/* computed root style                                                */
/* ------------------------------------------------------------------ */
const rootStyle = computed<StyleValue>(() => {
  if (!layout.value) return props.style;

  const base =
    typeof props.style === 'object' && !Array.isArray(props.style)
      ? { ...props.style }
      : (props.style ?? {});

  return [
    base,
    {
      width: `${layout.value.totalWidth}px`,
      height: `${layout.value.totalHeight}px`,
      position: 'relative',
      boxSizing: 'border-box',
      margin: '0 auto',
      ...(layout.value.strategy === ScrollStrategy.Horizontal && {
        display: 'flex',
        flexDirection: 'row',
      }),
    },
  ];
});
</script>

<template>
  <!-- render nothing until both layout + registry exist -->
  <div v-if="layout && registry" :style="rootStyle" v-bind="attrs">
    <!-- leading spacer -->
    <div
      v-if="layout.strategy === 'horizontal'"
      :style="{ width: layout.startSpacing + 'px', height: '100%', flexShrink: 0 }"
    />
    <div v-else :style="{ height: layout.startSpacing + 'px', width: '100%' }" />

    <!-- actual page grid -->
    <div
      :style="{
        gap: layout.pageGap + 'px',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        boxSizing: 'border-box',
        flexDirection: layout.strategy === 'horizontal' ? 'row' : 'column',
        minHeight: layout.strategy === 'horizontal' ? '100%' : undefined,
        minWidth: layout.strategy === 'vertical' ? 'fit-content' : undefined,
      }"
    >
      <template v-for="item in layout.items" :key="item.pageNumbers[0]">
        <div :style="{ display: 'flex', justifyContent: 'center', gap: layout.pageGap + 'px' }">
          <div
            v-for="pl in item.pageLayouts"
            :key="pl.pageNumber"
            :style="{ width: pl.rotatedWidth + 'px', height: pl.rotatedHeight + 'px' }"
          >
            <!-- 🔑 give the host app full control over page content -->
            <slot :page="pageSlotProps(pl)" />
          </div>
        </div>
      </template>
    </div>

    <!-- trailing spacer -->
    <div
      v-if="layout.strategy === 'horizontal'"
      :style="{ width: layout.endSpacing + 'px', height: '100%', flexShrink: 0 }"
    />
    <div v-else :style="{ height: layout.endSpacing + 'px', width: '100%' }" />

    <!-- optional overlay components -->
    <component v-for="(el, i) in props.overlayElements" :is="el" :key="i" />
  </div>
</template>
