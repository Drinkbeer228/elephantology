export {
  normalizeDoi,
  formatDoiUrl,
  slugifyHeading,
  cleanArticleMarkdownBody,
  extractTocFromMarkdown,
  buildEnrichedReferences,
} from './referenceService';

export {
  getGlossaryEntryByKey,
  getAllGlossaryEntries,
  segmentTextWithGlossary,
} from './glossaryService';
export type { TextSegment } from './glossaryService';

export {
  getCatalogDisciplines,
  getFeaturedMonographs,
  resolveRelatedArticles,
  resolveInternalCrossReference,
  resolvePublicAssetUrl,
  getPreparedArticle,
} from './articleService';

export {
  getPopularSearchTags,
  queryKnowledgeBase,
} from './searchService';
export type { SearchFilterOptions } from './searchService';
