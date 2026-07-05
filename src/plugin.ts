import type { App, Plugin } from 'vue'

import type { VuePdfxPluginOptions } from './types'
import { VuePdfxConfigKey } from './context'
import { PdfViewer } from './components/PdfViewer.lazy'

export const VuePdfx: Plugin<[VuePdfxPluginOptions?]> = {
  install(app: App, options: VuePdfxPluginOptions = {}) {
    app.provide(VuePdfxConfigKey, {
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

export default VuePdfx
