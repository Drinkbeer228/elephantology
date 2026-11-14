import { describe, expect, it } from 'vitest';
import { libraryBookUrl } from '../libraryLink';

describe('libraryBookUrl', () => {
  it('turns an article path into its book link', () => {
    expect(libraryBookUrl('anatomy/muscular-hydrostat-and-trunk-biomechanics.md')).toBe(
      'https://drinkbeer228.github.io/research-station/#/library/anatomy/muscular-hydrostat-and-trunk-biomechanics',
    );
  });
  it('handles reference books and stray prefixes', () => {
    expect(libraryBookUrl('bibliography.md')).toBe('https://drinkbeer228.github.io/research-station/#/library/bibliography');
    expect(libraryBookUrl('/docs/glossary.md')).toBe('https://drinkbeer228.github.io/research-station/#/library/glossary');
  });
});
