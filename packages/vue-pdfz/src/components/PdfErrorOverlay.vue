<script setup lang="ts">
import { computed } from 'vue'

import type { LocaleMessages, PdfError, PdfErrorCode, TranslateFn } from '../types'
import { AlertIcon } from './icons'

const ERROR_MESSAGE_KEYS: Partial<Record<PdfErrorCode, keyof LocaleMessages>> = {
  INVALID_PDF: 'errorInvalidPdf',
  MISSING_PDF: 'errorMissingPdf',
  NETWORK_ERROR: 'errorNetwork',
  RENDER_ERROR: 'errorRender',
  WORKER_ERROR: 'errorWorker',
}

const props = defineProps<{
  error: PdfError
  t: TranslateFn
}>()

defineEmits<{
  retry: []
}>()

const message = computed(() => props.t(ERROR_MESSAGE_KEYS[props.error.code] ?? 'errorGeneric'))
</script>

<template>
  <div class="vue-pdfz-overlay" role="alert">
    <div class="vue-pdfz-overlay__icon">
      <AlertIcon />
    </div>

    <p class="vue-pdfz-overlay__title">{{ t('errorTitle') }}</p>
    <p class="vue-pdfz-overlay__message">{{ message }}</p>

    <button type="button" class="vue-pdfz-btn--action" @click="$emit('retry')">
      {{ t('retry') }}
    </button>
  </div>
</template>
