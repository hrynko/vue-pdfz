import { nextTick, toValue, watch, type MaybeRefOrGetter } from 'vue'

import type {
  AnnotationClickPayload,
  FormChangePayload,
  LinkClickPayload,
  LinkTarget,
} from '../types'

const ENHANCED_ATTR = 'data-vue-pdfx-enhanced'

function isExternalHref(href: string | null): boolean {
  if (!href || href.startsWith('#')) {
    return false
  }
  return /^(https?:|mailto:|tel:|ftp:)/i.test(href) || /^\/\//.test(href)
}

function getFieldType(el: Element): string {
  const tag = el.tagName.toLowerCase()
  if (tag === 'select') {
    return 'Ch'
  }
  if (tag === 'textarea') {
    return 'Tx'
  }
  if (tag === 'input') {
    const type = (el as HTMLInputElement).type
    if (type === 'checkbox' || type === 'radio') {
      return 'Btn'
    }
    return 'Tx'
  }
  return 'Tx'
}

function getFieldValue(el: Element): boolean | string | string[] {
  const tag = el.tagName.toLowerCase()
  if (tag === 'input') {
    const input = el as HTMLInputElement
    return input.type === 'checkbox' || input.type === 'radio' ? input.checked : input.value
  }
  if (tag === 'select') {
    const select = el as HTMLSelectElement
    return select.multiple
      ? Array.from(select.selectedOptions).map((option) => option.value)
      : select.value
  }
  return (el as HTMLTextAreaElement).value
}

function getSubtype(el: Element): string {
  const className = Array.from(el.classList).find((name) => /Annotation$/.test(name))
  if (!className) {
    return 'Unknown'
  }
  const subtype = className.replace(/Annotation$/, '')
  return subtype.charAt(0).toUpperCase() + subtype.slice(1)
}

export function useAnnotationLayer(options: {
  container: MaybeRefOrGetter<HTMLElement | null>
  enabled?: MaybeRefOrGetter<boolean>
  linkRel?: MaybeRefOrGetter<string | undefined>
  linkTarget?: MaybeRefOrGetter<LinkTarget | undefined>
  page: MaybeRefOrGetter<number>
  readonly?: MaybeRefOrGetter<boolean>
  tick: MaybeRefOrGetter<number>
  onAnnotationClick?: (payload: AnnotationClickPayload) => void
  onFormChange?: (payload: FormChangePayload) => void
  onLinkClick?: (payload: LinkClickPayload) => void
}): void {
  watch(
    () => [
      toValue(options.container),
      toValue(options.enabled),
      toValue(options.readonly),
      toValue(options.tick),
    ],
    async () => {
      await nextTick()
      if (options.enabled !== undefined && !toValue(options.enabled)) {
        return
      }
      const root = toValue(options.container)?.querySelector<HTMLElement>('.annotationLayer')
      if (!root) {
        return
      }

      root.querySelectorAll<HTMLElement>('section').forEach((section) => {
        if (section.getAttribute(ENHANCED_ATTR) === 'section') {
          return
        }
        section.setAttribute(ENHANCED_ATTR, 'section')
        section.addEventListener('click', () => {
          options.onAnnotationClick?.({
            id: section.dataset.annotationId ?? '',
            page: toValue(options.page),
            subtype: getSubtype(section),
          })
        })
      })

      const linkRel = toValue(options.linkRel)
      const linkTarget = toValue(options.linkTarget)
      root.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
        if (link.getAttribute(ENHANCED_ATTR) === 'link') {
          return
        }
        link.setAttribute(ENHANCED_ATTR, 'link')
        const href = link.getAttribute('href')
        if (isExternalHref(href)) {
          if (linkRel) {
            link.rel = linkRel
          }
          if (linkTarget) {
            link.target = linkTarget
          }
          link.addEventListener('click', () => {
            options.onLinkClick?.({ kind: 'external', url: href ?? undefined })
          })
        }
      })

      root.querySelectorAll<HTMLElement>('input, select, textarea').forEach((field) => {
        if (toValue(options.readonly)) {
          field.setAttribute('disabled', 'true')
          ;(field as HTMLInputElement).readOnly = true
        }
        if (field.getAttribute(ENHANCED_ATTR) === 'field') {
          return
        }
        field.setAttribute(ENHANCED_ATTR, 'field')
        const handler = (): void => {
          options.onFormChange?.({
            page: toValue(options.page),
            field:
              field.getAttribute('name') || field.getAttribute('data-element-id') || field.id || '',
            value: getFieldValue(field),
            fieldType: getFieldType(field),
          })
        }
        field.addEventListener('change', handler)
        if (field.tagName.toLowerCase() !== 'select') {
          field.addEventListener('input', handler)
        }
      })
    },
    { immediate: true },
  )
}
