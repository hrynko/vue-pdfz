import { describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'

import { useVirtualPages } from '../src/composables/useVirtualPages'

function setup(
  opts: {
    clientHeight?: number
    columns?: number
    enabled?: boolean
    overscan?: number
    pageCount?: number
    pageGap?: number
    pageHeight?: number
    scrollMargin?: number
  } = {},
) {
  const {
    clientHeight = 600,
    columns = 1,
    enabled = true,
    overscan = 2,
    pageCount = 100,
    pageGap = 16,
    pageHeight = 800,
    scrollMargin = 0,
  } = opts
  let api!: ReturnType<typeof useVirtualPages>
  const el = document.createElement('div')
  el.scrollTop = 0
  Object.defineProperty(el, 'clientHeight', { value: clientHeight, configurable: true })
  mount(
    defineComponent({
      setup() {
        const container = ref<HTMLElement | null>(el)
        api = useVirtualPages({
          container,
          columns: () => columns,
          enabled: () => enabled,
          overscan: () => overscan,
          pageCount: () => pageCount,
          pageGap: () => pageGap,
          pageHeight: () => pageHeight,
          scrollMargin: () => scrollMargin,
        })
        return () => h('div')
      },
    }),
  )
  return { api, el }
}

describe('useVirtualPages', () => {
  it('mounts every page when disabled', () => {
    const { api } = setup({ enabled: false })
    expect(api.visiblePages.value).toHaveLength(100)
    expect(api.topSpacer.value).toBe(0)
    expect(api.bottomSpacer.value).toBe(0)
  })

  it('renders nothing for an empty document', () => {
    const { api } = setup({ pageCount: 0 })
    expect(api.visiblePages.value).toHaveLength(0)
    expect(api.topSpacer.value).toBe(0)
    expect(api.bottomSpacer.value).toBe(0)
  })

  it('reports a small window near the top when enabled', () => {
    const { api } = setup()
    expect(api.visibleRange.value).toEqual([1, 3]) // 1 page + 2 overscan
    expect(api.visiblePages.value.length).toBeLessThan(100)
    expect(api.currentPage.value).toBe(1)
  })

  it('scrollToPage centres the page and shifts the window', () => {
    const { api, el } = setup()
    api.scrollToPage(50)
    expect(el.scrollTop).toBe(49 * 816)
    expect(api.currentPage.value).toBe(50)
    expect(api.visiblePages.value).toContain(50)
    expect(api.topSpacer.value).toBeGreaterThan(0)
  })

  it('recomputes the window after the container scrolls', () => {
    const { api, el } = setup()
    expect(api.visiblePages.value).toContain(1)
    el.scrollTop = 49 * 816
    api.update()
    expect(api.currentPage.value).toBe(50)
    expect(api.visiblePages.value).toContain(50)
  })

  it('windows by row for a facing (multi-column) layout', () => {
    expect(setup({ columns: 2, enabled: false }).api.visiblePages.value).toHaveLength(100)
    expect(setup({ columns: 2 }).api.visibleRange.value).toEqual([1, 6])
  })

  it('considers scrollMargin', () => {
    const { api, el } = setup({ scrollMargin: 40 })
    api.scrollToPage(50)
    expect(el.scrollTop).toBe(49 * 816 - 40)
  })

  it('clamps out-of-range pages', () => {
    const { api, el } = setup()
    api.scrollToPage(999)
    expect(el.scrollTop).toBe(99 * 816)
    expect(api.currentPage.value).toBe(100)
  })
})
