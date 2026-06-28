import type { LocaleMessages } from '../../types'

export const fr: LocaleMessages = {
  previousPage: 'Page précédente',
  nextPage: 'Page suivante',
  goToPage: 'Aller à la page',

  zoomIn: 'Zoom avant',
  zoomOut: 'Zoom arrière',
  zoomLevel: 'Niveau de zoom',
  fitAuto: 'Auto',
  fitPage: 'Ajuster la page',
  fitWidth: 'Ajuster la largeur',
  zoomPercent: '{percent} %',

  rotateClockwise: 'Pivoter dans le sens horaire',
  toggleThumbnails: 'Afficher/masquer les miniatures',
  print: 'Imprimer',
  download: 'Télécharger',
  search: 'Rechercher',
  closeSearch: 'Fermer la recherche',
  more: 'Plus',

  thumbnailsTitle: 'Miniatures',
  thumbnailLabel: 'Page {page}',

  searchPlaceholder: 'Rechercher',
  searchPrevious: 'Résultat précédent',
  searchNext: 'Résultat suivant',
  caseSensitive: 'Respecter la casse',
  entireWord: 'Mot entier',
  matchesCount: '{current} sur {total}',
  noMatches: 'Aucun résultat',

  loading: 'Chargement…',
  empty: 'Aucun document à afficher',

  errorTitle: "Impossible d'afficher le document",
  errorGeneric: "Une erreur inattendue s'est produite lors du chargement du document.",
  errorInvalidPdf: "Le fichier n'est pas un document PDF valide.",
  errorMissingPdf: 'Le document est introuvable.',
  errorNetwork: "Une erreur réseau s'est produite lors du chargement du document.",
  errorWorker: 'Le worker de rendu PDF a échoué au démarrage.',
  errorRender: "La page n'a pas pu être affichée.",
  retry: 'Réessayer',

  passwordTitle: 'Mot de passe requis',
  passwordPrompt: 'Ce document est protégé par un mot de passe. Veuillez le saisir.',
  passwordPlaceholder: 'Mot de passe',
  passwordSubmit: 'Déverrouiller',
  passwordIncorrect: 'Mot de passe incorrect. Veuillez réessayer.',

  documentLabel: 'Document PDF',
  toolbarLabel: 'Barre d’outils du lecteur PDF',
  pageChanged: 'Page {page} sur {total}',
  zoomChanged: 'Zoom {percent} %',
}
