import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { ArticleContentRenderer } from '../../article/ArticleContentRenderer';

const render = (bodyMarkdown: string) =>
  renderToStaticMarkup(
    <LanguageProvider>
      <ArticleContentRenderer
        bodyMarkdown={bodyMarkdown}
        references={[]}
        category="anatomy"
        onSelectArticle={() => {}}
      />
    </LanguageProvider>,
  );

describe('ArticleContentRenderer math', () => {
  it('renders inline and display math with KaTeX', () => {
    // remark-math only produces display math (katex-display) when the $$ fences sit on their own lines.
    const html = render('где $V$ — объём хобота.\n\n$$\nV = \\pi \\cdot r^2 \\cdot L = \\text{const}\n$$');
    expect(html).toContain('class="katex"');
    expect(html).toContain('katex-display');
    expect(html).not.toContain('$V$');
    expect(html).not.toContain('$$');
  });

  it('renders the single-line $$...$$ form used in the articles', () => {
    const html = render('где $V$ — объём хобота.\n\n$$V = \\pi \\cdot r^2 \\cdot L = \\text{const}$$');
    expect(html).toContain('class="katex"');
    expect(html).not.toContain('$V$');
    expect(html).not.toContain('$$');
  });
});
