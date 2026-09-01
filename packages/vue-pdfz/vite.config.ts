import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      entryRoot: 'src',
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      tsconfigPath: 'tsconfig.build.json',
    }),
  ],
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    sourcemap: true,
    rollupOptions: {
      external: ['vue', 'vue-pdf-embed', 'pdfjs-dist', /^pdfjs-dist\/.*/],
      output: {
        exports: 'named',
      },
    },
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'locales/ar': resolve(__dirname, 'src/i18n/locales/ar.ts'),
        'locales/de': resolve(__dirname, 'src/i18n/locales/de.ts'),
        'locales/en': resolve(__dirname, 'src/i18n/locales/en.ts'),
        'locales/es': resolve(__dirname, 'src/i18n/locales/es.ts'),
        'locales/fr': resolve(__dirname, 'src/i18n/locales/fr.ts'),
        'locales/he': resolve(__dirname, 'src/i18n/locales/he.ts'),
        'locales/ja': resolve(__dirname, 'src/i18n/locales/ja.ts'),
        'locales/ko': resolve(__dirname, 'src/i18n/locales/ko.ts'),
        'locales/zh': resolve(__dirname, 'src/i18n/locales/zh.ts'),
      },
      formats: ['cjs', 'es'],
      cssFileName: 'style',
    },
  },
})
