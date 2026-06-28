<script setup lang="ts">
import type { TranslateFn } from '../types'
import { FileIcon } from './icons'

defineProps<{
  t: TranslateFn
}>()
</script>

<template>
  <div class="vue-pdfx-overlay">
    <div class="vue-pdfx-overlay__icon">
      <FileIcon />
    </div>

    <p class="vue-pdfx-overlay__title">{{ t('empty') }}</p>
  </div>
</template>
