import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

vi.mock('vue-pdf-embed', async () => await import('./mocks/vue-pdf-embed'))

import type { PdfError, SearchResult } from '../src/types'
import { makeFakeDoc } from './mocks/vue-pdf-embed'
import PdfPage from '../src/components/PdfPage.vue'
import PdfViewer from '../src/components/PdfViewer.vue'

async function mountViewer(props: Record<string, unknown> = {}) {
  const wrapper = mount(PdfViewer, {
    props: { source: '/test.pdf', ...props },
    attachTo: document.body,
  })
  await flushPromises()
  return wrapper
}

describe('PdfViewer', () => {
  beforeEach(() => {
    globalThis.__VPE_MOCK_DOC__ = makeFakeDoc()
  })

  afterEach(() => {
    globalThis.__VPE_MOCK_DOC__ = undefined
    globalThis.__VPE_MOCK_RENDER_FAIL__ = undefined
  })

  it('loads the document and emits metadata', async () => {
    const wrapper = await mountViewer()
    const loaded = wrapper.emitted('loaded')
    expect(loaded).toBeTruthy()
    expect((loaded![0][0] as { pageCount: number }).pageCount).toBe(3)
    expect(wrapper.find('.vue-pdfz-toolbar').exists()).toBe(true)
  })

  it('surfaces a page render failure as a RENDER_ERROR', async () => {
    globalThis.__VPE_MOCK_RENDER_FAIL__ = new Error('canvas allocation failed')
    const wrapper = await mountViewer({ layout: 'single' })
    const errors = wrapper.emitted('error')
    expect(errors).toBeTruthy()
    const error = errors![0][0] as PdfError
    expect(error.code).toBe('RENDER_ERROR')
    expect(error.cause).toBeInstanceOf(Error)
  })

  it('navigates via exposed methods and emits page-change', async () => {
    const wrapper = await mountViewer({ layout: 'single' })
    const vm = wrapper.vm as unknown as { nextPage: () => void }
    vm.nextPage()
    await flushPromises()
    const changes = wrapper.emitted('page-change')
    expect(changes).toBeTruthy()
    expect(changes![changes!.length - 1][0]).toBe(2)
    expect(wrapper.emitted('update:page')).toBeTruthy()
  })

  it('clamps navigation to the page range', async () => {
    const wrapper = await mountViewer({ layout: 'single' })
    const vm = wrapper.vm as unknown as { goToPage: (n: number) => void }
    vm.goToPage(999)
    await flushPromises()
    const changes = wrapper.emitted('page-change')!
    expect(changes[changes.length - 1][0]).toBe(3)
  })

  it('navigates to the target page when an internal link is clicked', async () => {
    const wrapper = await mountViewer()
    const payload = { kind: 'internal', page: 3 }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    wrapper.findComponent(PdfPage).vm.$emit('link-click', payload)
    await flushPromises()
    const updates = wrapper.emitted('update:page')!
    expect(updates[updates.length - 1]).toEqual([payload.page])
    const links = wrapper.emitted('link-click')!
    expect(links[links.length - 1]).toEqual([payload])
  })

  it('opens a virtualized document at the initial page', async () => {
    globalThis.__VPE_MOCK_DOC__ = makeFakeDoc(40)
    const wrapper = await mountViewer({ page: 30, virtualization: true })
    const main = wrapper.find('.vue-pdfz-main').element as HTMLElement
    expect(main.scrollTop).toBeGreaterThan(0)
    expect(wrapper.find('.vue-pdfz-page[data-page="30"]').exists()).toBe(true)
    expect(wrapper.find('.vue-pdfz-page[data-page="1"]').exists()).toBe(false)
    const updates = wrapper.emitted('update:page') ?? []
    expect(updates.every(([n]) => n === 30)).toBe(true)
  })

  it('keeps the current page when the layout changes', async () => {
    globalThis.__VPE_MOCK_DOC__ = makeFakeDoc(40)
    const wrapper = await mountViewer({ page: 12, virtualization: true })
    await wrapper.setProps({ layout: 'facing' })
    await flushPromises()
    expect(wrapper.find('.vue-pdfz-page[data-page="12"]').exists()).toBe(true)
    const updates = wrapper.emitted('update:page') ?? []
    expect(updates.every(([n]) => n === 12)).toBe(true)
  })

  it('clamps an out-of-range initial page once the page count is known', async () => {
    const wrapper = await mountViewer({ page: 99 })
    const updates = wrapper.emitted('update:page')!
    expect(updates[updates.length - 1]).toEqual([3])
  })

  it('keeps measuring the first page while navigating a continuous layout', async () => {
    globalThis.__VPE_MOCK_DOC__ = makeFakeDoc(3, (n) => (n === 2 ? [800, 600] : [600, 800]))
    const wrapper = await mountViewer()
    ;(wrapper.vm as unknown as { goToPage: (n: number) => void }).goToPage(2)
    await flushPromises()
    expect(wrapper.findComponent(PdfPage).props('estimatedSize')).toEqual({
      width: 600,
      height: 800,
    })
  })

  it('measures the current page in the single layout', async () => {
    globalThis.__VPE_MOCK_DOC__ = makeFakeDoc(3, (n) => (n === 2 ? [800, 600] : [600, 800]))
    const wrapper = await mountViewer({ layout: 'single' })
    ;(wrapper.vm as unknown as { goToPage: (n: number) => void }).goToPage(2)
    await flushPromises()
    expect(wrapper.findComponent(PdfPage).props('estimatedSize')).toEqual({
      width: 800,
      height: 600,
    })
  })

  it('re-emits external link clicks without navigating', async () => {
    const wrapper = await mountViewer()
    const payload = { kind: 'external', url: 'https://example.com' }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    wrapper.findComponent(PdfPage).vm.$emit('link-click', payload)
    await flushPromises()
    expect(wrapper.emitted('update:page')).toBeFalsy()
    const links = wrapper.emitted('link-click')!
    expect(links[links.length - 1]).toEqual([payload])
  })

  it('falls back through i18n (German locale renders localized labels)', async () => {
    const wrapper = await mountViewer({ locale: 'de' })
    expect(wrapper.find('button[aria-label="Nächste Seite"]').exists()).toBe(true)
  })

  it('considers a component-level message override', async () => {
    const wrapper = await mountViewer({ messages: { nextPage: 'foo' } })
    expect(wrapper.find('button[aria-label="foo"]').exists()).toBe(true)
  })

  it('runs a search through the exposed method', async () => {
    const wrapper = await mountViewer()
    const vm = wrapper.vm as unknown as {
      search: (q: string) => Promise<SearchResult>
    }
    const result = await vm.search('vue')
    expect(result.total).toBe(2)
    expect(result.current).toBe(1)
  })

  it('does not render the toolbar when showToolbar is false', async () => {
    const wrapper = await mountViewer({ showToolbar: false })
    expect(wrapper.find('.vue-pdfz-toolbar').exists()).toBe(false)
  })

  it('applies theme tokens as CSS variables alongside the theme mode', async () => {
    const wrapper = await mountViewer({
      theme: 'dark',
      themeTokens: { colorPrimary: 'red', ease: 'linear' },
    })
    const viewer = wrapper.find('.vue-pdfz-viewer')
    const style = viewer.attributes('style') ?? ''
    expect(viewer.attributes('data-theme')).toBe('dark')
    expect(style).toContain('--vue-pdfz-color-primary: red')
    expect(style).toContain('--vue-pdfz-ease: linear')
  })
})
