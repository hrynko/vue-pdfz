import { computed, toValue, type MaybeRefOrGetter, type Ref } from 'vue'

import type { FitMode, ZoomValue } from '../types'
import { clamp, round } from '../utils'

const FIT_MODES: ReadonlySet<string> = new Set(['auto', 'page-fit', 'page-width'])
const MAX_AUTO_SCALE = 1.25
const SCALE_TOLERANCE = 1e-4
const ZOOM_PRESETS = [0.25, 0.5, 0.67, 0.75, 1, 1.25, 1.5, 2, 3, 4, 6, 8]

export function isFitMode(zoom: ZoomValue): zoom is FitMode {
  return typeof zoom === 'string' && FIT_MODES.has(zoom)
}

export interface PageSize {
  width: number
  height: number
}

export function useZoom(options: {
  columnGap?: MaybeRefOrGetter<number>
  columns?: MaybeRefOrGetter<number>
  containerSize: MaybeRefOrGetter<PageSize | null>
  maxZoom?: MaybeRefOrGetter<number>
  minZoom?: MaybeRefOrGetter<number>
  pageSize: MaybeRefOrGetter<PageSize | null>
  zoom: Ref<ZoomValue>
  zoomStep?: MaybeRefOrGetter<number>
}) {
  const min = computed(() => toValue(options.minZoom) ?? 0.1)
  const max = computed(() => toValue(options.maxZoom) ?? 10)
  const step = computed(() => toValue(options.zoomStep) ?? 0.25)

  function resolveFit(mode: FitMode): number {
    const container = toValue(options.containerSize)
    const page = toValue(options.pageSize)
    if (!container || !page || page.width <= 0 || page.height <= 0) {
      return 1
    }
    const columns = Math.max(1, toValue(options.columns) ?? 1)
    const gap = toValue(options.columnGap) ?? 0
    const columnWidth = (container.width - gap * (columns - 1)) / columns
    const fitWidth = Math.max(1, columns > 1 ? columnWidth - 1 : columnWidth) / page.width
    const fitHeight = container.height / page.height
    switch (mode) {
      case 'auto': {
        const isPortrait = page.width <= page.height
        return Math.min(MAX_AUTO_SCALE, isPortrait ? fitWidth : fitHeight)
      }
      case 'page-fit':
        return Math.min(fitWidth, fitHeight)
      case 'page-width':
        return fitWidth
    }
  }

  const fitMode = computed<FitMode | null>(() =>
    isFitMode(options.zoom.value) ? options.zoom.value : null,
  )

  const scale = computed<number>(() => {
    const zoom = isFitMode(options.zoom.value) ? resolveFit(options.zoom.value) : options.zoom.value
    return round(clamp(zoom, min.value, max.value), 3)
  })

  const canZoomIn = computed(() => scale.value < max.value - SCALE_TOLERANCE)
  const canZoomOut = computed(() => scale.value > min.value + SCALE_TOLERANCE)

  function nextPreset(current: number, dir: 1 | -1): number {
    const presets = ZOOM_PRESETS.filter((preset) => preset >= min.value && preset <= max.value)
    const ordered = dir === 1 ? presets : presets.reverse()
    return (
      (dir === 1
        ? ordered.find((preset) => preset > current + SCALE_TOLERANCE)
        : ordered.find((preset) => preset < current - SCALE_TOLERANCE)) ??
      round(clamp(current + dir * step.value, min.value, max.value), 3)
    )
  }

  const setZoom = (zoom: ZoomValue): void => {
    if (isFitMode(zoom)) {
      options.zoom.value = zoom
    } else {
      options.zoom.value = round(clamp(zoom, min.value, max.value), 3)
    }
  }

  const zoomIn = (): void => setZoom(nextPreset(scale.value, 1))
  const zoomOut = (): void => setZoom(nextPreset(scale.value, -1))
  const reset = (): void => setZoom(1)

  return {
    canZoomIn,
    canZoomOut,
    fitMode,
    scale,
    reset,
    setZoom,
    zoomIn,
    zoomOut,
  }
}
