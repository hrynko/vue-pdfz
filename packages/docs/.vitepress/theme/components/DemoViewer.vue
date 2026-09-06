<script setup lang="ts">
import { withBase } from 'vitepress'
import { PdfViewer } from 'vue-pdfz'

withDefaults(
  defineProps<{
    height?: string
    sample?: string
  }>(),
  {
    height: '440px',
    sample: '/vue-pdfz-sample.pdf',
  },
)
</script>

<template>
  <div class="demo-viewer" :style="{ height }">
    <PdfViewer :source="withBase(sample)" :show-thumbnails="false" style="height: 100%">
      <template v-for="(_, name) in $slots" #[name]="scope">
        <slot :name="name" v-bind="scope ?? {}" />
      </template>
    </PdfViewer>
  </div>
</template>

<style scoped>
.demo-viewer {
  margin: 1.25rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg);
}
</style>
