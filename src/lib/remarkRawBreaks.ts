import type { Parents, Root, RootContent } from 'mdast';

const RAW_BREAK = /^<br\s*\/?>$/i;

/**
 * remark plugin: a raw HTML `<br>` (also `<br/>` or `<br />`, in any case), which the articles
 * use inside table cells, becomes a line break. Any other raw HTML stays raw, so remark-rehype
 * drops it as the site does.
 */
export function remarkRawBreaks(): (tree: Root) => void {
  return function (tree) {
    walk(tree);
  };
}

function walk(parent: Parents): void {
  const children = parent.children as RootContent[];
  children.forEach((child, index) => {
    if (child.type === 'html' && RAW_BREAK.test(child.value)) children[index] = { type: 'break', position: child.position };
    else if ('children' in child) walk(child);
  });
}
