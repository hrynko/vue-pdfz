import { computed, ref, watch, type ShallowRef } from 'vue'
import { usePdfSearch } from 'vue-pdf-embed'
import type { PDFDocumentProxy } from 'pdfjs-dist'

import type { SearchOptions, SearchResult } from '../types'

export type FindController = ReturnType<typeof usePdfSearch>['findController']

export function useSearch(options: {
  doc: ShallowRef<PDFDocumentProxy | null>
  onResult?: (result: SearchResult) => void
}) {
  const isSearching = ref(false)
  const query = ref('')

  const engine = usePdfSearch(options.doc)

  const current = computed(() => engine.currentMatch.value)
  const currentPage = computed(() => engine.currentMatchPage.value)
  const isActive = computed(() => query.value.trim().length > 0)
  const total = computed(() => engine.matchCount.value)

  const result = computed<SearchResult>(() => ({
    current: current.value,
    currentPage: currentPage.value,
    query: query.value,
    total: total.value,
  }))

  watch(result, (value) => {
    if (isActive.value) {
      options.onResult?.(value)
    }
  })

  function waitForMatches(delay = 400): Promise<void> {
    return new Promise<void>((resolve) => {
      let stop = () => {}
      const timer = setTimeout(() => {
        stop()
        resolve()
      }, delay)
      stop = watch([total, current], () => {
        clearTimeout(timer)
        stop()
        resolve()
      })
    })
  }

  const search = async (q: string, opts: SearchOptions = {}): Promise<SearchResult> => {
    query.value = q
    if (!q.trim()) {
      isSearching.value = false
      engine.clear()
      return result.value
    }
    isSearching.value = true
    engine.find(q, {
      caseSensitive: opts.caseSensitive ?? false,
      entireWord: opts.entireWord ?? false,
      highlightAll: opts.highlightAll ?? true,
      matchDiacritics: opts.matchDiacritics ?? false,
    })
    await waitForMatches()
    isSearching.value = false
    return result.value
  }

  const clear = (): void => {
    query.value = ''
    isSearching.value = false
    engine.clear()
  }

  const nextMatch = (): void => {
    if (isActive.value) {
      engine.next()
    }
  }

  const prevMatch = (): void => {
    if (isActive.value) {
      engine.previous()
    }
  }

  return {
    current,
    currentPage,
    findController: engine.findController,
    isActive,
    isSearching,
    query,
    result,
    total,
    clear,
    nextMatch,
    prevMatch,
    search,
  }
}
