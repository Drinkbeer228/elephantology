import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const md = `
Text[^1]
[^1]: Note
`;

console.log(renderToStaticMarkup(<ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>));
