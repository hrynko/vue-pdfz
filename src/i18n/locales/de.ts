import type { LocaleMessages } from '../../types'

export const de: LocaleMessages = {
  previousPage: 'Vorherige Seite',
  nextPage: 'Nächste Seite',
  goToPage: 'Zur Seite springen',

  zoomIn: 'Vergrößern',
  zoomOut: 'Verkleinern',
  zoomLevel: 'Zoomstufe',
  fitAuto: 'Automatisch',
  fitPage: 'Seite anpassen',
  fitWidth: 'Breite anpassen',
  zoomPercent: '{percent} %',

  rotateClockwise: 'Im Uhrzeigersinn drehen',
  toggleThumbnails: 'Miniaturansichten umschalten',
  print: 'Drucken',
  download: 'Herunterladen',
  search: 'Suchen',
  closeSearch: 'Suche schließen',
  more: 'Mehr',

  thumbnailsTitle: 'Miniaturansichten',
  thumbnailLabel: 'Seite {page}',

  searchPlaceholder: 'Suchen',
  searchPrevious: 'Vorheriger Treffer',
  searchNext: 'Nächster Treffer',
  caseSensitive: 'Groß-/Kleinschreibung',
  entireWord: 'Ganzes Wort',
  matchesCount: '{current} von {total}',
  noMatches: 'Keine Treffer',

  loading: 'Wird geladen…',
  empty: 'Kein Dokument zum Anzeigen',

  errorTitle: 'Dokument konnte nicht angezeigt werden',
  errorGeneric: 'Beim Laden des Dokuments ist ein unerwarteter Fehler aufgetreten.',
  errorInvalidPdf: 'Die Datei ist kein gültiges PDF-Dokument.',
  errorMissingPdf: 'Das Dokument wurde nicht gefunden.',
  errorNetwork: 'Beim Laden des Dokuments ist ein Netzwerkfehler aufgetreten.',
  errorWorker: 'Der PDF-Worker konnte nicht gestartet werden.',
  errorRender: 'Die Seite konnte nicht gerendert werden.',
  retry: 'Erneut versuchen',

  passwordTitle: 'Passwort erforderlich',
  passwordPrompt: 'Dieses Dokument ist passwortgeschützt. Bitte geben Sie das Passwort ein.',
  passwordPlaceholder: 'Passwort',
  passwordSubmit: 'Entsperren',
  passwordIncorrect: 'Falsches Passwort. Bitte versuchen Sie es erneut.',

  documentLabel: 'PDF-Dokument',
  toolbarLabel: 'PDF-Viewer-Symbolleiste',
  pageChanged: 'Seite {page} von {total}',
  zoomChanged: 'Zoom {percent} %',
}
