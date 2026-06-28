import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'

import { useKeyboard } from '../src/composables/useKeyboard'

async function setup(handlers: Record<string, () => void>, opts?: { enabled?: boolean }) {
  const wrapper = mount(
    defineComponent({
      setup() {
        const target = ref<HTMLElement | null>(null)
        useKeyboard({
          target,
          handlers,
          enabled: () => opts?.enabled ?? true,
        })
        return () => h('div', { ref: target, tabindex: 0 })
      },
    }),
    { attachTo: document.body },
  )
  await flushPromises()
  return wrapper
}

function press(el: Element, init: KeyboardEventInit): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init }))
}

describe('useKeyboard', () => {
  it('does not fire when disabled', async () => {
    const nextPage = vi.fn()
    const wrapper = await setup({ nextPage }, { enabled: false })
    press(wrapper.element, { key: 'ArrowRight' })
    expect(nextPage).not.toHaveBeenCalled()
  })

  it('fires the handler for a plain key binding', async () => {
    const nextPage = vi.fn()
    const wrapper = await setup({ nextPage })
    press(wrapper.element, { key: 'ArrowRight' })
    expect(nextPage).toHaveBeenCalledTimes(1)
  })

  it('matches platform mod combos', async () => {
    const toggleSearch = vi.fn()
    const wrapper = await setup({ toggleSearch })
    press(wrapper.element, { key: 'f', ctrlKey: true })
    expect(toggleSearch).toHaveBeenCalledTimes(1)
  })

  it('does not let a bare-key binding fire when Cmd/Ctrl is held', async () => {
    const rotateCw = vi.fn()
    const wrapper = await setup({ rotateCw })
    press(wrapper.element, { key: 'r', metaKey: true })
    press(wrapper.element, { key: 'r', ctrlKey: true })
    expect(rotateCw).not.toHaveBeenCalled()
    press(wrapper.element, { key: 'r' })
    expect(rotateCw).toHaveBeenCalledTimes(1)
  })

  it('ignores shortcuts while typing in inputs (except allowed ones)', async () => {
    const nextPage = vi.fn()
    const toggleSearch = vi.fn()
    const wrapper = mount(
      defineComponent({
        setup() {
          const target = ref<HTMLElement | null>(null)
          useKeyboard({ target, handlers: { nextPage, toggleSearch } })
          return () => h('div', { ref: target }, [h('input', { class: 'field' })])
        },
      }),
      { attachTo: document.body },
    )
    await flushPromises()
    const input = wrapper.find('input.field').element
    press(input, { key: 'ArrowRight' })
    expect(nextPage).not.toHaveBeenCalled()
    press(input, { key: 'f', ctrlKey: true })
    expect(toggleSearch).toHaveBeenCalledTimes(1)
  })

  it('lets match navigation fire from inside a focused input', async () => {
    const nextMatch = vi.fn()
    const wrapper = mount(
      defineComponent({
        setup() {
          const target = ref<HTMLElement | null>(null)
          useKeyboard({ target, handlers: { nextMatch } })
          return () => h('div', { ref: target }, [h('input', { class: 'field' })])
        },
      }),
      { attachTo: document.body },
    )
    await flushPromises()
    const input = wrapper.find('input.field').element
    press(input, { key: 'g', ctrlKey: true })
    expect(nextMatch).toHaveBeenCalledTimes(1)
  })
})
