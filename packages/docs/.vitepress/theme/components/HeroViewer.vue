<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { PdfViewer } from 'vue-pdfz'

const { isDark } = useData()
const theme = computed(() => (isDark.value ? 'dark' : 'light'))
</script>

<template>
  <div class="hero-viewer">
    <PdfViewer :source="withBase('/vue-pdfz-sample.pdf')" :theme="theme" forms />
  </div>
</template>

<style scoped>
.hero-viewer {
  width: 100%;
  height: 420px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--vp-shadow-3);
  background: var(--vp-c-bg);
}

@media (min-width: 960px) {
  .hero-viewer {
    height: 460px;
  }
}
</style>
