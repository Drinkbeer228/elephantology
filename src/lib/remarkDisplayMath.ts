import type { Paragraph, Parents, Root, RootContent } from 'mdast';
import type { VFile } from 'vfile';

type DisplayMath = Extract<RootContent, { type: 'math' }>;

/**
 * remark plugin, to run right after remark-math. A paragraph that holds nothing but one formula
 * written as `$$…$$` becomes display math: the same `math` node remark-math builds for `$$` on
 * lines of their own, which rehype-katex renders with `display="block"`. Whether the formula was
 * written with `$$` is read from the source text at the node's position. Formulas inside text,
 * `$…$` and `$$…$$` alike, stay inline.
 */
export function remarkDisplayMath(): (tree: Root, file: VFile) => void {
  return function (tree, file) {
    const source = String(file);
    walk(tree);

    function walk(parent: Parents): void {
      const children = parent.children as RootContent[];
      children.forEach((child, index) => {
        const math = child.type === 'paragraph' ? displayMath(child, source) : null;
        if (math) children[index] = math;
        else if ('children' in child) walk(child);
      });
    }
  };
}

function displayMath(paragraph: Paragraph, source: string): DisplayMath | null {
  const [only, ...rest] = paragraph.children;
  if (!only || rest.length > 0 || only.type !== 'inlineMath') return null;
  const start = only.position?.start.offset;
  const end = only.position?.end.offset;
  if (start === undefined || end === undefined) return null;
  const written = source.slice(start, end);
  if (written.length < 4 || !written.startsWith('$$') || !written.endsWith('$$')) return null;
  return {
    type: 'math',
    meta: null,
    value: only.value,
    position: paragraph.position,
    data: {
      hName: 'pre',
      hChildren: [
        {
          type: 'element',
          tagName: 'code',
          properties: { className: ['language-math', 'math-display'] },
          children: [{ type: 'text', value: only.value }],
        },
      ],
    },
  };
}
