<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { PDFDocumentProxy } from 'pdfjs-dist'

import type { TranslateFn } from '../types'
import { capDpr, isClient } from '../utils'

const props = withDefaults(
  defineProps<{
    currentPage: number
    doc: PDFDocumentProxy
    pageCount: number
    t: TranslateFn
    thumbnailWidth?: number
  }>(),
  {
    thumbnailWidth: 120,
  },
)

const emit = defineEmits<{
  navigate: [page: number]
}>()

const aspects = ref<Record<number, number>>({})
const itemEls = ref<Map<number, HTMLElement>>(new Map())
const listEl = ref<HTMLElement | null>(null)
const rendering = new Set<number>()
const sources = ref<Record<number, string>>({})
let renderObserver: IntersectionObserver | null = null

function setItemRef(page: number, el: Element | null): void {
  if (el instanceof HTMLElement) {
    itemEls.value.set(page, el)
    renderObserver?.observe(el)
  } else {
    const existing = itemEls.value.get(page)
    if (existing) {
      renderObserver?.unobserve(existing)
    }
    itemEls.value.delete(page)
  }
}

watch(
  () => props.doc,
  () => {
    aspects.value = {}
    sources.value = {}
    rendering.clear()
  },
)

watch(
  () => props.currentPage,
  (newCurrentPage) => {
    const list = listEl.value
    const el = itemEls.value.get(newCurrentPage)
    if (!list || !el) {
      return
    }
    const top = el.offsetTop - list.clientHeight / 2 + el.offsetHeight / 2
    const max = list.scrollHeight - list.clientHeight
    const target = Math.max(0, Math.min(top, max))
    if (typeof list.scrollTo === 'function') {
      list.scrollTo({ top: target, behavior: 'smooth' })
    } else {
      list.scrollTop = target
    }
  },
)

async function renderThumbnail(page: number): Promise<void> {
  if (sources.value[page] || rendering.has(page)) {
    return
  }
  rendering.add(page)
  try {
    const pdfPage = await props.doc.getPage(page)
    const viewport = pdfPage.getViewport({
      scale: props.thumbnailWidth / pdfPage.getViewport({ scale: 1 }).width,
    })
    aspects.value[page] = viewport.height / viewport.width
    const dpr = capDpr(2)
    const canvas = document.createElement('canvas')
    canvas.width = Math.floor(viewport.width * dpr)
    canvas.height = Math.floor(viewport.height * dpr)
    const canvasContext = canvas.getContext('2d')
    if (!canvasContext) {
      return
    }
    canvasContext.scale(dpr, dpr)
    await pdfPage.render({ canvas: null, canvasContext, viewport }).promise
    sources.value[page] = canvas.toDataURL('image/png')
    canvas.width = 0
    canvas.height = 0
  } catch {
    // ignore individual thumbnail failures
  } finally {
    rendering.delete(page)
  }
}

onMounted(() => {
  void nextTick(() => {
    if (!isClient || typeof IntersectionObserver === 'undefined') {
      for (let n = 1; n <= props.pageCount; n++) {
        void renderThumbnail(n)
      }
      return
    }

    renderObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const page = Number((entry.target as HTMLElement).dataset.page)
            if (page) {
              void renderThumbnail(page)
            }
          }
        }
      },
      {
        root: listEl.value,
        rootMargin: '300px 0px',
        threshold: 0,
      },
    )

    itemEls.value.forEach((el) => renderObserver?.observe(el))
  })
})

onBeforeUnmount(() => {
  renderObserver?.disconnect()
  renderObserver = null
})
</script>

<template>
  <div class="vue-pdfx-thumbnails">
    <div
      ref="listEl"
      class="vue-pdfx-thumbnails__list"
      :aria-label="t('thumbnailsTitle')"
      role="listbox"
      tabindex="0"
      @keydown.down.prevent="emit('navigate', Math.min(currentPage + 1, pageCount))"
      @keydown.up.prevent="emit('navigate', Math.max(currentPage - 1, 1))"
    >
      <button
        v-for="page in pageCount"
        :key="page"
        :ref="(el) => setItemRef(page, el as Element | null)"
        type="button"
        class="vue-pdfx-thumb"
        :class="{ 'vue-pdfx-thumb--active': page === currentPage }"
        :aria-label="t('thumbnailLabel', { page })"
        :aria-selected="page === currentPage"
        :data-page="page"
        role="option"
        @click="emit('navigate', page)"
      >
        <slot name="thumbnail" :is-active="page === currentPage" :page="page" :src="sources[page]">
          <span
            class="vue-pdfx-thumb__frame"
            :style="{
              inlineSize: `${thumbnailWidth}px`,
              aspectRatio: aspects[page] ? `1 / ${aspects[page]}` : '1 / 1.414',
            }"
          >
            <img
              v-if="sources[page]"
              class="vue-pdfx-thumb__canvas"
              :alt="t('thumbnailLabel', { page })"
              :src="sources[page]"
              loading="lazy"
            />
          </span>

          <span
            class="vue-pdfx-thumb__label"
            :class="{ 'vue-pdfx-thumb__label--active': page === currentPage }"
          >
            {{ page }}
          </span>
        </slot>
      </button>
    </div>
  </div>
</template>
