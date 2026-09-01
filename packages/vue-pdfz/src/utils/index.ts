import { PdfError, type PdfSource, type PdfSourceProp } from '../types'

export const isClient = typeof window !== 'undefined' && typeof document !== 'undefined'

export function capDpr(cap = 3): number {
  if (!isClient) {
    return 1
  }
  return clamp(window.devicePixelRatio || 1, 1, cap)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  wait: number,
): ((...args: A) => void) & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined
  const wrapped = (...args: A): void => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      timer = undefined
      fn(...args)
    }, wait)
  }
  wrapped.cancel = (): void => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = undefined
  }
  return wrapped
}

function isPdfSourceObject(v: unknown): v is PdfSource {
  return (
    typeof v === 'object' &&
    v !== null &&
    !(v instanceof ArrayBuffer) &&
    !(v instanceof Uint8Array) &&
    !(v instanceof URL)
  )
}

export function normalizePdfError(error: unknown): PdfError {
  if (error instanceof PdfError) {
    return error
  }

  const e = error as { name?: string; message?: string } | undefined
  const name = e?.name ?? ''
  const message = e?.message ?? 'Unknown error'

  switch (name) {
    case 'InvalidPDFException':
      return new PdfError('INVALID_PDF', message, error)
    case 'MissingPDFException':
      return new PdfError('MISSING_PDF', message, error)
    case 'PasswordException':
      return new PdfError('PASSWORD_REQUIRED', message, error)
    case 'UnexpectedResponseException':
      return new PdfError('NETWORK_ERROR', message, error)
    case 'UnknownErrorException':
      return new PdfError('UNKNOWN', message, error)
    default:
      if (/worker/i.test(message)) {
        return new PdfError('WORKER_ERROR', message, error)
      }
      if (/fetch|network|load failed/i.test(message)) {
        return new PdfError('NETWORK_ERROR', message, error)
      }
      return new PdfError('UNKNOWN', message, error)
  }
}

export function normalizeSource(
  source: PdfSourceProp | null | undefined,
  overrides?: { password?: string },
): Record<string, unknown> | null {
  if (source == null || source === '') {
    return null
  }
  if (typeof source === 'string') {
    return { url: source }
  }
  if (source instanceof URL) {
    return { url: source.toString() }
  }
  if (source instanceof ArrayBuffer) {
    return { data: new Uint8Array(source) }
  }
  if (source instanceof Uint8Array) {
    return { data: source }
  }
  if (isPdfSourceObject(source)) {
    const normalized: Record<string, unknown> = {}
    if (source.cMapPacked != null) {
      normalized.cMapPacked = source.cMapPacked
    }
    if (source.cMapUrl != null) {
      normalized.cMapUrl = source.cMapUrl
    }
    if (source.data != null) {
      normalized.data =
        source.data instanceof ArrayBuffer ? new Uint8Array(source.data) : source.data
    }
    if (source.httpHeaders != null) {
      normalized.httpHeaders = source.httpHeaders
    }
    if (source.standardFontDataUrl != null) {
      normalized.standardFontDataUrl = source.standardFontDataUrl
    }
    if (source.url != null) {
      normalized.url = source.url.toString()
    }
    if (source.withCredentials != null) {
      normalized.withCredentials = source.withCredentials
    }
    const password = overrides?.password ?? source.password
    if (password != null) {
      normalized.password = password
    }
    return normalized
  }
  return null
}

export function parsePdfDate(value: unknown): Date | null {
  if (typeof value !== 'string') {
    return null
  }
  const matches = value.match(/^D?:?(\d{4})(\d{2})?(\d{2})?(\d{2})?(\d{2})?(\d{2})?/)
  if (!matches) {
    return null
  }
  const [, year, month = '01', day = '01', hours = '00', minutes = '00', seconds = '00'] = matches
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes),
    Number(seconds),
  )
  return Number.isNaN(date.getTime()) ? null : date
}

export function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export function throttle<A extends unknown[]>(
  fn: (...args: A) => void,
): ((...args: A) => void) & { cancel: () => void } {
  let scheduled = false
  let lastArgs: A | null = null
  let handle = 0
  const raf =
    isClient && typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame
      : (cb: FrameRequestCallback): number => setTimeout(() => cb(0), 16) as unknown as number
  const caf =
    isClient && typeof cancelAnimationFrame === 'function'
      ? cancelAnimationFrame
      : (id: number): void => clearTimeout(id)
  const wrapped = (...args: A): void => {
    lastArgs = args
    if (scheduled) {
      return
    }
    scheduled = true
    handle = raf(() => {
      scheduled = false
      if (lastArgs) {
        fn(...lastArgs)
      }
    })
  }
  wrapped.cancel = (): void => {
    scheduled = false
    caf(handle)
  }
  return wrapped
}
