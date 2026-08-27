import React from 'react';
import { renderToString } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const markdown = `
Text[^1]
[^1]: Note
`;

const html = renderToString(
  <ReactMarkdown remarkPlugins={[remarkGfm]}>
    {markdown}
  </ReactMarkdown>
);

console.log(html);
