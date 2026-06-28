import { inject, type InjectionKey } from 'vue'

import type {
  I18nAdapter,
  KeyboardShortcuts,
  LocaleMessagesMap,
  ThemeMode,
  ThemeTokens,
} from './types'

export interface VuePdfxConfig {
  i18nAdapter?: I18nAdapter
  locale?: string
  messages?: LocaleMessagesMap
  shortcuts?: KeyboardShortcuts
  theme?: ThemeMode
  themeTokens?: ThemeTokens
}

export const VuePdfxConfigKey: InjectionKey<VuePdfxConfig> = Symbol('vue-pdfx:config')

export function useVuePdfxConfig(): VuePdfxConfig {
  return inject(VuePdfxConfigKey, {})
}
