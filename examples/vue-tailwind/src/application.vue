<script setup lang="ts">
import { usePdfiumEngine } from '@embedpdf/engines/vue';
import { EmbedPDF } from '@embedpdf/core/vue';
import { createPluginRegistration } from '@embedpdf/core';
import { LoaderPluginPackage } from '@embedpdf/plugin-loader/vue';
import { Viewport, ViewportPluginPackage } from '@embedpdf/plugin-viewport/vue';
import { Scroller, ScrollPluginPackage, ScrollStrategy } from '@embedpdf/plugin-scroll/vue';
import { RenderLayer, RenderPluginPackage } from '@embedpdf/plugin-render/vue';
import { TilingLayer, TilingPluginPackage } from '@embedpdf/plugin-tiling/vue';
import { SelectionLayer, SelectionPluginPackage } from '@embedpdf/plugin-selection/vue';
import {
  InteractionManagerPluginPackage,
  GlobalPointerProvider,
  PagePointerProvider,
} from '@embedpdf/plugin-interaction-manager/vue';
import { RotatePluginPackage } from '@embedpdf/plugin-rotate/vue';
import { Rotate } from '@embedpdf/plugin-rotate/vue';
import { FullscreenPluginPackage } from '@embedpdf/plugin-fullscreen/vue';
import { ZoomMode, ZoomPluginPackage } from '@embedpdf/plugin-zoom/vue';

const { engine, isLoading: engineLoading, error: engineError } = usePdfiumEngine();
</script>

<template>
  <div class="flex h-screen flex-1 flex-col overflow-hidden">
    <div v-if="engineLoading" class="flex h-full items-center justify-center text-gray-500">
      Loading PDF engine...
    </div>
    <div v-else-if="engineError" class="flex h-full items-center justify-center text-red-600">
      Error: {{ engineError.message }}
    </div>
    <div v-else-if="engine" class="flex flex-1 overflow-hidden">
      <EmbedPDF
        :engine="engine"
        :plugins="[
          createPluginRegistration(LoaderPluginPackage, {
            loadingOptions: {
              type: 'url',
              pdfFile: {
                id: 'sample-pdf',
                name: 'embedpdf-ebook.pdf',
                url: 'https://snippet.embedpdf.com/ebook.pdf',
              },
            },
          }),
          createPluginRegistration(ViewportPluginPackage, {
            viewportGap: 10,
          }),
          createPluginRegistration(ScrollPluginPackage, {
            strategy: ScrollStrategy.Vertical,
            pageGap: 10,
          }),
          createPluginRegistration(RenderPluginPackage),
          createPluginRegistration(TilingPluginPackage, {
            tileSize: 768,
            overlapPx: 2.5,
            extraRings: 0,
          }),
          createPluginRegistration(InteractionManagerPluginPackage),
          createPluginRegistration(SelectionPluginPackage),
          createPluginRegistration(RotatePluginPackage),
          createPluginRegistration(FullscreenPluginPackage),
          createPluginRegistration(ZoomPluginPackage, {
            defaultZoomLevel: ZoomMode.FitPage,
          }),
        ]"
      >
        <template #default="{ pluginsReady }">
          <!-- Main container with flex column layout -->
          <div class="relative flex h-full w-full select-none flex-col">
            <!-- Main content area that grows to fill remaining space -->
            <div class="flex flex-1 overflow-hidden">
              <!-- Main Viewport -->
              <div class="relative flex min-w-0 flex-1 flex-col">
                <GlobalPointerProvider>
                  <Viewport class="h-full w-full flex-1 overflow-auto bg-gray-100">
                    <div v-if="!pluginsReady" class="flex h-full items-center justify-center">
                      <div class="text-gray-500">Loading plugins...</div>
                    </div>
                    <Scroller v-if="pluginsReady">
                      <template #default="{ page }">
                        <Rotate :page-size="{ width: page.width, height: page.height }">
                          <PagePointerProvider
                            :page-index="page.pageIndex"
                            :page-width="page.width"
                            :page-height="page.height"
                            :rotation="page.rotation"
                            :scale="page.scale"
                            class="absolute"
                            :style="{
                              width: page.width + 'px',
                              height: page.height + 'px',
                            }"
                          >
                            <RenderLayer :page-index="page.pageIndex" class="pointer-events-none" />
                            <TilingLayer
                              :page-index="page.pageIndex"
                              :scale="page.scale"
                              class="pointer-events-none"
                            />
                            <SelectionLayer :page-index="page.pageIndex" :scale="page.scale" />
                          </PagePointerProvider>
                        </Rotate>
                      </template>
                    </Scroller>
                  </Viewport>
                </GlobalPointerProvider>
              </div>
            </div>
          </div>
        </template>
      </EmbedPDF>
    </div>
    <div v-else class="flex h-full items-center justify-center text-gray-500">Engine not ready</div>
  </div>
</template>
