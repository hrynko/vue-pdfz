<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import VuePdfEmbed from 'vue-pdf-embed'
import type { PDFDocumentProxy } from 'pdfjs-dist'

import 'vue-pdf-embed/dist/styles/textLayer.css'
import 'vue-pdf-embed/dist/styles/annotationLayer.css'

import {
  PdfError,
  type AnnotationClickPayload,
  type FormChangePayload,
  type LinkClickPayload,
  type LinkTarget,
  type Rotation,
  type TranslateFn,
} from '../types'
import { debounce, isClient } from '../utils'
import type { FindController } from '../composables/useSearch'
import { useAnnotationLayer } from '../composables/useAnnotationLayer'

const props = withDefaults(
  defineProps<{
    annotationLayer?: boolean
    doc: PDFDocumentProxy
    findController?: FindController
    forms?: boolean
    imageResourcesPath?: string
    lazy?: boolean
    linkRel?: string
    linkTarget?: LinkTarget
    pageNumber: number
    readonly?: boolean
    rotation: Rotation
    scale: number
    t: TranslateFn
    textLayer?: boolean
  }>(),
  {
    annotationLayer: true,
    findController: undefined,
    forms: false,
    imageResourcesPath: undefined,
    lazy: true,
    linkRel: 'noopener noreferrer',
    linkTarget: '_blank',
    readonly: false,
    textLayer: true,
  },
)

const emit = defineEmits<{
  'annotation-click': [payload: AnnotationClickPayload]
  'form-change': [payload: FormChangePayload]
  'link-click': [payload: LinkClickPayload]
  'render-failed': [error: PdfError]
  rendered: [page: number]
}>()

const inner = ref<HTMLElement | null>(null)
const intrinsicSize = shallowRef<{ width: number; height: number } | null>(null)
const isRendered = ref(false)
const renderTick = ref(0)
const root = ref<HTMLElement | null>(null)
const shouldRender = ref(!props.lazy)

const cssWidth = computed(() =>
  intrinsicSize.value
    ? Math.max(1, Math.round(intrinsicSize.value.width * props.scale))
    : undefined,
)

const cssHeight = computed(() =>
  intrinsicSize.value
    ? Math.max(1, Math.round(intrinsicSize.value.height * props.scale))
    : undefined,
)

const renderWidth = computed(() =>
  intrinsicSize.value
    ? Math.max(1, Math.round(intrinsicSize.value.width * renderScale.value))
    : undefined,
)

const previewScale = computed(() =>
  cssWidth.value && renderWidth.value ? cssWidth.value / renderWidth.value : 1,
)

const innerStyle = computed(() =>
  Math.abs(previewScale.value - 1) > 0.002
    ? { transform: `scale(${previewScale.value})`, transformOrigin: '0 0' }
    : undefined,
)

const rootStyle = computed<Record<string, string>>(() => {
  const style: Record<string, string> = {}
  if (cssWidth.value != null) {
    style.width = `${cssWidth.value}px`
  }
  if (cssHeight.value != null) {
    if (innerStyle.value) {
      style.height = `${cssHeight.value}px`
      style.overflow = 'hidden'
    } else {
      style.minHeight = `${cssHeight.value}px`
    }
  }
  return style
})

watch(
  () => [props.doc, props.pageNumber, props.rotation],
  async () => {
    try {
      const page = await props.doc.getPage(props.pageNumber)
      const viewport = page.getViewport({ scale: 1, rotation: props.rotation })
      intrinsicSize.value = { width: viewport.width, height: viewport.height }
    } catch {
      // keep intrinsicSize null so the page falls back to its placeholder box
    }
  },
  { immediate: true },
)

function handleInternalLinkClick(page: number): void {
  emit('link-click', { kind: 'internal', page })
}

function handleRender(): void {
  isRendered.value = true
  renderTick.value++
  emit('rendered', props.pageNumber)
}

function handleRenderFail(err: Error): void {
  emit('render-failed', new PdfError('RENDER_ERROR', err.message, err))
}

useAnnotationLayer({
  container: inner,
  enabled: () => props.annotationLayer && isRendered.value,
  linkRel: () => props.linkRel,
  linkTarget: () => props.linkTarget,
  page: () => props.pageNumber,
  readonly: () => props.readonly,
  tick: renderTick,
  onAnnotationClick: (payload) => emit('annotation-click', payload),
  onFormChange: (payload) => emit('form-change', payload),
  onLinkClick: (payload) => emit('link-click', payload),
})

const renderScale = ref(props.scale)
const settleRenderScale = debounce(() => {
  renderScale.value = props.scale
}, 140)

watch(
  () => props.scale,
  (newScale) => {
    if (isRendered.value) {
      settleRenderScale()
    } else {
      settleRenderScale.cancel()
      renderScale.value = newScale
    }
  },
)

let preloadingObserver: IntersectionObserver | null = null

onMounted(() => {
  if (!props.lazy) {
    shouldRender.value = true
    return
  }
  if (isClient && typeof IntersectionObserver !== 'undefined' && root.value) {
    preloadingObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          shouldRender.value = true
          preloadingObserver?.disconnect()
          preloadingObserver = null
        }
      },
      {
        root: null,
        rootMargin: `${Math.round((window.innerHeight || 800) * 2)}px 0px`,
        threshold: 0,
      },
    )
    preloadingObserver.observe(root.value)
  } else {
    shouldRender.value = true
  }
})

onBeforeUnmount(() => {
  preloadingObserver?.disconnect()
  preloadingObserver = null
  settleRenderScale.cancel()
})
</script>

<template>
  <div
    ref="root"
    class="vue-pdfz-page"
    :class="{ 'vue-pdfz-page--rendered': isRendered }"
    :style="rootStyle"
    :aria-label="t('thumbnailLabel', { page: pageNumber })"
    :data-page="pageNumber"
    role="region"
  >
    <div ref="inner" class="vue-pdfz-page__inner" :style="innerStyle">
      <VuePdfEmbed
        v-if="shouldRender && renderWidth"
        :annotation-layer="annotationLayer"
        :find-controller="findController"
        :forms="forms"
        :image-resources-path="imageResourcesPath"
        :page="pageNumber"
        :rotation="rotation"
        :source="doc"
        :text-layer="textLayer"
        :width="renderWidth"
        @internal-link-clicked="handleInternalLinkClick"
        @rendered="handleRender"
        @rendering-failed="handleRenderFail"
      />

      <div
        v-else
        class="vue-pdfz-page__placeholder"
        :style="{
          width: cssWidth != null ? `${cssWidth}px` : '100%',
          height: cssHeight != null ? `${cssHeight}px` : '140px',
        }"
        aria-hidden="true"
      />

      <div v-if="$slots['page-overlay']" class="vue-pdfz-page-overlay">
        <slot name="page-overlay" :page-number="pageNumber" :scale="scale" />
      </div>
    </div>
  </div>
</template>
