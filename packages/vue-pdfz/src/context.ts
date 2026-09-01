import { inject, type InjectionKey } from 'vue'

import type {
  I18nAdapter,
  KeyboardShortcuts,
  LocaleMessagesMap,
  ThemeMode,
  ThemeTokens,
} from './types'

export interface VuePdfzConfig {
  i18nAdapter?: I18nAdapter
  locale?: string
  messages?: LocaleMessagesMap
  shortcuts?: KeyboardShortcuts
  theme?: ThemeMode
  themeTokens?: ThemeTokens
}

export const VuePdfzConfigKey: InjectionKey<VuePdfzConfig> = Symbol('vue-pdfz:config')

export function useVuePdfzConfig(): VuePdfzConfig {
  return inject(VuePdfzConfigKey, {})
}
