import { computed, type Ref } from 'vue'

import type { Rotation, RotationDirection } from '../types'

/**
 * Normalize any degree value to {@link Rotation} (0 / 90 / 180 / 270).
 */
export function normalizeRotation(degree: number): Rotation {
  return ((((Math.round(degree / 90) % 4) + 4) % 4) * 90) as Rotation
}

export function useRotation(options: { rotation: Ref<Rotation> }) {
  const rotation = computed<Rotation>(() => normalizeRotation(options.rotation.value))

  const setRotation = (degree: number): void => {
    options.rotation.value = normalizeRotation(degree)
  }

  const rotate = (direction: RotationDirection): void => {
    const delta = direction === 'cw' ? 90 : -90
    options.rotation.value = normalizeRotation(rotation.value + delta)
  }

  return {
    rotation,
    rotate,
    setRotation,
  }
}
