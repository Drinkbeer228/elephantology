import type { ElementContent } from 'hast';
import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';
import type { VFile } from 'vfile';

/** Source of this plugin's file messages, which the book turns into `repaired-math` issues. */
export const REPAIR_MATH_SOURCE = 'repair-math';

/**
 * Commands that decoding the text as escape sequences turned into control characters:
 * `\alpha` lost `\a` to U+0007, `\beta` lost `\b` to U+0008, `\frac` lost `\f` to U+000C.
 */
const COMMANDS: Record<string, string> = { '\u0007': '\\a', '\u0008': '\\b', '\u000b': '\\v', '\u000c': '\\f' };
const CONTROL_CHARACTERS = /[\u0007\u0008\u000b\u000c]/g;

/**
 * remark plugin, after remark-math and remarkDisplayMath: gives formulas back the commands that
 * became control characters, so KaTeX can render them. Only the book changes, never the article
 * file. Each repaired formula is reported as a message on the file, so it gets fixed at the source.
 */
export function repairMath() {
  return function (tree: Root, file: VFile): void {
    visit(tree, (node) => {
      if (node.type !== 'math' && node.type !== 'inlineMath') return;
      const repaired = repair(node.value);
      if (repaired === node.value) return;
      file.message(`${visible(node.value)} → ${repaired}`, {
        place: node.position,
        ruleId: 'control-character',
        source: REPAIR_MATH_SOURCE,
      });
      node.value = repaired;
      // remark-math keeps a copy of the formula in `data.hChildren`, and that copy is what
      // rehype-katex renders.
      node.data?.hChildren?.forEach(repairText);
    });
  };
}

function repair(tex: string): string {
  return tex.replace(CONTROL_CHARACTERS, (character) => COMMANDS[character]);
}

/** The formula with its control characters written out, such as `\u0008eta`. */
function visible(tex: string): string {
  return tex.replace(CONTROL_CHARACTERS, (character) => `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`);
}

function repairText(node: ElementContent): void {
  if (node.type === 'text') node.value = repair(node.value);
  else if (node.type === 'element') node.children.forEach(repairText);
}
