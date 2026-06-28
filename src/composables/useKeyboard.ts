import { onBeforeUnmount, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'

import type { KeyboardShortcuts, ShortcutAction } from '../types'
import { isClient } from '../utils'

export const DEFAULT_SHORTCUTS: Record<ShortcutAction, string[]> = {
  closeOverlay: ['Escape'],
  download: ['mod+s'],
  firstPage: ['Home'],
  lastPage: ['End'],
  nextMatch: ['F3', 'mod+g'],
  nextPage: ['ArrowRight', 'PageDown'],
  prevMatch: ['shift+F3', 'shift+mod+g'],
  prevPage: ['ArrowLeft', 'PageUp'],
  print: ['mod+p'],
  rotateCcw: ['shift+r'],
  rotateCw: ['r'],
  toggleSearch: ['mod+f'],
  toggleThumbnails: ['F4'],
  zoomIn: ['mod+=', 'mod++', '+', '='],
  zoomOut: ['mod+-', '-'],
  zoomReset: ['mod+0', '0'],
}

const ALWAYS_ALLOWED: ShortcutAction[] = ['closeOverlay', 'nextMatch', 'prevMatch', 'toggleSearch']
const MODIFIERS = ['shift', 'alt', 'ctrl', 'meta', 'mod']

const isMac = isClient && /mac|iphone|ipad|ipod/i.test(navigator.platform ?? navigator.userAgent)

function getEventCombos(e: KeyboardEvent): string[] {
  const mods: string[] = [
    ...(e.shiftKey ? ['shift'] : []),
    ...(e.altKey ? ['alt'] : []),
    ...(e.ctrlKey ? ['ctrl'] : []),
    ...(e.metaKey ? ['meta'] : []),
  ]
  const platformMod = isMac ? 'meta' : 'ctrl'
  const actual = [...mods, e.key].join('+').toLowerCase()
  const aliased = [...mods.map((mod) => (mod === platformMod ? 'mod' : mod)), e.key]
    .join('+')
    .toLowerCase()
  return actual === aliased ? [actual] : [actual, aliased]
}

function normalizeBinding(binding: string): string {
  const parts = binding
    .toLowerCase()
    .split(/\+(?=.)/)
    .map((part) => part.trim())
    .filter(Boolean)
  const modifiers = MODIFIERS.filter((modifier) => parts.includes(modifier))
  const keys = parts.filter((part) => !MODIFIERS.includes(part))
  return [...modifiers, ...keys].join('+')
}

function matchesBinding(eventCombos: string[], binding: string): boolean {
  const target = normalizeBinding(binding)
  return eventCombos.some((combo) => normalizeBinding(combo) === target)
}

function isEditableTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.tagName === 'INPUT' ||
      target.tagName === 'SELECT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable)
  )
}

export function useKeyboard(options: {
  enabled?: MaybeRefOrGetter<boolean>
  handlers: Partial<Record<ShortcutAction, () => void>>
  shortcuts?: MaybeRefOrGetter<KeyboardShortcuts | undefined>
  target: Ref<HTMLElement | null>
}): void {
  if (!isClient) {
    return
  }

  const resolveBindings = (action: ShortcutAction): string[] => {
    const overrides = toValue(options.shortcuts) ?? {}
    const override = overrides[action]
    if (override === undefined) {
      return DEFAULT_SHORTCUTS[action]
    }
    return Array.isArray(override) ? override : [override]
  }

  const handleKeydown = (e: KeyboardEvent): void => {
    if (options.enabled !== undefined && !toValue(options.enabled)) {
      return
    }

    const isEditable = isEditableTarget(e.target)
    const combos = getEventCombos(e)

    for (const action of Object.keys(options.handlers) as ShortcutAction[]) {
      if (
        options.handlers[action] &&
        (!isEditable || ALWAYS_ALLOWED.includes(action)) &&
        resolveBindings(action).some((binding) => matchesBinding(combos, binding))
      ) {
        e.preventDefault()
        e.stopPropagation()
        options.handlers[action]()
        return
      }
    }
  }

  let bound: HTMLElement | null = null

  const stop = watch(
    options.target,
    (el) => {
      bound?.removeEventListener('keydown', handleKeydown)
      bound = el
      bound?.addEventListener('keydown', handleKeydown)
    },
    { immediate: true, flush: 'post' },
  )

  onBeforeUnmount(() => {
    stop()
    bound?.removeEventListener('keydown', handleKeydown)
    bound = null
  })
}
