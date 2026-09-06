# Methods

The viewer exposes imperative methods on its component instance. Access the instance through a template ref and call the methods directly:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { PdfViewer } from 'vue-pdfz'

const viewer = ref<InstanceType<typeof PdfViewer>>()
</script>

<template>
  <PdfViewer ref="viewer" source="/document.pdf" />
</template>
```

| Method                    | Signature                                                   | Description                                          |
| ------------------------- | ----------------------------------------------------------- | ---------------------------------------------------- |
| `goToPage`                | `(page: number) => void`                                    | Scroll to and activate a page.                       |
| `nextPage` / `prevPage`   | `() => void`                                                | Move one page forward / back.                        |
| `setZoom`                 | `(zoom: ZoomValue) => void`                                 | Set a numeric scale or a fit mode.                   |
| `zoomIn` / `zoomOut`      | `() => void`                                                | Step the zoom by `zoomStep`.                         |
| `rotate`                  | `(direction: 'cw' \| 'ccw') => void`                        | Rotate 90° clockwise / counter-clockwise.            |
| `search`                  | `(query: string, options?: SearchOptions) => Promise<void>` | Run a search; `options` is a `SearchOptions` object. |
| `nextMatch` / `prevMatch` | `() => void`                                                | Jump to the next / previous match.                   |
| `clearSearch`             | `() => void`                                                | Clear the query and highlights.                      |
| `print`                   | `() => Promise<void>`                                       | Print the document.                                  |
| `download`                | `(filename?: string) => Promise<void>`                      | Download the document (form values baked in).        |

### Example

```ts
viewer.value.goToPage(3)
viewer.value.setZoom('page-width')
viewer.value.rotate('cw')
await viewer.value.search('invoice', { caseSensitive: true })
viewer.value.nextMatch()
await viewer.value.download('report.pdf')
```
