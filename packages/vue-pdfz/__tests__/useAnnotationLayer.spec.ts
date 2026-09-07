import { describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'

import { useAnnotationLayer } from '../src/composables/useAnnotationLayer'

async function setup(readonly: boolean) {
  const wrapper = mount(
    defineComponent({
      props: { readonly: { type: Boolean, default: false } },
      setup(props) {
        const container = ref<HTMLElement | null>(null)
        useAnnotationLayer({
          container,
          enabled: () => true,
          page: () => 1,
          readonly: () => props.readonly,
          tick: () => 0,
        })
        return () =>
          h('div', { ref: container }, [
            h('div', { class: 'annotationLayer' }, [
              h('input', { class: 'a' }),
              h('input', { class: 'b', disabled: true }),
            ]),
          ])
      },
    }),
    { props: { readonly } },
  )
  await flushPromises()
  return wrapper
}

describe('useAnnotationLayer', () => {
  it('disables form fields in readonly mode', async () => {
    const wrapper = await setup(true)
    expect(wrapper.find<HTMLInputElement>('.a').element.disabled).toBe(true)
    expect(wrapper.find<HTMLInputElement>('.b').element.disabled).toBe(true)
  })

  it('re-enables only manually disabled fields when readonly clears', async () => {
    const wrapper = await setup(true)
    await wrapper.setProps({ readonly: false })
    await flushPromises()
    expect(wrapper.find<HTMLInputElement>('.a').element.disabled).toBe(false)
    expect(wrapper.find<HTMLInputElement>('.b').element.disabled).toBe(true)
  })

  it('re-applies readonly when it is turned back on', async () => {
    const wrapper = await setup(true)
    await wrapper.setProps({ readonly: false })
    await flushPromises()
    await wrapper.setProps({ readonly: true })
    await flushPromises()
    expect(wrapper.find<HTMLInputElement>('.a').element.disabled).toBe(true)
    expect(wrapper.find<HTMLInputElement>('.b').element.disabled).toBe(true)
  })
})
