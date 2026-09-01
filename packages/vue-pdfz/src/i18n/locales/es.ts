import type { LocaleMessages } from '../../types'

export const es: LocaleMessages = {
  previousPage: 'Página anterior',
  nextPage: 'Página siguiente',
  goToPage: 'Ir a la página',

  zoomIn: 'Acercar',
  zoomOut: 'Alejar',
  zoomLevel: 'Nivel de zoom',
  fitAuto: 'Auto',
  fitPage: 'Ajustar página',
  fitWidth: 'Ajustar ancho',
  zoomPercent: '{percent} %',

  rotateClockwise: 'Girar a la derecha',
  toggleThumbnails: 'Alternar miniaturas',
  print: 'Imprimir',
  download: 'Descargar',
  search: 'Buscar',
  closeSearch: 'Cerrar búsqueda',
  more: 'Más',

  thumbnailsTitle: 'Miniaturas',
  thumbnailLabel: 'Página {page}',

  searchPlaceholder: 'Buscar',
  searchPrevious: 'Coincidencia anterior',
  searchNext: 'Coincidencia siguiente',
  caseSensitive: 'Distinguir mayúsculas',
  entireWord: 'Palabra completa',
  matchesCount: '{current} de {total}',
  noMatches: 'Sin coincidencias',

  loading: 'Cargando…',
  empty: 'No hay documento para mostrar',

  errorTitle: 'No se pudo mostrar el documento',
  errorGeneric: 'Se produjo un error inesperado al cargar el documento.',
  errorInvalidPdf: 'El archivo no es un documento PDF válido.',
  errorMissingPdf: 'No se encontró el documento.',
  errorNetwork: 'Se produjo un error de red al cargar el documento.',
  errorWorker: 'No se pudo iniciar el worker de PDF.',
  errorRender: 'No se pudo renderizar la página.',
  retry: 'Reintentar',

  passwordTitle: 'Se requiere contraseña',
  passwordPrompt: 'Este documento está protegido con contraseña. Introdúzcala.',
  passwordPlaceholder: 'Contraseña',
  passwordSubmit: 'Desbloquear',
  passwordIncorrect: 'Contraseña incorrecta. Inténtelo de nuevo.',

  documentLabel: 'Documento PDF',
  toolbarLabel: 'Barra de herramientas del visor de PDF',
  pageChanged: 'Página {page} de {total}',
  zoomChanged: 'Zoom {percent} %',
}
