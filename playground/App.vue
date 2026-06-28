<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import {
  PdfViewer,
  type LayoutMode,
  type PdfDocumentMeta,
  type PdfSourceProp,
  type Rotation,
  type ThemeMode,
  type ZoomValue,
} from 'vue-pdfx'

const samples: Record<string, string> = {
  'Text (5 pages)': '/samples/sample-text.pdf',
  'Long (40 pages)': '/samples/sample-long.pdf',
  Form: '/samples/sample-form.pdf',
  'Image (no text)': '/samples/sample-image.pdf',
  'Protected (pwd: test)': '/samples/sample-protected.pdf',
  'Broken (error)': '/samples/sample-broken.pdf',
  'Slow load (~2s)': '/slow-sample.pdf',
}

const sampleKey = ref<string>(Object.keys(samples)[0])
const source = shallowRef<PdfSourceProp>(Object.values(samples)[0])
const urlInput = ref('')

const page = ref(1)
const rotation = ref<Rotation>(0)
const zoom = ref<ZoomValue>('auto')

const accent = ref<'ink' | 'blue'>('ink')
const enableAnnotations = ref(true)
const forms = ref<boolean | 'readonly'>(true)
const layout = ref<LayoutMode>('continuous')
const layoutOptions: LayoutMode[] = ['continuous', 'single', 'facing']
const locale = ref('en')
const localeOptions = ['ar', 'de', 'en', 'es', 'fr', 'he', 'ja', 'ko', 'zh']
const showThumbnails = ref<boolean | 'auto'>('auto')
const theme = ref<ThemeMode>('light')
const themeOptions: ThemeMode[] = ['light', 'dark', 'auto']
const virtualization = ref(false)
const watermark = ref(false)
const widthOption = ref<'full' | '1024px' | '768px' | '414px'>('full')

const meta = shallowRef<PdfDocumentMeta | null>(null)
const status = ref('Ready')
const viewerWrapStyle = computed(() => ({
  margin: widthOption.value === 'full' ? '0' : '0 auto',
  maxWidth: widthOption.value === 'full' ? '100%' : widthOption.value,
  height: '100%',
}))

function handleDocumentLoad(newMeta: PdfDocumentMeta): void {
  meta.value = newMeta
  log(`Loaded "${newMeta.title ?? 'untitled'}" – ${newMeta.pageCount} page(s)`)
}

async function handleFileChange(e: Event): Promise<void> {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    source.value = new Uint8Array(await file.arrayBuffer())
    page.value = 1
    log(`Loaded local file: ${file.name}`)
  }
}

function handleSampleChange(): void {
  source.value = samples[sampleKey.value]
  page.value = 1
}

function handleUrlEnter(): void {
  const url = urlInput.value.trim()
  if (url) {
    source.value = url
    page.value = 1
  }
}

function log(message: string): void {
  status.value = message
}
</script>

<template>
  <div class="app">
    <div class="app__bar">
      <h1>vue-pdfx</h1>

      <label>
        Sample
        <select v-model="sampleKey" @change="handleSampleChange">
          <option v-for="(key, name) in samples" :key="key" :value="name">{{ name }}</option>
        </select>
      </label>
      <label>
        URL
        <input v-model="urlInput" type="text" placeholder="https://.../file.pdf" />
      </label>
      <button @click="handleUrlEnter">Load</button>
      <label>
        File
        <input type="file" accept="application/pdf" @change="handleFileChange" />
      </label>

      <label>
        Accent
        <select v-model="accent">
          <option value="ink">Ink</option>
          <option value="blue">Blue</option>
        </select>
      </label>
      <label>
        Forms
        <select v-model="forms">
          <option :value="false">off</option>
          <option :value="true">interactive</option>
          <option value="readonly">readonly</option>
        </select>
      </label>
      <label>
        Layout
        <select v-model="layout">
          <option v-for="option in layoutOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </label>
      <label>
        Locale
        <select v-model="locale">
          <option v-for="option in localeOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </label>
      <label>
        Theme
        <select v-model="theme">
          <option v-for="option in themeOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </label>
      <label>
        Width
        <select v-model="widthOption">
          <option value="full">Full</option>
          <option value="1024px">1024</option>
          <option value="768px">Tablet 768</option>
          <option value="414px">Phone 414</option>
        </select>
      </label>

      <label>
        <input v-model="enableAnnotations" type="checkbox" />
        Annotations
      </label>
      <label>
        <input v-model="showThumbnails" type="checkbox" :true-value="'auto'" :false-value="false" />
        Thumbnails
      </label>
      <label>
        <input v-model="virtualization" type="checkbox" />
        Virtualize
      </label>
      <label>
        <input v-model="watermark" type="checkbox" />
        Watermark
      </label>
    </div>

    <div class="app__viewer">
      <div
        class="viewer-wrap"
        :class="{ 'accent-blue': accent === 'blue' }"
        :style="viewerWrapStyle"
      >
        <PdfViewer
          v-model:page="page"
          v-model:rotation="rotation"
          v-model:zoom="zoom"
          :annotation-layer="enableAnnotations"
          :forms="forms"
          :layout="layout"
          :locale="locale"
          :search-controls="{ caseSensitive: true, entireWord: true }"
          :show-thumbnails="showThumbnails"
          :source="source"
          :theme="theme"
          :virtualization="virtualization"
          @annotation-click="(annotation) => log(`Annotation click: ${annotation.subtype}`)"
          @error="(error) => log(`Error [${error.code}]: ${error.message}`)"
          @form-change="(form) => log(`Form '${form.field}' = ${JSON.stringify(form.value)}`)"
          @link-click="(link) => log(`Link click: ${link.kind} ${link.url ?? link.page ?? ''}`)"
          @loaded="handleDocumentLoad"
          @page-change="(page) => log(`Page changed to ${page}`)"
          @search-result="(result) => log(`Search: ${result.current}/${result.total}`)"
        >
          <template v-if="watermark" #page-overlay="{ pageNumber }">
            <div class="watermark">DRAFT {{ pageNumber }}</div>
          </template>
        </PdfViewer>
      </div>
    </div>

    <div class="app__status">
      {{ status }} • zoom {{ zoom }} • rotation {{ rotation }}° • page {{ page }}
      <template v-if="meta?.pageCount">/ {{ meta.pageCount }}</template>
      <template v-if="meta?.hasForms">• has forms</template>
    </div>
  </div>
</template>
