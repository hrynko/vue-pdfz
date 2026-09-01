import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import type { TranslateFn } from '../src/types'
import { interpolate } from '../src/i18n'
import { en } from '../src/i18n/locales'
import PdfToolbar from '../src/components/PdfToolbar.vue'

const t: TranslateFn = (key, params) => interpolate(en[key], params)

const baseProps = {
  currentPage: 2,
  fitMode: null,
  layout: 'continuous' as const,
  pageCount: 10,
  formatNumber: (n: number) => String(n),
  scale: 1,
  t,
}

describe('PdfToolbar', () => {
  it('emits navigation events', async () => {
    const wrapper = mount(PdfToolbar, { props: baseProps })
    await wrapper.find('button[aria-label="Previous page"]').trigger('click')
    await wrapper.find('button[aria-label="Next page"]').trigger('click')
    expect(wrapper.emitted('prev')).toHaveLength(1)
    expect(wrapper.emitted('next')).toHaveLength(1)
  })

  it('commits a typed page number', async () => {
    const wrapper = mount(PdfToolbar, { props: baseProps })
    const input = wrapper.find('input.vue-pdfz-page-input')
    await input.setValue('7')
    await input.trigger('keydown.enter')
    expect(wrapper.emitted('navigate')![0]).toEqual([7])
  })

  it('emits set-zoom from the zoom select (fit mode and percent)', async () => {
    const wrapper = mount(PdfToolbar, { props: baseProps })
    const select = wrapper.find('select.vue-pdfz-select')
    await select.setValue('page-width')
    await select.setValue('200')
    const events = wrapper.emitted('set-zoom')!
    expect(events[0]).toEqual(['page-width'])
    expect(events[1]).toEqual([2])
  })

  it('disables prev on the first page', () => {
    const wrapper = mount(PdfToolbar, { props: { ...baseProps, currentPage: 1 } })
    expect(
      (wrapper.find('button[aria-label="Previous page"]').element as HTMLButtonElement).disabled,
    ).toBe(true)
  })

  it('renders a custom icon slot', () => {
    const wrapper = mount(PdfToolbar, {
      props: baseProps,
      slots: { 'icon-print': '<span class="custom-print" />' },
    })
    expect(wrapper.find('.custom-print').exists()).toBe(true)
  })

  describe('compact mode', () => {
    it('hides the inline zoom select and shows an overflow button', () => {
      const wrapper = mount(PdfToolbar, { props: { ...baseProps, compact: true } })
      expect(wrapper.find('select.vue-pdfz-select').exists()).toBe(false)
      expect(wrapper.find('button[aria-haspopup="menu"]').exists()).toBe(true)
      expect(wrapper.find('.vue-pdfz-toolbar__compact-count').exists()).toBe(true)
      expect(wrapper.find('select.vue-pdfz-select').exists()).toBe(false)
    })

    it('requests toggling the overflow menu', async () => {
      const wrapper = mount(PdfToolbar, { props: { ...baseProps, compact: true } })
      expect(wrapper.find('.vue-pdfz-overflow').exists()).toBe(false)
      await wrapper.find('button[aria-haspopup="menu"]').trigger('click')
      expect(wrapper.emitted('update:overflowOpen')![0]).toEqual([true])
    })

    it('emits from an item and requests close when open', async () => {
      const wrapper = mount(PdfToolbar, {
        props: { ...baseProps, compact: true, overflowOpen: true },
      })
      expect(wrapper.find('.vue-pdfz-overflow').exists()).toBe(true)
      const download = wrapper
        .findAll('.vue-pdfz-overflow__item')
        .find((item) => item.text().includes('Download'))
      expect(download).toBeTruthy()
      await download!.trigger('click')
      expect(wrapper.emitted('download')).toHaveLength(1)
      expect(wrapper.emitted('update:overflowOpen')!.at(-1)).toEqual([false])
    })

    it('emits set-zoom page-width from the overflow fit item', async () => {
      const wrapper = mount(PdfToolbar, {
        props: { ...baseProps, compact: true, overflowOpen: true },
      })
      const fit = wrapper
        .findAll('.vue-pdfz-overflow__item')
        .find((item) => item.text().includes('Fit'))
      await fit!.trigger('click')
      expect(wrapper.emitted('set-zoom')![0]).toEqual(['page-width'])
    })
  })
})
