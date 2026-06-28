<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'

import type {
  AnnotationClickPayload,
  FormChangePayload,
  KeyboardShortcuts,
  LayoutMode,
  LinkClickPayload,
  LinkTarget,
  LoadingProgress,
  LocaleMessages,
  PdfDocumentMeta,
  PdfError,
  PdfSourceProp,
  Rotation,
  SearchControls,
  SearchOptions,
  SearchResult,
  ThemeMode,
  ThemeTokens,
  ZoomValue,
} from '../types'
import { useVuePdfxConfig } from '../context'
import { ensureReadableStreamAsyncIterator } from '../polyfills'
import { clamp, isClient, throttle } from '../utils'
import { useI18n } from '../i18n'
import { useKeyboard } from '../composables/useKeyboard'
import { usePdfDocument } from '../composables/usePdfDocument'
import { useRotation } from '../composables/useRotation'
import { useSearch } from '../composables/useSearch'
import { useVirtualPages } from '../composables/useVirtualPages'
import { useZoom } from '../composables/useZoom'
import PdfEmptyOverlay from './PdfEmptyOverlay.vue'
import PdfErrorOverlay from './PdfErrorOverlay.vue'
import PdfLoadingOverlay from './PdfLoadingOverlay.vue'
import PdfPage from './PdfPage.vue'
import PdfPasswordOverlay from './PdfPasswordOverlay.vue'
import PdfSearchBar from './PdfSearchBar.vue'
import PdfThumbnails from './PdfThumbnails.vue'
import PdfToolbar from './PdfToolbar.vue'

ensureReadableStreamAsyncIterator()

const ICON_SLOT_NAMES = [
  'icon-prev',
  'icon-next',
  'icon-zoom-in',
  'icon-zoom-out',
  'icon-rotate-cw',
  'icon-search',
  'icon-print',
  'icon-download',
  'icon-thumbnails',
] as const

const props = withDefaults(
  defineProps<{
    annotationLayer?: boolean
    enableDownload?: boolean
    enableKeyboard?: boolean
    enablePrint?: boolean
    enableSearch?: boolean
    forms?: boolean | 'readonly'
    imageResourcesPath?: string
    layout?: LayoutMode
    lazy?: boolean
    linkRel?: string
    linkTarget?: LinkTarget
    locale?: string
    maxZoom?: number
    messages?: Partial<LocaleMessages>
    minZoom?: number
    searchControls?: SearchControls
    shortcuts?: KeyboardShortcuts
    showThumbnails?: boolean | 'auto'
    showToolbar?: boolean
    source: PdfSourceProp
    textLayer?: boolean
    theme?: ThemeMode
    themeTokens?: ThemeTokens
    thumbnailWidth?: number
    virtualization?: boolean
    zoomStep?: number
  }>(),
  {
    annotationLayer: true,
    enableDownload: true,
    enableKeyboard: true,
    enablePrint: true,
    enableSearch: true,
    forms: false,
    layout: 'continuous',
    lazy: true,
    linkRel: 'noopener noreferrer',
    linkTarget: '_blank',
    maxZoom: 10,
    minZoom: 0.1,
    showThumbnails: 'auto',
    showToolbar: true,
    textLayer: true,
    thumbnailWidth: 120,
    virtualization: false,
    zoomStep: 0.25,
  },
)

const emit = defineEmits<{
  'annotation-click': [payload: AnnotationClickPayload]
  'form-change': [payload: FormChangePayload]
  'link-click': [payload: LinkClickPayload]
  'loading-progress': [progress: LoadingProgress]
  'page-change': [page: number]
  'password-incorrect': []
  'password-required': []
  'rotation-change': [rotation: Rotation]
  'search-result': [result: SearchResult]
  'zoom-change': [zoom: ZoomValue, scale: number]
  error: [error: PdfError]
  loaded: [meta: PdfDocumentMeta]
  rendered: [page: number]
}>()

const config = useVuePdfxConfig()
const containerSize = shallowRef<{ width: number; height: number } | null>(null)
const isDownloading = ref(false)
const isPrinting = ref(false)
const isSearchOpen = ref(false)
const liveMessage = ref('')
const mainEl = ref<HTMLElement | null>(null)
const page = defineModel<number>('page', { default: 1 })
const pageSize = shallowRef<{ width: number; height: number } | null>(null)
const rootEl = ref<HTMLElement | null>(null)
const rotation = defineModel<Rotation>('rotation', { default: 0 })
const searchBarRef = ref<{ focus: () => void } | null>(null)
const zoom = defineModel<ZoomValue>('zoom', { default: 'auto' })

/* -------------------------------- theme --------------------------------- */
const themeMode = computed<ThemeMode>(() => props.theme ?? config.theme ?? 'light')
const themeVars = computed<Record<string, string>>(() => {
  const vars: Record<string, string> = {}
  for (const [key, value] of Object.entries({ ...config.themeTokens, ...props.themeTokens })) {
    if (value == null) {
      continue
    }
    const cssVar = '--vue-pdfx-' + key.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())
    vars[cssVar] = String(value)
  }
  return vars
})

/* --------------------------------- i18n --------------------------------- */
const i18n = useI18n({
  locale: () => props.locale,
  messages: () => props.messages,
  pluginLocale: () => config.locale,
  pluginMessages: () => config.messages,
  ...(config.i18nAdapter ? { adapter: config.i18nAdapter } : {}),
})

/* ------------------------------- document ------------------------------- */
const {
  doc,
  download: downloadPdf,
  error,
  isLoading,
  isPasswordIncorrect,
  isPasswordRequired,
  meta,
  print: printPdf,
  progress,
  reload,
  submitPassword,
} = usePdfDocument({
  source: () => props.source,
  onError: (error) => emit('error', error),
  onLoaded: (meta) => emit('loaded', meta),
  onPasswordIncorrect: () => emit('password-incorrect'),
  onPasswordRequired: () => emit('password-required'),
  onProgress: (progress) => emit('loading-progress', progress),
})

const isDocumentReady = computed(() => !!doc.value && pageCount.value > 0)
const hasSource = computed(
  () => props.source != null && props.source !== '' && pageCount.value >= 0,
)
const pageCount = computed(() => meta.value?.pageCount ?? 0)

/* --------------------------------- zoom --------------------------------- */
const { canZoomIn, canZoomOut, fitMode, scale, setZoom, zoomIn, zoomOut } = useZoom({
  columnGap: () => PAGE_GAP,
  columns: () => (props.layout === 'facing' ? 2 : 1),
  containerSize: () => containerSize.value,
  maxZoom: () => props.maxZoom,
  minZoom: () => props.minZoom,
  pageSize: () => pageSize.value,
  zoom,
  zoomStep: () => props.zoomStep,
})

/* ------------------------------- rotation ------------------------------- */
const { rotation: rotationValue, rotate } = useRotation({ rotation })

/* -------------------------------- search -------------------------------- */
const search = useSearch({
  doc,
  onResult: (result) => emit('search-result', result),
})

/* ---------------------------- virtualization ---------------------------- */
const PAGE_GAP = 28 // --vue-pdfx-page-gap
const estimatedPageHeight = computed(() => (pageSize.value?.height ?? 800) * scale.value)
const isContinuous = computed(() => props.layout === 'continuous' || props.layout === 'facing')
const {
  bottomSpacer,
  currentPage,
  scrollToPage,
  topSpacer,
  update: updateVirtualPages,
  visiblePages,
} = useVirtualPages({
  columns: () => (props.layout === 'facing' ? 2 : 1),
  container: mainEl,
  enabled: () => props.virtualization && isContinuous.value,
  paddingStart: PAGE_GAP,
  pageCount,
  pageGap: PAGE_GAP,
  pageHeight: estimatedPageHeight,
  scrollMargin: PAGE_GAP,
})

/* ------------------------------- sidebar -------------------------------- */
const isOverflowOpen = ref(false)
const isSidebarOpen = ref(false)
const rootWidth = ref(0)
const shouldAnimateSidebar = ref(false)
let isSidebarInteractive = false

const isCompact = computed(() => rootWidth.value > 0 && rootWidth.value < 640)

const isSidebarVisible = computed(
  () =>
    props.showThumbnails !== false &&
    isSidebarOpen.value &&
    hasSource.value &&
    !!doc.value &&
    !error.value &&
    !isLoading.value &&
    !isPasswordRequired.value,
)

const isSidebarDrawer = computed(() => isCompact.value && isSidebarVisible.value)

const sidebarTransition = computed(() =>
  shouldAnimateSidebar.value
    ? isSidebarDrawer.value
      ? 'vue-pdfx-drawer'
      : 'vue-pdfx-sidebar'
    : 'vue-pdfx-none',
)

watch(
  isSidebarOpen,
  () => {
    if (isSidebarInteractive) {
      shouldAnimateSidebar.value = true
    }
  },
  { flush: 'sync' },
)

/* --------------------------- pages to render ---------------------------- */
const pagesToRender = computed<number[]>(() => {
  if (pageCount.value <= 0) {
    return []
  }
  if (props.layout === 'single') {
    return [clamp(page.value, 1, pageCount.value)]
  }
  if (props.virtualization && isContinuous.value) {
    return visiblePages.value
  }
  return Array.from({ length: pageCount.value }, (_, i) => i + 1)
})

/* ------------------------------- methods -------------------------------- */
async function download(): Promise<void> {
  if (isDownloading.value) {
    return
  }
  isDownloading.value = true
  try {
    await downloadPdf(meta.value?.title ?? '')
  } finally {
    isDownloading.value = false
  }
}

async function print(): Promise<void> {
  if (isPrinting.value) {
    return
  }
  isPrinting.value = true
  try {
    await printPdf(undefined, meta.value?.title ?? undefined)
  } finally {
    isPrinting.value = false
  }
}

function goToPage(n: number): void {
  const target = clamp(Math.round(n), 1, Math.max(1, pageCount.value))
  page.value = target
  if (isContinuous.value) {
    void nextTick(() => {
      scrollToPage(target)
    })
  }
}

function nextPage(): void {
  goToPage(page.value + 1)
}

function prevPage(): void {
  goToPage(page.value - 1)
}

function handleThumbnailNavigate(n: number): void {
  goToPage(n)
  if (isSidebarDrawer.value) {
    isSidebarOpen.value = false
  }
}

function rotateCcw(): void {
  rotate('ccw')
}

function rotateCw(): void {
  rotate('cw')
}

async function handleSearch(query: string, opts?: SearchOptions): Promise<SearchResult> {
  return search.search(query, opts)
}

function nextMatch(): void {
  search.nextMatch()
}

function prevMatch(): void {
  search.prevMatch()
}

function clearSearch(): void {
  search.clear()
}

function toggleSearch(): void {
  if (!props.enableSearch) {
    return
  }
  isSearchOpen.value = !isSearchOpen.value
  if (isSearchOpen.value) {
    isSidebarOpen.value = false
    isOverflowOpen.value = false
    void nextTick(() => {
      searchBarRef.value?.focus()
    })
  } else {
    search.clear()
  }
}

function closeSearch(): void {
  isSearchOpen.value = false
  search.clear()
}

function handleSearchEnter(el: Element): void {
  if (!isCompact.value) {
    return
  }
  const box = el as HTMLElement
  const target = box.scrollHeight
  box.style.height = '0px'
  void box.offsetHeight // force a reflow so the transition has a from-value
  box.style.height = `${target}px`
}

function handleSearchAfterEnter(el: Element): void {
  ;(el as HTMLElement).style.height = ''
}

function handleSearchLeave(el: Element): void {
  if (!isCompact.value) {
    return
  }
  const box = el as HTMLElement
  box.style.height = `${box.scrollHeight}px`
  void box.offsetHeight
  box.style.height = '0px'
}

function toggleThumbnails(): void {
  isSidebarOpen.value = !isSidebarOpen.value
  if (isSidebarOpen.value) {
    closeSearch()
    isOverflowOpen.value = false
  }
}

function handleOverflowToggle(isOpen: boolean): void {
  isOverflowOpen.value = isOpen
  if (isOpen) {
    closeSearch()
    isSidebarOpen.value = false
  }
}

function handlePageRenderFail(err: PdfError): void {
  if (error.value) {
    return
  }
  error.value = err
  emit('error', err)
}

/* ------------------------------- keyboard ------------------------------- */
useKeyboard({
  enabled: () => props.enableKeyboard,
  handlers: {
    closeOverlay: () => {
      if (isSearchOpen.value) {
        closeSearch()
      } else if (isSidebarOpen.value) {
        isSidebarOpen.value = false
      }
    },
    download: () => void download(),
    firstPage: () => goToPage(1),
    lastPage: () => goToPage(pageCount.value),
    nextMatch,
    nextPage,
    prevMatch,
    prevPage,
    print: () => void print(),
    rotateCcw,
    rotateCw,
    toggleSearch,
    toggleThumbnails,
    zoomIn,
    zoomOut,
    zoomReset: () => setZoom(1),
  },
  shortcuts: () => props.shortcuts ?? config.shortcuts,
  target: rootEl,
})

/* ----------------------------- zoom anchor ------------------------------ */
const zoomAnchor = ref<{ x: number; y: number } | null>(null)
const canZoomInteract = computed(
  () => !!doc.value && !error.value && !isLoading.value && !isPasswordRequired.value,
)

function setZoomAnchorFromClient(clientX: number, clientY: number): void {
  if (mainEl.value) {
    const rect = mainEl.value.getBoundingClientRect()
    zoomAnchor.value = { x: clientX - rect.left, y: clientY - rect.top }
  }
}

/* ------------------------------ wheel zoom ------------------------------ */
function handleWheel(e: WheelEvent): void {
  if (!(e.ctrlKey || e.metaKey) || !canZoomInteract.value) {
    return
  }
  e.preventDefault()
  setZoomAnchorFromClient(e.clientX, e.clientY)
  if (e.deltaY < 0) {
    zoomIn()
  } else {
    zoomOut()
  }
  flashZoomPill()
}

/* ------------------------- zoom indicator pill -------------------------- */
const isPillVisible = ref(false)
const isPinching = ref(false)
let pillTimer: ReturnType<typeof setTimeout> | undefined

function flashZoomPill(): void {
  isPillVisible.value = true
  if (pillTimer) {
    clearTimeout(pillTimer)
  }
  pillTimer = setTimeout(() => {
    isPillVisible.value = false
  }, 700)
}

/* ------------------------------ pinch zoom ------------------------------ */
let pinchStartDist = 0
let pinchStartScale = 1

function touchDist(t: TouchList): number {
  const dx = t[0].clientX - t[1].clientX
  const dy = t[0].clientY - t[1].clientY
  return Math.hypot(dx, dy)
}

function handleTouchStart(e: TouchEvent): void {
  if (e.touches.length === 2 && canZoomInteract.value) {
    pinchStartDist = touchDist(e.touches)
    pinchStartScale = scale.value
    isPinching.value = true
  }
}

function handleTouchMove(e: TouchEvent): void {
  if (e.touches.length === 2 && pinchStartDist > 0) {
    e.preventDefault()
    const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2
    const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2
    setZoomAnchorFromClient(midX, midY)
    const ratio = touchDist(e.touches) / pinchStartDist
    setZoom(clamp(pinchStartScale * ratio, props.minZoom, props.maxZoom))
  }
}

function handleTouchEnd(): void {
  pinchStartDist = 0
  isPinching.value = false
}

/* ------------------------------- measure -------------------------------- */
async function measurePage(): Promise<void> {
  if (!doc.value || pageCount.value < 1) {
    pageSize.value = null
    return
  }
  try {
    const first = await doc.value.getPage(clamp(page.value, 1, pageCount.value))
    const viewport = first.getViewport({ scale: 1, rotation: rotationValue.value })
    pageSize.value = { width: viewport.width, height: viewport.height }
  } catch {
    pageSize.value = null
  }
}

function measureContainer(): void {
  if (mainEl.value) {
    containerSize.value = {
      width: Math.max(0, mainEl.value.clientWidth - PAGE_GAP * 2),
      height: Math.max(0, mainEl.value.clientHeight - PAGE_GAP * 2),
    }
  }
}

function measureRoot(): void {
  if (rootEl.value) {
    rootWidth.value = rootEl.value.clientWidth
  }
}

const handleResize = throttle(() => {
  measureRoot()
  measureContainer()
  updateVirtualPages()
})

watch([doc, pageCount, rotationValue, () => page.value], measurePage, { immediate: true })

/* ------------------------------- watchers ------------------------------- */
let isDocSettling = false
let docSettleTimer: ReturnType<typeof setTimeout> | undefined

watch(doc, (newDoc, oldDoc) => {
  if (newDoc && newDoc !== oldDoc && mainEl.value) {
    isDocSettling = true
    mainEl.value.scrollTop = 0
    mainEl.value.scrollLeft = 0
    if (docSettleTimer) {
      clearTimeout(docSettleTimer)
    }
    docSettleTimer = setTimeout(() => {
      isDocSettling = false
    }, 200)
  }
})

watch(currentPage, (newCurrentPage) => {
  if (isContinuous.value && newCurrentPage !== page.value) {
    page.value = newCurrentPage
  }
})

watch(page, (newPage) => {
  emit('page-change', newPage)
  liveMessage.value = i18n.t('pageChanged', { page: newPage, total: pageCount.value })
  if (isContinuous.value && newPage !== currentPage.value) {
    void nextTick(() => {
      scrollToPage(newPage)
    })
  }
})

watch(rotationValue, (newRotationValue) => emit('rotation-change', newRotationValue))

watch(scale, (newScale, oldScale) => {
  emit('zoom-change', zoom.value, newScale)
  liveMessage.value = i18n.t('zoomChanged', { percent: Math.round(newScale * 100) })
  const el = mainEl.value
  if (!el || !isContinuous.value || !oldScale || isDocSettling) {
    if (isDocSettling && el) {
      el.scrollTop = 0
      el.scrollLeft = 0
    }
    zoomAnchor.value = null
    void nextTick(updateVirtualPages)
    return
  }
  const factor = newScale / oldScale
  const mainRect = el.getBoundingClientRect()
  const anchorX = zoomAnchor.value?.x ?? el.clientWidth / 2
  const anchorY = zoomAnchor.value?.y ?? el.clientHeight / 2
  zoomAnchor.value = null
  const anchorClientX = mainRect.left + anchorX
  const anchorClientY = mainRect.top + anchorY
  let anchorPage: HTMLElement | null = null
  let nearestDistance = Infinity
  for (const pageEl of el.querySelectorAll<HTMLElement>('.vue-pdfx-page')) {
    const rect = pageEl.getBoundingClientRect()
    const dx =
      anchorClientX < rect.left
        ? rect.left - anchorClientX
        : Math.max(0, anchorClientX - rect.right)
    const dy =
      anchorClientY < rect.top ? rect.top - anchorClientY : Math.max(0, anchorClientY - rect.bottom)
    if (dx === 0 && dy === 0) {
      anchorPage = pageEl
      break
    }
    const distance = Math.hypot(dx, dy)
    if (distance < nearestDistance) {
      nearestDistance = distance
      anchorPage = pageEl
    }
  }
  if (!anchorPage) {
    void nextTick(updateVirtualPages)
    return
  }
  const refRect = anchorPage.getBoundingClientRect()
  const relX = anchorClientX - refRect.left
  const relY = anchorClientY - refRect.top
  void nextTick(() => {
    if (!anchorPage.isConnected) {
      updateVirtualPages()
      return
    }
    const mainRectAfter = el.getBoundingClientRect()
    const refRectAfter = anchorPage.getBoundingClientRect()
    const pageLeft = refRectAfter.left - mainRectAfter.left + el.scrollLeft
    const pageTop = refRectAfter.top - mainRectAfter.top + el.scrollTop
    el.scrollTo({
      left: pageLeft + relX * factor - anchorX,
      top: pageTop + relY * factor - anchorY,
      behavior: 'instant',
    })
    updateVirtualPages()
  })
})

function scrollToSelectedMatch(): boolean {
  const main = mainEl.value
  if (!main) {
    return false
  }
  const selected = main.querySelector<HTMLElement>('.vue-pdfx-page .textLayer .highlight.selected')
  const fallback =
    search.currentPage.value > 0
      ? main.querySelector<HTMLElement>(`.vue-pdfx-page[data-page="${search.currentPage.value}"]`)
      : null
  const target = selected ?? fallback
  if (!target) {
    return false
  }
  const mainRect = main.getBoundingClientRect()
  const bar = rootEl.value?.querySelector<HTMLElement>('.vue-pdfx-searchbar')
  let inset = PAGE_GAP
  if (bar) {
    const barRect = bar.getBoundingClientRect()
    const targetRect = (selected ?? target).getBoundingClientRect()
    if (targetRect.left < barRect.right && targetRect.right > barRect.left) {
      inset = Math.max(inset, barRect.bottom - mainRect.top + PAGE_GAP)
    }
  }
  const top = main.scrollTop + (target.getBoundingClientRect().top - mainRect.top) - inset
  main.scrollTo({ top: Math.max(0, top), behavior: 'instant' })
  return !!selected
}

let searchScrollRaf = 0
function cancelSearchScroll(): void {
  if (searchScrollRaf) {
    cancelAnimationFrame(searchScrollRaf)
    searchScrollRaf = 0
  }
}

watch(
  () => search.current.value,
  (newMatch) => {
    cancelSearchScroll()
    if (newMatch <= 0 || !isClient) {
      return
    }
    if (!isContinuous.value && search.currentPage.value > 0) {
      page.value = search.currentPage.value
    }
    const startPage = search.currentPage.value
    let frames = 0
    let settle = 0
    const tick = (): void => {
      searchScrollRaf = 0
      if (!mainEl.value || search.currentPage.value !== startPage) {
        return
      }
      frames++
      if (scrollToSelectedMatch()) {
        settle++
      }
      if (settle < 2 && frames <= 45) {
        searchScrollRaf = requestAnimationFrame(tick)
      }
    }
    void nextTick(() => {
      searchScrollRaf = requestAnimationFrame(tick)
    })
  },
)

/* ------------------------------ lifecycle ------------------------------- */
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  measureRoot()
  measureContainer()
  if (isClient && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(handleResize)
    if (rootEl.value) {
      resizeObserver.observe(rootEl.value)
    }
    if (mainEl.value) {
      resizeObserver.observe(mainEl.value)
    }
  }
  isSidebarOpen.value =
    props.showThumbnails === true || (props.showThumbnails === 'auto' && !isCompact.value)
  isSidebarInteractive = true
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  handleResize.cancel()
  if (pillTimer) {
    clearTimeout(pillTimer)
  }
  if (docSettleTimer) {
    clearTimeout(docSettleTimer)
  }
  cancelSearchScroll()
})

/* -------------------------------- expose -------------------------------- */
defineExpose({
  clearSearch,
  download,
  goToPage,
  nextMatch,
  nextPage,
  prevMatch,
  prevPage,
  print,
  rotate,
  search: handleSearch,
  setZoom,
  zoomIn,
  zoomOut,
})
</script>

<template>
  <div
    ref="rootEl"
    class="vue-pdfx-viewer"
    :class="[
      `vue-pdfx-layout-${layout}`,
      {
        'vue-pdfx-viewer--compact': isCompact,
        'vue-pdfx-viewer--searching': isSearchOpen && enableSearch && isDocumentReady,
      },
    ]"
    :aria-busy="isLoading"
    :aria-label="i18n.t('documentLabel')"
    :data-theme="themeMode"
    :dir="i18n.dir.value"
    :style="themeVars"
    tabindex="0"
  >
    <div class="vue-pdfx-sr-only" aria-live="polite" role="status">
      {{ liveMessage }}
    </div>

    <slot
      v-if="showToolbar"
      name="toolbar"
      :page="page"
      :page-count="pageCount"
      :rotation="rotationValue"
      :scale="scale"
    >
      <PdfToolbar
        :can-zoom-in="canZoomIn"
        :can-zoom-out="canZoomOut"
        :compact="isCompact"
        :current-page="page"
        :downloading="isDownloading"
        :enable-download="enableDownload"
        :enable-print="enablePrint"
        :enable-search="enableSearch"
        :fit-mode="fitMode"
        :format-number="i18n.formatNumber"
        :layout="layout"
        :overflow-open="isOverflowOpen"
        :page-count="pageCount"
        :printing="isPrinting"
        :ready="isDocumentReady"
        :scale="scale"
        :search-active="isSearchOpen"
        :show-thumbnails-toggle="showThumbnails !== false"
        :t="i18n.t"
        :thumbnails-open="isSidebarVisible"
        @download="download()"
        @navigate="goToPage"
        @next="nextPage"
        @prev="prevPage"
        @print="print"
        @rotate-ccw="rotateCcw"
        @rotate-cw="rotateCw"
        @set-zoom="setZoom"
        @toggle-search="toggleSearch"
        @toggle-thumbnails="toggleThumbnails"
        @update:overflow-open="handleOverflowToggle"
        @zoom-in="zoomIn"
        @zoom-out="zoomOut"
      >
        <template v-for="name in ICON_SLOT_NAMES" #[name]>
          <slot :name="name" />
        </template>
        <template v-if="$slots['toolbar-start']" #toolbar-start>
          <slot name="toolbar-start" />
        </template>
        <template v-if="$slots['toolbar-center']" #toolbar-center>
          <slot name="toolbar-center" />
        </template>
        <template v-if="$slots['toolbar-end']" #toolbar-end>
          <slot name="toolbar-end" />
        </template>
      </PdfToolbar>
    </slot>

    <div class="vue-pdfx-body">
      <Transition :name="sidebarTransition">
        <aside
          v-if="isSidebarVisible && doc"
          class="vue-pdfx-sidebar"
          :class="{ 'vue-pdfx-sidebar--drawer': isSidebarDrawer }"
          :aria-label="i18n.t('thumbnailsTitle')"
        >
          <div class="vue-pdfx-sidebar__inner">
            <slot name="thumbnails" :go-to-page="goToPage" :page="page" :page-count="pageCount">
              <PdfThumbnails
                :current-page="page"
                :doc="doc"
                :page-count="pageCount"
                :t="i18n.t"
                :thumbnail-width="thumbnailWidth"
                @navigate="handleThumbnailNavigate"
              >
                <template v-if="$slots.thumbnail" #thumbnail="slotProps">
                  <slot name="thumbnail" v-bind="slotProps" />
                </template>
              </PdfThumbnails>
            </slot>
          </div>
        </aside>
      </Transition>

      <Transition name="vue-pdfx-backdrop-fade">
        <button
          v-if="isSidebarDrawer"
          type="button"
          class="vue-pdfx-backdrop"
          :aria-label="i18n.t('toggleThumbnails')"
          @click="isSidebarOpen = false"
        />
      </Transition>

      <div class="vue-pdfx-content">
        <Transition
          name="vue-pdfx-search"
          @enter="handleSearchEnter"
          @after-enter="handleSearchAfterEnter"
          @leave="handleSearchLeave"
        >
          <div v-if="isSearchOpen && enableSearch && isDocumentReady" class="vue-pdfx-search-slot">
            <slot
              name="search-bar"
              :close="closeSearch"
              :current="search.current.value"
              :next="nextMatch"
              :prev="prevMatch"
              :search="handleSearch"
              :total="search.total.value"
            >
              <PdfSearchBar
                ref="searchBarRef"
                :controls="searchControls"
                :current="search.current.value"
                :searching="search.isSearching.value"
                :t="i18n.t"
                :total="search.total.value"
                @close="closeSearch"
                @next="nextMatch"
                @prev="prevMatch"
                @search="handleSearch"
              />
            </slot>
          </div>
        </Transition>

        <div
          ref="mainEl"
          class="vue-pdfx-main"
          @touchend="handleTouchEnd"
          @touchmove="handleTouchMove"
          @touchstart="handleTouchStart"
          @wheel="handleWheel"
        >
          <div
            v-if="doc && pageSize"
            class="vue-pdfx-pages"
            :class="{ 'vue-pdfx-pages--facing': layout === 'facing' }"
            :style="
              virtualization && isContinuous
                ? {
                    paddingBlockStart: `calc(var(--vue-pdfx-page-gap) + ${topSpacer}px)`,
                    paddingBlockEnd: `calc(var(--vue-pdfx-page-gap) + ${bottomSpacer}px)`,
                  }
                : undefined
            "
          >
            <PdfPage
              v-for="p in pagesToRender"
              :key="p"
              :annotation-layer="annotationLayer"
              :doc="doc"
              :find-controller="search.findController"
              :forms="forms !== false"
              :image-resources-path="imageResourcesPath"
              :lazy="lazy && layout !== 'single'"
              :link-rel="linkRel"
              :link-target="linkTarget"
              :page-number="p"
              :readonly="forms === 'readonly'"
              :rotation="rotationValue"
              :scale="scale"
              :t="i18n.t"
              :text-layer="textLayer"
              @annotation-click="emit('annotation-click', $event)"
              @form-change="emit('form-change', $event)"
              @link-click="emit('link-click', $event)"
              @render-failed="handlePageRenderFail"
              @rendered="emit('rendered', $event)"
            >
              <template v-if="$slots['page-overlay']" #page-overlay="slotProps">
                <slot name="page-overlay" v-bind="slotProps" />
              </template>
            </PdfPage>
          </div>

          <Transition name="vue-pdfx-fade">
            <slot v-if="!hasSource && !isLoading" name="empty">
              <PdfEmptyOverlay :t="i18n.t" />
            </slot>
          </Transition>
        </div>

        <Transition name="vue-pdfx-fade">
          <div v-if="isPinching || isPillVisible" class="vue-pdfx-zoom-pill" aria-hidden="true">
            {{ Math.round(scale * 100) }}%
          </div>
        </Transition>
      </div>

      <Transition name="vue-pdfx-fade">
        <slot v-if="isLoading && !error && !isPasswordRequired" name="loading" :progress="progress">
          <PdfLoadingOverlay :progress="progress" :t="i18n.t" />
        </slot>
      </Transition>
    </div>

    <Transition name="vue-pdfx-fade">
      <slot
        v-if="isPasswordRequired"
        name="password"
        :error="isPasswordIncorrect"
        :submit="submitPassword"
      >
        <PdfPasswordOverlay
          v-model:error="isPasswordIncorrect"
          :t="i18n.t"
          @submit="submitPassword"
        />
      </slot>
    </Transition>

    <Transition name="vue-pdfx-fade">
      <slot v-if="error" name="error" :error="error" :retry="reload">
        <PdfErrorOverlay :error="error" :t="i18n.t" @retry="reload" />
      </slot>
    </Transition>
  </div>
</template>
