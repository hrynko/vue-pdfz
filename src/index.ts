import './theme/default.css'

export {
  PdfError,
  type AnnotationClickPayload,
  type FormChangePayload,
  type I18nAdapter,
  type KeyboardShortcuts,
  type LayoutMode,
  type LinkClickPayload,
  type LinkTarget,
  type LoadingProgress,
  type LocaleMessages,
  type PdfDocumentMeta,
  type PdfErrorCode,
  type PdfSource,
  type PdfSourceProp,
  type Rotation,
  type SearchControls,
  type SearchOptions,
  type SearchResult,
  type ThemeMode,
  type ThemeTokens,
  type VuePdfxPluginOptions,
  type ZoomValue,
} from './types'

export { createVueI18nAdapter } from './i18n/adapter'
export { ar, de, en, es, fr, he, ja, ko, zh } from './i18n/locales'

export { VuePdfx, default } from './plugin'
export { PdfViewer } from './components/PdfViewer.lazy'
