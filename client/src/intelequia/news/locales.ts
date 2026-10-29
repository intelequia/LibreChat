import type { TOptions } from 'i18next';
import type { TranslationKeys } from '~/hooks/useLocalize';
import useLocalize from '~/hooks/useLocalize';
import i18n from '~/locales/i18n';

i18n.addResourceBundle(
  'es',
  'intelequia-news',
  {
    com_intelequia_news_title: 'Novedades',
    com_intelequia_news_product: 'Intelewriter',
    com_intelequia_news_deployed: 'Versi\u00f3n desplegada: {{0}}',
    com_intelequia_news_empty: 'No hay novedades disponibles para esta versi\u00f3n.',
    com_intelequia_news_error: 'No se han podido cargar las novedades.',
    com_intelequia_news_source: 'Notas originales de la versi\u00f3n',
    com_intelequia_news_breaking: 'Cambios incompatibles',
  },
  true,
  true,
);

export function useNewsLocalize() {
  const localize = useLocalize();
  return (key: TranslationKeys, options?: TOptions) =>
    localize(key, { ...options, ns: 'intelequia-news' });
}
