import { describe, it, expect } from 'vitest';
import { searchArticles, ArticleItem } from '../searchEngine';

const mk = (p: Partial<ArticleItem> & { path: string }): ArticleItem => ({
  filename: p.path.split('/').pop() ?? p.path,
  title: '',
  category: '',
  ...p,
});

const corpus: ArticleItem[] = [
  mk({ path: 'anatomy/ears-and-hearing.md', title: 'Слоновий слух и инфразвук', category: 'anatomy', excerpt: 'Как слоны слышат землю', tags: ['инфразвук'] }),
  mk({ path: 'ecology/feeding-ecology-nutrition-and-geophagy.md', title: 'Питание и геофагия', category: 'ecology', excerpt: 'Солонцы и минералы' }),
  mk({ path: 'ethogram/social-structure.md', title: 'Социальная структура стад', category: 'ethology', excerpt: 'Матриархат' }),
];

describe('searchArticles', () => {
  it('returns all articles for an empty query', () => {
    expect(searchArticles(corpus, '')).toHaveLength(3);
    expect(searchArticles(corpus, '   ')).toHaveLength(3);
  });

  it('ranks the best-matching article first (exact/substring/title+tags combined score)', () => {
    const res = searchArticles(corpus, 'геофагия');
    expect(res.length).toBeGreaterThan(0);
    // geophagy article wins via static semantic tags + title substring
    expect(res[0].path).toContain('geophagy');
  });

  it('filters out non-matching articles', () => {
    const res = searchArticles(corpus, 'квантовая-хронометрия-единорогов');
    expect(res).toHaveLength(0);
  });

  it('is case-insensitive', () => {
    const a = searchArticles(corpus, 'ИНФРАЗВУК');
    const b = searchArticles(corpus, 'инфразвук');
    expect(a.map(x => x.path)).toEqual(b.map(x => x.path));
    expect(a.length).toBeGreaterThan(0);
  });

  it('boosts articles whose semantic tags match the query', () => {
    // ecology/feeding... has static tags including 'солонцы' in ARTICLE_SEMANTIC_TAGS
    const res = searchArticles(corpus, 'солонцы');
    expect(res[0]?.path).toContain('geophagy');
  });

  it('matches excerpt and content tokens', () => {
    const res = searchArticles(corpus, 'матриархат');
    expect(res.some(r => r.path === 'ethogram/social-structure.md')).toBe(true);
  });

  it('handles punctuation-only queries gracefully', () => {
    // tokens filtered out -> returns full list (documented behavior)
    expect(searchArticles(corpus, '?!.,')).toHaveLength(3);
  });
});

import { getStaticArticles, resolveArticlePath, MODULES_CACHE } from '../articles';

describe('Corpus integrity: 5 overview articles, search, and non-duplication of reference pages', () => {
  const keys = Object.keys(MODULES_CACHE);
  const rubricatorArticles = getStaticArticles('ru');

  it('resolves all 5 discipline overview routes accurately', () => {
    const overviewRoutes = [
      { route: 'anatomy/index', expected: '/docs/anatomy/index.md' },
      { route: 'ecology/index', expected: '/docs/ecology/index.md' },
      { route: 'ethogram/index', expected: '/docs/ethogram/index.md' },
      { route: 'taxonomy/index', expected: '/docs/taxonomy/index.md' },
      { route: 'veterinary/index', expected: '/docs/veterinary/index.md' },
    ];

    for (const { route, expected } of overviewRoutes) {
      expect(resolveArticlePath(route, keys)).toBe(expected);
      expect(resolveArticlePath(`${route}.md`, keys)).toBe(expected);
      expect(resolveArticlePath(`../${route}.md`, keys)).toBe(expected);
    }
  });

  it('includes all 5 overview articles in full-text search and finds their content', () => {
    const queries = [
      { q: 'триумф эволюционной инженерии', expectedPath: 'anatomy/index.md' },
      { q: 'Экология и социальная психология', expectedPath: 'ecology/index.md' },
      { q: 'Этограмма и поведение', expectedPath: 'ethogram/index.md' },
      { q: 'Эволюционная история отряда хоботных', expectedPath: 'taxonomy/index.md' },
      { q: 'Ветеринария и уход', expectedPath: 'veterinary/index.md' },
    ];

    for (const { q, expectedPath } of queries) {
      const results = searchArticles(rubricatorArticles, q);
      expect(results.some(r => r.path === expectedPath)).toBe(true);
    }
  });

  it('excludes glossary, bibliography, root index, and bot archive from the rubricator while keeping them accessible by route', () => {
    expect(rubricatorArticles).toHaveLength(68);
    expect(rubricatorArticles.some(a => a.path.includes('glossary'))).toBe(false);
    expect(rubricatorArticles.some(a => a.path.includes('bibliography'))).toBe(false);
    expect(rubricatorArticles.some(a => a.path.includes('elephant_bot_archive'))).toBe(false);
    expect(rubricatorArticles.some(a => a.path === 'index.md')).toBe(false);

    expect(resolveArticlePath('glossary', keys)).toBe('/docs/glossary.md');
    expect(resolveArticlePath('bibliography', keys)).toBe('/docs/bibliography.md');
    expect(resolveArticlePath('elephant_bot_archive', keys)).toBe('/docs/assets/books/elephant_bot_archive.md');
  });
});

