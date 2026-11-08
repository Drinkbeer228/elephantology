import { describe, it, expect } from 'vitest';
import { contributorErrors } from '../contributors.js';

describe('contributorErrors', () => {
  it('accepts valid lists and the legacy string', () => {
    expect(contributorErrors({ authors: [{ name: 'Анна', orcid: '0000-0002-1825-009X', url: 'https://example.org' }] })).toEqual([]);
    expect(contributorErrors({ authors: 'Иванов И. И.' })).toEqual([]);
    expect(contributorErrors({})).toEqual([]);
  });
  it('reports empty names, bad ORCID, non-https URL and duplicates', () => {
    const errors = contributorErrors({
      authors: [{ name: ' ' }, { name: 'Анна', orcid: '1234' }, { name: 'Анна', url: 'http://x' }],
      editors: [{ name: 'Борис' }],
    });
    expect(errors).toEqual([
      'authors[0]: name is empty',
      'authors[1]: orcid must match 0000-0000-0000-000X',
      'authors[2]: url must start with https://',
      'authors[2]: duplicate name "Анна"',
    ]);
  });
  it('treats plain strings in lists as names and requires editors to be a list', () => {
    expect(contributorErrors({ authors: ['Анна', ' '], editors: 'Борис' })).toEqual([
      'authors[1]: name is empty',
      'editors must be a list',
    ]);
  });
  it('rejects authors that are neither a string nor a list', () => {
    expect(contributorErrors({ authors: { name: 'Анна' } })).toEqual(['authors must be a string or a list']);
  });
});
