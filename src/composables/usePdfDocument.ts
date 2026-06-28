import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { usePdfDocument as usePdfEmbed } from 'vue-pdf-embed'
import type { PDFDocumentProxy } from 'pdfjs-dist'

import type { LoadingProgress, PdfDocumentMeta, PdfError, PdfSourceProp } from '../types'
import { isClient, normalizePdfError, normalizeSource, parsePdfDate } from '../utils'

async function extractMeta(doc: PDFDocumentProxy, isEncrypted: boolean): Promise<PdfDocumentMeta> {
  let info: Record<string, unknown> = {}

  try {
    info = ((await doc.getMetadata())?.info ?? {}) as Record<string, unknown>
  } catch {
    // metadata is optional
  }

  const str = (v: unknown): string | null => (typeof v === 'string' && v.length > 0 ? v : null)

  return {
    author: str(info.Author),
    creationDate: parsePdfDate(info.CreationDate),
    creator: str(info.Creator),
    fingerprint: doc.fingerprints?.filter(Boolean)[0] ?? null,
    hasForms: Boolean(info.IsAcroFormPresent) || Boolean(info.IsXFAPresent),
    isEncrypted,
    keywords: str(info.Keywords),
    modificationDate: parsePdfDate(info.ModDate),
    pageCount: doc.numPages,
    pdfVersion: str(info.PDFFormatVersion),
    producer: str(info.Producer),
    subject: str(info.Subject),
    title: str(info.Title),
  }
}

export function usePdfDocument(options: {
  source: MaybeRefOrGetter<PdfSourceProp | null | undefined>
  onError?: (error: PdfError) => void
  onLoaded?: (meta: PdfDocumentMeta) => void
  onPasswordIncorrect?: () => void
  onPasswordRequired?: () => void
  onProgress?: (progress: LoadingProgress) => void
}) {
  const error = ref<PdfError | null>(null)
  const isLoading = ref(false)
  const isPasswordIncorrect = ref(false)
  const isPasswordRequired = ref(false)
  const meta = ref<PdfDocumentMeta | null>(null)
  const pendingPassword = ref<string | undefined>()
  const progress = ref<LoadingProgress>({ loaded: 0, total: 0, percent: 0 })
  const reloadTick = ref(0)
  const wasEncrypted = ref(false)
  let passwordCallback: ((password: unknown) => void) | null = null

  const sourceNormalized = computed(() => {
    void reloadTick.value
    if (!isClient) {
      return null
    }
    return normalizeSource(toValue(options.source), {
      ...(pendingPassword.value !== undefined ? { password: pendingPassword.value } : {}),
    })
  })

  const { doc, download, print } = usePdfEmbed({
    source: sourceNormalized,
    onError: (err: Error) => {
      const errorNormalized = normalizePdfError(err)
      isLoading.value = false
      if (errorNormalized.code === 'PASSWORD_REQUIRED') {
        return
      }
      error.value = errorNormalized
      options.onError?.(errorNormalized)
    },
    onPasswordRequest: (params: {
      callback: (password: unknown) => void
      isWrongPassword: boolean
    }) => {
      wasEncrypted.value = true
      passwordCallback = params.callback
      isPasswordRequired.value = true
      isLoading.value = false
      if (params.isWrongPassword) {
        isPasswordIncorrect.value = true
        options.onPasswordIncorrect?.()
      } else {
        options.onPasswordRequired?.()
      }
    },
    onProgress: (params: { loaded: number; total: number }) => {
      const total = params.total || 0
      const percent = total > 0 ? Math.min(100, Math.round((params.loaded / total) * 100)) : 0
      progress.value = { loaded: params.loaded, total, percent }
      options.onProgress?.(progress.value)
    },
  })

  watch(
    () => toValue(options.source),
    () => {
      wasEncrypted.value = false
      pendingPassword.value = undefined
    },
  )

  watch(
    sourceNormalized,
    (newSourceNormalized) => {
      meta.value = null
      error.value = null
      isPasswordRequired.value = false
      isPasswordIncorrect.value = false
      passwordCallback = null
      progress.value = { loaded: 0, total: 0, percent: 0 }
      isLoading.value = Boolean(newSourceNormalized)
    },
    { immediate: true },
  )

  watch(
    doc,
    async (newDoc) => {
      if (!newDoc) {
        return
      }
      isPasswordRequired.value = false
      isPasswordIncorrect.value = false
      try {
        meta.value = await extractMeta(newDoc, wasEncrypted.value)
        isLoading.value = false
        options.onLoaded?.(meta.value)
      } catch (err) {
        error.value = normalizePdfError(err)
        isLoading.value = false
        options.onError?.(error.value)
      }
    },
    { immediate: true },
  )

  const reload = (): void => {
    error.value = null
    reloadTick.value += 1
  }

  const submitPassword = (password: string): void => {
    isPasswordIncorrect.value = false
    if (passwordCallback) {
      passwordCallback(password)
      passwordCallback = null
      isLoading.value = true
    } else {
      pendingPassword.value = password
      reloadTick.value += 1
    }
  }

  return {
    doc,
    error,
    isLoading,
    isPasswordIncorrect,
    isPasswordRequired,
    meta,
    progress,
    download,
    print,
    reload,
    submitPassword,
  }
}
