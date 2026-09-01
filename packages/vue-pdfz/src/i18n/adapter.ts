import type { I18nAdapter, LocaleMessages, TextDirection } from '../types'

interface VueI18nLike {
  locale?: { value: string } | string
  t: (key: string, named?: Record<string, unknown>) => string
}

interface VueI18nAdapterOptions {
  /** Force a text direction; otherwise, the built-in resolver is used. */
  dir?: TextDirection
  /** Key prefix used when looking strings up in the host vue-i18n catalog. Defaults to `vuePdfz.`. */
  prefix?: string
}

/**
 * Build an {@link I18nAdapter} that delegates to a host `vue-i18n` instance.
 * The library never depends on `vue-i18n` directly - pass the instance in.
 *
 * Strings are looked up as `${prefix}${key}` (e.g. `vuePdfz.pageOf`). If the
 * host catalog is missing a key, vue-i18n typically returns the key unchanged;
 * the adapter detects that and falls back to the built-in bundle.
 *
 * @example
 * ```ts
 * import { useI18n } from 'vue-i18n'
 * const i18n = useI18n()
 * app.use(VuePdfz, { i18nAdapter: createVueI18nAdapter(i18n) })
 * ```
 */
export function createVueI18nAdapter(
  i18n: VueI18nLike,
  options: VueI18nAdapterOptions = {},
): I18nAdapter {
  return {
    t(key: keyof LocaleMessages, params?: Record<string, string | number>) {
      const fullKey = `${options.prefix ?? 'vuePdfz.'}${key}`
      const result = i18n.t(fullKey, params ?? {})
      if (result === fullKey || result === key) {
        return undefined
      }
      return result
    },
    get locale() {
      return typeof i18n.locale === 'string' ? i18n.locale : i18n.locale?.value
    },
    ...(options.dir ? { dir: options.dir } : {}),
  }
}
