import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildLibrary, type BuildOptions } from '../buildLibrary';
import { validateBook, validateCatalog } from '../schema';

const root = mkdtempSync(join(tmpdir(), 'library-'));
const docsDir = join(root, 'docs');
const outDir = join(root, 'out');

const write = (path: string, text: string) => {
  mkdirSync(dirname(join(docsDir, path)), { recursive: true });
  writeFileSync(join(docsDir, path), text);
};

const options = (): BuildOptions => ({
  docsDir,
  publicDir: join(root, 'public'),
  outDir,
  siteBase: 'https://example.github.io/elephantology',
  commit: 'abc1234',
  now: '2026-11-07T12:00:00Z',
});

beforeAll(() => {
  write('anatomy/a.md', `---
title: "Хобот: архитектоника"
short_title: Хобот
description: Про хобот.
authors:
  - name: Анна Слонова
related_knowledge:
  - anatomy/b.md
---

## Обзор темы

Текст[^1].

## Связанные знания

* [B](./b.md)
* [A itself](./a.md)

[^1]: Источник.
`);
  write('anatomy/b.md', '---\ntitle: "Бивни: строение и рост"\n---\n\n## Обзор\n\nТекст.\n\n### Подраздел\n\nЕщё текст.\n');
  write('anatomy/index.md', '---\ntitle: Анатомия\n---\n\n## Обзор\n\nТекст.\n');
  write('glossary.md', '---\ntitle: Словарь\n---\n\n## Термины\n\nТекст.\n');
  write('index.md', '---\ntitle: Главная\n---\n\nТекст.\n');
  write('assets/skip.md', '---\ntitle: Skip\n---\n\nТекст.\n');
});
afterAll(() => rmSync(root, { recursive: true, force: true }));

describe('buildLibrary', () => {
  it('keeps only level-2 headings in the catalog, and every heading in the book', async () => {
    const { catalog } = await buildLibrary(options());
    const entry = catalog.books.find((b) => b.id === 'anatomy/b')!;
    expect(entry.headings.map((h) => h.level)).toEqual([2]);
    for (const book of catalog.books) expect(book.headings.every((h) => h.level === 2)).toBe(true);
    const file = JSON.parse(readFileSync(join(outDir, 'books/anatomy/b.json'), 'utf8'));
    expect(file.html).toContain('Подраздел');
    expect(file.html).toMatch(/<h3[^>]*data-h=/);
  });

  it('builds the catalog and the books', async () => {
    const { catalog, report } = await buildLibrary(options());
    expect(catalog.schema).toBe('elephantology.library/1');
    expect(report.books).toBe(4);
    expect(report.articles).toBe(3);
    expect(report.schemaErrors).toEqual([]);
    expect(validateCatalog(catalog)).toEqual([]);
    expect(catalog.disciplines).toHaveLength(10);
    expect(JSON.parse(readFileSync(join(outDir, 'catalog.json'), 'utf8'))).toEqual(catalog);

    const byId = new Map(catalog.books.map((b) => [b.id, b]));
    const a = byId.get('anatomy/a')!;
    expect(a.shortTitle).toBe('Хобот');
    expect(a.shortTitleFrom).toBe('frontmatter');
    expect(a.contributors[0].role).toBe('author');
    expect(a.related).toEqual(['anatomy/b']);
    expect(a.contentUrl).toBe('books/anatomy/a.json');
    expect(a.siteUrl).toBe('https://example.github.io/elephantology/article/anatomy/a/');
    expect(a.contentHash).toMatch(/^sha256:[0-9a-f]{12}$/);
    expect(byId.get('anatomy/b')!.shortTitleFrom).toBe('derived');
    expect(byId.get('anatomy/b')!.shortTitle).toBe('Бивни');
    expect(byId.get('anatomy/index')!.kind).toBe('overview');
    expect(byId.get('glossary')!.kind).toBe('reference');
    expect(byId.get('glossary')!.discipline).toBe('reference');
    expect(byId.has('index')).toBe(false);
  });

  it('writes valid book files', async () => {
    await buildLibrary(options());
    const file = join(outDir, 'books/anatomy/a.json');
    expect(existsSync(file)).toBe(true);
    const book = JSON.parse(readFileSync(file, 'utf8'));
    expect(validateBook(book)).toEqual([]);
    expect(book.contentHash).toBe(
      JSON.parse(readFileSync(join(outDir, 'catalog.json'), 'utf8')).books.find((b: { id: string }) => b.id === 'anatomy/a').contentHash,
    );
  });
});
