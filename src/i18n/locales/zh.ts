import type { LocaleMessages } from '../../types'

export const zh: LocaleMessages = {
  previousPage: '上一页',
  nextPage: '下一页',
  goToPage: '转到页面',

  zoomIn: '放大',
  zoomOut: '缩小',
  zoomLevel: '缩放级别',
  fitAuto: '自动',
  fitPage: '适合页面',
  fitWidth: '适合宽度',
  zoomPercent: '{percent}%',

  rotateClockwise: '顺时针旋转',
  toggleThumbnails: '切换缩略图',
  print: '打印',
  download: '下载',
  search: '搜索',
  closeSearch: '关闭搜索',
  more: '更多',

  thumbnailsTitle: '缩略图',
  thumbnailLabel: '第 {page} 页',

  searchPlaceholder: '搜索',
  searchPrevious: '上一个匹配项',
  searchNext: '下一个匹配项',
  caseSensitive: '区分大小写',
  entireWord: '全字匹配',
  matchesCount: '{current} / {total}',
  noMatches: '无匹配项',

  loading: '正在加载…',
  empty: '没有可显示的文档',

  errorTitle: '无法显示文档',
  errorGeneric: '加载文档时发生意外错误。',
  errorInvalidPdf: '该文件不是有效的 PDF 文档。',
  errorMissingPdf: '找不到文档。',
  errorNetwork: '加载文档时发生网络错误。',
  errorWorker: 'PDF 渲染工作线程启动失败。',
  errorRender: '无法渲染页面。',
  retry: '重试',

  passwordTitle: '需要密码',
  passwordPrompt: '此文档受密码保护。请输入密码。',
  passwordPlaceholder: '密码',
  passwordSubmit: '解锁',
  passwordIncorrect: '密码错误。请重试。',

  documentLabel: 'PDF 文档',
  toolbarLabel: 'PDF 查看器工具栏',
  pageChanged: '第 {page} 页，共 {total} 页',
  zoomChanged: '缩放 {percent}%',
}
