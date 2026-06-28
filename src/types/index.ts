/* ------------------------------------------------------------------ *
 * Document source
 * ------------------------------------------------------------------ */

/**
 * A fully-described document source. Mirrors the supported subset of pdf.js
 * `DocumentInitParameters`, plus the binary inputs.
 */
export interface PdfSource {
  /** Whether the cMaps are packed (`.bcmap`). Defaults to `true`. */
  cMapPacked?: boolean
  /** URL to PDF.js character maps (needed for some non-Latin fonts). */
  cMapUrl?: string
  /** Raw bytes of the document. */
  data?: ArrayBuffer | Uint8Array
  /** Extra request headers for the fetch (e.g. authorization). */
  httpHeaders?: Record<string, string>
  /** Password for an encrypted document. */
  password?: string
  /** URL to the standard font data directory. */
  standardFontDataUrl?: string
  /** URL string, binary buffer, or base64 data URI of the document. */
  url?: string | URL
  /** Send cookies/credentials with the range/fetch requests. */
  withCredentials?: boolean
}

/** Anything `<PdfViewer source>` accepts. */
export type PdfSourceProp = ArrayBuffer | PdfSource | URL | Uint8Array | string

/* ------------------------------------------------------------------ *
 * Document metadata
 * ------------------------------------------------------------------ */

export interface PdfDocumentMeta {
  author: string | null
  creationDate: Date | null
  creator: string | null
  fingerprint: string | null
  hasForms: boolean
  isEncrypted: boolean
  keywords: string | null
  modificationDate: Date | null
  pageCount: number
  pdfVersion: string | null
  producer: string | null
  subject: string | null
  title: string | null
}

export interface LoadingProgress {
  loaded: number
  total: number
  percent: number
}

/* ------------------------------------------------------------------ *
 * Errors
 * ------------------------------------------------------------------ */

export type PdfErrorCode =
  | 'INVALID_PDF'
  | 'MISSING_PDF'
  | 'NETWORK_ERROR'
  | 'PASSWORD_REQUIRED'
  | 'RENDER_ERROR'
  | 'UNKNOWN'
  | 'WORKER_ERROR'

export class PdfError extends Error {
  readonly code: PdfErrorCode
  /** The originating error, if any. */
  readonly cause?: unknown

  constructor(code: PdfErrorCode, message: string, cause?: unknown) {
    super(message)
    this.name = 'PdfError'
    this.code = code
    this.cause = cause
  }
}

/* ------------------------------------------------------------------ *
 * Zoom / rotation / layout
 * ------------------------------------------------------------------ */

export type FitMode = 'auto' | 'page-fit' | 'page-width'
export type LayoutMode = 'continuous' | 'facing' | 'single'
export type Rotation = 0 | 90 | 180 | 270
export type RotationDirection = 'ccw' | 'cw'
export type TextDirection = 'ltr' | 'rtl'
export type ZoomValue = number | FitMode

/* ------------------------------------------------------------------ *
 * Search
 * ------------------------------------------------------------------ */

export interface SearchOptions {
  /** Match uppercase/lowercase exactly. Defaults to `false`. */
  caseSensitive?: boolean
  /** Match whole words only. Defaults to `false`. */
  entireWord?: boolean
  /** Highlight all matches (not just the active one). Defaults to `true`. */
  highlightAll?: boolean
  /** Match accented characters exactly (`café` ≠ `cafe`). Defaults to `false`. */
  matchDiacritics?: boolean
}

export interface SearchControls {
  /** Show the case-sensitive (`Aa`) toggle. Hidden by default. */
  caseSensitive?: boolean
  /** Show the whole-word (`ab`) toggle. Hidden by default. */
  entireWord?: boolean
}

export interface SearchResult {
  /** 1-based index of the active match, or 0 when there are none. */
  current: number
  /** 1-based page of the active match, or 0 when there are none. */
  currentPage: number
  /** The query that produced this result. */
  query: string
  /** Total number of matches across the whole document. */
  total: number
}

/* ------------------------------------------------------------------ *
 * Annotations / forms
 * ------------------------------------------------------------------ */

export interface AnnotationClickPayload {
  id: string
  page: number
  subtype: string
}

export interface FormChangePayload {
  field: string
  fieldType: string
  page: number
  value: boolean | string | string[]
}

export type LinkTarget = '_blank' | '_parent' | '_self' | '_top'

export interface LinkClickPayload {
  kind: 'external' | 'internal'
  page?: number
  url?: string
}

/* ------------------------------------------------------------------ *
 * Theming
 * ------------------------------------------------------------------ */

export type ThemeMode = 'auto' | 'dark' | 'light'

/**
 * Design tokens. Every value maps to a `--vue-pdfx-*` CSS custom property.
 */
export interface ThemeTokens {
  colorBackdrop?: string
  colorBg?: string
  colorBorder?: string
  colorBorderStrong?: string
  colorDanger?: string
  colorFocusRing?: string
  colorHighlight?: string
  colorHighlightActive?: string
  colorHover?: string
  colorPage?: string
  colorPrimary?: string
  colorPrimaryContrast?: string
  colorPrimaryHover?: string
  colorSidebarBg?: string
  colorSurface?: string
  colorSurfaceActive?: string
  colorText?: string
  colorTextMuted?: string
  colorTextSecondary?: string
  colorToolbarBg?: string
  colorToolbarText?: string
  controlSize?: string
  duration?: string
  durationSlow?: string
  ease?: string
  fontFamily?: string
  fontSize?: string
  iconSize?: string
  pageGap?: string
  radius?: string
  shadow?: string
  shadowElevated?: string
  shadowPage?: string
  shadowPopover?: string
  sidebarWidth?: string
  spacing?: string
  toolbarHeight?: string
  transition?: string
}

/* ------------------------------------------------------------------ *
 * Keyboard
 * ------------------------------------------------------------------ */

export type ShortcutAction =
  | 'closeOverlay'
  | 'download'
  | 'firstPage'
  | 'lastPage'
  | 'nextMatch'
  | 'nextPage'
  | 'prevMatch'
  | 'prevPage'
  | 'print'
  | 'rotateCcw'
  | 'rotateCw'
  | 'toggleSearch'
  | 'toggleThumbnails'
  | 'zoomIn'
  | 'zoomOut'
  | 'zoomReset'

/** Map an action to one or more key combos, e.g. `{ nextPage: ['ArrowRight', 'PageDown'] }`. */
export type KeyboardShortcuts = Partial<Record<ShortcutAction, string | string[]>>

/* ------------------------------------------------------------------ *
 * i18n
 * ------------------------------------------------------------------ */

/**
 * Every user-facing string the viewer can render. Built-in locale bundles
 * implement this interface in full; consumers may override any subset via the
 * `messages` prop or the plugin options. Values may contain `{placeholder}`
 * tokens that are interpolated at render time.
 */
export interface LocaleMessages {
  // Toolbar - navigation
  previousPage: string
  nextPage: string
  goToPage: string

  // Toolbar - zoom
  zoomIn: string
  zoomOut: string
  zoomLevel: string
  fitAuto: string
  fitPage: string
  fitWidth: string
  /** Interpolated: `{percent}`. */
  zoomPercent: string

  // Toolbar - actions
  rotateClockwise: string
  toggleThumbnails: string
  print: string
  download: string
  search: string
  closeSearch: string
  /** Accessible name for the overflow (more actions) menu button. */
  more: string

  // Thumbnails
  thumbnailsTitle: string
  /** Interpolated: `{page}`. */
  thumbnailLabel: string

  // Search
  searchPlaceholder: string
  searchPrevious: string
  searchNext: string
  caseSensitive: string
  entireWord: string
  /** Interpolated: `{current}`, `{total}`. */
  matchesCount: string
  noMatches: string

  // Loading / empty
  loading: string
  empty: string

  // Errors
  errorTitle: string
  errorGeneric: string
  errorInvalidPdf: string
  errorMissingPdf: string
  errorNetwork: string
  errorWorker: string
  errorRender: string
  retry: string

  // Password
  passwordTitle: string
  passwordPrompt: string
  passwordPlaceholder: string
  passwordSubmit: string
  passwordIncorrect: string

  // Accessibility / live regions
  documentLabel: string
  toolbarLabel: string
  /** Interpolated: `{page}`, `{total}`. */
  pageChanged: string
  /** Interpolated: `{percent}`. */
  zoomChanged: string
}

/** Locale code -> (partial) message bundle. */
export type LocaleMessagesMap = Record<string, Partial<LocaleMessages>>

export type TranslateFn<R = string> = (
  key: keyof LocaleMessages,
  params?: Record<string, string | number>,
) => R

/**
 * Optional adapter for delegating translation to a host i18n library
 * (e.g. `vue-i18n`). When provided, it takes precedence over built-in
 * resolution for keys it can resolve.
 */
export interface I18nAdapter {
  dir?: TextDirection
  locale?: string
  t: TranslateFn<string | undefined>
}

/* ------------------------------------------------------------------ *
 * Plugin options
 * ------------------------------------------------------------------ */

export interface VuePdfxPluginOptions {
  /** Optional host i18n adapter (e.g. a vue-i18n bridge). */
  i18nAdapter?: I18nAdapter
  /** Default locale code for all viewers. Defaults to `'en'`. */
  locale?: string
  /** Global message overrides, keyed by locale. */
  messages?: LocaleMessagesMap
  /** Register the component globally as `<PdfViewer>`. Defaults to `true`. */
  registerComponents?: boolean
  /** Default keyboard shortcut overrides. */
  shortcuts?: KeyboardShortcuts
  /** Default theme mode for all viewers. */
  theme?: ThemeMode
  /** Global design-token overrides for all viewers. */
  themeTokens?: ThemeTokens
}
