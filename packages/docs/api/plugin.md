# Plugin

Installing the plugin registers `<PdfViewer>` globally and sets app-wide defaults. It is optional – the component works with a [plain import](/guide/getting-started#plain-import-no-plugin-required) too.

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

## Options

The options object has type `VuePdfzPluginOptions` (exported from `vue-pdfz`).

| Option               | Type                | Default | Description                                                                                 |
| -------------------- | ------------------- | ------- | ------------------------------------------------------------------------------------------- |
| `i18nAdapter`        | `I18nAdapter`       | –       | Host i18n adapter (e.g. a [vue-i18n bridge](/guide/i18n#add-an-optional-vue-i18n-adapter)). |
| `locale`             | `string`            | `'en'`  | Default locale code for all viewers.                                                        |
| `messages`           | `LocaleMessagesMap` | –       | Global message overrides, keyed by locale.                                                  |
| `registerComponents` | `boolean`           | `true`  | Register the component globally as `<PdfViewer>`.                                           |
| `shortcuts`          | `KeyboardShortcuts` | –       | Default keyboard-shortcut overrides.                                                        |
| `themeTokens`        | `ThemeTokens`       | –       | Global design-token overrides for all viewers.                                              |
| `theme`              | `ThemeMode`         | –       | Default theme mode for all viewers.                                                         |

Per-viewer props always override the plugin defaults; per-viewer `messages` and `themeTokens`
merge over the plugin-wide ones.

## Named export

The default export and the named `VuePdfz` export are the same plugin:

```ts
import VuePdfz from 'vue-pdfz'
// or
import { VuePdfz } from 'vue-pdfz'
```
