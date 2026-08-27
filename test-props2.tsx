import React from 'react';
import { renderToString } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const md = `Text[^1]\n\n[^1]: Note`;

const components = {
  a: (props) => {
    console.log("className type:", typeof props.className, props.className);
    return <a {...props} />;
  }
};

renderToString(<ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{md}</ReactMarkdown>);
