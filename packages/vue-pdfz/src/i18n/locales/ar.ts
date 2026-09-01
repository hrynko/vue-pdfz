import type { LocaleMessages } from '../../types'

export const ar: LocaleMessages = {
  previousPage: 'الصفحة السابقة',
  nextPage: 'الصفحة التالية',
  goToPage: 'الانتقال إلى الصفحة',

  zoomIn: 'تكبير',
  zoomOut: 'تصغير',
  zoomLevel: 'مستوى التكبير',
  fitAuto: 'تلقائي',
  fitPage: 'ملاءمة الصفحة',
  fitWidth: 'ملاءمة العرض',
  zoomPercent: '{percent}%',

  rotateClockwise: 'تدوير باتجاه عقارب الساعة',
  toggleThumbnails: 'تبديل الصور المصغّرة',
  print: 'طباعة',
  download: 'تنزيل',
  search: 'بحث',
  closeSearch: 'إغلاق البحث',
  more: 'المزيد',

  thumbnailsTitle: 'الصور المصغّرة',
  thumbnailLabel: 'صفحة {page}',

  searchPlaceholder: 'بحث',
  searchPrevious: 'النتيجة السابقة',
  searchNext: 'النتيجة التالية',
  caseSensitive: 'مطابقة حالة الأحرف',
  entireWord: 'كلمة كاملة',
  matchesCount: '{current} / {total}',
  noMatches: 'لا توجد نتائج',

  loading: 'جارٍ التحميل…',
  empty: 'لا يوجد مستند لعرضه',

  errorTitle: 'تعذّر عرض المستند',
  errorGeneric: 'حدث خطأ غير متوقع أثناء تحميل المستند.',
  errorInvalidPdf: 'الملف ليس مستند PDF صالحًا.',
  errorMissingPdf: 'تعذّر العثور على المستند.',
  errorNetwork: 'حدث خطأ في الشبكة أثناء تحميل المستند.',
  errorWorker: 'فشل بدء عملية معالجة PDF.',
  errorRender: 'تعذّر عرض الصفحة.',
  retry: 'إعادة المحاولة',

  passwordTitle: 'كلمة المرور مطلوبة',
  passwordPrompt: 'هذا المستند محمي بكلمة مرور. الرجاء إدخال كلمة المرور.',
  passwordPlaceholder: 'كلمة المرور',
  passwordSubmit: 'إلغاء القفل',
  passwordIncorrect: 'كلمة المرور غير صحيحة. حاول مرة أخرى.',

  documentLabel: 'مستند PDF',
  toolbarLabel: 'شريط أدوات عارض PDF',
  pageChanged: 'صفحة {page} من {total}',
  zoomChanged: 'التكبير {percent}%',
}
