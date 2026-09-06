import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { parse } from 'vue-docgen-api'

const GENERATED_NOTICE = '<!-- Generated from the component JSDoc. Do not edit. -->\n\n'
const TYPE_OVERRIDES = {
  // vue-docgen ignores generic arguments
  messages: 'Partial<LocaleMessages>',
}

const escapePipes = (s) => String(s).replace(/\|/g, '\\|')
const mono = (s) => (s ? `\`${escapePipes(s)}\`` : '–')
const text = (s) => escapePipes((s ?? '').replace(/\s*\n\s*/g, ' ').trim()) || '–'

function formatType(type) {
  if (!type) {
    return null
  }
  if (type.name === 'union' && Array.isArray(type.elements)) {
    return type.elements.map(formatType).join(' | ')
  }
  const name = type.name ?? ''
  const literal = name.match(/^"(.*)"$/)
  return literal ? `'${literal[1]}'` : name
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

const doc = await parse(
  fileURLToPath(new URL('../../vue-pdfz/src/components/PdfViewer.vue', import.meta.url)),
)

const propsTable = mdTable(
  ['Prop', 'Type', 'Default', 'Description'],
  [...(doc.props ?? [])]
    .sort((a, b) => Number(b.required) - Number(a.required) || a.name.localeCompare(b.name))
    .map((p) => [
      mono(p.name),
      mono(TYPE_OVERRIDES[p.name] ?? formatType(p.type)),
      mono(p.defaultValue?.value),
      text(p.description),
    ]),
)

const eventsTable = mdTable(
  ['Event', 'Payload', 'Description'],
  (doc.events ?? []).map((e) => [
    mono(e.name),
    mono(e.type?.names?.join(' | ')),
    text(e.description),
  ]),
)

mkdirSync(fileURLToPath(new URL('../api/_generated', import.meta.url)), { recursive: true })
writeFileSync(new URL('../api/_generated/props.md', import.meta.url), propsTable)
writeFileSync(new URL('../api/_generated/events.md', import.meta.url), eventsTable)
