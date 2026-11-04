import { describe, it, expect } from 'vitest';
import { translateMarkdownToEnglish } from '../translateMarkdown';

describe('translateMarkdownToEnglish link protection', () => {
  it('keeps relative markdown links intact (no glossary corruption of paths)', () => {
    const md = 'См. подробнее в [Анатомия хобота](../anatomy/hobot.md) и [Хобот](хобот.md).';
    const out = translateMarkdownToEnglish(md);
    expect(out).toContain('(../anatomy/hobot.md)');
    expect(out).toContain('(хобот.md)');
    expect(out).not.toMatch(/\]\([^)]*proboscis[^)]*\)/i);
  });

  it('keeps external URLs intact', () => {
    const md = 'Источник: https://doi.org/10.1038/s41586-024-хобот and [DOI](https://example.com/hobota)';
    const out = translateMarkdownToEnglish(md);
    expect(out).toContain('https://doi.org/10.1038/s41586-024-хобот');
    expect(out).toContain('[DOI](https://example.com/hobota)');
  });

  it('still translates section headings', () => {
    const out = translateMarkdownToEnglish('## Ключевые сведения\nТекст');
    expect(out).toMatch(/^## Key Scientific Findings/m);
  });
});
