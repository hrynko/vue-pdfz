import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import type { TranslateFn } from '../src/types'
import { interpolate } from '../src/i18n'
import { en } from '../src/i18n/locales'
import PdfSearchBar from '../src/components/PdfSearchBar.vue'

const t: TranslateFn = (key, params) => interpolate(en[key], params)

describe('PdfSearchBar', () => {
  it('emits a debounced search with options as the query changes', async () => {
    vi.useFakeTimers()
    const wrapper = mount(PdfSearchBar, {
      props: { t, total: 0, current: 0, debounceDelay: 200 },
    })
    await wrapper.find('input[type=text]').setValue('foo')
    expect(wrapper.emitted('search')).toBeUndefined()
    vi.advanceTimersByTime(250)
    const events = wrapper.emitted('search')
    expect(events).toBeTruthy()
    expect(events![0][0]).toBe('foo')
    expect(events![0][1]).toMatchObject({ caseSensitive: false, highlightAll: true })
    vi.useRealTimers()
  })

  it('emits next/prev with keyboard', async () => {
    const wrapper = mount(PdfSearchBar, { props: { t, total: 3, current: 1 } })
    const input = wrapper.find('input[type=text]')
    await input.trigger('keydown.enter')
    await input.trigger('keydown.enter', { shiftKey: true })
    expect(wrapper.emitted('next')).toHaveLength(1)
    expect(wrapper.emitted('prev')).toHaveLength(1)
  })

  it('shows the localized match count', async () => {
    const wrapper = mount(PdfSearchBar, { props: { t, total: 7, current: 3 } })
    expect(wrapper.text()).toContain('3 of 7')
  })

  it('emits close', async () => {
    const wrapper = mount(PdfSearchBar, { props: { t, total: 0, current: 0 } })
    await wrapper.find('button[aria-label="Close search"]').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('toggles match-case and re-emits search with the option set', async () => {
    vi.useFakeTimers()
    const wrapper = mount(PdfSearchBar, {
      props: { t, total: 0, current: 0, debounceDelay: 50, controls: { caseSensitive: true } },
    })
    await wrapper.find('input[type=text]').setValue('x')
    await wrapper.find('button[aria-label="Match case"]').trigger('click')
    vi.advanceTimersByTime(80)
    const events = wrapper.emitted('search')!
    expect(events[events.length - 1][1]).toMatchObject({ caseSensitive: true })
    vi.useRealTimers()
  })
})
