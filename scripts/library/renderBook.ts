import type { Root as HastRoot } from 'hast';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { remarkDisplayMath } from '../../src/lib/remarkDisplayMath';
import { remarkRawBreaks } from '../../src/lib/remarkRawBreaks';
import { cleanArticleMarkdownBody } from '../../src/services/referenceService';
import type { ReferenceItem } from '../../src/types';
import { rehypeBlocks } from './blocks';
import { remarkNotes, type CollectedNote } from './notes';
import { repairMath } from './repairMath';
import { sanitizeSchema } from './sanitizeSchema';
import type { BookNote, BuildIssue, Heading } from './schema';

export interface RenderInput {
  id: string;
  body: string;
  frontmatterRefs: ReferenceItem[];
  resolveLink(href: string, fromId: string): string | null;
  siteBase: string;
  imageSize(publicPath: string): { width: number; height: number } | null;
}

export interface RenderResult {
  html: string;
  notes: BookNote[];
  blocks: number;
  headings: Heading[];
  missingSources: number;
  issues: BuildIssue[];
}

/** Box-drawing and arrow characters that keep a code block a diagram (spec 5.1). */
const DIAGRAM_CHARACTERS = /[─│┌┐└┘├┤┬┴┼═║╔╗╚╝╭╮▼▲►◄→←↑↓█▓▒]/u;

/**
 * Turns the Markdown body of an article (after its frontmatter) into the HTML of a book.
 * Formulas are MathML only, so books need no KaTeX CSS; `strict: 'ignore'` keeps KaTeX quiet
 * about Unicode inside formulas without changing how they look.
 */
export async function renderBook(input: RenderInput): Promise<RenderResult> {
  const issues: BuildIssue[] = [];
  const headings: Heading[] = [];
  const collected: CollectedNote[] = [];
  const blocksOptions = {
    bookId: input.id,
    siteBase: input.siteBase,
    resolveLink: input.resolveLink,
    imageSize: input.imageSize,
    classifyCodeBlock,
    issues,
  };

  const book = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkDisplayMath)
    .use(remarkRawBreaks)
    .use(repairMath)
    .use(remarkNotes, { frontmatterRefs: input.frontmatterRefs, missingLabel: missingNoteLabel, notes: collected })
    .use(remarkRehype)
    .use(rehypeKatex, { output: 'mathml', strict: 'ignore' })
    .use(rehypeBlocks, { ...blocksOptions, headings })
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeStringify);
  const source = splitGroupedCitations(cleanArticleMarkdownBody(input.body));
  const tree = await book.run(book.parse(source), source);
  const blocks = countBlocks(tree, input.id);

  const noteText = unified()
    .use(remarkRehype)
    .use(rehypeKatex, { output: 'mathml', strict: 'ignore' })
    .use(rehypeBlocks, { ...blocksOptions, bookHeadings: headings })
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeStringify);
  const notes: BookNote[] = [];
  for (const note of collected) {
    const html = noteText.stringify(withoutParagraph(await noteText.run(note.content)));
    notes.push({ n: note.n, key: note.key, html, missing: note.missing });
    if (note.missing) issues.push({ book: input.id, kind: 'missing-source', detail: `[^${note.key}]` });
  }

  return {
    html: book.stringify(tree),
    notes,
    blocks,
    headings,
    missingSources: notes.filter((note) => note.missing).length,
    issues,
  };
}

/**
 * A code block is prose fenced by mistake (`wrap`) when its longest line is longer than 118
 * characters and it has no diagram characters; otherwise it is a diagram.
 */
export function classifyCodeBlock(text: string): { kind: 'diagram' | 'wrap'; cols: number; lines: number } {
  const rows = text.replace(/\r?\n$/, '').split(/\r?\n/);
  const cols = rows.reduce((longest, row) => Math.max(longest, [...row].length), 0);
  const kind = cols > 118 && !DIAGRAM_CHARACTERS.test(text) ? 'wrap' : 'diagram';
  return { kind, cols, lines: rows.length };
}

/**
 * Label of a source the article cites but never gives: a number stays as is, `ref_author_year`
 * reads "Author year", any other key stays as written.
 */
export function missingNoteLabel(key: string): string {
  const match = /^ref_(.+)_(\d{4}[a-z]?)$/i.exec(key);
  if (!match) return key;
  const author = match[1]
    .split('_')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
  return `${author} ${match[2]}`;
}

/** `[^a, ^b]` becomes `[^a][^b]` everywhere but in code and formulas. The article file is not touched. */
function splitGroupedCitations(markdown: string): string {
  const literal: Array<[number, number]> = [];
  const tree = unified().use(remarkParse).use(remarkGfm).use(remarkMath).parse(markdown);
  visit(tree, (node) => {
    const literalNode = node.type === 'code' || node.type === 'inlineCode' || node.type === 'math' || node.type === 'inlineMath';
    const start = node.position?.start.offset;
    const end = node.position?.end.offset;
    if (literalNode && start !== undefined && end !== undefined) literal.push([start, end]);
  });
  return markdown.replace(/\[\^[^\]\s,]+(?:\s*,\s*\^[^\]\s,]+)+\]/g, (group: string, offset: number) =>
    literal.some(([start, end]) => offset >= start && offset < end)
      ? group
      : group
          .slice(2, -1)
          .split(/\s*,\s*\^/)
          .map((key) => `[^${key}]`)
          .join(''),
  );
}

/**
 * Number of top-level blocks, each of which carries `data-b` 0…n-1 in order. A sanitizer that
 * removed or unwrapped a numbered block would break that order, so this fails loudly instead of
 * shipping wrong bookmarks.
 */
function countBlocks(tree: HastRoot, id: string): number {
  const blocks = tree.children.filter((child) => child.type === 'element');
  blocks.forEach((block, n) => {
    if (block.properties.dataB !== n) {
      throw new Error(`renderBook(${id}): top-level <${block.tagName}> is block ${n} but carries data-b=${String(block.properties.dataB)}`);
    }
  });
  return blocks.length;
}

/** A note of one paragraph reads inline, without its <p>. */
function withoutParagraph(tree: HastRoot): HastRoot {
  const content = tree.children.filter((child) => child.type !== 'text' || child.value.trim() !== '');
  const [only] = content;
  return content.length === 1 && only.type === 'element' && only.tagName === 'p'
    ? { type: 'root', children: only.children }
    : tree;
}
