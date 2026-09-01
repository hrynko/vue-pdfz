import type { LocaleMessages } from '../../types'

export const en: LocaleMessages = {
  previousPage: 'Previous page',
  nextPage: 'Next page',
  goToPage: 'Go to page',

  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  zoomLevel: 'Zoom level',
  fitAuto: 'Auto',
  fitPage: 'Fit page',
  fitWidth: 'Fit width',
  zoomPercent: '{percent}%',

  rotateClockwise: 'Rotate clockwise',
  toggleThumbnails: 'Toggle thumbnails',
  print: 'Print',
  download: 'Download',
  search: 'Search',
  closeSearch: 'Close search',
  more: 'More',

  thumbnailsTitle: 'Thumbnails',
  thumbnailLabel: 'Page {page}',

  searchPlaceholder: 'Search',
  searchPrevious: 'Previous match',
  searchNext: 'Next match',
  caseSensitive: 'Match case',
  entireWord: 'Whole word',
  matchesCount: '{current} of {total}',
  noMatches: 'No matches',

  loading: 'Loading…',
  empty: 'No document to display',

  errorTitle: 'Could not display the document',
  errorGeneric: 'An unexpected error occurred while loading the document.',
  errorInvalidPdf: 'The file is not a valid PDF document.',
  errorMissingPdf: 'The document could not be found.',
  errorNetwork: 'A network error occurred while loading the document.',
  errorWorker: 'The PDF rendering worker failed to start.',
  errorRender: 'The page could not be rendered.',
  retry: 'Retry',

  passwordTitle: 'Password required',
  passwordPrompt: 'This document is password protected. Please enter the password.',
  passwordPlaceholder: 'Password',
  passwordSubmit: 'Unlock',
  passwordIncorrect: 'Incorrect password. Please try again.',

  documentLabel: 'PDF document',
  toolbarLabel: 'PDF viewer toolbar',
  pageChanged: 'Page {page} of {total}',
  zoomChanged: 'Zoom {percent}%',
}
