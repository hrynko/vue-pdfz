import type { LocaleMessages } from '../../types'

export const ko: LocaleMessages = {
  previousPage: '이전 페이지',
  nextPage: '다음 페이지',
  goToPage: '페이지로 이동',

  zoomIn: '확대',
  zoomOut: '축소',
  zoomLevel: '확대/축소 수준',
  fitAuto: '자동',
  fitPage: '페이지에 맞추기',
  fitWidth: '너비에 맞추기',
  zoomPercent: '{percent}%',

  rotateClockwise: '시계 방향으로 회전',
  toggleThumbnails: '썸네일 전환',
  print: '인쇄',
  download: '다운로드',
  search: '검색',
  closeSearch: '검색 닫기',
  more: '더 보기',

  thumbnailsTitle: '썸네일',
  thumbnailLabel: '{page}페이지',

  searchPlaceholder: '검색',
  searchPrevious: '이전 일치 항목',
  searchNext: '다음 일치 항목',
  caseSensitive: '대/소문자 구분',
  entireWord: '단어 단위',
  matchesCount: '{current} / {total}',
  noMatches: '일치 항목 없음',

  loading: '불러오는 중…',
  empty: '표시할 문서가 없습니다',

  errorTitle: '문서를 표시할 수 없습니다',
  errorGeneric: '문서를 불러오는 중 예기치 않은 오류가 발생했습니다.',
  errorInvalidPdf: '유효한 PDF 문서가 아닙니다.',
  errorMissingPdf: '문서를 찾을 수 없습니다.',
  errorNetwork: '문서를 불러오는 중 네트워크 오류가 발생했습니다.',
  errorWorker: 'PDF 렌더링 작업자를 시작하지 못했습니다.',
  errorRender: '페이지를 렌더링할 수 없습니다.',
  retry: '다시 시도',

  passwordTitle: '비밀번호 필요',
  passwordPrompt: '이 문서는 비밀번호로 보호되어 있습니다. 비밀번호를 입력하세요.',
  passwordPlaceholder: '비밀번호',
  passwordSubmit: '잠금 해제',
  passwordIncorrect: '비밀번호가 올바르지 않습니다. 다시 시도하세요.',

  documentLabel: 'PDF 문서',
  toolbarLabel: 'PDF 뷰어 도구 모음',
  pageChanged: '{page} / {total} 페이지',
  zoomChanged: '확대/축소 {percent}%',
}
