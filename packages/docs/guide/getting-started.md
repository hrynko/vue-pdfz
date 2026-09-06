# Getting started

`vue-pdfz` wraps [`vue-pdf-embed`](https://npmjs.com/package/vue-pdf-embed) in a complete viewer UI: a toolbar with page navigation, zoom, rotate and fit, a thumbnails sidebar, theming, configurable keyboard shortcuts, accessibility, and internationalization.

## Installation

```bash
npm install vue-pdfz
```

`vue` (^3.4) is the only peer dependency you install explicitly. `vue-pdf-embed` comes bundled with `vue-pdfz` and brings its own PDF.js, including the worker, so there is no worker to configure for the common case (see [Styles & worker](/guide/styles-and-worker#pdf-js-worker-csp)).

## Quick start

### Plain import (no plugin required)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { PdfViewer, type PdfDocumentMeta } from 'vue-pdfz'
import 'vue-pdfz/style.css'

const page = ref(1)
const zoom = ref<'auto' | number>('auto')

function onLoaded(meta: PdfDocumentMeta) {
  console.log(`${meta.pageCount} pages`)
}
</script>

<template>
  <PdfViewer
    source="/document.pdf"
    v-model:page="page"
    v-model:zoom="zoom"
    locale="de"
    style="height: 100vh"
    @loaded="onLoaded"
  />
</template>
```

The viewer sizes to its container, so give it a height (`100vh`, a fixed pixel height, or a flex parent). Don't forget the [stylesheet import](/guide/styles-and-worker) – the component does not auto-load its CSS.

### As a plugin (global defaults + component registration)

```ts
import { createApp } from 'vue'
import VuePdfz from 'vue-pdfz'
import 'vue-pdfz/style.css'
import App from './App.vue'

createApp(App)
  .use(VuePdfz, {
    theme: 'dark',
    locale: 'es',
    messages: { es: { download: 'Exportar' } },
  })
  .mount('#app')
```

With the plugin installed you can use `<PdfViewer>` anywhere without importing it. See the [Plugin API](/api/plugin) for every option.

## Next steps

- [Styles & worker](/guide/styles-and-worker) – the required stylesheet import and CSP notes.
- [SSR & Nuxt](/guide/ssr-nuxt) – server-rendering the viewer safely.
- [Props](/api/props) · [Events](/api/events) · [Slots](/api/slots) · [Methods](/api/methods) – the full component API.
- [Live demo](/demo) – every feature, interactively.
