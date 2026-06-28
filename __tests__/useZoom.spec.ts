import { describe, expect, it } from 'vitest'
import { ref } from 'vue'

import type { ZoomValue } from '../src/types'
import { isFitMode, useZoom } from '../src/composables/useZoom'

function setup(initial: ZoomValue) {
  const zoom = ref<ZoomValue>(initial)
  const api = useZoom({
    containerSize: () => ({ width: 900, height: 600 }),
    maxZoom: () => 8,
    minZoom: () => 0.25,
    pageSize: () => ({ width: 600, height: 800 }),
    zoom,
  })
  return { zoom, ...api }
}

describe('useZoom', () => {
  it('identifies fit modes', () => {
    expect(isFitMode('auto')).toBe(true)
    expect(isFitMode('page-fit')).toBe(true)
    expect(isFitMode('page-width')).toBe(true)
    expect(isFitMode(1.5)).toBe(false)
  })

  it('exposes fitMode only for fit values', () => {
    expect(setup('auto').fitMode.value).toBe('auto')
    expect(setup('page-fit').fitMode.value).toBe('page-fit')
    expect(setup('page-width').fitMode.value).toBe('page-width')
    expect(setup(2).fitMode.value).toBeNull()
  })

  it('resolves page-fit to the smaller ratio', () => {
    const { scale } = setup('page-fit')
    expect(scale.value).toBeCloseTo(Math.min(900 / 600, 600 / 800))
  })

  it('resolves page-width to container/page ratio', () => {
    const { scale } = setup('page-width')
    expect(scale.value).toBeCloseTo(900 / 600)
  })

  it('caps the auto fit at the max auto scale', () => {
    const { scale } = setup('auto')
    expect(scale.value).toBe(1.25)
  })

  it('clamps numeric zoom to the configured range', () => {
    const { scale, setZoom } = setup(1)
    setZoom(10)
    expect(scale.value).toBe(8)
    setZoom(0.1)
    expect(scale.value).toBe(0.25)
  })

  it('steps through presets on zoom in/out', () => {
    const { zoom, setZoom, zoomIn, zoomOut } = setup(1)
    zoomIn()
    expect(zoom.value).toBe(1.25)
    setZoom(1)
    zoomOut()
    expect(zoom.value).toBe(0.75)
  })

  it('reports whether zoom in/out is available at the range bounds', () => {
    expect(setup(1).canZoomIn.value).toBe(true)
    expect(setup(1).canZoomOut.value).toBe(true)
    expect(setup(8).canZoomIn.value).toBe(false)
    expect(setup(0.25).canZoomOut.value).toBe(false)
  })

  it('reset returns to 100%', () => {
    const { fitMode, zoom, reset } = setup('auto')
    reset()
    expect(zoom.value).toBe(1)
    expect(fitMode.value).toBeNull()
  })

  it('divides width-based fits across columns (facing layout)', () => {
    const zoom = ref<ZoomValue>('page-width')
    const { scale } = useZoom({
      zoom,
      pageSize: () => ({ width: 600, height: 800 }),
      containerSize: () => ({ width: 1228, height: 600 }),
      columns: () => 2,
      columnGap: () => 28,
      minZoom: () => 0.1,
      maxZoom: () => 10,
    })
    // ((1228 - 28) / 2 - 1) / 600 = 599/600 - two pages fit side by side, with
    // ~1px per-page slack so pixel rounding can't tip the row into wrapping
    expect(scale.value).toBeCloseTo(599 / 600)
  })
})
