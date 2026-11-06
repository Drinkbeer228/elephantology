import {
  ArticleSummary,
  DisciplineSubCluster,
  FoundationalMonograph,
  GlossaryTermEntry,
} from '../types';
import { getKnowledgeArticleEntries } from './documentLoader';
import { parseFrontmatter } from './frontmatterParser';
import { ARTICLE_TRANSLATIONS_EN } from '../lib/articleTranslations';
import { ACADEMIC_CATEGORIES, CategoryDef } from '../data/categories';
import rawGlossaryData from '../data/glossary.json';

/**
 * Content Layer: Structured Collections for Articles, Categories, Glossary & Foundational Monographs
 */

const cachedArticlesByLang: Record<string, ArticleSummary[]> = {};

export function getArticleCollection(lang?: string): ArticleSummary[] {
  const key = lang === 'en' ? 'en' : 'ru';
  if (!cachedArticlesByLang[key]) {
    cachedArticlesByLang[key] = buildArticleCollection(key);
  }
  return cachedArticlesByLang[key];
}

function buildArticleCollection(lang: 'ru' | 'en'): ArticleSummary[] {
  const isEn = lang === 'en';
  const entries = getKnowledgeArticleEntries();

  return entries.map(([filePath, rawText]) => {
    const { metadata, content: cleanContent } = parseFrontmatter(rawText);

    let category = metadata.category;
    if (!category) {
      const parts = filePath.split('/');
      if (parts.length >= 3) {
        category = parts[parts.length - 2];
      }
    }

    let title = metadata.title;
    if (!title) {
      const filename = filePath.split('/').pop() || '';
      title = filename.replace('.md', '').replace(/_/g, ' ');
      title = title.charAt(0).toUpperCase() + title.slice(1);
    }

    const filename = filePath.split('/').pop() || '';
    const pathPart = category ? `${category}/${filename}` : filename;
    const cleanKey = pathPart.replace(/\.md$/, '');

    const translation = ARTICLE_TRANSLATIONS_EN[cleanKey];
    const finalTitle = isEn && translation?.title ? translation.title : title;
    const rawExcerpt =
      isEn && translation?.excerpt ? translation.excerpt : metadata.excerpt || '';
    const finalExcerpt = rawExcerpt.replace(/\s+\d+(?=[.,;:])/g, '').trim();
    const finalTags = isEn && translation?.tags ? translation.tags : metadata.tags || [];
    const readingTimeMin = metadata.readingTimeMin || 5;

    return {
      path: pathPart,
      filename,
      title: finalTitle,
      excerpt: finalExcerpt,
      category: category || '',
      tags: finalTags,
      related_knowledge: metadata.related_knowledge || [],
      reading_time_min: readingTimeMin,
      readingTime: isEn ? `${readingTimeMin} min` : `${readingTimeMin} мин`,
      evidenceLevel: metadata.evidenceLevel || '',
      evidence_level: metadata.evidenceLevel || '',
      difficulty: metadata.difficulty || '',
      lastReviewed: metadata.lastReviewed || '',
      content: cleanContent,
    };
  });
}

export function getDisciplineCategories(): CategoryDef[] {
  return ACADEMIC_CATEGORIES;
}

export const DISCIPLINE_SUBCLUSTERS: Record<string, DisciplineSubCluster[]> = {
  taxonomy: [
    {
      id: 'early',
      labelRu: 'Базальные группы и филогения',
      labelEn: 'Basal Groups & Phylogeny',
      keywords: ['early', 'phylogeny', 'trunk-evolution', 'deinotheriidae', 'gomphotheriidae'],
    },
    {
      id: 'crown',
      labelRu: 'Мастодонты, мамонты и палеолоксодоны',
      labelEn: 'Mastodons, Mammoths & Palaeoloxodon',
      keywords: ['mammuthus', 'mammutidae', 'palaeoloxodon'],
    },
  ],
  anatomy: [
    {
      id: 'musculoskeletal',
      labelRu: 'Опорно-двигательный аппарат и череп',
      labelEn: 'Musculoskeletal & Cranial',
      keywords: ['skeletal', 'muscular-hydrostat', 'integumentary'],
    },
    {
      id: 'visceral',
      labelRu: 'Висцеральные системы и сенсорика',
      labelEn: 'Visceral Systems & Sensory',
      keywords: [
        'cardiovascular',
        'respiratory',
        'digestive',
        'microbiome',
        'urogenital',
        'sensory',
      ],
    },
  ],
  ethogram: [
    {
      id: 'social',
      labelRu: 'Социальная организация и репродукция',
      labelEn: 'Social Structure & Reproduction',
      keywords: ['fission-fusion', 'aggression', 'musth', 'inbreeding', 'catalogue'],
    },
    {
      id: 'comm',
      labelRu: 'Инфразвук, сейсмика и хеморецепция',
      labelEn: 'Infrasound, Seismics & Olfaction',
      keywords: ['seismic', 'chemosensory', 'trauma'],
    },
  ],
  ecology: [
    {
      id: 'trophic',
      labelRu: 'Трофика, биоценоз и терморегуляция',
      labelEn: 'Foraging, Biocoenosis & Thermoregulation',
      keywords: ['feeding', 'engineers', 'thermoregulation', 'climate', 'paleoecology'],
    },
    {
      id: 'life',
      labelRu: 'Онтогенез, долголетие и устойчивость',
      labelEn: 'Ontogeny, Longevity & Breakdown',
      keywords: ['ontogeny', 'cancer', 'breakdown'],
    },
  ],
};

const FOUNDATIONAL_MONOGRAPH_DEFS = [
  {
    path: 'taxonomy/proboscidea-evolution-and-phylogeny.md',
    code: '01 · TAXONOMY',
    titleRu: 'Филогения и макроэволюция отряда Proboscidea',
    titleEn: 'Phylogeny & Macroevolution of Proboscidea',
    summaryRu:
      '60 млн лет эволюции от палеоценового Eritherium до современных родов Loxodonta и Elephas.',
    summaryEn:
      '60 million years of radiation from Paleocene Eritherium to extant Loxodonta and Elephas.',
  },
  {
    path: 'anatomy/muscular-hydrostat-and-trunk-biomechanics.md',
    code: '03 · ANATOMY',
    titleRu: 'Мышечный гидростат и биомеханика хобота',
    titleEn: 'Muscular Hydrostat & Trunk Biomechanics',
    summaryRu:
      'Архитектоника мышечных пучков, изоволюметрическая деформация и нейросенсорный контроль.',
    summaryEn:
      'Fascicle architecture, isovolumetric mechanics, and trigeminal-facial motor control.',
  },
  {
    path: 'cognition/neuroanatomy-brain-architecture-and-memory.md',
    code: '05 · COGNITION',
    titleRu: 'Нейроанатомия, архитектура мозга и память',
    titleEn: 'Neuroanatomy, Brain Architecture & Memory',
    summaryRu:
      'Цитоархитектоника коры, гиппокампальный комплекс, нейроны фон Экономо и долговременная память.',
    summaryEn:
      'Cortical cytoarchitectonics, hippocampal volume, von Economo neurons, and spatial memory.',
  },
  {
    path: 'ecology/comparative-genomics-and-cancer-resistance.md',
    code: '07 · ECOLOGY & GENOMICS',
    titleRu: 'Парадокс Пето и противоопухолевая защита (TP53 / LIF6)',
    titleEn: 'Peto’s Paradox & Cancer Resistance (TP53 / LIF6)',
    summaryRu: '20 копий гена TP53, реанимированный псевдоген LIF6 и механизмы апоптоза.',
    summaryEn:
      'Retroduplicated TP53 repertoire, refunctionalized LIF6 pseudogene, and DNA damage response.',
  },
];

export function getFoundationalMonographs(lang?: string): FoundationalMonograph[] {
  const isEn = lang === 'en';
  return FOUNDATIONAL_MONOGRAPH_DEFS.map((item) => ({
    path: item.path,
    code: item.code,
    title: isEn ? item.titleEn : item.titleRu,
    summary: isEn ? item.summaryEn : item.summaryRu,
  }));
}

export function getGlossaryTermEntries(): GlossaryTermEntry[] {
  const dict = rawGlossaryData as Record<
    string,
    {
      term: string;
      full: string;
      definition: { ru: string; en: string };
      category: { ru: string; en: string };
      annotate?: boolean;
    }
  >;
  return Object.entries(dict).map(([key, val]) => ({
    key,
    term: val.term,
    fullRu: val.full || val.term,
    fullEn: val.full || val.term,
    defRu: val.definition?.ru || '',
    defEn: val.definition?.en || '',
    categoryRu: val.category?.ru || '',
    categoryEn: val.category?.en || '',
  }));
}

