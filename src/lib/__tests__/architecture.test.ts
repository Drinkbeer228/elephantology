import { describe, it, expect } from 'vitest';
import {
  getArticleCollection,
  getDisciplineCategories,
  getGlossaryTermEntries,
  resolveDocumentKey,
} from '../../content';
import {
  getCatalogDisciplines,
  getFeaturedMonographs,
  getPreparedArticle,
  resolveInternalCrossReference,
  queryKnowledgeBase,
  getGlossaryEntryByKey,
  segmentTextWithGlossary,
  cleanArticleMarkdownBody,
  buildEnrichedReferences,
} from '../../services';
import { ru } from '../../i18n/ru';

describe('Architectural Boundaries: Content Layer & Content Services', () => {
  it('loads the complete collection of knowledge base articles and 10 disciplines', () => {
    const articles = getArticleCollection('ru');
    const categories = getDisciplineCategories();
    expect(articles.length).toBeGreaterThanOrEqual(65);
    expect(categories.length).toBe(10);
    expect(categories.map((c) => c.id)).toContain('anatomy');
    expect(categories.map((c) => c.id)).toContain('genomics');
  });

  it('resolves document keys cleanly across relative and extensionless paths', () => {
    const key1 = resolveDocumentKey('anatomy/muscular-hydrostat-and-trunk-biomechanics.md');
    const key2 = resolveDocumentKey('anatomy/muscular-hydrostat-and-trunk-biomechanics');
    expect(key1).toBeTruthy();
    expect(key1).toEqual(key2);
  });

  it('provides structured catalog disciplines and foundational monographs', () => {
    const disciplines = getCatalogDisciplines('ru', ru);
    expect(disciplines.length).toBe(10);
    expect(disciplines[0].indexNumber).toBe('01');
    expect(disciplines[0].articles.length).toBeGreaterThan(0);

    const monographs = getFeaturedMonographs('ru');
    expect(monographs.length).toBe(4);
    expect(monographs[0].title).toBeTruthy();
  });

  it('prepares a complete structured article document with TOC, references, and cross-references', () => {
    const prepared = getPreparedArticle(
      'anatomy/muscular-hydrostat-and-trunk-biomechanics.md',
      'ru',
      ru
    );
    expect(prepared).not.toBeNull();
    expect(prepared!.title.toLowerCase()).toContain('биомеханика мышечного гидростата');
    expect(prepared!.toc.length).toBeGreaterThan(2);
    expect(prepared!.references.length).toBeGreaterThan(0);
    expect(prepared!.siblingArticles.length).toBeGreaterThan(1);
  });

  it('resolves internal cross-references accurately', () => {
    const resolved = resolveInternalCrossReference(
      'ethogram/seismic-and-infrasonic-communication.md',
      'anatomy'
    );
    expect(resolved).toBe('ethogram/seismic-and-infrasonic-communication.md');
  });

  it('resolves glossary terms and segments text without coupling to UI', () => {
    const glossary = getGlossaryTermEntries();
    expect(glossary.length).toBeGreaterThan(10);

    const entry = getGlossaryEntryByKey('муст');
    expect(entry).toBeDefined();

    const segments = segmentTextWithGlossary('Состояние муста сопровождается ростом тестостерона.');
    expect(segments.some((s) => s.type === 'term' && s.termKey === 'муст')).toBe(true);
  });

  it('normalizes markdown headings and enriches structured references with DOIs', () => {
    const cleaned = cleanArticleMarkdownBody('# Заголовок\n\n## Кратко (Lead)\n\nТекст статьи.');
    expect(cleaned).not.toContain('# Заголовок');
    expect(cleaned).toContain('## Обзор темы');

    const refs = buildEnrichedReferences(
      '[^1]: Shoshani, J. (1998). Understanding proboscidean evolution. https://doi.org/10.1016/S0169-5347(98)01491-8',
      []
    );
    expect(refs).toHaveLength(1);
    expect(refs[0].doi).toBe('10.1016/S0169-5347(98)01491-8');
  });

  it('queries the knowledge base with category and semantic filters', () => {
    const results = queryKnowledgeBase({ query: 'TP53' }, 'ru');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].path).toContain('comparative-genomics-and-cancer-resistance.md');
  });
});
