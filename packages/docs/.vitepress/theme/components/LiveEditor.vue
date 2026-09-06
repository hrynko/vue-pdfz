<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const LiveEditorInner = defineAsyncComponent(() => import('./LiveEditorInner.vue'))

defineProps<{
  code?: string
}>()
</script>

<template>
  <ClientOnly>
    <Suspense>
      <LiveEditorInner :code="code" />

      <template #fallback>
        <div class="live-editor-loading">Loading editor...</div>
      </template>
    </Suspense>
  </ClientOnly>
</template>

<style scoped>
.live-editor-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 271px;
  margin: 1.25rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-3);
  font-size: 14px;
}
</style>
