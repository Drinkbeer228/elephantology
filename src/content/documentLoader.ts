/**
 * Content Layer: Raw Markdown Document Loader & Path Resolution
 * Isolates Vite's import.meta.glob and filesystem layout from Services and UI.
 */

import { resolveDocumentKey as resolveDocumentKeyPure } from './resolveDocumentKey';

export const RAW_MARKDOWN_MODULES = import.meta.glob('/docs/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

export { LEGACY_SLUG_MAP } from './resolveDocumentKey';

export function resolveDocumentKey(
  requestedPath: string,
  modulesKeys: string[] = Object.keys(RAW_MARKDOWN_MODULES)
): string | null {
  return resolveDocumentKeyPure(requestedPath, modulesKeys);
}

export function getRawMarkdownByKey(moduleKey: string): string {
  const raw = RAW_MARKDOWN_MODULES[moduleKey];
  if (!raw) return '';
  return typeof raw === 'string' ? raw : (raw as any).default || '';
}

export function getKnowledgeArticleEntries(): Array<[string, string]> {
  return Object.entries(RAW_MARKDOWN_MODULES)
    .filter(
      ([filePath]) =>
        !filePath.includes('/assets/') &&
        filePath !== '/docs/index.md' &&
        !filePath.endsWith('glossary.md') &&
        !filePath.endsWith('bibliography.md')
    )
    .sort(([a], [b]) => {
      const aIsIndex = a.endsWith('/index.md');
      const bIsIndex = b.endsWith('/index.md');
      if (aIsIndex !== bIsIndex) return aIsIndex ? -1 : 1;
      return a.localeCompare(b);
    })
    .map(([filePath, raw]) => [
      filePath,
      typeof raw === 'string' ? raw : (raw as any).default || '',
    ]);
}
