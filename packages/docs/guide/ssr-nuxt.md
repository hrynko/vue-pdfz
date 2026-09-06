# SSR & Nuxt

The viewer is SSR-safe: on the server the exported component renders nothing instead of touching browser-only APIs, and defers its client-only imports so they never reach the server bundle. It mounts on the client after hydration, where all rendering work runs. No extra configuration is required for the viewer's own code.

## Nuxt

Nuxt needs no special setup in most projects. If its server build fails to process the ESM in `vue-pdfz` or `vue-pdf-embed`, transpile them:

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
