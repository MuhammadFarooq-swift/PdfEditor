<script setup lang="ts">
defineProps<{
  wrappers: any[];
}>();
</script>

<template>
  <component :is="wrappers[0]">
    <NestedWrapper v-if="wrappers.length > 1" :wrappers="wrappers.slice(1)">
      <slot />
    </NestedWrapper>
    <slot v-else />
  </component>
</template>
