/**
 * Central site configuration and single source of truth for canonical domains,
 * metadata, and academic publication settings.
 */

export const SITE_CONFIG = {
  // Canonical origin used for og/canonical fallbacks. Override via VITE_SITE_ORIGIN
  // at build time when deploying elsewhere (e.g. https://user.github.io/repo).
  domain: import.meta.env.VITE_SITE_ORIGIN || 'https://elephantology.github.io',
  name: 'Слонология',
  nameEn: 'Elephantology',
  title: '«Слонология» | Академическая цифровая энциклопедия о слонах',
  titleEn: 'Elephantology | Academic Digital Encyclopedia on Proboscidea',
  description: '«Слонология» — академическая цифровая энциклопедия о слонах, объединяющая систематизированные материалы по биологии, анатомии, поведению, экологии, ветеринарии, эволюции и охране Elephantidae.',
  descriptionEn: 'Elephantology is an academic digital encyclopedia on Proboscidea, synthesizing structured research across biology, anatomy, ethology, ecology, veterinary medicine, evolution, and conservation.',
  publisher: {
    name: 'Академическая Лига Слонологии',
    nameEn: 'Elephantology Research Guild',
    url: 'https://elephantology.github.io',
    logo: 'https://elephantology.github.io/icons/icon.svg'
  },
  defaultOgImage: 'https://elephantology.github.io/assets/images/og-home-elephants.jpg'
};
