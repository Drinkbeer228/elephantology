import {
  ArticleSummary,
  DisciplineCollection,
  FoundationalMonograph,
  PreparedArticleDocument,
  RelatedKnowledgeItem,
} from '../types';
import {
  resolveDocumentKey,
  getRawMarkdownByKey,
  parseFrontmatter,
  getArticleCollection,
  DISCIPLINE_SUBCLUSTERS,
  getFoundationalMonographs,
} from '../content';
import {
  cleanArticleMarkdownBody,
  extractTocFromMarkdown,
  buildEnrichedReferences,
} from './referenceService';
import { ARTICLE_TRANSLATIONS_EN } from '../lib/articleTranslations';
import { translateMarkdownBody } from '../lib/translateMarkdown';
import { getCategoryMeta } from '../data/categories';
import { SITE_CONFIG } from '../config/site';

/**
 * Content Service: Article Retrieval, Catalog Organization & Cross-Reference Resolution
 * Provides a clean, typed interface so UI components never depend on raw Markdown loading.
 */

export function getCatalogDisciplines(
  lang: 'ru' | 'en',
  translations?: any
): DisciplineCollection[] {
  const articles = getArticleCollection(lang);
  const categoryMeta = getCategoryMeta(translations);

  const groups: Record<string, ArticleSummary[]> = {};
  Object.keys(categoryMeta).forEach((cat) => {
    groups[cat] = [];
  });

  articles.forEach((article) => {
    const cat = article.category || 'other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(article);
  });

  Object.keys(groups).forEach((cat) => {
    groups[cat].sort((a, b) => {
      const aIsIdx = a.filename === 'index.md';
      const bIsIdx = b.filename === 'index.md';
      if (aIsIdx !== bIsIdx) return aIsIdx ? -1 : 1;
      return a.title.localeCompare(b.title, lang === 'en' ? 'en' : 'ru');
    });
  });

  const orderedCategories = Object.keys(categoryMeta).filter(
    (cat) => (groups[cat]?.length || 0) > 0
  );

  return orderedCategories.map((catId, idx) => ({
    id: catId,
    indexNumber: String(idx + 1).padStart(2, '0'),
    title: categoryMeta[catId]?.title || catId,
    description: categoryMeta[catId]?.description || '',
    articles: groups[catId] || [],
    subClusters: DISCIPLINE_SUBCLUSTERS[catId] || [],
  }));
}

export function getFeaturedMonographs(lang: 'ru' | 'en'): FoundationalMonograph[] {
  return getFoundationalMonographs(lang);
}

export function resolveRelatedArticles(
  relatedItems: Array<string | RelatedKnowledgeItem> | undefined,
  allArticles: ArticleSummary[]
): ArticleSummary[] {
  if (!relatedItems || relatedItems.length === 0) return [];

  const resolved = relatedItems
    .map((relItem) => {
      const rawPath = typeof relItem === 'string' ? relItem : relItem?.target || '';
      if (!rawPath) return undefined;
      const cleanRel = rawPath.replace(/\.md$/, '').replace(/^\//, '');
      return allArticles.find((art) => {
        const cleanArt = art.path.replace(/\.md$/, '').replace(/^\//, '');
        return (
          cleanArt === cleanRel ||
          cleanArt.endsWith(cleanRel) ||
          cleanRel.endsWith(cleanArt.split('/').pop() || '___')
        );
      });
    })
    .filter((a): a is ArticleSummary => Boolean(a));

  return Array.from(new Map(resolved.map((a) => [a.path, a])).values());
}

export function resolveInternalCrossReference(
  href: string,
  currentCategory?: string
): string | null {
  if (!href) return null;
  const isExternal =
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:');
  const isAsset =
    href.endsWith('.pdf') ||
    href.endsWith('.jpg') ||
    href.endsWith('.png') ||
    href.endsWith('.jpeg');

  if (isExternal || isAsset || href.startsWith('#')) {
    return null;
  }

  let candidate = href;
  if (!candidate.includes('/') && currentCategory) {
    candidate = `${currentCategory}/${candidate}`;
  }

  const resolvedKey = resolveDocumentKey(candidate);
  if (!resolvedKey) return null;
  return resolvedKey.replace(/^\/docs\//, '');
}

export function resolvePublicAssetUrl(urlOrPath: string): string {
  if (!urlOrPath) return '';
  if (
    urlOrPath.startsWith('http://') ||
    urlOrPath.startsWith('https://') ||
    urlOrPath.startsWith('data:')
  ) {
    return urlOrPath;
  }
  const base = SITE_CONFIG.basePath;
  if (urlOrPath.startsWith('/') && !urlOrPath.startsWith(`${base}/`)) {
    return `${base}${urlOrPath}`;
  }
  if (!urlOrPath.startsWith('/') && !urlOrPath.startsWith(`${base}/`)) {
    return `${base}/${urlOrPath}`;
  }
  return urlOrPath;
}

export function getPreparedArticle(
  articlePath: string,
  lang: 'ru' | 'en',
  translations?: any
): PreparedArticleDocument | null {
  const isEn = lang === 'en';
  const matchedKey = resolveDocumentKey(articlePath);
  if (!matchedKey) return null;

  const rawContent = getRawMarkdownByKey(matchedKey);
  const { metadata, content: cleanContent } = parseFrontmatter(rawContent);

  if (!metadata.category) {
    const parts = matchedKey.split('/');
    if (parts.length >= 3 && parts[parts.length - 2] !== 'docs') {
      metadata.category = parts[parts.length - 2];
    }
  }

  const filename = matchedKey.split('/').pop() || '';
  const cleanSlug = matchedKey.replace(/^\/docs\//, '').replace(/\.md$/, '');
  const enTranslation = isEn ? ARTICLE_TRANSLATIONS_EN[cleanSlug] : undefined;

  const title = enTranslation?.title || metadata.title || '';
  const rawExcerpt = enTranslation?.excerpt || metadata.excerpt || '';
  const excerpt = rawExcerpt.replace(/\s+\d+(?=[.,;:])/g, '').trim();
  const tags = enTranslation?.tags || metadata.tags || [];

  const cleanedRuBody = cleanArticleMarkdownBody(cleanContent);
  const bodyMarkdown = isEn ? translateMarkdownBody(cleanedRuBody) : cleanedRuBody;
  const toc = extractTocFromMarkdown(bodyMarkdown);

  // Check whether excerpt duplicates the opening paragraph
  let shouldShowLead = Boolean(excerpt && excerpt.length >= 25);
  if (shouldShowLead) {
    const firstPara = bodyMarkdown
      .split('\n\n')
      .map((p) => p.replace(/[#*`[\]^0-9()]/g, '').trim())
      .find((p) => p.length > 30);
    if (firstPara) {
      const normExcerpt = excerpt.slice(0, 45).toLowerCase();
      const normPara = firstPara.slice(0, 45).toLowerCase();
      if (normPara.startsWith(normExcerpt)) {
        shouldShowLead = false;
      }
    }
  }

  const baseRefs = metadata.structuredReferences || metadata.references || [];
  const references = buildEnrichedReferences(cleanContent, baseRefs);

  const allArticles = getArticleCollection(lang);
  const relatedArticles = resolveRelatedArticles(metadata.related_knowledge, allArticles);

  const normCurrent = cleanSlug;
  const currentIndex = allArticles.findIndex(
    (a) => a.path.replace(/\.md$/, '') === normCurrent
  );
  const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
  const nextArticle =
    currentIndex >= 0 && currentIndex < allArticles.length - 1
      ? allArticles[currentIndex + 1]
      : null;

  const category =
    metadata.category || (currentIndex >= 0 ? allArticles[currentIndex].category : '');
  const siblingArticles = category
    ? allArticles.filter((a) => a.category === category)
    : [];
  const currentIndexInCategory = siblingArticles.findIndex(
    (a) => a.path.replace(/\.md$/, '') === normCurrent
  );

  const categoryMeta = getCategoryMeta(translations);
  const categoryTitle = category
    ? categoryMeta[category]?.title || category
    : isEn
    ? 'Reference'
    : 'Справочник';

  const readingTimeMin = metadata.readingTimeMin || 5;
  const minReadSuffix = translations?.article?.minRead || (isEn ? 'min read' : 'мин чтения');
  const readingTime = `${readingTimeMin} ${minReadSuffix}`;

  return {
    path: `${cleanSlug}.md`,
    slug: cleanSlug,
    filename,
    category,
    categoryTitle,
    title,
    excerpt,
    shouldShowLead,
    tags,
    readingTime,
    readingTimeMin,
    evidenceLevel: metadata.evidenceLevel,
    evidenceBasis: metadata.evidenceBasis,
    difficulty: metadata.difficulty,
    lastReviewed: metadata.lastReviewed,
    keyFindings: metadata.keyFindings || [],
    confidenceLevel: metadata.confidenceLevel,
    reviewStatus: metadata.reviewStatus,
    uncertaintyNotes: metadata.uncertaintyNotes,
    bodyMarkdown,
    toc,
    references,
    relatedArticles,
    siblingArticles,
    currentIndexInCategory,
    prevArticle,
    nextArticle,
  };
}
