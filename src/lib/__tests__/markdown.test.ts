import { describe, it, expect } from 'vitest';
import { parseFrontmatter } from '../markdown';

describe('parseFrontmatter', () => {
  it('parses YAML frontmatter fields', () => {
    const md = [
      '---',
      'title: Elephant Thermoregulation',
      'description: How ears cool the blood',
      'category: anatomy',
      'difficulty: advanced',
      'evidence_level: high',
      'tags:',
      '  - ears',
      '  - blood',
      '---',
      '',
      '# Body heading',
      'Content here.',
    ].join('\n');

    const { metadata, content } = parseFrontmatter(md);
    expect(metadata.title).toBe('Elephant Thermoregulation');
    expect(metadata.excerpt).toBe('How ears cool the blood');
    expect(metadata.category).toBe('anatomy');
    expect(metadata.difficulty).toBe('advanced');
    expect(metadata.evidenceLevel).toBe('high');
    expect(metadata.tags).toContain('ears');
    expect(content).toContain('# Body heading');
    expect(content).not.toContain('title:');
  });

  it('falls back to first H1 as title when no frontmatter present', () => {
    const md = '# Just markdown\n\nNo frontmatter.';
    const { metadata, content } = parseFrontmatter(md);
    // documented fallback behavior: title inferred from H1
    expect(metadata.title).toBe('Just markdown');
    expect(content).toBe(md);
  });

  it('keeps frontmatter title over H1 fallback', () => {
    const md = ['---', 'title: FM Title', '---', '# H1 Title'].join('\n');
    const { metadata } = parseFrontmatter(md);
    expect(metadata.title).toBe('FM Title');
  });

  it('is robust against non-string input', () => {
    // @ts-expect-error runtime guard under test
    const { metadata, content } = parseFrontmatter(null);
    expect(metadata).toBeDefined();
    expect(content).toBe('');
  });

  it('does not choke on broken YAML', () => {
    const md = ['---', 'title: [unclosed', ': bad:', '---', 'body'].join('\n');
    expect(() => parseFrontmatter(md)).not.toThrow();
  });

  it('supports excerpt alias when description is absent', () => {
    const md = ['---', 'title: T', 'excerpt: Short summary', '---', 'c'].join('\n');
    const { metadata } = parseFrontmatter(md);
    expect(metadata.excerpt).toBe('Short summary');
  });

  it('prefers description over excerpt when both present', () => {
    const md = ['---', 'title: T', 'description: D', 'excerpt: E', '---', 'c'].join('\n');
    const { metadata } = parseFrontmatter(md);
    expect(metadata.excerpt).toBe('D');
  });
});
