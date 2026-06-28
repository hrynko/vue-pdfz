import { describe, expect, it } from 'vitest'
import { ref } from 'vue'

import type { Rotation } from '../src/types'
import { normalizeRotation, useRotation } from '../src/composables/useRotation'

describe('useRotation', () => {
  it('normalizes arbitrary degrees', () => {
    expect(normalizeRotation(0)).toBe(0)
    expect(normalizeRotation(90)).toBe(90)
    expect(normalizeRotation(360)).toBe(0)
    expect(normalizeRotation(-90)).toBe(270)
    expect(normalizeRotation(450)).toBe(90)
  })

  it('rotates clockwise and counter-clockwise', () => {
    const rotation = ref<Rotation>(0)
    const { rotate, rotation: rotationValue } = useRotation({ rotation })
    rotate('cw')
    expect(rotationValue.value).toBe(90)
    rotate('cw')
    expect(rotationValue.value).toBe(180)
    rotate('ccw')
    expect(rotationValue.value).toBe(90)
    rotation.value = 270
    rotate('cw')
    expect(rotationValue.value).toBe(0)
  })

  it('sets rotation with normalization', () => {
    const rotation = ref<Rotation>(0)
    const { setRotation, rotation: rotationValue } = useRotation({ rotation })
    setRotation(-90)
    expect(rotationValue.value).toBe(270)
  })
})
