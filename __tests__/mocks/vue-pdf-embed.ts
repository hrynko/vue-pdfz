import { defineComponent, h, onMounted, ref, shallowRef } from 'vue'
import type { PDFDocumentProxy } from 'pdfjs-dist'

declare global {
  var __VPE_MOCK_DOC__: PDFDocumentProxy | undefined
  var __VPE_MOCK_RENDER_FAIL__: Error | undefined
}

export function makeFakeDoc(numPages = 3): PDFDocumentProxy {
  return {
    numPages,
    fingerprints: ['fake-fingerprint'],
    getPage: async (n: number) => ({
      getViewport: ({ scale = 1 }: { scale?: number; rotation?: number } = {}) => ({
        width: 600 * scale,
        height: 800 * scale,
      }),
      getTextContent: async () => ({
        items: [{ str: `Page ${n} content with the word vue and pdf.` }],
      }),
      render: () => ({ promise: Promise.resolve() }),
    }),
    getMetadata: async () => ({
      info: { Title: 'Mock Document', PDFFormatVersion: '1.7' },
      metadata: null,
    }),
    getData: async () => new Uint8Array([37, 80, 68, 70]),
  } as unknown as PDFDocumentProxy
}

const VuePdfEmbed = defineComponent({
  name: 'VuePdfEmbedMock',
  props: {
    annotationLayer: { type: Boolean, default: false },
    findController: { type: null, default: null },
    forms: { type: Boolean, default: false },
    imageResourcesPath: { type: String, default: undefined },
    page: { type: [Number, Array], default: 1 },
    rotation: { type: Number, default: 0 },
    source: { type: null, default: null },
    textLayer: { type: Boolean, default: false },
    width: { type: Number, default: undefined },
  },
  emits: ['internal-link-clicked', 'rendered', 'rendering-failed'],
  setup(props, { emit }) {
    onMounted(() => {
      const failure = globalThis.__VPE_MOCK_RENDER_FAIL__
      emit(failure ? 'rendering-failed' : 'rendered', failure)
    })
    return () => h('div', { class: 'vpe-mock-page', 'data-page': props.page })
  },
})

export default VuePdfEmbed

export function usePdfDocument(opts: { source: unknown }): {
  doc: ReturnType<typeof shallowRef<PDFDocumentProxy | null>>
  download: () => Promise<void>
  print: () => Promise<void>
} {
  const injected = globalThis.__VPE_MOCK_DOC__
  const doc = shallowRef<PDFDocumentProxy | null>(injected ?? null)
  void opts
  return {
    doc,
    download: async () => {},
    print: async () => {},
  }
}

export function usePdfSearch(): {
  clear: () => void
  currentMatch: ReturnType<typeof ref<number>>
  currentMatchPage: ReturnType<typeof ref<number>>
  find: (q: string) => void
  findController: Record<string, unknown>
  matchCount: ReturnType<typeof ref<number>>
  next: () => void
  previous: () => void
} {
  const currentMatch = ref(0)
  const currentMatchPage = ref(0)
  const matchCount = ref(0)
  return {
    clear: () => {
      currentMatch.value = 0
      matchCount.value = 0
      currentMatchPage.value = 0
    },
    currentMatch,
    currentMatchPage,
    find: (q: string) => {
      matchCount.value = q ? 2 : 0
      currentMatch.value = q ? 1 : 0
      currentMatchPage.value = q ? 1 : 0
    },
    findController: {},
    matchCount,
    next: () => {
      if (matchCount.value > 0) {
        currentMatch.value = (currentMatch.value % matchCount.value) + 1
      }
    },
    previous: () => {
      if (matchCount.value > 0) {
        currentMatch.value = currentMatch.value <= 1 ? matchCount.value : currentMatch.value - 1
      }
    },
  }
}
