import { ArticleItem } from './searchEngine';
import { parseFrontmatter } from './markdown';
import { ARTICLE_TRANSLATIONS_EN } from './articleTranslations';
import { translateMarkdownToEnglish } from './translateMarkdown';

const legacyMap: Record<string, string> = {
  "respiratory_system": "anatomy/respiratory-system-and-vocal-tract",
  "foot_care": "veterinary/clinical-podiatry-and-foot-care",
  "foot_care_protocol": "veterinary/clinical-podiatry-and-foot-care",
  "integumentary_system": "anatomy/integumentary-system-and-skin-morphology",
  "muscular_hydrostat": "anatomy/muscular-hydrostat-and-trunk-biomechanics",
  "skeletal_system_cranial": "anatomy/skeletal-system-cranial-and-dentition",
  "skeletal_system_appendicular": "anatomy/skeletal-system-appendicular-and-biomechanics",
  "sensory_umwelt": "anatomy/sensory-umwelt-and-multimodal-perception",
  "digestive_system": "anatomy/digestive-system-macroanatomy-and-vascularization",
  "urogenital_system": "anatomy/urogenital-system-and-reproductive-anatomy",
  "chemosensory_communication": "ethogram/chemosensory-communication-and-vomeronasal-system",
  "cognitive_architecture": "cognition/cognitive-architecture-and-self-awareness",
  "seismic_communication": "ethogram/seismic-and-infrasonic-communication",
  "acoustic_patterns": "ethogram/seismic-and-infrasonic-communication",
  "aggression_patterns": "ethogram/aggression-dominance-and-reconciliation",
  "social_patterns": "ethogram/fission-fusion-social-structure",
  "taxonomy_evolution": "taxonomy/proboscidea-evolution-and-phylogeny",
  "orphan_calf_rehabilitation": "veterinary/elephant-neonatology-and-calves",
  "eehv_protocol": "veterinary/eehv-endotheliotropic-herpesvirus-protocols",
  "musth_and_temporal_gland": "ethogram/musth-ethology-and-endocrinology"
};

export function resolveArticlePath(requestedPath: string, modulesKeys: string[]): string | null {
  if (!requestedPath) return null;
  const clean = requestedPath
    .replace(/^https?:\/\/[^\/]+/, '')
    .split('#')[0]
    .split('?')[0]
    .replace(/^(\.\.\/)+/, '')
    .replace(/^\.\//, '')
    .replace(/^\//, '')
    .replace(/^docs\//, '')
    .replace(/\.md$/, '')
    .trim();

  if (!clean) return null;

  // 1. Direct legacy / alias map
  if (legacyMap[clean]) {
    const target = legacyMap[clean];
    const found = modulesKeys.find(k => k.includes(target));
    if (found) return found;
  }
  const cleanBase = clean.split('/').pop() || '';
  if (legacyMap[cleanBase]) {
    const target = legacyMap[cleanBase];
    const found = modulesKeys.find(k => k.includes(target));
    if (found) return found;
  }

  // 2. Exact match in module keys
  const exact = modulesKeys.find(k => {
    const rel = k.replace(/^\/docs\//, '').replace(/\.md$/, '');
    return rel === clean || rel.toLowerCase() === clean.toLowerCase();
  });
  if (exact) return exact;

  // 3. Key ends with `/clean.md`
  const endsWith = modulesKeys.find(k => {
    const rel = k.replace(/^\/docs\//, '').replace(/\.md$/, '');
    return rel.endsWith(`/${clean}`) || rel.toLowerCase().endsWith(`/${clean.toLowerCase()}`);
  });
  if (endsWith) return endsWith;

  // 4. Base filename matching (with underscore/dash normalization)
  const normCleanBase = cleanBase.toLowerCase().replace(/_/g, '-');
  const baseMatch = modulesKeys.find(k => {
    const kFilename = k.split('/').pop()?.replace(/\.md$/, '').toLowerCase() || '';
    return kFilename === normCleanBase || kFilename.replace(/_/g, '-') === normCleanBase;
  });
  if (baseMatch) return baseMatch;

  // 5. Prefix / substring match
  const subMatch = modulesKeys.find(k => {
    const kFilename = k.split('/').pop()?.replace(/\.md$/, '').toLowerCase().replace(/_/g, '-') || '';
    return kFilename.startsWith(normCleanBase) || normCleanBase.startsWith(kFilename) || kFilename.includes(normCleanBase) || normCleanBase.includes(kFilename);
  });
  if (subMatch) return subMatch;

  // 6. Multi-word fuzzy match on slug
  const words = normCleanBase.split('-').filter(w => w.length > 2);
  if (words.length > 0) {
    let bestKey: string | null = null;
    let bestScore = 0;
    for (const k of modulesKeys) {
      const kBase = k.split('/').pop()?.replace(/\.md$/, '').toLowerCase().replace(/_/g, '-') || '';
      const matchCount = words.filter(w => kBase.includes(w)).length;
      if (matchCount > bestScore) {
        bestScore = matchCount;
        bestKey = k;
      }
    }
    if (bestScore >= 2 || (words.length === 1 && bestScore === 1)) {
      return bestKey;
    }
  }

  return null;
}

export const MODULES_CACHE = import.meta.glob('/docs/**/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;

// Pre-rendered full LLM translations (produced by scripts/translate-articles.mjs).
// Empty object until docs_en/ exists — all consumers must fall back gracefully.
export const MODULES_CACHE_EN = import.meta.glob('/docs_en/**/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;

/** Strip the leading /docs_en/ prefix to get a key aligned with docs-relative slugs. */
export function enKeyToSlug(key: string): string {
  return key.replace(/^\/docs_en\//, '').replace(/\.md$/, '');
}

export function hasFullEnTranslation(): boolean {
  return Object.keys(MODULES_CACHE_EN).length > 0;
}

/** Raw markdown of the full EN translation for a docs-relative path (with or without .md), or null. */
export function getEnArticleRaw(requestedPath: string): string | null {
  const keys = Object.keys(MODULES_CACHE_EN);
  if (keys.length === 0) return null;
  const matched = resolveArticlePath(requestedPath, keys);
  return matched ? MODULES_CACHE_EN[matched] : null;
}

const cachedArticles: Record<string, ArticleItem[]> = {};

function computeArticles(lang?: string): ArticleItem[] {
  const isEn = lang === 'en';
  // Prefer full LLM translations (docs_en/) when available; fall back to the
  // RU corpus + dictionary translation otherwise.
  const sourceCache = (isEn && Object.keys(MODULES_CACHE_EN).length > 0) ? MODULES_CACHE_EN : MODULES_CACHE;

  return Object.entries(sourceCache)
    .filter(([filePath]) => 
      !filePath.includes('/assets/') &&
      !filePath.endsWith('index.md') && 
      !filePath.endsWith('glossary.md') && 
      !filePath.endsWith('bibliography.md')
    )
    .map(([filePath, contentObj]) => {
    const textContent = typeof contentObj === 'string' ? contentObj : (contentObj as any).default || '';
    const { metadata, content: cleanContent } = parseFrontmatter(textContent);

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

    // Check for English translation
    const translation = ARTICLE_TRANSLATIONS_EN[cleanKey];
    const finalTitle = (isEn && translation?.title) ? translation.title : title;
    const finalExcerpt = (isEn && translation?.excerpt) ? translation.excerpt : (metadata.excerpt || '');
    const finalTags = (isEn && translation?.tags) ? translation.tags : (metadata.tags || []);
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
      // EN body: full LLM translation (docs_en/) when present — content is then
      // already English. Fallback: dictionary glossary over the RU source, so
      // search by English terms still matches (+15 score for content).
      content: (isEn && sourceCache === MODULES_CACHE_EN)
        ? cleanContent
        : (isEn ? translateMarkdownToEnglish(cleanContent) : cleanContent)
    };
  });
}

export function getStaticArticles(lang?: string): ArticleItem[] {
  const key = lang || 'ru';
  if (!cachedArticles[key]) {
    cachedArticles[key] = computeArticles(lang);
  }
  return cachedArticles[key];
}
