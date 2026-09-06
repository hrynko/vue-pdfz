# Customization

Almost every region of the viewer is slot-overridable, and the whole component is driven by props and exposed methods. This page is a cookbook; see [Slots](/api/slots) for the full slot list and their scoped props. To try props interactively, see the [Demo](/demo).

## Custom toolbar

Replace a single region with `toolbar-start` / `toolbar-center` / `toolbar-end`, or the whole bar with `toolbar`:

```vue
<PdfViewer>
  <template #toolbar-end>
    <button class="vue-pdfz-btn">Share</button>
  </template>
</PdfViewer>
```

<DemoViewer>
  <template #toolbar-end>
    <button class="vue-pdfz-btn">Share</button>
  </template>
</DemoViewer>

## Custom thumbnails

```vue
<PdfViewer>
  <template #thumbnail="{ page, isActive, src }">
    <figure :class="{ active: isActive }">
      <img :src="src" :alt="`Page ${page}`" />
      <figcaption>{{ page }}</figcaption>
    </figure>
  </template>
</PdfViewer>
```

## Watermark overlay

The `page-overlay` slot renders once per page, positioned over the canvas – ideal for watermarks or badges:

```vue
<PdfViewer>
  <template #page-overlay="{ pageNumber }">
    <div class="watermark">DRAFT {{ pageNumber }}</div>
  </template>
</PdfViewer>
```

<DemoViewer>
  <template #page-overlay="{ pageNumber }">
    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:800 clamp(28px,7vw,52px)/1 system-ui,sans-serif;color:rgba(120,120,120,0.18);transform:rotate(-28deg);pointer-events:none;user-select:none">
      DRAFT {{ pageNumber }}
    </div>
  </template>
</DemoViewer>

## Swap icons

Every toolbar icon has an `icon-*` slot (`icon-prev`, `icon-next`, `icon-zoom-in`, `icon-zoom-out`, `icon-rotate-cw`, `icon-search`, `icon-print`, `icon-download`, and `icon-thumbnails`):

```vue
<PdfViewer>
  <template #icon-download>
    <CustomDownloadIcon />
  </template>
</PdfViewer>
```

## Custom states

The loading, error, password, and empty states each have a slot with scoped props, so you can match them to your app's design:

```vue
<PdfViewer>
  <template #loading="{ progress }"> Loading... {{ progress.percent }}% </template>
  <template #password="{ submit, error }">
    <!-- your own password field; call submit(value) -->
  </template>
  <template #empty> Drop a PDF to get started. </template>
</PdfViewer>
```

## Search

Search is powered by the PDF.js find controller, which scans all pages (including those not yet rendered) and highlights matches in the text layer, scrolling the active match into view.

Provide your own search UI with the `search-bar` slot:

```vue
<PdfViewer>
  <template #search-bar="{ total, current, search, next, prev, close }">
    <!-- custom search field -->
  </template>
</PdfViewer>
```

## Programmatic control

Drive the viewer imperatively through a template ref – see [Methods](/api/methods):

```ts
const viewer = ref<InstanceType<typeof PdfViewer>>()

viewer.value.goToPage(3)
viewer.value.setZoom('page-width')
await viewer.value.search('invoice', { caseSensitive: true })
```
