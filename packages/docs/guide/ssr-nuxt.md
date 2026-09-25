# SSR & Nuxt

The viewer is SSR-safe: on the server the exported component renders nothing instead of touching browser-only APIs, and defers its client-only imports so they are never loaded on the server. It mounts on the client after hydration, where all rendering work runs. No extra configuration is required for the viewer's own code.

## Nuxt

Load the stylesheet through the Nuxt config:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  css: ['vue-pdfz/style.css'],
})
```

Then either import `PdfViewer` where you use it, or install the plugin to register it globally and set app-wide defaults:

```ts
// plugins/vue-pdfz.ts
import VuePdfz from 'vue-pdfz'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VuePdfz, { theme: 'auto' })
})
```

Nothing else is needed in most projects. If Nuxt's server build fails to process the ESM in `vue-pdfz` or `vue-pdf-embed`, transpile them:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  build: { transpile: ['vue-pdfz', 'vue-pdf-embed'] },
})
```

## Client-only fallback

If a transitive dependency ever fails at import time, render the viewer on the client only:

```vue
<ClientOnly>
  <PdfViewer />
</ClientOnly>
```
