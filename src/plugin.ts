import type { App, Plugin } from 'vue'

import type { VuePdfzPluginOptions } from './types'
import { VuePdfzConfigKey } from './context'
import { PdfViewer } from './components/PdfViewer.lazy'

export const VuePdfz: Plugin<[VuePdfzPluginOptions?]> = {
  install(app: App, options: VuePdfzPluginOptions = {}) {
    app.provide(VuePdfzConfigKey, {
      ...(options.i18nAdapter !== undefined ? { i18nAdapter: options.i18nAdapter } : {}),
      ...(options.locale !== undefined ? { locale: options.locale } : {}),
      ...(options.messages !== undefined ? { messages: options.messages } : {}),
      ...(options.shortcuts !== undefined ? { shortcuts: options.shortcuts } : {}),
      ...(options.theme !== undefined ? { theme: options.theme } : {}),
      ...(options.themeTokens !== undefined ? { themeTokens: options.themeTokens } : {}),
    })

    if (options.registerComponents !== false) {
      app.component('PdfViewer', PdfViewer)
    }
  },
}

export default VuePdfz
