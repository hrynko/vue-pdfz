import { defineAsyncComponent, type Component } from 'vue'

import type PdfViewerComponent from './PdfViewer.vue'
import { isClient } from '../utils'

const PdfViewerServerStub: Component = { render: () => null }

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const PdfViewer = defineAsyncComponent(() =>
  isClient
    ? // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      import('./PdfViewer.vue').then((m) => m.default)
    : Promise.resolve(PdfViewerServerStub),
) as unknown as typeof PdfViewerComponent
