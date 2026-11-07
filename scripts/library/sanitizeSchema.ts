import type { Options as Schema } from 'rehype-sanitize';

type PropertyDefinition = NonNullable<Schema['attributes']>[string][number];

/**
 * MathML that KaTeX (`output: 'mathml'`) emits, with the attributes it sets on each element.
 * Taken from KaTeX's real output for every formula in the corpus plus a probe set of KaTeX
 * constructs (fractions, roots, scripts, `\text`, matrices, arrays, fonts, accents, colours,
 * spacing, `\left`/`\right`, `\cancel`, `\boxed`, `\phantom`, `\tag`). Left out on purpose:
 * KaTeX's `class` hooks, which only its CSS uses, and one inline `style` (`\fcolorbox`).
 */
const MATHML: Record<string, PropertyDefinition[]> = {
  math: [
    ['xmlns', 'http://www.w3.org/1998/Math/MathML'],
    ['display', 'block'],
  ],
  semantics: [],
  annotation: [['encoding', 'application/x-tex']],
  mrow: [],
  mi: ['mathvariant'],
  mn: ['mathvariant'],
  mo: ['fence', 'lspace', 'mathvariant', 'maxsize', 'minsize', 'rspace', 'separator', 'stretchy'],
  mtext: ['mathvariant'],
  mspace: ['height', 'mathbackground', 'width'],
  msub: [],
  msup: [],
  msubsup: [],
  mfrac: ['linethickness'],
  msqrt: [],
  mroot: [],
  mover: ['accent'],
  munder: ['accentunder'],
  munderover: [],
  mtable: ['columnalign', 'columnlines', 'columnspacing', 'rowlines', 'rowspacing', 'width'],
  mtr: [],
  mtd: ['width'],
  mstyle: ['displaystyle', 'mathcolor', 'scriptlevel'],
  mpadded: ['depth', 'height', 'lspace', 'mathbackground', 'voffset', 'width'],
  mphantom: [],
  menclose: ['notation'],
};

/**
 * What a book may contain: the reader's allowlist (spec section 11), which also covers what the
 * book pipeline emits (spec 5.1, «Преобразования»): the `note`, `plate` and `wrap` classes, `rel`
 * and `target` on external links, lazy images, `data-*` attributes and KaTeX's MathML.
 * No element keeps an `id`, so nothing is clobbered into `user-content-` ids either.
 */
export const sanitizeSchema: Schema = {
  tagNames: [
    'p',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'br',
    'ul',
    'ol',
    'li',
    'blockquote',
    'strong',
    'em',
    'del',
    'sup',
    'sub',
    'a',
    'span',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'figure',
    'figcaption',
    'pre',
    'code',
    'img',
    ...Object.keys(MATHML),
  ],
  attributes: {
    '*': ['data*'],
    a: ['href', ['rel', 'noopener'], ['target', '_blank']],
    img: ['src', 'alt', 'width', 'height', ['loading', 'lazy']],
    ol: ['start'],
    th: ['colSpan', 'rowSpan', 'align'],
    td: ['colSpan', 'rowSpan', 'align'],
    sup: [['className', 'note']],
    figure: [['className', 'plate']],
    pre: [['className', 'wrap']],
    ...MATHML,
  },
  protocols: { href: ['https'], src: ['https'] },
  ancestors: { thead: ['table'], tbody: ['table'], tr: ['table'], th: ['table'], td: ['table'] },
  required: {},
  clobber: [],
  clobberPrefix: '',
  strip: ['script'],
};
