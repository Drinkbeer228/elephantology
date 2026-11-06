import { ArticleSummary } from '../types';
import { getArticleCollection } from '../content';
import { searchArticles, SearchFilterOptions } from '../lib/searchEngine';

/**
 * Content Service: Search & Faceted Filtering
 * Provides a typed search interface over the article collection.
 */

export type { SearchFilterOptions };

const POPULAR_TAGS_RU = [
  'анатомия',
  'эволюция',
  'этология',
  'палеонтология',
  'ветеринария',
  'когнитивистика',
  'инфразвук',
  'генетика',
];

const POPULAR_TAGS_EN = [
  'anatomy',
  'evolution',
  'ethology',
  'paleontology',
  'veterinary',
  'cognition',
  'infrasound',
  'genetics',
];

export function getPopularSearchTags(lang: 'ru' | 'en'): string[] {
  return lang === 'en' ? POPULAR_TAGS_EN : POPULAR_TAGS_RU;
}

export function queryKnowledgeBase(
  options: SearchFilterOptions,
  lang: 'ru' | 'en',
  limit = 20
): ArticleSummary[] {
  const articles = getArticleCollection(lang);
  return searchArticles(articles, options).slice(0, limit);
}
