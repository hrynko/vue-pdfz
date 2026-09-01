import {
  computed,
  onBeforeUnmount,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'

import { clamp, isClient, throttle } from '../utils'

export function useVirtualPages(options: {
  columns?: MaybeRefOrGetter<number>
  container: Ref<HTMLElement | null>
  enabled?: MaybeRefOrGetter<boolean>
  overscan?: MaybeRefOrGetter<number>
  paddingStart?: MaybeRefOrGetter<number>
  pageCount: MaybeRefOrGetter<number>
  pageGap?: MaybeRefOrGetter<number>
  pageHeight: MaybeRefOrGetter<number>
  scrollMargin?: MaybeRefOrGetter<number>
}) {
  const currentPage = ref(1)
  const scrollTop = ref(0)
  const viewportHeight = ref(0)
  const visibleRange = ref<[number, number]>([1, 1])

  const columns = computed(() => Math.max(1, Math.floor(toValue(options.columns) ?? 1)))
  const count = computed(() => Math.max(0, Math.floor(toValue(options.pageCount))))
  const enabled = computed(() => toValue(options.enabled) ?? true)
  const gap = computed(() => toValue(options.pageGap) ?? 16)
  const overscan = computed(() => toValue(options.overscan) ?? 2)
  const pad = computed(() => toValue(options.paddingStart) ?? 0)
  const rows = computed(() => (count.value > 0 ? Math.ceil(count.value / columns.value) : 0))
  const scrollMargin = computed(() => toValue(options.scrollMargin) ?? 0)
  const unit = computed(() => Math.max(1, toValue(options.pageHeight) + gap.value))

  const rowOf = (page: number): number => Math.floor((page - 1) / columns.value)

  const visiblePages = computed<number[]>(() => {
    const [start, end] = visibleRange.value
    if (end < start) {
      return []
    }
    const result: number[] = []
    for (let n = start; n <= end; n++) {
      result.push(n)
    }
    return result
  })

  const topSpacer = computed(() =>
    enabled.value ? Math.max(0, rowOf(visibleRange.value[0]) * unit.value) : 0,
  )

  const bottomSpacer = computed(() =>
    enabled.value ? Math.max(0, (rows.value - 1 - rowOf(visibleRange.value[1])) * unit.value) : 0,
  )

  function compute(): void {
    if (count.value <= 0) {
      visibleRange.value = [1, 0]
      return
    }
    const center = scrollTop.value + viewportHeight.value / 2 - pad.value
    const centerPage = clamp(
      clamp(Math.floor(center / unit.value), 0, rows.value - 1) * columns.value + 1,
      1,
      count.value,
    )
    if (!enabled.value) {
      visibleRange.value = [1, count.value]
      currentPage.value = centerPage
      return
    }
    const firstRow = Math.floor((scrollTop.value - pad.value) / unit.value)
    const lastRow = Math.floor((scrollTop.value + viewportHeight.value - pad.value) / unit.value)
    const startRow = clamp(firstRow - overscan.value, 0, rows.value - 1)
    const endRow = clamp(lastRow + overscan.value, 0, rows.value - 1)
    visibleRange.value = [
      clamp(startRow * columns.value + 1, 1, count.value),
      clamp(endRow * columns.value + columns.value, 1, count.value),
    ]
    currentPage.value = centerPage
  }

  const scrollToPage = (page: number): void => {
    const el = options.container.value
    if (!el) {
      return
    }
    const pageNum = clamp(Math.round(page), 1, Math.max(1, count.value))
    const pageEl = el.querySelector<HTMLElement>(`[data-page="${pageNum}"]`)
    let top: number
    if (pageEl) {
      top = el.scrollTop + (pageEl.getBoundingClientRect().top - el.getBoundingClientRect().top)
    } else {
      top = pad.value + rowOf(pageNum) * unit.value
    }
    el.scrollTop = Math.max(0, top - scrollMargin.value)
    scrollTop.value = el.scrollTop
    viewportHeight.value = el.clientHeight
    compute()
  }

  const handleScroll = throttle(() => {
    const el = options.container.value
    if (!el) {
      return
    }
    scrollTop.value = el.scrollTop
    viewportHeight.value = el.clientHeight
    compute()
  })

  const update = (): void => {
    const el = options.container.value
    if (el) {
      scrollTop.value = el.scrollTop
      viewportHeight.value = el.clientHeight
    }
    compute()
  }

  let bound: HTMLElement | null = null
  let resizeObserver: ResizeObserver | null = null

  watch(
    options.container,
    (el) => {
      bound?.removeEventListener('scroll', handleScroll)
      resizeObserver?.disconnect()
      resizeObserver = null
      bound = el
      if (!el) {
        return
      }
      el.addEventListener('scroll', handleScroll, { passive: true })
      viewportHeight.value = el.clientHeight
      scrollTop.value = el.scrollTop
      if (isClient && typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(update)
        resizeObserver.observe(el)
      }
      compute()
    },
    { immediate: true, flush: 'post' },
  )

  watch([columns, count, enabled, unit], compute)

  onBeforeUnmount(() => {
    handleScroll.cancel()
    bound?.removeEventListener('scroll', handleScroll)
    resizeObserver?.disconnect()
  })

  return {
    bottomSpacer,
    currentPage,
    topSpacer,
    visiblePages,
    visibleRange,
    scrollToPage,
    update,
  }
}
