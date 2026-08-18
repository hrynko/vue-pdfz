<script setup lang="ts">
import { computed } from 'vue'

import type { LoadingProgress, TranslateFn } from '../types'
import { clamp } from '../utils'

const props = defineProps<{
  progress: LoadingProgress
  t: TranslateFn
}>()

const loadbarWidth = computed(() => {
  const { loaded, total, percent } = props.progress
  if (total > 0) {
    return `${clamp(percent, 6, 100)}%`
  }
  // an asymptotic curve of the bytes received
  return `${clamp(100 * (1 - 1 / (1 + loaded / 1_500_000)), 8, 90)}%`
})
</script>

<template>
  <div class="vue-pdfz-overlay" role="status">
    <div class="vue-pdfz-loadbar" aria-hidden="true">
      <div class="vue-pdfz-loadbar__seg" :style="{ inlineSize: loadbarWidth }" />
    </div>

    <div class="vue-pdfz-loading">
      <span class="vue-pdfz-spinner" aria-hidden="true" />
      <span>{{ t('loading') }}</span>
    </div>
  </div>
</template>
