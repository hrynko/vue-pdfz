# vue-pdfz

A customizable, i18n-ready, SSR-safe PDF viewer for Vue

[![npm Version](https://img.shields.io/npm/v/vue-pdfz?style=flat)](https://npmjs.com/package/vue-pdfz)
[![npm Downloads](https://img.shields.io/npm/dm/vue-pdfz?style=flat)](https://npmjs.com/package/vue-pdfz)
[![GitHub Stars](https://img.shields.io/github/stars/hrynko/vue-pdfz?style=flat)](https://github.com/hrynko/vue-pdfz)
[![License](https://img.shields.io/npm/l/vue-pdfz?style=flat)](https://github.com/hrynko/vue-pdfz/blob/main/LICENSE)

<img src="https://raw.githubusercontent.com/hrynko/vue-pdfz/main/.github/assets/screenshot.png" alt="vue-pdfz screenshot" width="100%">

## Features

- 🧭 **Navigation** – UI and keyboard navigation, `continuous` / `single` / `facing` layouts.
- 🔍 **Zoom & Rotation** – discrete presets + free zoom, fit modes, scroll & pinch zoom.
- 🖼 **Thumbnails** – lazily rendered, collapsible.
- 🔎 **Text Search** – cross-page matching and highlighting.
- 🖨 **Print & Download** – whole document, with filled form values baked in.
- 📝 **Annotations & Forms** – annotation layer, interactive AcroForms, internal/external links.
- 🔒 **Passwords** – built-in prompt for encrypted PDFs.
- 🌍 **i18n** – typed translations, 9 built-in + custom locales, optional `vue-i18n` adapter, RTL.
- 📱 **Responsiveness** – container-driven, compact toolbar + thumbnails drawer on narrow widths.
- 🎨 **Theming** – custom design tokens, `light` / `dark` / `auto` modes, deep slot overrides.
- ♿ **Accessibility** – keyboard shortcuts, ARIA roles & labels.
- ⚡ **Performance** – lazy + virtualized page rendering.
- 🧩 **Compatibility** – typed, tree-shakeable ESM (+ CJS), SSR/Nuxt-safe.

## Installation

```bash
npm install vue-pdfz
```

## Usage

```vue
<script setup>
import { PdfViewer } from 'vue-pdfz'
import 'vue-pdfz/style.css'
</script>

<template>
  <PdfViewer source="/document.pdf" />
</template>
```

### Props

| Prop                 | Type                                                      | Default                 | Description                                                                 |
| -------------------- | --------------------------------------------------------- | ----------------------- | --------------------------------------------------------------------------- |
| `annotationLayer`    | `boolean`                                                 | `true`                  | Render the annotation layer.                                                |
| `enableDownload`     | `boolean`                                                 | `true`                  | Show the download action.                                                   |
| `enableKeyboard`     | `boolean`                                                 | `true`                  | Enable keyboard shortcuts.                                                  |
| `enablePrint`        | `boolean`                                                 | `true`                  | Show the print action.                                                      |
| `enableSearch`       | `boolean`                                                 | `true`                  | Enable text search.                                                         |
| `forms`              | `boolean \| 'readonly'`                                   | `false`                 | Interactive AcroForm fields; `'readonly'` renders them non-editable.        |
| `imageResourcesPath` | `string`                                                  | –                       | URL path to PDF.js annotation icon assets.                                  |
| `layout`             | `'continuous' \| 'facing' \| 'single'`                    | `'continuous'`          | Page layout mode.                                                           |
| `lazy`               | `boolean`                                                 | `true`                  | Defer per-page rendering until near the viewport.                           |
| `linkRel`            | `string`                                                  | `'noopener noreferrer'` | `rel` attribute for external links.                                         |
| `linkTarget`         | `'_blank' \| '_parent' \| '_self' \| '_top'`              | `'_blank'`              | `target` attribute for external links.                                      |
| `locale`             | `string`                                                  | plugin / `'en'`         | Active UI locale code.                                                      |
| `maxZoom`            | `number`                                                  | `10`                    | Maximum zoom scale.                                                         |
| `messages`           | `Partial<LocaleMessages>`                                 | –                       | Per-instance string overrides.                                              |
| `minZoom`            | `number`                                                  | `0.1`                   | Minimum zoom scale.                                                         |
| `page`               | `number`                                                  | `1`                     | Current page number. `v-model:page`.                                        |
| `rotation`           | `0 \| 90 \| 180 \| 270`                                   | `0`                     | Rotation in degrees. `v-model:rotation`.                                    |
| `searchControls`     | `{ caseSensitive?: boolean, entireWord?: boolean }`       | –                       | Which search toggles to show (hidden by default).                           |
| `shortcuts`          | `KeyboardShortcuts`                                       | –                       | Override key bindings per action.                                           |
| `showThumbnails`     | `boolean \| 'auto'`                                       | `'auto'`                | Thumbnails sidebar; `'auto'` opens on wide containers, `false` disables it. |
| `showToolbar`        | `boolean`                                                 | `true`                  | Show the toolbar.                                                           |
| `source`             | `string \| URL \| ArrayBuffer \| Uint8Array \| PdfSource` | –                       | The PDF to load: URL, binary, or config object.                             |
| `textLayer`          | `boolean`                                                 | `true`                  | Render the selectable text layer (required for search).                     |
| `theme`              | `'light' \| 'dark' \| 'auto'`                             | `'light'`               | Color-scheme mode.                                                          |
| `themeTokens`        | `ThemeTokens`                                             | –                       | Design-token overrides.                                                     |
| `thumbnailWidth`     | `number`                                                  | `120`                   | Thumbnail render width in px.                                               |
| `virtualization`     | `boolean`                                                 | `false`                 | Windowed page rendering for large documents.                                |
| `zoom`               | `number \| 'auto' \| 'page-fit' \| 'page-width'`          | `'auto'`                | Zoom level or fit mode. `v-model:zoom`.                                     |
| `zoomStep`           | `number`                                                  | `0.25`                  | Step for zooming in/out.                                                    |

### Events

| Event                                             | Payload                       |
| ------------------------------------------------- | ----------------------------- |
| `annotation-click`                                | `AnnotationClickPayload`      |
| `error`                                           | `PdfError`                    |
| `form-change`                                     | `FormChangePayload`           |
| `link-click`                                      | `LinkClickPayload`            |
| `loaded`                                          | `PdfDocumentMeta`             |
| `loading-progress`                                | `LoadingProgress`             |
| `page-change`                                     | `number` (page)               |
| `password-incorrect`                              | –                             |
| `password-required`                               | –                             |
| `rendered`                                        | `number` (page)               |
| `rotation-change`                                 | `Rotation`                    |
| `search-result`                                   | `SearchResult`                |
| `update:page` / `update:rotation` / `update:zoom` | `v-model` updates             |
| `zoom-change`                                     | `ZoomValue`, `number` (scale) |

### Slots

| Slot                                               | Scope                                           | Purpose                                                                                                                                      |
| -------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `empty`                                            | –                                               | Empty-state overlay.                                                                                                                         |
| `error`                                            | `{ error, retry }`                              | Error overlay.                                                                                                                               |
| `icon-*`                                           | –                                               | `icon-prev`, `icon-next`, `icon-zoom-in`, `icon-zoom-out`, `icon-rotate-cw`, `icon-search`, `icon-print`, `icon-download`, `icon-thumbnails` |
| `loading`                                          | `{ progress }`                                  | Loading overlay.                                                                                                                             |
| `page-overlay`                                     | `{ pageNumber, scale }`                         | Per-page watermarks / badges.                                                                                                                |
| `password`                                         | `{ submit, error }`                             | Password prompt overlay.                                                                                                                     |
| `search-bar`                                       | `{ total, current, search, next, prev, close }` | Custom search UI.                                                                                                                            |
| `thumbnail`                                        | `{ isActive, page, src }`                       | Per-thumbnail item.                                                                                                                          |
| `thumbnails`                                       | `{ goToPage, page, pageCount }`                 | Full sidebar replacement.                                                                                                                    |
| `toolbar-start` / `toolbar-center` / `toolbar-end` | –                                               | Replace a toolbar region.                                                                                                                    |
| `toolbar`                                          | `{ page, pageCount, rotation, scale }`          | Full toolbar replacement.                                                                                                                    |

### Exposed Methods

```ts
const viewer = ref<InstanceType<typeof PdfViewer>>()
viewer.value.goToPage(1)
viewer.value.nextPage()
viewer.value.prevPage()
viewer.value.setZoom(1)
viewer.value.zoomIn()
viewer.value.zoomOut()
viewer.value.rotate('cw')
await viewer.value.search('foo')
viewer.value.nextMatch()
viewer.value.prevMatch()
viewer.value.clearSearch()
await viewer.value.print()
await viewer.value.download('report.pdf')
```

## Internationalization

Resolution order for any string: per-component `messages` → plugin `messages` → built-in bundle for `locale` → `en` fallback.

### Override individual strings

```vue
<PdfViewer :messages="{ download: 'Save' }" />
```

### Add a locale

```ts
import { PdfViewer } from 'vue-pdfz'
import type { LocaleMessages } from 'vue-pdfz'
import { en } from 'vue-pdfz/locales/en'

const it: LocaleMessages = { ...en, nextPage: 'Pagina successiva', /* ... */ }

// Per instance:
<PdfViewer locale="it" :messages="it" />

// Or app-wide via the plugin:
app.use(VuePdfz, { locale: 'it', messages: { it } })
```

### Add an optional `vue-i18n` adapter

With an adapter to a host `vue-i18n` instance, keys resolve as `${prefix}${key}` (the default prefix is `vuePdfz.`), with unresolved keys falling back to the built-in bundle.

```ts
import { useI18n } from 'vue-i18n'
import { createVueI18nAdapter } from 'vue-pdfz'

const i18n = useI18n()
app.use(VuePdfz, { i18nAdapter: createVueI18nAdapter(i18n) })
```

## License

[MIT](LICENSE)
