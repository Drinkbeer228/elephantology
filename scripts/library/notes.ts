import type { ElementContent } from 'hast';
import type { FootnoteDefinition, Root, RootContent, Text } from 'mdast';
import { visit, SKIP } from 'unist-util-visit';
import type { ReferenceItem } from '../../src/types';

/** A note of the book, before its text is rendered to HTML. */
export interface CollectedNote {
  /** Number shown in the text; for a missing source, its readable label. */
  n: string;
  /** The label as written in the article: `3`, `ref_x`. */
  key: string;
  /** Neither a definition in the article nor a frontmatter reference with this id. */
  missing: boolean;
  /** The note text as mdast; empty for a missing source. */
  content: Root;
}

export interface NotesOptions {
  frontmatterRefs: readonly ReferenceItem[];
  /** Label shown in the text for a missing source. */
  missingLabel(key: string): string;
  /** Output: every note of the book, ordered by number. */
  notes: CollectedNote[];
}

/** A call `[^key]` that stayed text because the article has no definition for it. */
const CALL = /\[\^([^\]\s]+)\]/g;
const NUMERIC = /^\d+$/;

/**
 * remark plugin: turns footnote calls into the book's note marks and collects the notes,
 * including definitions the text never cites. Numeric labels keep their number; named labels
 * are numbered by first mention from max(numeric labels) + 1, and a repeated mention gets the
 * same number. A call without a definition takes its text from the frontmatter reference with
 * the same id, or else stays a visible mark of a missing source. Definitions leave the tree, so
 * remark-rehype builds no footnote section.
 */
export function remarkNotes(options: NotesOptions) {
  return function (tree: Root): void {
    const definitions = new Map<string, FootnoteDefinition>();
    const labels = new Map<string, string>();
    const order: string[] = [];
    const mention = (id: string, label: string) => {
      if (labels.has(id)) return;
      labels.set(id, label);
      order.push(id);
    };

    visit(tree, (node) => {
      if (node.type === 'footnoteDefinition') {
        if (!definitions.has(node.identifier)) definitions.set(node.identifier, node);
      } else if (node.type === 'footnoteReference') {
        mention(node.identifier, node.label ?? node.identifier);
      } else if (node.type === 'text') {
        for (const [, key] of node.value.matchAll(CALL)) mention(identifierOf(key), key);
      }
    });
    for (const [id, definition] of definitions) mention(id, definition.label ?? id);

    const contents = new Map(order.map((id) => [id, contentOf(id, definitions, options.frontmatterRefs)]));
    const numeric = order.map((id) => labels.get(id)!).filter((key) => NUMERIC.test(key));
    let next = Math.max(0, ...numeric.map(Number)) + 1;
    const numbers = new Map<string, string>();
    for (const id of order) {
      const key = labels.get(id)!;
      if (!contents.get(id)) numbers.set(id, options.missingLabel(key));
      else numbers.set(id, NUMERIC.test(key) ? key : String(next++));
    }
    const mark = (id: string): Text => noteMark(numbers.get(id)!, labels.get(id)!, !contents.get(id));

    visit(tree, (node, index, parent) => {
      if (!parent || index === undefined) return;
      const siblings = parent.children as RootContent[];
      if (node.type === 'footnoteReference') {
        siblings[index] = mark(node.identifier);
        return SKIP;
      }
      if (node.type === 'text' && node.value.includes('[^')) {
        const parts = splitCalls(node, (key) => mark(identifierOf(key)));
        siblings.splice(index, 1, ...parts);
        return [SKIP, index + parts.length];
      }
    });
    visit(tree, 'footnoteDefinition', (_node, index, parent) => {
      if (!parent || index === undefined) return;
      (parent.children as RootContent[]).splice(index, 1);
      return [SKIP, index];
    });

    const notes = order.map((id) => {
      const content = contents.get(id);
      return {
        n: numbers.get(id)!,
        key: labels.get(id)!,
        missing: !content,
        content: content ?? { type: 'root', children: [] },
      } satisfies CollectedNote;
    });
    const rank = (note: CollectedNote) => (NUMERIC.test(note.n) ? Number(note.n) : Number.POSITIVE_INFINITY);
    notes.sort((a, b) => rank(a) - rank(b) || 0);
    options.notes.push(...notes);
  };
}

/** The identifier mdast gives a footnote label (see micromark's `normalizeIdentifier`). */
function identifierOf(label: string): string {
  return label.replace(/[\t\n\r ]+/g, ' ').trim().toLowerCase().toUpperCase().toLowerCase();
}

/** Text of a note: its definition, else a frontmatter reference with the same id, else none. */
function contentOf(
  id: string,
  definitions: ReadonlyMap<string, FootnoteDefinition>,
  frontmatterRefs: readonly ReferenceItem[],
): Root | null {
  const definition = definitions.get(id);
  if (definition) return { type: 'root', children: definition.children };
  const reference = frontmatterRefs.find((ref) => identifierOf(String(ref.id)) === id);
  const text = reference ? referenceText(reference) : '';
  return text ? { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', value: text }] }] } : null;
}

/** "Authors (Year). Title", from what the frontmatter reference gives. */
function referenceText(ref: ReferenceItem): string {
  const title = (ref.title ?? '').trim();
  const authors = (ref.authors ?? '').trim();
  const year = ref.year == null ? '' : String(ref.year).trim();
  if (!title && !authors) return '';
  const head = authors ? (year ? `${authors} (${year})` : authors) : '';
  if (!head) return year ? `${title} (${year})` : title;
  return title ? `${head}. ${title}` : head;
}

/**
 * The mark of a note in the text. remark-rehype turns it into
 * `<sup class="note"><a data-note="N">N</a></sup>`, with `data-key` for a named label, or into
 * `<sup class="note" data-missing="" data-key="KEY">LABEL</sup>` for a missing source.
 */
function noteMark(n: string, key: string, missing: boolean): Text {
  if (missing) {
    return { type: 'text', value: n, data: { hName: 'sup', hProperties: { className: ['note'], dataMissing: '', dataKey: key } } };
  }
  const link: ElementContent = { type: 'element', tagName: 'a', properties: { dataNote: n }, children: [{ type: 'text', value: n }] };
  const properties = NUMERIC.test(key) ? { className: ['note'] } : { className: ['note'], dataKey: key };
  return { type: 'text', value: n, data: { hName: 'sup', hProperties: properties, hChildren: [link] } };
}

/** Splits a text node around `[^key]` calls, replacing each call with its note mark. */
function splitCalls(node: Text, markOf: (key: string) => Text): Text[] {
  const parts: Text[] = [];
  let last = 0;
  for (const match of node.value.matchAll(CALL)) {
    const start = match.index ?? 0;
    if (start > last) parts.push({ type: 'text', value: node.value.slice(last, start) });
    parts.push(markOf(match[1]));
    last = start + match[0].length;
  }
  if (last < node.value.length) parts.push({ type: 'text', value: node.value.slice(last) });
  return parts.length > 0 ? parts : [node];
}
