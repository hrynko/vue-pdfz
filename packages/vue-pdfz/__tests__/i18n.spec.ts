import { describe, expect, it } from 'vitest'
import { ref } from 'vue'

import { getLocaleDir, interpolate, useI18n } from '../src/i18n'
import { en, locales } from '../src/i18n/locales'

describe('i18n core', () => {
  it('ships every built-in locale with the full key set (no drift)', () => {
    const enKeys = Object.keys(en).sort()
    expect(Object.keys(locales)).toEqual(
      expect.arrayContaining(['ar', 'de', 'en', 'es', 'fr', 'he', 'ja', 'ko', 'zh']),
    )
    for (const [code, bundle] of Object.entries(locales)) {
      expect(Object.keys(bundle).sort(), `locale "${code}" key set`).toEqual(enKeys)
    }
  })

  it('interpolates placeholders', () => {
    expect(interpolate('Page {current} of {total}', { current: 2, total: 9 })).toBe('Page 2 of 9')
    expect(interpolate('no params')).toBe('no params')
    expect(interpolate('keep {missing}', {})).toBe('keep {missing}')
  })

  it('detects RTL languages', () => {
    expect(getLocaleDir('en')).toBe('ltr')
    expect(getLocaleDir('ar')).toBe('rtl')
    expect(getLocaleDir('he-IL')).toBe('rtl')
  })

  describe('useI18n', () => {
    it('translates and reacts to locale changes', () => {
      const locale = ref('en')
      const { t, dir } = useI18n({ locale })
      expect(t('nextPage')).toBe('Next page')
      locale.value = 'fr'
      expect(t('nextPage')).toBe('Page suivante')
      expect(dir.value).toBe('ltr')
    })

    it('interpolates through t()', () => {
      const { t } = useI18n({ locale: ref('en') })
      expect(t('pageChanged', { page: 1, total: 3 })).toBe('Page 1 of 3')
    })

    it('falls back to English for unknown locales', () => {
      const { t } = useI18n({ locale: ref('xx') })
      expect(t('nextPage')).toBe('Next page')
    })

    it('applies plugin then component overrides in order', () => {
      const { t } = useI18n({
        locale: ref('en'),
        pluginMessages: ref({ en: { nextPage: 'PLUGIN' } }),
        messages: ref({ nextPage: 'COMPONENT' }),
      })
      expect(t('nextPage')).toBe('COMPONENT')
    })

    it('delegates to an adapter when it resolves a key', () => {
      const { t } = useI18n({
        locale: ref('en'),
        adapter: {
          t: (key) => (key === 'nextPage' ? 'ADAPTED' : undefined),
        },
      })
      expect(t('nextPage')).toBe('ADAPTED')
      expect(t('previousPage')).toBe('Previous page')
    })
  })
})
