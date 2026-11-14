import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { imageSize } from 'image-size';
import { parseFrontmatter } from '../../src/content/frontmatterParser';
import { resolveDocumentKey } from '../../src/content/resolveDocumentKey';
import { ACADEMIC_CATEGORIES } from '../../src/data/categories';
import { cleanArticleMarkdownBody } from '../../src/services/referenceService';
import type { ArticleMetadata } from '../../src/types';
import { renderBook } from './renderBook';
import {
  BOOK_SCHEMA,
  CATALOG_SCHEMA,
  validateBook,
  validateCatalog,
  type BookFile,
  type BuildIssue,
  type CatalogBook,
  type CatalogFile,
} from './schema';
import { deriveShortTitle } from './shortTitle';

export interface BuildOptions {
  docsDir: string;
  publicDir: string;
  outDir: string;
  siteBase: string;
  commit: string;
  now: string;
  /** Checks a rendered book; defaults to `validateBook`. A book with errors is neither written nor catalogued. */
  validate?: (file: BookFile) => string[];
}

export interface BuildReport {
  books: number;
  articles: number;
  katexErrors: number;
  schemaErrors: string[];
  issues: BuildIssue[];
}

interface Source {
  id: string;
  kind: CatalogBook['kind'];
  discipline: string;
  key: string;
  metadata: ArticleMetadata;
  body: string;
}

const REFERENCE_FILES = ['glossary', 'bibliography'];

/** Every Markdown file under `dir`, as a path relative to it with `/` separators. */
function markdownFiles(dir: string, prefix = ''): string[] {
  return readdirSync(join(dir, prefix), { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory() ? markdownFiles(dir, `${prefix}${entry.name}/`) : entry.name.endsWith('.md') ? [`${prefix}${entry.name}`] : [],
    )
    .sort();
}

/** The books: `<category>/*.md` for each academic category, then the glossary and the bibliography. */
function collectSources(docsDir: string): Source[] {
  const sources: Source[] = [];
  const add = (id: string, kind: Source['kind'], discipline: string, file: string) => {
    const { metadata, content } = parseFrontmatter(readFileSync(join(docsDir, file), 'utf8'));
    sources.push({ id, kind, discipline, key: `/docs/${file}`, metadata, body: content });
  };
  for (const category of ACADEMIC_CATEGORIES) {
    const dir = join(docsDir, category.id);
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir).filter((n) => n.endsWith('.md')).sort()) {
      const slug = name.slice(0, -3);
      add(`${category.id}/${slug}`, slug === 'index' ? 'overview' : 'article', category.id, `${category.id}/${name}`);
    }
  }
  for (const slug of REFERENCE_FILES) {
    if (existsSync(join(docsDir, `${slug}.md`))) add(slug, 'reference', 'reference', `${slug}.md`);
  }
  return sources;
}

/** Targets of `.md` links under the level-2 heading «Связанные знания» (optionally numbered). */
function relatedSectionLinks(body: string): string[] {
  const lines = body.split(/\r?\n/);
  const start = lines.findIndex((line) => /^##\s+(?:\d+\.\s*)?Связанные знания\s*$/.test(line));
  if (start === -1) return [];
  const links: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (/^#{1,2}\s/.test(line)) break;
    for (const match of line.matchAll(/\]\(([^)\s]+?\.md(?:#[^)\s]*)?)\)/g)) links.push(match[1]);
  }
  return links;
}

function imageSizeOf(publicDir: string, publicPath: string): { width: number; height: number } | null {
  try {
    const file = join(publicDir, publicPath);
    if (!statSync(file).isFile()) return null;
    const { width, height } = imageSize(readFileSync(file));
    return width && height ? { width, height } : null;
  } catch {
    return null;
  }
}

const hashOf = (html: string, notes: unknown) =>
  `sha256:${createHash('sha256')
    .update(html + JSON.stringify(notes))
    .digest('hex')
    .slice(0, 12)}`;

function writeJson(file: string, value: unknown): void {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(value));
}

/**
 * Renders every article of `docsDir` into `outDir/books/<id>.json` and writes `outDir/catalog.json`.
 * Problems are reported, not thrown: a book that fails to render or to validate is neither written
 * nor catalogued, and its errors land in `schemaErrors` (the build script then exits with 1).
 */
export async function buildLibrary(opts: BuildOptions): Promise<{ catalog: CatalogFile; report: BuildReport }> {
  const siteBase = opts.siteBase.replace(/\/+$/, '');
  const sources = collectSources(opts.docsDir);
  const moduleKeys = markdownFiles(opts.docsDir).map((file) => `/docs/${file}`);
  const idOfKey = new Map(sources.map((source) => [source.key, source.id]));
  const resolve = (href: string): string | null => {
    const key = resolveDocumentKey(href, moduleKeys);
    return (key && idOfKey.get(key)) || null;
  };

  const issues: BuildIssue[] = [];
  const schemaErrors: string[] = [];
  const rendered: Array<{ source: Source; book: CatalogBook }> = [];

  for (const source of sources) {
    const { id, metadata } = source;
    try {
      const result = await renderBook({
        id,
        body: source.body,
        frontmatterRefs: metadata.references ?? [],
        resolveLink: (href) => resolve(href),
        siteBase,
        imageSize: (publicPath) => imageSizeOf(opts.publicDir, publicPath),
      });
      issues.push(...result.issues);
      const contentHash = hashOf(result.html, result.notes);
      const file: BookFile = { schema: BOOK_SCHEMA, id, contentHash, html: result.html, notes: result.notes, blocks: result.blocks };
      const bookErrors = (opts.validate ?? validateBook)(file);
      if (bookErrors.length > 0) {
        schemaErrors.push(...bookErrors.map((error) => `${id}: ${error}`));
        continue;
      }
      writeJson(join(opts.outDir, 'books', `${id}.json`), file);

      const title = metadata.title || id.split('/').pop()!;
      rendered.push({
        source,
        book: {
          id,
          discipline: source.discipline,
          kind: source.kind,
          title,
          shortTitle: metadata.shortTitle ?? deriveShortTitle(title),
          shortTitleFrom: metadata.shortTitle ? 'frontmatter' : 'derived',
          description: metadata.excerpt ?? '',
          tags: metadata.tags ?? [],
          difficulty: metadata.difficulty ?? null,
          evidenceLevel: metadata.evidenceLevel ?? null,
          evidenceBasis: metadata.evidenceBasis ?? [],
          readingMinutes: metadata.readingTimeMin ?? 5,
          chars: cleanArticleMarkdownBody(source.body).length,
          lastReviewed: metadata.lastReviewed ?? null,
          contributors: metadata.contributors,
          contributorsText: metadata.contributorsText ?? null,
          // The catalog lists chapters only (level 2); the book keeps every heading.
          headings: result.headings.filter((heading) => heading.level === 2),
          related: [],
          siteUrl: `${siteBase}/article/${id}/`,
          contentUrl: `books/${id}.json`,
          contentHash,
          missingSources: result.missingSources,
        },
      });
    } catch (error) {
      schemaErrors.push(`${id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const built = new Set(rendered.map(({ book }) => book.id));
  for (const { source, book } of rendered) {
    const targets = [
      ...(source.metadata.related_knowledge ?? []).map((item) => (typeof item === 'string' ? item : item.target)),
      ...relatedSectionLinks(source.body),
    ];
    const related = new Set<string>();
    for (const target of targets) {
      const id = resolve(target);
      if (id && id !== book.id && built.has(id)) related.add(id);
    }
    book.related = [...related];
  }

  const catalog: CatalogFile = {
    schema: CATALOG_SCHEMA,
    generatedAt: opts.now,
    source: { commit: opts.commit, site: `${siteBase}/` },
    disciplines: ACADEMIC_CATEGORIES.map(({ id, name, order, description }) => ({ id, name, order, description })),
    books: rendered.map(({ book }) => book),
  };
  schemaErrors.push(...validateCatalog(catalog));
  writeJson(join(opts.outDir, 'catalog.json'), catalog);

  const report: BuildReport = {
    books: catalog.books.length,
    articles: sources.filter((source) => source.kind !== 'reference').length,
    katexErrors: issues.filter((issue) => issue.kind === 'katex').length,
    schemaErrors,
    issues,
  };
  return { catalog, report };
}
