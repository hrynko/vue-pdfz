import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

function buildPdf(objects, { trailerExtra = '' } = {}) {
  let body = '%PDF-1.7\n%\xe2\xe3\xcf\xd3\n'
  const offsets = []
  objects.forEach((content, i) => {
    offsets[i] = Buffer.byteLength(body, 'latin1')
    const text = Buffer.isBuffer(content) ? content.toString('latin1') : content
    body += `${i + 1} 0 obj\n${text}\nendobj\n`
  })
  const xrefPos = Buffer.byteLength(body, 'latin1')
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const offset of offsets) {
    xref += `${String(offset).padStart(10, '0')} 00000 n \n`
  }
  const trailer = `trailer\n<</Size ${objects.length + 1}/Root 1 0 R${trailerExtra}>>\nstartxref\n${xrefPos}\n%%EOF`
  return Buffer.from(body + xref + trailer, 'latin1')
}

function escapePdfText(text) {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function getTextContentStream(lines) {
  let stream = 'BT\n/F1 16 Tf\n72 740 Td\n18 TL\n'
  lines.forEach((line, i) => {
    if (i) {
      stream += 'T*\n'
    }
    stream += `(${escapePdfText(line)}) Tj\n`
  })
  return stream + 'ET'
}

function getPageLabel(text, { size = 11, margin = 20 } = {}) {
  const x = Math.round(612 - margin * 0.5 - text.length * size * 0.5)
  const y = 792 - margin
  return `BT\n/F1 ${size} Tf\n${x} ${y} Td\n(${escapePdfText(text)}) Tj\nET`
}

function makeTextPdf(pageCount = 5) {
  const objects = []
  objects[0] = '<</Type/Catalog/Pages 2 0 R>>'
  objects[2] = '<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>'
  const pageRefs = []
  let nextObjNo = 4
  for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
    const lines = [
      'Sample Document',
      '',
      'vue-pdfz is a customizable, i18n-ready PDF viewer for Vue.',
      '',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do',
      'eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut',
      'enim ad minim veniam, quis nostrud exercitation ullamco laboris',
      'nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in',
      'reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla',
      'pariatur. Excepteur sint occaecat cupidatat non proident, sunt in',
      'culpa qui officia deserunt mollit anim id est laborum.',
    ]
    const contentObjNo = nextObjNo++
    const pageObjNo = nextObjNo++
    const stream = `${getTextContentStream(lines)}\n${getPageLabel(`Page ${pageIndex + 1} of ${pageCount}`)}`
    objects[contentObjNo - 1] =
      `<</Length ${Buffer.byteLength(stream, 'latin1')}>>\nstream\n${stream}\nendstream`
    objects[pageObjNo - 1] =
      `<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]` +
      `/Contents ${contentObjNo} 0 R/Resources<</Font<</F1 3 0 R>>>>>>`
    pageRefs.push(`${pageObjNo} 0 R`)
  }
  objects[1] = `<</Type/Pages/Kids[${pageRefs.join(' ')}]/Count ${pageCount}>>`
  return buildPdf(objects)
}

function makeFormPdf() {
  const objects = []
  objects[0] = '<</Type/Catalog/Pages 2 0 R/AcroForm 6 0 R>>'
  objects[1] = '<</Type/Pages/Kids[3 0 R]/Count 1>>'
  const stream = getTextContentStream(['Text:', '', 'Checkbox:'])
  objects[2] =
    '<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]' +
    '/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>' +
    '/Annots[7 0 R 8 0 R]>>'
  objects[3] = `<</Length ${Buffer.byteLength(stream, 'latin1')}>>\nstream\n${stream}\nendstream`
  objects[4] = '<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>'
  objects[5] = '<</Fields[7 0 R 8 0 R]/NeedAppearances true>>'
  objects[6] =
    '<</Type/Annot/Subtype/Widget/FT/Tx/T(text)/V()' +
    '/Rect[170 734 430 756]/F 4/DA(/F1 12 Tf 0 g)/Border[0 0 1]>>'
  objects[7] =
    '<</Type/Annot/Subtype/Widget/FT/Btn/T(checkbox)/V/Off/AS/Off' +
    '/Rect[170 701 188 719]/F 4/MK<</BC[0 0 0]>>>>'
  return buildPdf(objects)
}

function makeImagePdf() {
  const objects = []
  objects[0] = '<</Type/Catalog/Pages 2 0 R>>'
  const colors = [
    [0.86, 0.2, 0.27],
    [0.16, 0.5, 0.9],
  ]
  const pageRefs = []
  let nextObjNo = 3
  for (let pageIndex = 0; pageIndex < colors.length; pageIndex++) {
    const [r, g, b] = colors[pageIndex]
    const draw = `${r} ${g} ${b} rg\n40 40 532 712 re f\n1 1 1 rg\n90 360 432 80 re f\n`
    const contentObjNo = nextObjNo++
    const pageObjNo = nextObjNo++
    objects[contentObjNo - 1] =
      `<</Length ${Buffer.byteLength(draw, 'latin1')}>>\nstream\n${draw}\nendstream`
    objects[pageObjNo - 1] =
      `<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents ${contentObjNo} 0 R/Resources<<>>>>`
    pageRefs.push(`${pageObjNo} 0 R`)
  }
  objects[1] = `<</Type/Pages/Kids[${pageRefs.join(' ')}]/Count ${colors.length}>>`
  return buildPdf(objects)
}

const RC4_PAD = Buffer.from([
  0x28, 0xbf, 0x4e, 0x5e, 0x4e, 0x75, 0x8a, 0x41, 0x64, 0x00, 0x4e, 0x56, 0xff, 0xfa, 0x01, 0x08,
  0x2e, 0x2e, 0x00, 0xb6, 0xd0, 0x68, 0x3e, 0x80, 0x2f, 0x0c, 0xa9, 0xfe, 0x64, 0x53, 0x69, 0x7a,
])

function rc4(key, data) {
  const state = Array.from({ length: 256 }, (_, i) => i)
  let j = 0
  for (let i = 0; i < 256; i++) {
    j = (j + state[i] + key[i % key.length]) & 255
    ;[state[i], state[j]] = [state[j], state[i]]
  }
  const output = Buffer.alloc(data.length)
  let a = 0
  let b = 0
  for (let index = 0; index < data.length; index++) {
    a = (a + 1) & 255
    b = (b + state[a]) & 255
    ;[state[a], state[b]] = [state[b], state[a]]
    output[index] = data[index] ^ state[(state[a] + state[b]) & 255]
  }
  return output
}

function makeProtectedPdf(password = 'test') {
  const hex = (bytes) => bytes.toString('hex').toUpperCase()
  const md5 = (bytes) => createHash('md5').update(bytes).digest()
  const pad = (pwd) => Buffer.concat([Buffer.from(pwd, 'latin1'), RC4_PAD]).subarray(0, 32)
  const ownerEntry = rc4(md5(pad(password)).subarray(0, 5), pad(password))
  const permissions = -44
  const pBuf = Buffer.alloc(4)
  pBuf.writeInt32LE(permissions, 0)
  const id = Buffer.from('vue-pdfz', 'latin1').subarray(0, 16)
  const fileKey = md5(Buffer.concat([pad(password), ownerEntry, pBuf, id])).subarray(0, 5)
  const userEntry = rc4(fileKey, RC4_PAD)
  const objectKey = (num) => {
    const ext = Buffer.concat([
      fileKey,
      Buffer.from([num & 255, (num >> 8) & 255, (num >> 16) & 255, 0, 0]),
    ])
    return md5(ext).subarray(0, fileKey.length + 5)
  }
  const content = rc4(
    objectKey(5),
    Buffer.from(getTextContentStream(['Protected Document']), 'latin1'),
  )
  const objects = [
    '<</Type/Catalog/Pages 2 0 R>>',
    '<</Type/Pages/Kids[4 0 R]/Count 1>>',
    '<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>',
    '<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 5 0 R/Resources<</Font<</F1 3 0 R>>>>>>',
    Buffer.concat([
      Buffer.from(`<</Length ${content.length}>>\nstream\n`, 'latin1'),
      content,
      Buffer.from('\nendstream', 'latin1'),
    ]),
    `<</Filter/Standard/V 1/R 2/O <${hex(ownerEntry)}>/U <${hex(userEntry)}>/P ${permissions}>>`,
  ]
  const idHex = hex(id)
  return buildPdf(objects, { trailerExtra: `/Encrypt 6 0 R/ID[<${idHex}><${idHex}>]` })
}

function makeBrokenPdf() {
  return Buffer.from(
    '%PDF-1.7\n% Intentionally corrupt sample - used to exercise the error state.\n%%EOF',
    'latin1',
  )
}

const outDir = resolve(dirname(fileURLToPath(import.meta.url)), 'public/samples')
mkdirSync(outDir, { recursive: true })
writeFileSync(resolve(outDir, 'sample-text.pdf'), makeTextPdf())
writeFileSync(resolve(outDir, 'sample-long.pdf'), makeTextPdf(40))
writeFileSync(resolve(outDir, 'sample-form.pdf'), makeFormPdf())
writeFileSync(resolve(outDir, 'sample-image.pdf'), makeImagePdf())
writeFileSync(resolve(outDir, 'sample-protected.pdf'), makeProtectedPdf())
writeFileSync(resolve(outDir, 'sample-broken.pdf'), makeBrokenPdf())
console.log('Sample PDFs written to', outDir)
