import { EcosystemProject } from '../types';

/**
 * Central site configuration and single source of truth for canonical domains,
 * metadata, academic publication settings, and connected ecosystem projects.
 */
export const SITE_CONFIG = {
  domain: 'https://drinkbeer228.github.io/elephantology',
  basePath: '/elephantology',
  name: 'Слонология',
  nameEn: 'Elephantology',
  subtitleCode: 'Proboscidea',
  title: '«Слонология» | Академическая цифровая энциклопедия о слонах',
  titleEn: 'Elephantology | Academic Digital Encyclopedia on Proboscidea',
  description:
    '«Слонология» — академическая цифровая энциклопедия о слонах, объединяющая систематизированные материалы по биологии, анатомии, поведению, экологии, ветеринарии, эволюции и охране Elephantidae.',
  descriptionEn:
    'Elephantology is an academic digital encyclopedia on Proboscidea, synthesizing structured research across biology, anatomy, ethology, ecology, veterinary medicine, evolution, and conservation.',
  publisher: {
    name: 'Академическая Лига Слонологии',
    nameEn: 'Elephantology Research Guild',
    url: 'https://drinkbeer228.github.io/elephantology/',
    logo: 'https://drinkbeer228.github.io/elephantology/favicon.png',
  },
  defaultOgImage: 'https://drinkbeer228.github.io/elephantology/favicon.png',
};

export const ECOSYSTEM_PROJECTS: EcosystemProject[] = [
  {
    id: 'research-station',
    nameRu: 'Research Station',
    nameEn: 'Research Station',
    roleBadgeRu: 'Вход',
    roleBadgeEn: 'Hub',
    descriptionRu: 'Центральная интерактивная станция и карта кампуса',
    descriptionEn: 'Central campus environment connecting all stations',
    url: 'https://drinkbeer228.github.io/research-station/',
    isCurrent: false,
  },
  {
    id: 'elephantology',
    nameRu: 'Слонология',
    nameEn: 'Elephantology',
    roleBadgeRu: 'Вы здесь',
    roleBadgeEn: 'Active',
    descriptionRu: 'Академическая энциклопедия и архив монографий',
    descriptionEn: 'Academic encyclopedia & systematic monograph archive',
    url: 'https://drinkbeer228.github.io/elephantology/',
    isCurrent: true,
  },
  {
    id: 'elephantorina',
    nameRu: 'Слоноторина',
    nameEn: 'Elephantorina',
    roleBadgeRu: 'Обучение',
    roleBadgeEn: 'Coursework',
    descriptionRu: 'Образовательная платформа, учебные треки и практикум',
    descriptionEn: 'Educational platform, structured tracks & field cases',
    url: 'https://drinkbeer228.github.io/elephantorina/',
    isCurrent: false,
  },
];
