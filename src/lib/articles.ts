import {
  RAW_MARKDOWN_MODULES,
  resolveDocumentKey,
  getArticleCollection,
} from '../content';
import { ArticleItem } from './searchEngine';

export const MODULES_CACHE = RAW_MARKDOWN_MODULES;

export function resolveArticlePath(
  requestedPath: string,
  modulesKeys: string[] = Object.keys(RAW_MARKDOWN_MODULES)
): string | null {
  return resolveDocumentKey(requestedPath, modulesKeys);
}

export function getStaticArticles(lang?: string): ArticleItem[] {
  return getArticleCollection(lang);
}
