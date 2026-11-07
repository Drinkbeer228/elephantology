import { describe, it, expect } from 'vitest';
import { parseFrontmatter } from '../markdown';

const fm = (yaml: string) => parseFrontmatter(`---\ntitle: T\n${yaml}\n---\n\nТекст`).metadata;

describe('contributors', () => {
  it('keeps the legacy string form as is', () => {
    const m = fm('authors: "Иванов И. И., Петров П. П."');
    expect(m.authors).toBe('Иванов И. И., Петров П. П.');
    expect(m.contributorsText).toBe('Иванов И. И., Петров П. П.');
    expect(m.contributors).toEqual([]);
  });
  it('parses authors and editors lists', () => {
    const m = fm('authors:\n  - name: "Анна Слонова"\n    affiliation: "Станция"\n    orcid: "0000-0002-1825-0097"\neditors:\n  - name: "Борис Хоботов"\n    role: "научный редактор"\n  - name: "Вера Бивнева"');
    expect(m.contributors).toEqual([
      { name: 'Анна Слонова', role: 'author', affiliation: 'Станция', orcid: '0000-0002-1825-0097', url: null },
      { name: 'Борис Хоботов', role: 'научный редактор', affiliation: null, orcid: null, url: null },
      { name: 'Вера Бивнева', role: 'editor', affiliation: null, orcid: null, url: null },
    ]);
    expect(m.authors).toBe('Анна Слонова');
  });
  it('skips entries without a name', () => {
    expect(fm('authors:\n  - affiliation: "X"').contributors).toEqual([]);
  });
  it('has no contributors when fields are absent', () => {
    const m = fm('category: anatomy');
    expect(m.contributors).toEqual([]);
    expect(m.authors).toBeUndefined();
  });
  it('accepts plain strings in lists as names', () => {
    const m = fm('authors:\n  - "Анна Слонова"\neditors:\n  - "Борис Хоботов"');
    expect(m.contributors).toEqual([
      { name: 'Анна Слонова', role: 'author', affiliation: null, orcid: null, url: null },
      { name: 'Борис Хоботов', role: 'editor', affiliation: null, orcid: null, url: null },
    ]);
    expect(m.authors).toBe('Анна Слонова');
  });
  it('still reads the singular author key', () => {
    const m = fm('author: "Иванов И. И."');
    expect(m.authors).toBe('Иванов И. И.');
    expect(m.contributorsText).toBe('Иванов И. И.');
    expect(m.contributors).toEqual([]);
  });
});

describe('short_title', () => {
  it('reads short_title into shortTitle and leaves it unset when absent', () => {
    expect(fm('short_title: " Хобот "').shortTitle).toBe('Хобот');
    expect(fm('description: x').shortTitle).toBeUndefined();
  });
});
