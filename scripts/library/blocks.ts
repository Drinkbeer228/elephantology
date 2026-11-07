import type { Element, ElementContent, Root, RootContent } from 'hast';
import { visit, SKIP } from 'unist-util-visit';
import type { VFile } from 'vfile';
import { slugifyHeading } from '../../src/services/referenceService';
import { REPAIR_MATH_SOURCE } from './repairMath';
import type { BuildIssue, Heading } from './schema';

/** Plugins that report formula problems as file messages, and the issue each message becomes. */
const MESSAGE_ISSUES: Partial<Record<string, BuildIssue['kind']>> = {
  'rehype-katex': 'katex',
  [REPAIR_MATH_SOURCE]: 'repaired-math',
};

export interface CodeBlockShape {
  kind: 'diagram' | 'wrap';
  cols: number;
  lines: number;
}

export interface BlocksOptions {
  bookId: string;
  siteBase: string;
  resolveLink(href: string, fromId: string): string | null;
  imageSize(publicPath: string): { width: number; height: number } | null;
  classifyCodeBlock(text: string): CodeBlockShape;
  /** Output: problems found on the way. */
  issues: BuildIssue[];
  /** Given for the book body only: its top-level blocks get `data-b`, and its h2/h3 land here. */
  headings?: Heading[];
  /** For pieces of a book that carry no headings of their own (notes): the book's headings, which `#x` links point at. */
  bookHeadings?: Heading[];
}

/**
 * rehype plugin, between rehype-katex and rehype-sanitize. Turns formula problems into issues,
 * leaves formulas as bare MathML, turns diagrams and tables into plates, rewires links, images
 * and headings for the book, and numbers the top-level blocks.
 */
export function rehypeBlocks(options: BlocksOptions) {
  return function (tree: Root, file: VFile): void {
    // Formula problems arrive as messages on the file: one per formula rehype-katex could not
    // parse, including those KaTeX recovered inline (an unknown command, printed in red) that
    // leave no `.katex-error` behind, and one per formula repairMath restored.
    for (const message of file.messages) {
      const kind = message.source ? MESSAGE_ISSUES[message.source] : undefined;
      if (kind) options.issues.push({ book: options.bookId, kind, detail: messageDetail(message) });
    }

    // Formulas stay bare MathML, without KaTeX's wrapper, so a display formula is a top-level <math>.
    visit(tree, 'element', (node, index, parent) => {
      if (!parent || index === undefined || node.tagName !== 'span' || !classList(node).includes('katex')) return;
      (parent.children as ElementContent[]).splice(index, 1, ...node.children);
      return [SKIP, index];
    });

    const headings = options.headings;
    const pageLinks: Element[] = [];
    const basePath = new URL(options.siteBase).pathname.replace(/\/+$/, '');
    visit(tree, 'element', (node, index, parent) => {
      if (!parent || index === undefined) return;
      const siblings = parent.children as ElementContent[];
      switch (node.tagName) {
        case 'a':
          if (typeof node.properties.href === 'string' && node.properties.href.startsWith('#')) pageLinks.push(node);
          else rewireLink(node, options);
          return;
        case 'img':
          placeImage(node, options, basePath);
          return;
        case 'pre': {
          const shape = options.classifyCodeBlock(visibleText(node));
          if (shape.kind === 'wrap') {
            const { className: _ignored, ...rest } = node.properties;
            node.properties = { className: ['wrap'], ...rest };
          } else {
            siblings[index] = plate(node, { dataKind: 'diagram', dataCols: shape.cols, dataLines: shape.lines });
          }
          return SKIP;
        }
        case 'table':
          siblings[index] = plate(node, { dataKind: 'table' });
          return;
        case 'h2':
        case 'h3':
          if (headings) markHeading(node, headings);
          return;
      }
    });

    // A `#x` link stays a link only when a heading of the book carries `data-h="x"`; that is known
    // once every heading has been seen, so a link may point forward.
    const targets = new Set((headings ?? options.bookHeadings ?? []).map((heading) => heading.h));
    for (const link of pageLinks) {
      const href = link.properties.href as string;
      if (targets.has(href.slice(1))) continue;
      toText(link);
      options.issues.push({ book: options.bookId, kind: 'unresolved-link', detail: href });
    }

    // Numbered last, so `data-b` follows each block's own attributes, a plate's included.
    if (headings) {
      let n = 0;
      for (const child of tree.children) if (child.type === 'element') child.properties.dataB = n++;
    }
  };
}

function plate(content: Element, properties: Element['properties']): Element {
  return { type: 'element', tagName: 'figure', properties: { className: ['plate'], ...properties }, children: [content] };
}

/**
 * Links to articles become `data-book` links, or plain text when they lead nowhere. PDFs are
 * never published, so links to them become text too. External links open in a new tab.
 */
function rewireLink(node: Element, options: BlocksOptions): void {
  const href = node.properties.href;
  if (typeof href !== 'string') return;
  const path = href.split(/[?#]/, 1)[0];
  if (/\.pdf$/i.test(path)) {
    toText(node);
  } else if (/^https?:\/\//i.test(href) || href.startsWith('//')) {
    node.properties = { href, rel: ['noopener'], target: '_blank' };
  } else if (/\.md$/i.test(path) && !/^[a-z][a-z\d+.-]*:/i.test(href)) {
    const book = options.resolveLink(href, options.bookId);
    if (book) {
      node.properties = { dataBook: book };
    } else {
      toText(node);
      options.issues.push({ book: options.bookId, kind: 'unresolved-link', detail: href });
    }
  }
}

function toText(link: Element): void {
  link.tagName = 'span';
  link.properties = {};
}

/** Site images get an absolute URL on the Elephantology site and their size. */
function placeImage(node: Element, options: BlocksOptions, basePath: string): void {
  const src = typeof node.properties.src === 'string' ? node.properties.src : '';
  const alt = node.properties.alt;
  const publicPath = sitePath(src, basePath);
  const size = publicPath === null ? null : options.imageSize(publicPath);
  if (!size) options.issues.push({ book: options.bookId, kind: 'missing-image', detail: publicPath ?? src });
  node.properties = {
    src: publicPath === null ? src : options.siteBase.replace(/\/+$/, '') + publicPath,
    ...(alt === undefined ? {} : { alt }),
    ...(size ? { width: size.width, height: size.height } : {}),
    loading: 'lazy',
  };
}

/** Path of an image under the site root (`/images/…`), or null for an image hosted elsewhere. */
function sitePath(src: string, basePath: string): string | null {
  if (!src || /^[a-z][a-z\d+.-]*:/i.test(src) || src.startsWith('//')) return null;
  const path = src.startsWith('/') ? src : `/${src.replace(/^(\.\/)+/, '')}`;
  return basePath && path.startsWith(`${basePath}/`) ? path.slice(basePath.length) : path;
}

function markHeading(node: Element, headings: Heading[]): void {
  const text = visibleText(node).replace(/\s+/g, ' ').trim();
  const h = slugifyHeading(text);
  if (!text || !h) return;
  node.properties.dataH = h;
  headings.push({ level: node.tagName === 'h2' ? 2 : 3, text, h });
}

/** For a formula KaTeX could not parse, its TeX source and KaTeX's reason; otherwise the message. */
function messageDetail(message: VFile['messages'][number]): string {
  const ancestors = message.ancestors ?? [];
  const formula = ancestors[ancestors.length - 1] as RootContent | undefined;
  const tex = formula ? visibleText(formula) : '';
  const reason = message.cause instanceof Error ? message.cause.message : message.reason;
  return tex ? `${tex} — ${reason}` : reason;
}

function classList(node: Element): string[] {
  return node.properties.className ?? [];
}

/** Text a reader sees: no TeX sources of formulas, no note marks. */
function visibleText(node: Root | RootContent): string {
  if (node.type === 'text') return node.value;
  if (node.type === 'element') {
    if (node.tagName === 'annotation' || classList(node).includes('note')) return '';
    return node.children.map(visibleText).join('');
  }
  if (node.type === 'root') return node.children.map(visibleText).join('');
  return '';
}
