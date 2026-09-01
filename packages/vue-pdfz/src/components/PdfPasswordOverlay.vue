<script setup lang="ts">
import { onMounted, ref } from 'vue'

import type { TranslateFn } from '../types'
import { LockIcon } from './icons'

defineProps<{
  t: TranslateFn
}>()

const emit = defineEmits<{
  submit: [password: string]
}>()

const error = defineModel<boolean>('error', { default: false })
const inputEl = ref<HTMLInputElement | null>(null)
const password = ref('')

onMounted(() => {
  inputEl.value?.focus()
})
</script>

<template>
  <div class="vue-pdfz-overlay">
    <div class="vue-pdfz-overlay__icon">
      <LockIcon />
    </div>

    <p class="vue-pdfz-overlay__title">{{ t('passwordTitle') }}</p>
    <p class="vue-pdfz-overlay__message">{{ t('passwordPrompt') }}</p>

    <form class="vue-pdfz-overlay__form" @submit.prevent="emit('submit', password)">
      <input
        ref="inputEl"
        v-model="password"
        type="password"
        class="vue-pdfz-input vue-pdfz-password-input"
        :class="{ 'vue-pdfz-input--invalid': error }"
        :aria-invalid="error"
        :aria-label="t('passwordPlaceholder')"
        :placeholder="t('passwordPlaceholder')"
        autocomplete="off"
        @input="error && (error = false)"
      />

      <Transition name="vue-pdfz-msg">
        <p v-if="error" class="vue-pdfz-overlay__message vue-pdfz-overlay__message--error">
          {{ t('passwordIncorrect') }}
        </p>
      </Transition>

      <button type="submit" class="vue-pdfz-btn--action">
        {{ t('passwordSubmit') }}
      </button>
    </form>
  </div>
</template>
