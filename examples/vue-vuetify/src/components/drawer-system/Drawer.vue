<script setup lang="ts">
import { inject, computed, ref } from 'vue';
import { useDisplay } from 'vuetify';
import type { DrawerComponent, DrawerPosition, DrawerState } from './types';

interface Props {
  position: DrawerPosition;
  width?: number;
}

const props = withDefaults(defineProps<Props>(), {
  width: 320,
});

const { mobile } = useDisplay();
const expanded = ref(false);

const drawerContext = inject('drawerContext') as {
  registeredComponents: { value: DrawerComponent[] };
  drawerStates: Record<DrawerPosition, DrawerState>;
  showComponent: (id: string) => void;
  hideComponent: (position: DrawerPosition) => void;
  getActiveComponent: (position: DrawerPosition) => DrawerComponent | null;
};

const isOpen = computed(() => drawerContext.drawerStates[props.position].isOpen);
const activeComponent = computed(() => drawerContext.getActiveComponent(props.position));

const handleClose = () => {
  drawerContext.hideComponent(props.position);
};

const toggleExpanded = () => {
  expanded.value = !expanded.value;
};
</script>

<template>
  <!-- Mobile Bottom Sheet -->
  <v-bottom-sheet
    v-if="mobile"
    :model-value="isOpen"
    @update:model-value="!$event && handleClose()"
    :height="expanded ? '100%' : '50%'"
  >
    <v-card class="fill-height">
      <v-card-title class="d-flex align-center justify-space-between pa-3">
        <div class="d-flex align-center">
          <div class="drag-handle mx-auto" @click="toggleExpanded" />
          <span v-if="activeComponent" class="ml-3">{{ activeComponent.label }}</span>
        </div>
        <v-btn icon="mdi-close" variant="text" size="small" @click="handleClose" />
      </v-card-title>
      <v-divider />
      <v-card-text class="fill-height pa-0 overflow-y-auto">
        <component
          v-if="activeComponent"
          :is="activeComponent.component"
          v-bind="activeComponent.props || {}"
        />
      </v-card-text>
    </v-card>
  </v-bottom-sheet>

  <!-- Desktop Side Drawer -->
  <v-navigation-drawer
    v-else
    :model-value="isOpen"
    :location="position"
    :width="width"
    permanent
    :rail="!isOpen"
    rail-width="0"
    class="drawer-desktop"
  >
    <div v-if="activeComponent" class="fill-height d-flex flex-column">
      <v-toolbar density="compact" color="surface-variant">
        <v-toolbar-title class="text-subtitle-1">
          {{ activeComponent.label }}
        </v-toolbar-title>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" size="small" @click="handleClose" />
      </v-toolbar>
      <div class="flex-1-1-100 overflow-y-auto">
        <component :is="activeComponent.component" v-bind="activeComponent.props || {}" />
      </div>
    </div>
  </v-navigation-drawer>
</template>

<style scoped>
.drawer-desktop {
  transition: width 0.2s ease !important;
}

.drag-handle {
  width: 32px;
  height: 4px;
  background-color: rgb(var(--v-theme-on-surface));
  opacity: 0.38;
  border-radius: 2px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.drag-handle:hover {
  opacity: 0.6;
}

.flex-1-1-100 {
  flex: 1 1 100%;
}
</style>
