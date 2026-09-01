import type { LocaleMessages } from '../../types'

export const ja: LocaleMessages = {
  previousPage: '前のページ',
  nextPage: '次のページ',
  goToPage: 'ページに移動',

  zoomIn: '拡大',
  zoomOut: '縮小',
  zoomLevel: 'ズームレベル',
  fitAuto: '自動',
  fitPage: 'ページに合わせる',
  fitWidth: '幅に合わせる',
  zoomPercent: '{percent}%',

  rotateClockwise: '時計回りに回転',
  toggleThumbnails: 'サムネイルの切り替え',
  print: '印刷',
  download: 'ダウンロード',
  search: '検索',
  closeSearch: '検索を閉じる',
  more: 'その他',

  thumbnailsTitle: 'サムネイル',
  thumbnailLabel: '{page} ページ',

  searchPlaceholder: '検索',
  searchPrevious: '前の一致',
  searchNext: '次の一致',
  caseSensitive: '大文字と小文字を区別',
  entireWord: '単語単位',
  matchesCount: '{current} / {total}',
  noMatches: '一致なし',

  loading: '読み込み中…',
  empty: '表示するドキュメントがありません',

  errorTitle: 'ドキュメントを表示できませんでした',
  errorGeneric: 'ドキュメントの読み込み中に予期しないエラーが発生しました。',
  errorInvalidPdf: 'このファイルは有効な PDF ドキュメントではありません。',
  errorMissingPdf: 'ドキュメントが見つかりませんでした。',
  errorNetwork: 'ドキュメントの読み込み中にネットワークエラーが発生しました。',
  errorWorker: 'PDF レンダリングワーカーの起動に失敗しました。',
  errorRender: 'ページをレンダリングできませんでした。',
  retry: '再試行',

  passwordTitle: 'パスワードが必要です',
  passwordPrompt: 'このドキュメントはパスワードで保護されています。パスワードを入力してください。',
  passwordPlaceholder: 'パスワード',
  passwordSubmit: 'ロック解除',
  passwordIncorrect: 'パスワードが正しくありません。もう一度お試しください。',

  documentLabel: 'PDF ドキュメント',
  toolbarLabel: 'PDF ビューアーのツールバー',
  pageChanged: '{page} / {total} ページ',
  zoomChanged: 'ズーム {percent}%',
}
