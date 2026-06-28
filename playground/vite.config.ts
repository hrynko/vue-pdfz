import { readFileSync } from 'node:fs'
import { URL, fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'

function slowSamplePlugin(): Plugin {
  return {
    name: 'vue-pdfx-slow-sample',
    configureServer(server) {
      server.middlewares.use('/slow-sample.pdf', (_req, res) => {
        const file = readFileSync(
          fileURLToPath(new URL('./public/samples/sample-long.pdf', import.meta.url)),
        )
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Length', file.length)
        res.setHeader('Accept-Ranges', 'none')
        const chunkCount = 12
        const chunkSize = Math.ceil(file.length / chunkCount)
        let sent = 0
        const sendChunk = () => {
          if (sent >= file.length) {
            res.end()
            return
          }
          res.write(file.subarray(sent, sent + chunkSize))
          sent += chunkSize
          setTimeout(sendChunk, 180) // ~2s total
        }
        sendChunk()
      })
    },
  }
}

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [vue(), slowSamplePlugin()],
  resolve: {
    alias: [
      {
        find: 'vue-pdfx/style.css',
        replacement: fileURLToPath(new URL('../src/theme/default.css', import.meta.url)),
      },
      {
        find: /^vue-pdfx$/,
        replacement: fileURLToPath(new URL('../src/index.ts', import.meta.url)),
      },
    ],
  },
})
