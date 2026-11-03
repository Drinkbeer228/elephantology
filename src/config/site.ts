/**
 * Central site configuration and single source of truth for canonical domains,
 * metadata, and academic publication settings.
 */

// Default origin matches the current GitHub Pages PROJECT site
// (https://<owner>.github.io/<repo>). Override via VITE_SITE_ORIGIN at build
// time when deploying elsewhere (custom domain, user-site, Render, etc.).
const DEFAULT_ORIGIN = 'https://drinkbeer228.github.io/elephantology';

export const SITE_CONFIG = {
  // Canonical origin used for og/canonical fallbacks.
  domain: import.meta.env.VITE_SITE_ORIGIN || DEFAULT_ORIGIN,
  name: 'Слонология',
  nameEn: 'Elephantology',
  title: '«Слонология» | Академическая цифровая энциклопедия о слонах',
  titleEn: 'Elephantology | Academic Digital Encyclopedia on Proboscidea',
  description: '«Слонология» — академическая цифровая энциклопедия о слонах, объединяющая систематизированные материалы по биологии, анатомии, поведению, экологии, ветеринарии, эволюции и охране Elephantidae.',
  descriptionEn: 'Elephantology is an academic digital encyclopedia on Proboscidea, synthesizing structured research across biology, anatomy, ethology, ecology, veterinary medicine, evolution, and conservation.',
  publisher: {
    name: 'Академическая Лига Слонологии',
    nameEn: 'Elephantology Research Guild',
    url: DEFAULT_ORIGIN,
    logo: `${DEFAULT_ORIGIN}/icons/icon.svg`
  },
  defaultOgImage: `${DEFAULT_ORIGIN}/assets/images/og-home-elephants.jpg`
};
