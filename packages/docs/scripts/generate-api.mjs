import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { parse } from 'vue-docgen-api'

const GENERATED_NOTICE = '<!-- Generated from the component JSDoc. Do not edit. -->\n\n'

const escapePipes = (s) => String(s).replace(/\|/g, '\\|')
const mono = (s) => (s ? `\`${escapePipes(s)}\`` : '–')
const text = (s) => escapePipes((s ?? '').replace(/\s*\n\s*/g, ' ').trim()) || '–'

function formatType(type) {
  if (!type) {
    return null
  }
  const name = type.name ?? ''
  const args = Array.isArray(type.elements) ? type.elements.map(formatType) : null
  if (name === 'union') {
    return args?.join(' | ') ?? name
  }
  if (args?.length) {
    return `${name}<${args.join(', ')}>`
  }
  const literal = name.match(/^"(.*)"$/)
  return literal ? `'${literal[1]}'` : name
}

/**
 * `vue-docgen` truncates payload tuples to their first element, so parse them
 * from the `defineEmits` block instead.
 */
function parseEmitPayloads(source) {
  const block = source.match(/defineEmits<\{([\s\S]*?)\n\}>\(\)/)?.[1] ?? ''
  const entries = [...block.matchAll(/^\s*'?([\w-]+)'?\s*:\s*\[(.*)\]\s*$/gm)].map(
    ([, name, args]) => {
      const inner = args.trim()
      // A lone argument reads better as a bare type; several keep their names.
      return [
        name,
        inner && (inner.includes(',') ? `(${inner})` : inner.replace(/^\w+\??:\s*/, '')),
      ]
    },
  )
  return new Map(entries)
}

function mdTable(headers, rows) {
  const row = (cells) => `| ${cells.join(' | ')} |`
  return [
    GENERATED_NOTICE + row(headers),
    row(headers.map(() => '---')),
    ...rows.map(row),
    '',
  ].join('\n')
}

const componentPath = fileURLToPath(
  new URL('../../vue-pdfz/src/components/PdfViewer.vue', import.meta.url),
)

const doc = await parse(componentPath)

const propsTable = mdTable(
  ['Prop', 'Type', 'Default', 'Description'],
  [...(doc.props ?? [])]
    .sort((a, b) => Number(b.required) - Number(a.required) || a.name.localeCompare(b.name))
    .map((p) => [
      mono(p.name),
      mono(formatType(p.type)),
      mono(p.defaultValue?.value),
      text(p.description),
    ]),
)

const emitPayloads = parseEmitPayloads(readFileSync(componentPath, 'utf8'))
const eventsTable = mdTable(
  ['Event', 'Payload', 'Description'],
  [...(doc.events ?? [])]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((e) => [
      mono(e.name),
      mono(emitPayloads.get(e.name) ?? e.type?.names?.join(' | ')),
      text(e.description),
    ]),
)

mkdirSync(fileURLToPath(new URL('../api/_generated', import.meta.url)), { recursive: true })
writeFileSync(new URL('../api/_generated/props.md', import.meta.url), propsTable)
writeFileSync(new URL('../api/_generated/events.md', import.meta.url), eventsTable)
