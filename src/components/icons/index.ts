import { h, type FunctionalComponent } from 'vue'

/** A path `d` string, or a `[tag, attrs]` tuple for rects/circles. */
type SvgShape = string | [tag: string, attrs: Record<string, number | string>]

function icon(name: string, shapes: SvgShape[]): FunctionalComponent {
  const component: FunctionalComponent = () =>
    h(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 20 20',
        width: '20',
        height: '20',
        class: 'vue-pdfx-icon',
        'aria-hidden': 'true',
        focusable: 'false',
      },
      shapes.map((shape) =>
        typeof shape === 'string' ? h('path', { d: shape }) : h(shape[0], shape[1]),
      ),
    )
  component.displayName = `${name}Icon`
  return component
}

export const AlertIcon = icon('Alert', [
  'M8.95 5.71A1.2 1.2 0 0 1 11.05 5.71L16.02 14.71A1.2 1.2 0 0 1 14.96 16.5L5.04 16.5A1.2 1.2 0 0 1 3.99 14.71Z',
  'M10 9v3',
  'M10 14.3h.01',
])
export const ChevronDownIcon = icon('ChevronDown', ['M5 7.5l5 5 5-5'])
export const ChevronLeftIcon = icon('ChevronLeft', ['M12.5 5l-5 5 5 5'])
export const ChevronRightIcon = icon('ChevronRight', ['M7.5 5l5 5-5 5'])
export const ChevronUpIcon = icon('ChevronUp', ['M5 12.5l5-5 5 5'])
export const CloseIcon = icon('Close', ['M5.5 5.5l9 9', 'M14.5 5.5l-9 9'])
export const DownloadIcon = icon('Download', [
  'M10 3.5v8.5M6.5 8.5L10 12l3.5-3.5',
  'M16 13.5v1.5a1.5 1.5 0 0 1-1.5 1.5h-9a1.5 1.5 0 0 1-1.5-1.5V13.5',
])
export const FileIcon = icon('File', ['M5 3h6l4 4v10H5Z', 'M11 3v4h4'])
export const FitIcon = icon('Fit', ['M4 7V4h3', 'M16 7V4h-3', 'M4 13v3h3', 'M16 13v3h-3'])
export const LockIcon = icon('Lock', [
  ['rect', { x: 4.5, y: 9, width: 11, height: 7, rx: 2 }],
  'M7 9V7a3 3 0 0 1 6 0v2',
])
export const MoreIcon = icon('More', [
  ['circle', { cx: 10, cy: 4.7, r: 1.5, fill: 'currentColor', stroke: 'none' }],
  ['circle', { cx: 10, cy: 10, r: 1.5, fill: 'currentColor', stroke: 'none' }],
  ['circle', { cx: 10, cy: 15.3, r: 1.5, fill: 'currentColor', stroke: 'none' }],
])
export const PrintIcon = icon('Print', [
  'M5.5 9.5V4h9v5.5',
  'M5.5 15H4A1.5 1.5 0 0 1 2.5 13.5v-2.5A1.5 1.5 0 0 1 4 9.5h12A1.5 1.5 0 0 1 17.5 11v2.5A1.5 1.5 0 0 1 16 14.5H14.5',
  'M5.5 13h9v4h-9z',
])
export const RotateCwIcon = icon('RotateCw', ['M15.5 6.5A5.5 5.5 0 1 0 16 12', 'M15.5 3v4h-4'])
export const SearchIcon = icon('Search', [['circle', { cx: 9, cy: 9, r: 5 }], 'M16 16l-3.2-3.2'])
export const SidebarIcon = icon('Sidebar', [
  ['rect', { x: 3.5, y: 4, width: 13, height: 12, rx: 2 }],
  'M8 4v12',
])
export const ZoomInIcon = icon('ZoomIn', ['M10 4.5v11', 'M4.5 10h11'])
export const ZoomOutIcon = icon('ZoomOut', ['M4.5 10h11'])
