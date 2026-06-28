<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

import type { SearchControls, SearchOptions, TranslateFn } from '../types'
import { debounce } from '../utils'
import { ChevronDownIcon, ChevronUpIcon, CloseIcon, SearchIcon } from './icons'

const props = withDefaults(
  defineProps<{
    autofocus?: boolean
    controls?: SearchControls
    current: number
    debounceDelay?: number
    searching?: boolean
    t: TranslateFn
    total: number
  }>(),
  {
    autofocus: true,
    debounceDelay: 250,
    searching: false,
  },
)

const emit = defineEmits<{
  close: []
  next: []
  prev: []
  search: [query: string, opts: SearchOptions]
}>()

const caseSensitive = ref(false)
const entireWord = ref(false)
const inputEl = ref<HTMLInputElement | null>(null)
const pending = ref(false)
const query = ref('')

const emitSearch = debounce(() => {
  emit('search', query.value, {
    caseSensitive: caseSensitive.value,
    entireWord: entireWord.value,
    highlightAll: true,
  })
}, props.debounceDelay)

watch([caseSensitive, entireWord, query], () => {
  emitSearch()
  pending.value = query.value.trim().length > 0
})

watch(
  () => props.searching,
  (isSearching) => {
    if (isSearching) {
      pending.value = false
    }
  },
)

watch(
  inputEl,
  (el) => {
    if (el && props.autofocus) {
      el.focus()
    }
  },
  { flush: 'post' },
)

onBeforeUnmount(() => {
  emitSearch.cancel()
})

function handleEnter(e: KeyboardEvent): void {
  if (e.shiftKey) {
    emit('prev')
  } else {
    emit('next')
  }
}

function focus(): void {
  inputEl.value?.focus()
  inputEl.value?.select()
}

defineExpose({
  focus,
})
</script>

<template>
  <div class="vue-pdfx-searchbar" role="search">
    <div class="vue-pdfx-searchbar__field">
      <span class="vue-pdfx-searchbar__leading" aria-hidden="true"><SearchIcon /></span>

      <input
        ref="inputEl"
        v-model="query"
        type="text"
        class="vue-pdfx-searchbar__input"
        :aria-label="t('searchPlaceholder')"
        :placeholder="t('searchPlaceholder')"
        @keydown.enter.prevent="handleEnter"
        @keydown.esc.prevent="emit('close')"
      />

      <span class="vue-pdfx-searchbar__count" aria-live="polite">
        <Transition name="vue-pdfx-count" mode="out-in">
          <span v-if="!searching && !pending && total > 0" key="matches">
            {{ t('matchesCount', { current, total }) }}
          </span>
          <span v-else-if="!searching && !pending && query" key="noMatches">
            {{ t('noMatches') }}
          </span>
        </Transition>
      </span>
    </div>

    <div class="vue-pdfx-searchbar__controls">
      <div class="vue-pdfx-searchbar__nav">
        <button
          type="button"
          class="vue-pdfx-btn"
          :aria-label="t('searchPrevious')"
          :disabled="total === 0"
          :title="t('searchPrevious')"
          @click="emit('prev')"
        >
          <ChevronUpIcon />
        </button>

        <button
          type="button"
          class="vue-pdfx-btn"
          :aria-label="t('searchNext')"
          :disabled="total === 0"
          :title="t('searchNext')"
          @click="emit('next')"
        >
          <ChevronDownIcon />
        </button>
      </div>

      <span
        v-if="controls?.caseSensitive || controls?.entireWord"
        class="vue-pdfx-searchbar__divider"
      />

      <div
        v-if="controls?.caseSensitive || controls?.entireWord"
        class="vue-pdfx-searchbar__toggles"
      >
        <button
          v-if="controls?.caseSensitive"
          type="button"
          class="vue-pdfx-btn vue-pdfx-searchbar__toggle"
          :class="{ 'vue-pdfx-btn--active': caseSensitive }"
          :aria-label="t('caseSensitive')"
          :aria-pressed="caseSensitive"
          :title="t('caseSensitive')"
          @click="caseSensitive = !caseSensitive"
        >
          Aa
        </button>

        <button
          v-if="controls?.entireWord"
          type="button"
          class="vue-pdfx-btn vue-pdfx-searchbar__toggle vue-pdfx-searchbar__toggle--word"
          :class="{ 'vue-pdfx-btn--active': entireWord }"
          :aria-label="t('entireWord')"
          :aria-pressed="entireWord"
          :title="t('entireWord')"
          @click="entireWord = !entireWord"
        >
          ab
        </button>
      </div>
    </div>

    <span class="vue-pdfx-searchbar__divider vue-pdfx-searchbar__divider--trailing" />

    <button
      type="button"
      class="vue-pdfx-btn vue-pdfx-searchbar__close"
      :aria-label="t('closeSearch')"
      :title="t('closeSearch')"
      @click="emit('close')"
    >
      <CloseIcon />
    </button>
  </div>
</template>
