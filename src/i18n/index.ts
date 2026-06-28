import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import type {
  I18nAdapter,
  LocaleMessages,
  LocaleMessagesMap,
  TextDirection,
  TranslateFn,
} from '../types'
import { en, locales } from './locales'

const RTL_LANGUAGES = new Set(['ar', 'dv', 'fa', 'he', 'ku', 'ps', 'sd', 'ug', 'ur', 'yi'])

/**
 * Resolve the text direction for a locale code.
 */
export function getLocaleDir(locale: string): TextDirection {
  const base = locale.toLowerCase().split('-')[0] ?? locale
  return RTL_LANGUAGES.has(base) ? 'rtl' : 'ltr'
}

/**
 * Replace `{token}` placeholders in a template string.
 */
export function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) {
    return template
  }
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = params[key]
    return value === undefined ? match : String(value)
  })
}

export function useI18n(options: {
  adapter?: I18nAdapter
  locale: MaybeRefOrGetter<string | undefined>
  messages?: MaybeRefOrGetter<Partial<LocaleMessages> | undefined>
  pluginLocale?: MaybeRefOrGetter<string | undefined>
  pluginMessages?: MaybeRefOrGetter<LocaleMessagesMap | undefined>
}) {
  const locale = computed<string>(
    () =>
      toValue(options.locale) ?? toValue(options.pluginLocale) ?? options.adapter?.locale ?? 'en',
  )

  const dir = computed<TextDirection>(() => options.adapter?.dir ?? getLocaleDir(locale.value))

  const messages = computed<LocaleMessages>(() => ({
    ...en,
    ...(locales[locale.value] ?? locales[locale.value.split('-')[0]]),
    ...toValue(options.pluginMessages)?.[locale.value],
    ...toValue(options.messages),
  }))

  const formatNumber = (value: number, opts?: Intl.NumberFormatOptions): string => {
    try {
      return new Intl.NumberFormat(locale.value, opts).format(value)
    } catch {
      return String(value)
    }
  }

  const t: TranslateFn = (key, params) => {
    if (options.adapter) {
      try {
        const fromAdapter = options.adapter.t(key, params)
        if (typeof fromAdapter === 'string') {
          return fromAdapter
        }
      } catch {
        // fall through to built-in resolution
      }
    }
    let template = messages.value[key]
    if (typeof template !== 'string') {
      template = en[key]
    }
    return interpolate(template, params)
  }

  return {
    dir,
    locale,
    messages,
    formatNumber,
    t,
  }
}
