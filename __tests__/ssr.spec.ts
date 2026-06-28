// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'

vi.mock('vue-pdf-embed', async () => await import('./mocks/vue-pdf-embed'))

import { makeFakeDoc } from './mocks/vue-pdf-embed'
import PdfViewer from '../src/components/PdfViewer.vue'

describe('SSR safety', () => {
  afterEach(() => {
    globalThis.__VPE_MOCK_DOC__ = undefined
  })

  it('renders a loaded document to a string without touching browser-only APIs', async () => {
    globalThis.__VPE_MOCK_DOC__ = makeFakeDoc()
    const html = await renderToString(createSSRApp(PdfViewer, { source: '/test.pdf' }))
    expect(html).toContain('vue-pdfx-viewer')
    expect(html).toContain('vue-pdfx-toolbar')
    expect(html).not.toContain('vue-pdfx-overlay')
  })

  it('renders the empty state for an absent source', async () => {
    const html = await renderToString(createSSRApp(PdfViewer, { source: '' }))
    expect(html).toContain('vue-pdfx-viewer')
    expect(html).toContain('vue-pdfx-overlay__title')
  })
})
