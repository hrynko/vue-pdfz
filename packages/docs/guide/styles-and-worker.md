# Styles & worker

## Styles

The default styles ship as a standalone stylesheet – import it once, anywhere in your app:

```ts
import 'vue-pdfz/style.css'
```

To restyle rather than replace, see [Theming](/guide/theming).

## PDF.js worker & CSP {#pdf-js-worker-csp}

`vue-pdf-embed` bundles its own copy of PDF.js and configures `GlobalWorkerOptions` itself, so there is no worker to set up. With no Content-Security-Policy there's nothing to configure here.

If your app **does** enforce a CSP, two details matter. The worker runs from a `blob:` URL, and PDF.js decodes some images via WebAssembly, so allow:

```
worker-src 'self' blob:;
script-src 'self' 'wasm-unsafe-eval';
```

Under a CSP that omits `blob:` from `worker-src` (or `script-src` as the fallback), the worker can't start.
