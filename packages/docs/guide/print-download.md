# Printing & download

Both are available as toolbar actions, instance methods ([`print()`](/api/methods) / [`download()`](/api/methods)), and keyboard shortcuts ([`Ctrl/⌘ P`](/guide/keyboard-shortcuts) / [`Ctrl/⌘ S`](/guide/keyboard-shortcuts)).

```ts
const viewer = ref<InstanceType<typeof PdfViewer>>()

await viewer.value?.print()
await viewer.value?.download()
```

Download saves the document with any filled-in form values baked in.

Turn either action off for the user with [`enablePrint`](/api/props) / [`enableDownload`](/api/props). This hides the toolbar button and unbinds the shortcut. The methods keep working, so you can still trigger the action from your own UI.

```vue
<PdfViewer :enable-print="false" :enable-download="false" />
```

::: warning Rotation isn't preserved
Both print and download use the document's original page orientation – the current on-screen rotation is not reflected in the printout or the saved file.
:::
