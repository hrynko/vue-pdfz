import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { PDFDocumentProxy } from 'pdfjs-dist'

vi.mock('vue-pdf-embed', async () => await import('./mocks/vue-pdf-embed'))

import { makeFakeDoc } from './mocks/vue-pdf-embed'
import PdfPage from '../src/components/PdfPage.vue'

describe('PdfPage', () => {
  it('sizes its placeholder from the estimated size until its own size loads', () => {
    const doc = { getPage: () => new Promise(() => {}) } as unknown as PDFDocumentProxy
    const wrapper = mount(PdfPage, {
      props: {
        doc,
        pageNumber: 2,
        rotation: 0,
        scale: 1.5,
        estimatedSize: { width: 600, height: 800 },
        t: (key: string) => key,
      },
    })
    const placeholder = wrapper.find('.vue-pdfz-page__placeholder')
    expect(placeholder.attributes('style')).toContain('width: 900px')
    expect(placeholder.attributes('style')).toContain('height: 1200px')
    expect(wrapper.find('.vue-pdfz-page').attributes('style')).toContain('min-height: 1200px')
  })

  it('sizes a page with built-in rotation as it is drawn', async () => {
    const wrapper = mount(PdfPage, {
      props: {
        doc: makeFakeDoc(
          1,
          () => [600, 800],
          () => 90,
        ),
        pageNumber: 1,
        rotation: 90,
        scale: 1,
        t: (key: string) => key,
      },
    })
    await flushPromises()
    expect(wrapper.find('.vue-pdfz-page').attributes('style')).toContain('width: 600px')
  })
})
