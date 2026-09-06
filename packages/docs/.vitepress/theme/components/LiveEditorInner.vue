<script setup lang="ts">
import {
  defineComponent,
  onBeforeUnmount,
  onErrorCaptured,
  ref,
  shallowRef,
  watch,
  type Component,
} from 'vue'
import * as Vue from 'vue'
import { compile } from '@vue/compiler-dom'
import { withBase } from 'vitepress'
import { PdfViewer } from 'vue-pdfz'

const DEFAULT_CODE = `<PdfViewer
  source="__SAMPLE__"
  layout="single"
  locale="en"
  theme="auto"
  style="height: min(72vh, 640px)"
/>`
const SAMPLE_DOC = withBase('/vue-pdfz-sample.pdf')

const props = withDefaults(
  defineProps<{
    code?: string
  }>(),
  {
    code: '',
  },
)

const code = ref((props.code || DEFAULT_CODE).replace(/__SAMPLE__/g, SAMPLE_DOC))
const hasError = ref(false)
const isCopied = ref(false)
const preview = shallowRef<Component | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined

async function copy(): Promise<void> {
  try {
    await navigator.clipboard.writeText(code.value)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 1400)
  } catch {
    // clipboard may be unavailable
  }
}

function build(src: string): void {
  const trimmed = src.trim()
  if (!trimmed) {
    hasError.value = true
    return
  }
  try {
    const { code: fnCode } = compile(trimmed, { mode: 'function', hoistStatic: false })
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call
    const render = new Function('Vue', fnCode)(Vue) as () => unknown
    preview.value = defineComponent({
      components: { PdfViewer },
      render,
    })
    hasError.value = false
  } catch {
    hasError.value = true
  }
}

build(code.value)

watch(code, (newCode) => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    build(newCode)
  }, 400)
})

onBeforeUnmount(() => {
  clearTimeout(timer)
})

onErrorCaptured(() => {
  hasError.value = true
  return false
})
</script>

<template>
  <div class="live-editor">
    <div class="live-editor__source">
      <div class="live-editor__bar">
        <span class="live-editor__label">Template</span>

        <button type="button" class="live-editor__copy" @click="copy">
          {{ isCopied ? 'Copied' : 'Copy' }}
        </button>
      </div>

      <textarea
        v-model="code"
        class="live-editor__code"
        spellcheck="false"
        autocapitalize="off"
        autocomplete="off"
        aria-label="Editable PdfViewer template"
      />
    </div>

    <component :is="preview" v-if="preview && !hasError" class="live-editor__preview" />
  </div>
</template>

<style scoped>
.live-editor {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 1.25rem 0;
}

.live-editor__source {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg-alt);
}

.live-editor__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.live-editor__label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
}

.live-editor__copy {
  padding: 3px 10px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.live-editor__copy:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-brand-1);
}

.live-editor__code {
  flex: 1;
  min-height: 220px;
  padding: 12px 14px;
  border: 0;
  resize: vertical;
  background: transparent;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.6;
  tab-size: 2;
}

.live-editor__code:focus {
  outline: none;
}

.live-editor__preview {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
}
</style>
