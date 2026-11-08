import { describe, it, expect } from 'vitest';
import { renderBook, classifyCodeBlock, missingNoteLabel } from '../renderBook';

const base = { id: 'anatomy/test', frontmatterRefs: [], siteBase: 'https://drinkbeer228.github.io/elephantology', resolveLink: (h: string) => (h.includes('skeletal') ? 'anatomy/skeletal-system-cranial-and-dentition' : null), imageSize: () => ({ width: 2816, height: 1536 }) };
const render = (body: string, extra = {}) => renderBook({ ...base, body, ...extra });

describe('renderBook', () => {
  it('renders math as MathML', async () => {
    const r = await render('где $V$ — объём.\n\n$$V = \\pi r^2$$');
    expect(r.html).toContain('<math');
    expect(r.html).not.toContain('$');
  });
  it('renders a paragraph that is only a $$ formula as display math', async () => {
    const r = await render('Объём $$V$$ и $r$ в тексте.\n\n$$V = \\pi r^2$$');
    expect(r.html.match(/<math/g)).toHaveLength(3);
    expect(r.html.match(/<math[^>]*display="block"/g)).toHaveLength(1);
  });
  it('splits grouped citations', async () => {
    const r = await render('Факт [^a, ^b].\n\n[^a]: Источник А.\n[^b]: Источник Б.');
    expect(r.html.match(/class="note"/g)).toHaveLength(2);
    expect(r.html).not.toContain('[^');
  });
  it('keeps numeric labels and numbers named ones after them', async () => {
    const r = await render('А [^3]. Б [^ref_x]. В [^3].\n\n[^3]: Три.\n[^ref_x]: Икс.');
    expect(r.notes.map((n) => [n.n, n.key])).toEqual([['3', '3'], ['4', 'ref_x']]);
  });
  it('marks missing sources without inventing them', async () => {
    const r = await render('А [^134]. Б [^ref_shoshani_1996].');
    expect(r.html).toContain('data-missing="" data-key="134">134</sup>');
    expect(r.html).toContain('>Shoshani 1996</sup>');
    expect(r.missingSources).toBe(2);
    expect(r.issues.filter((i) => i.kind === 'missing-source')).toHaveLength(2);
  });
  it('fills a missing source from frontmatter references', async () => {
    const r = await render('А [^ref_burn_2011].', { frontmatterRefs: [{ id: 'ref_burn_2011', title: 'Modelling the illegal killing of elephants in Africa', authors: 'Burn R. W. et al.', year: '2011' }] });
    expect(r.notes[0]).toMatchObject({ key: 'ref_burn_2011', missing: false });
    expect(r.notes[0].html).toContain('Modelling the illegal killing');
  });
  it('turns article links into book links and drops unresolved ones', async () => {
    const r = await render('[Череп](../anatomy/skeletal-system-cranial-and-dentition.md) и [нет](../x/none.md)');
    expect(r.html).toContain('data-book="anatomy/skeletal-system-cranial-and-dentition"');
    expect(r.html).not.toContain('none.md');
    expect(r.issues.some((i) => i.kind === 'unresolved-link')).toBe(true);
  });
  it('makes images absolute with dimensions', async () => {
    const r = await render('![Схема](/images/anatomy/proboscis.jpg)');
    expect(r.html).toContain('src="https://drinkbeer228.github.io/elephantology/images/anatomy/proboscis.jpg"');
    expect(r.html).toContain('width="2816"');
    expect(r.html).toContain('height="1536"');
  });
  it('wraps diagrams and tables as plates, numbers blocks, has no ids', async () => {
    const r = await render('## 1. Раздел\n\nТекст.\n\n```text\n┌──┐\n└──┘\n```\n\n| a | b |\n|---|---|\n| 1 | 2 |');
    expect(r.html).toContain('<figure class="plate" data-kind="diagram" data-cols="4" data-lines="2" data-b="2">');
    expect(r.html).toContain('<figure class="plate" data-kind="table" data-b="3">');
    expect(r.html).toContain('data-h="1-раздел"');
    expect(r.blocks).toBe(4);
    expect(r.html).not.toMatch(/\sid="/);
  });
  it('strips scripts and event handlers', async () => {
    const r = await render('Текст <img src=x onerror=alert(1)> <script>alert(1)</script>');
    expect(r.html).not.toContain('onerror');
    expect(r.html).not.toContain('<script');
  });
});

describe('classifyCodeBlock', () => {
  it('detects prose that was fenced by mistake', () => {
    expect(classifyCodeBlock('- [CLINICAL GUIDANCE] ' + 'а'.repeat(390)).kind).toBe('wrap');
    expect(classifyCodeBlock('┌' + '─'.repeat(130) + '┐').kind).toBe('diagram');
  });
});

describe('missingNoteLabel', () => {
  it('derives readable labels', () => {
    expect(missingNoteLabel('134')).toBe('134');
    expect(missingNoteLabel('ref_shoshani_1996')).toBe('Shoshani 1996');
    expect(missingNoteLabel('weird-key')).toBe('weird-key');
  });
});
