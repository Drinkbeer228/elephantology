import { describe, it, expect } from 'vitest';
import katex from 'katex';
import { renderBook } from '../renderBook';

// Rules from the spec and decisions that the brief's tests do not pin down.
const render = (body: string) =>
  renderBook({
    id: 'anatomy/test',
    body,
    frontmatterRefs: [],
    siteBase: 'https://drinkbeer228.github.io/elephantology',
    resolveLink: () => null,
    imageSize: () => null,
  });

/** Opening tags with their attributes, minus the book's own `data-*` attributes. */
const openingTags = (html: string) =>
  (html.match(/<[a-z][^>]*>/g) ?? []).map((tag) =>
    tag.replace(/\s+data-[\w-]+="[^"]*"/g, '').replace(/\s*\/>$/, '>'),
  );

describe('renderBook rules', () => {
  it('keeps KaTeX MathML intact through the sanitizer', async () => {
    const formulas = [
      '\\frac{a}{b}',
      '\\sqrt{x} + \\sqrt[3]{y}',
      'x_i^2 + y_{ij}',
      'V = \\pi \\cdot r^2 \\cdot L = \\text{const}',
      '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
      '\\mathbf{F} = m\\mathbf{a}',
      '\\left( \\frac{a}{b} \\right)',
    ];
    for (const tex of formulas) {
      for (const displayMode of [true, false]) {
        const r = await render(displayMode ? `$$${tex}$$` : `Формула $${tex}$ в тексте.`);
        const book = r.html.match(/<math[\s\S]*<\/math>/)?.[0] ?? '';
        const own = katex.renderToString(tex, { output: 'mathml', displayMode }).match(/<math[\s\S]*<\/math>/)?.[0];
        expect(openingTags(book)).toEqual(openingTags(own ?? 'KaTeX gave no MathML'));
        expect(r.html).not.toContain('katex');
      }
    }
  });

  it('reports KaTeX errors as build issues, recovered ones included', async () => {
    // KaTeX leaves `.katex-error` for \frac{1}, but prints the unknown \foo inline in red.
    const r = await render('Формулы $\\frac{1}$ и $\\foo{x}$ не разбираются.');
    const details = r.issues.filter((i) => i.kind === 'katex').map((i) => i.detail);
    expect(details).toHaveLength(2);
    expect(details[0]).toContain('\\frac{1}');
    expect(details[1]).toContain('\\foo{x}');
    expect(r.html).not.toContain('katex');
  });

  it('writes note calls as links to numbered notes', async () => {
    const r = await render('А [^3]. Б [^ref_x].\n\n[^3]: Три.\n[^ref_x]: Икс.');
    expect(r.html).toContain('<sup class="note"><a data-note="3">3</a></sup>');
    expect(r.html).toContain('<sup class="note" data-key="ref_x"><a data-note="4">4</a></sup>');
  });

  it('keeps sources that are listed but never cited', async () => {
    const r = await render('Текст [^2].\n\n[^1]: Первый.\n[^2]: Второй.');
    expect(r.notes).toEqual([
      { n: '1', key: '1', html: 'Первый.', missing: false },
      { n: '2', key: '2', html: 'Второй.', missing: false },
    ]);
  });

  it('leaves grouped citations inside code blocks as written', async () => {
    const r = await render('Текст [^1, ^2].\n\n```text\nВодная пленка [^1, ^2]\n```\n\n[^1]: А.\n[^2]: Б.');
    expect(r.html).toContain('Водная пленка [^1, ^2]');
    expect(r.html.match(/class="note"/g)).toHaveLength(2);
  });

  it('never links to PDF files', async () => {
    const r = await render('См. [Shoshani 1998](../assets/books/quaternaryShosTass.pdf).');
    expect(r.html).not.toContain('.pdf');
    expect(r.html).toContain('Shoshani 1998');
  });

  it('numbers every top-level block once, display formulas included', async () => {
    const r = await render(
      [
        '## Раздел',
        'Абзац.',
        '---',
        '### Подраздел',
        '#### Пункт',
        '- пункт',
        '1. шаг',
        '> цитата',
        '$$E = mc^2$$',
        '```text\n' + 'слово '.repeat(30) + '\n```',
        '```text\n┌┐\n```',
        '| a |\n|---|\n| 1 |',
        '![Схема](/images/x.jpg)',
      ].join('\n\n'),
    );
    const numbers = [...r.html.matchAll(/ data-b="(\d+)"/g)].map((m) => Number(m[1]));
    expect(numbers).toEqual([...Array(13).keys()]);
    expect(r.blocks).toBe(13);
    expect(r.html).toContain('<hr data-b="2">');
    expect(r.html).toContain('<h4 data-b="4">Пункт</h4>');
    expect(r.html).toMatch(/<math[^>]*display="block"[^>]*data-b="8"/);
  });

  it('keeps strikethrough', async () => {
    const r = await render('Было ~~a~~ стало.');
    expect(r.html).toContain('<del>a</del>');
  });

  it('keeps the number an ordered list starts at', async () => {
    const r = await render('2. x\n3. y');
    expect(r.html).toMatch(/<ol start="2"[ >]/);
  });

  it('turns a raw <br> in a table cell into a line break', async () => {
    const r = await render('| a<br>b |\n|---|');
    // mdast-util-to-hast writes a newline after every <br>; it shows as nothing.
    expect(r.html).toMatch(/<th>a<br>\n?b<\/th>/);
  });

  it('restores a formula command lost to a control character', async () => {
    const r = await render('Коэффициент $\u0008eta$ в тексте.');
    expect(r.html).toContain('<mi>β</mi>');
    const repaired = r.issues.filter((i) => i.kind === 'repaired-math');
    expect(repaired).toHaveLength(1);
    expect(repaired[0].detail).toBe('\\u0008eta → \\beta');
    expect(r.issues.filter((i) => i.kind === 'katex')).toHaveLength(0);
  });

  it('restores display formulas built from $$ paragraphs too', async () => {
    const r = await render('$$\u000crac{1}{2}$$');
    expect(r.html).toMatch(/<math[^>]*display="block"[^>]*>[\s\S]*<mfrac>/);
    expect(r.issues.map((i) => i.kind)).toEqual(['repaired-math']);
  });
});
