<script setup lang="ts">
import type { TranslateFn } from '../types'
import { FileIcon } from './icons'

defineProps<{
  t: TranslateFn
}>()
</script>

<template>
  <div class="vue-pdfz-overlay">
    <div class="vue-pdfz-overlay__icon">
      <FileIcon />
    </div>

    <p class="vue-pdfz-overlay__title">{{ t('empty') }}</p>
  </div>
</template>
