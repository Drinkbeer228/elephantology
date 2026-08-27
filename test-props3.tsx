import React from 'react';
import { renderToString } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const md = `Text[^1]\n\n[^1]: Note`;

const components = {
  a: ({node, href, children, ...props}) => {
    console.log("has data-footnote-ref:", !!props['data-footnote-ref']);
    console.log("has data-footnote-backref:", !!props['data-footnote-backref']);
    return <a {...props} />;
  }
};

renderToString(<ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{md}</ReactMarkdown>);
