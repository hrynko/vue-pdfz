# Events

<!-- @include: ./_generated/events.md -->

In addition, the [`v-model` bindings](/api/props#v-model-bindings) emit `update:page` / `update:zoom` / `update:rotation` when their value changes. Payload types are exported from `vue-pdfz`.

### Example

```vue
<PdfViewer
  @loaded="(meta) => console.log(`${meta.pageCount} pages`)"
  @error="(error) => console.error(error.code, error.message)"
  @page-change="(page) => (current = page)"
  @search-result="(r) => (count = `${r.current}/${r.total}`)"
  @form-change="(f) => console.log(f.field, f.value)"
/>
```
