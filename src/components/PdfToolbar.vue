<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { FitMode, LayoutMode, TranslateFn, ZoomValue } from '../types'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  FitIcon,
  MoreIcon,
  PrintIcon,
  RotateCwIcon,
  SearchIcon,
  SidebarIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from './icons'

const props = withDefaults(
  defineProps<{
    canZoomIn?: boolean
    canZoomOut?: boolean
    compact?: boolean
    currentPage: number
    downloading?: boolean
    enableDownload?: boolean
    enablePrint?: boolean
    enableSearch?: boolean
    fitMode: FitMode | null
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string
    layout: LayoutMode
    overflowOpen?: boolean
    pageCount: number
    printing?: boolean
    ready?: boolean
    scale: number
    searchActive?: boolean
    showThumbnailsToggle?: boolean
    t: TranslateFn
    thumbnailsOpen?: boolean
  }>(),
  {
    canZoomIn: true,
    canZoomOut: true,
    compact: false,
    downloading: false,
    enableDownload: true,
    enablePrint: true,
    enableSearch: true,
    overflowOpen: false,
    printing: false,
    ready: true,
    searchActive: false,
    showThumbnailsToggle: true,
    thumbnailsOpen: false,
  },
)

const emit = defineEmits<{
  'rotate-ccw': []
  'rotate-cw': []
  'set-zoom': [value: ZoomValue]
  'toggle-search': []
  'toggle-thumbnails': []
  'update:overflowOpen': [open: boolean]
  'zoom-in': []
  'zoom-out': []
  download: []
  navigate: [page: number]
  next: []
  prev: []
  print: []
}>()

const ZOOM_PRESETS = [0.5, 0.75, 1, 1.25, 1.5, 2, 4]

const overflowWrap = ref<HTMLElement | null>(null)
const pageInput = ref(String(props.currentPage))

const zoomPercentLabel = computed(() =>
  props.t('zoomPercent', { percent: Math.round(props.scale * 100) }),
)

const zoomSelectValue = computed<string>(() =>
  props.fitMode ? props.fitMode : String(Math.round(props.scale * 100)),
)

const showCustomPercent = computed(
  () =>
    !props.fitMode &&
    !ZOOM_PRESETS.some((preset) => Math.round(preset * 100) === Math.round(props.scale * 100)),
)

watch(
  () => props.currentPage,
  (newCurrentPage) => {
    pageInput.value = String(newCurrentPage)
  },
)

function handlePageInput(e: Event): void {
  const el = e.target as HTMLInputElement
  const digits = el.value.replace(/\D+/g, '')
  if (digits !== el.value) {
    el.value = digits
  }
  pageInput.value = digits
}

function handlePageNavigate(): void {
  const n = parseInt(pageInput.value, 10)
  if (!Number.isNaN(n)) {
    const target = Math.min(Math.max(n, 1), Math.max(1, props.pageCount))
    pageInput.value = String(target)
    emit('navigate', target)
  } else {
    pageInput.value = String(props.currentPage)
  }
}

function handleZoomSelect(e: Event): void {
  const value = (e.target as HTMLSelectElement).value
  const modes: FitMode[] = ['auto', 'page-fit', 'page-width']
  if ((modes as string[]).includes(value)) {
    emit('set-zoom', value as FitMode)
  } else {
    const percent = parseInt(value, 10)
    if (!Number.isNaN(percent)) {
      emit('set-zoom', percent / 100)
    }
  }
}

watch(
  () => props.compact,
  (isCompact) => {
    if (!isCompact && props.overflowOpen) {
      emit('update:overflowOpen', false)
    }
  },
)

function withOverflowClose(action: () => void): void {
  action()
  emit('update:overflowOpen', false)
}

function handlePointerDown(e: Event): void {
  if (props.overflowOpen && overflowWrap.value && !overflowWrap.value.contains(e.target as Node)) {
    emit('update:overflowOpen', false)
  }
}

function handleKeydown(e: KeyboardEvent): void {
  if (e.key !== 'Escape' || !props.overflowOpen) {
    return
  }
  emit('update:overflowOpen', false)
  overflowWrap.value?.querySelector('button')?.focus()
}

onMounted(() => {
  document.addEventListener('pointerdown', handlePointerDown, true)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handlePointerDown, true)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="vue-pdfx-toolbar" :aria-label="t('toolbarLabel')" role="toolbar">
    <div class="vue-pdfx-toolbar__start">
      <slot name="toolbar-start">
        <button
          v-if="showThumbnailsToggle"
          type="button"
          class="vue-pdfx-btn"
          :class="{ 'vue-pdfx-btn--active': thumbnailsOpen }"
          :aria-label="t('toggleThumbnails')"
          :aria-pressed="thumbnailsOpen"
          :disabled="!ready"
          :title="t('toggleThumbnails')"
          @click="emit('toggle-thumbnails')"
        >
          <slot name="icon-thumbnails">
            <SidebarIcon />
          </slot>
        </button>

        <Transition name="vue-pdfx-toolbar-fade">
          <span v-if="compact && ready" class="vue-pdfx-toolbar__compact-nav">
            <button
              v-if="layout === 'single'"
              type="button"
              class="vue-pdfx-btn vue-pdfx-btn--nav"
              :aria-label="t('previousPage')"
              :disabled="currentPage <= 1"
              :title="t('previousPage')"
              @click="emit('prev')"
            >
              <slot name="icon-prev">
                <ChevronLeftIcon />
              </slot>
            </button>

            <span class="vue-pdfx-toolbar__compact-count">
              {{ formatNumber(currentPage) }} / {{ formatNumber(pageCount) }}
            </span>

            <button
              v-if="layout === 'single'"
              type="button"
              class="vue-pdfx-btn vue-pdfx-btn--nav"
              :aria-label="t('nextPage')"
              :disabled="currentPage >= pageCount"
              :title="t('nextPage')"
              @click="emit('next')"
            >
              <slot name="icon-next">
                <ChevronRightIcon />
              </slot>
            </button>
          </span>
        </Transition>
      </slot>
    </div>

    <Transition name="vue-pdfx-toolbar-fade">
      <div v-if="!compact && ready" class="vue-pdfx-toolbar__center">
        <slot name="toolbar-center">
          <div class="vue-pdfx-toolbar__group">
            <button
              type="button"
              class="vue-pdfx-btn vue-pdfx-btn--nav"
              :aria-label="t('previousPage')"
              :disabled="currentPage <= 1"
              :title="t('previousPage')"
              @click="emit('prev')"
            >
              <slot name="icon-prev">
                <ChevronLeftIcon />
              </slot>
            </button>

            <span class="vue-pdfx-toolbar__pagebox">
              <input
                type="text"
                class="vue-pdfx-input vue-pdfx-page-input"
                :aria-label="t('goToPage')"
                :maxlength="String(Math.max(1, pageCount)).length"
                :value="pageInput"
                inputmode="numeric"
                @blur="handlePageNavigate"
                @input="handlePageInput"
                @keydown.enter="handlePageNavigate"
              />
              <span class="vue-pdfx-page-total">/ {{ formatNumber(pageCount) }}</span>
            </span>

            <button
              type="button"
              class="vue-pdfx-btn vue-pdfx-btn--nav"
              :aria-label="t('nextPage')"
              :disabled="currentPage >= pageCount"
              :title="t('nextPage')"
              @click="emit('next')"
            >
              <slot name="icon-next">
                <ChevronRightIcon />
              </slot>
            </button>
          </div>

          <span class="vue-pdfx-toolbar__divider" />

          <div class="vue-pdfx-toolbar__group">
            <button
              type="button"
              class="vue-pdfx-btn"
              :aria-label="t('zoomOut')"
              :disabled="!canZoomOut"
              :title="t('zoomOut')"
              @click="emit('zoom-out')"
            >
              <slot name="icon-zoom-out">
                <ZoomOutIcon />
              </slot>
            </button>

            <select
              class="vue-pdfx-select vue-pdfx-zoom-select"
              :aria-label="t('zoomLevel')"
              :title="zoomPercentLabel"
              :value="zoomSelectValue"
              @change="handleZoomSelect"
            >
              <option value="auto">{{ t('fitAuto') }}</option>
              <option value="page-fit">{{ t('fitPage') }}</option>
              <option value="page-width">{{ t('fitWidth') }}</option>
              <option v-if="showCustomPercent" :value="String(Math.round(scale * 100))">
                {{ zoomPercentLabel }}
              </option>
              <option
                v-for="preset in ZOOM_PRESETS"
                :key="preset"
                :value="String(Math.round(preset * 100))"
              >
                {{ t('zoomPercent', { percent: Math.round(preset * 100) }) }}
              </option>
            </select>

            <button
              type="button"
              class="vue-pdfx-btn"
              :aria-label="t('zoomIn')"
              :disabled="!canZoomIn"
              :title="t('zoomIn')"
              @click="emit('zoom-in')"
            >
              <slot name="icon-zoom-in">
                <ZoomInIcon />
              </slot>
            </button>
          </div>

          <span class="vue-pdfx-toolbar__divider" />

          <button
            type="button"
            class="vue-pdfx-btn"
            :aria-label="t('rotateClockwise')"
            :title="t('rotateClockwise')"
            @click="emit('rotate-cw')"
          >
            <slot name="icon-rotate-cw">
              <RotateCwIcon />
            </slot>
          </button>
        </slot>
      </div>
    </Transition>

    <div class="vue-pdfx-toolbar__end">
      <slot name="toolbar-end">
        <Transition name="vue-pdfx-toolbar-fade">
          <div v-if="ready" class="vue-pdfx-toolbar__end-actions">
            <button
              v-if="enableSearch"
              type="button"
              class="vue-pdfx-btn"
              :class="{ 'vue-pdfx-btn--active': searchActive }"
              :aria-label="t('search')"
              :aria-pressed="searchActive"
              :title="t('search')"
              @click="emit('toggle-search')"
            >
              <slot name="icon-search">
                <SearchIcon />
              </slot>
            </button>

            <template v-if="!compact">
              <button
                v-if="enablePrint"
                type="button"
                class="vue-pdfx-btn"
                :aria-label="t('print')"
                :disabled="printing"
                :title="t('print')"
                @click="emit('print')"
              >
                <slot name="icon-print">
                  <PrintIcon />
                </slot>
              </button>

              <button
                v-if="enableDownload"
                type="button"
                class="vue-pdfx-btn"
                :aria-label="t('download')"
                :disabled="downloading"
                :title="t('download')"
                @click="emit('download')"
              >
                <slot name="icon-download">
                  <DownloadIcon />
                </slot>
              </button>
            </template>

            <div v-else ref="overflowWrap" class="vue-pdfx-overflow-wrap">
              <button
                type="button"
                class="vue-pdfx-btn"
                :class="{ 'vue-pdfx-btn--active': overflowOpen }"
                :aria-expanded="overflowOpen"
                aria-haspopup="menu"
                :aria-label="t('more')"
                :title="t('more')"
                @click="emit('update:overflowOpen', !overflowOpen)"
              >
                <MoreIcon />
              </button>

              <Transition name="vue-pdfx-search">
                <div
                  v-if="overflowOpen"
                  class="vue-pdfx-overflow"
                  :aria-label="t('more')"
                  role="menu"
                >
                  <button
                    type="button"
                    class="vue-pdfx-overflow__item"
                    role="menuitem"
                    @click="withOverflowClose(() => emit('set-zoom', 'page-width'))"
                  >
                    <FitIcon />
                    <span>{{ t('fitWidth') }}</span>
                  </button>

                  <button
                    type="button"
                    class="vue-pdfx-overflow__item"
                    :disabled="!canZoomIn"
                    role="menuitem"
                    @click="withOverflowClose(() => emit('zoom-in'))"
                  >
                    <ZoomInIcon />
                    <span>{{ t('zoomIn') }}</span>
                  </button>

                  <button
                    type="button"
                    class="vue-pdfx-overflow__item"
                    :disabled="!canZoomOut"
                    role="menuitem"
                    @click="withOverflowClose(() => emit('zoom-out'))"
                  >
                    <ZoomOutIcon />
                    <span>{{ t('zoomOut') }}</span>
                  </button>

                  <button
                    type="button"
                    class="vue-pdfx-overflow__item"
                    role="menuitem"
                    @click="withOverflowClose(() => emit('rotate-cw'))"
                  >
                    <RotateCwIcon />
                    <span>{{ t('rotateClockwise') }}</span>
                  </button>

                  <template v-if="enablePrint || enableDownload">
                    <span class="vue-pdfx-overflow__divider" />

                    <button
                      v-if="enableDownload"
                      type="button"
                      class="vue-pdfx-overflow__item"
                      :disabled="downloading"
                      role="menuitem"
                      @click="withOverflowClose(() => emit('download'))"
                    >
                      <DownloadIcon />
                      <span>{{ t('download') }}</span>
                    </button>

                    <button
                      v-if="enablePrint"
                      type="button"
                      class="vue-pdfx-overflow__item"
                      :disabled="printing"
                      role="menuitem"
                      @click="withOverflowClose(() => emit('print'))"
                    >
                      <PrintIcon />
                      <span>{{ t('print') }}</span>
                    </button>
                  </template>
                </div>
              </Transition>
            </div>
          </div>
        </Transition>
      </slot>
    </div>
  </div>
</template>
