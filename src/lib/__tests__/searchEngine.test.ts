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
