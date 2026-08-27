import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';

const processor = unified().use(remarkParse).use(remarkGfm).use(remarkRehype);
const ast = processor.parse('Text[^1]\n\n[^1]: Note');
const hast = processor.runSync(ast);
console.log(JSON.stringify(hast, null, 2));
