import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import markedFootnote from 'marked-footnote';
import { parseFrontmatter } from './seo-helper.js';

marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  }
}));
marked.use(markedFootnote());

const renderer = new marked.Renderer();
marked.use({ renderer, gfm: true });

const docsDir = './docs';
const distDir = './dist';
const domain = 'https://elephantology-wiki.ai.studio';
const templatePath = path.join(distDir, 'index.html');

if (!fs.existsSync(templatePath)) {
  console.error("No index.html found in dist. Run vite build first.");
  process.exit(1);
}

const templateHTML = fs.readFileSync(templatePath, 'utf8');

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      if (file !== 'assets') {
        fileList = getFiles(path.join(dir, file), fileList);
      }
    } else if (file.endsWith('.md')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const files = getFiles(docsDir);
console.log(`Starting SSG for ${files.length} articles...`);

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const meta = parseFrontmatter(content);
  
  // Strip frontmatter from content for rendering
  const mdContent = content.replace(/^---\r?\n[\s\S]*?\r?\n---/, '').trim();
  const htmlContent = marked.parse(mdContent);
  
  const relativePath = path.relative(docsDir, file).replace(/\\/g, '/');
  const urlPath = `/article/${relativePath.replace(/\.md$/, '')}`;
  const fullUrl = `${domain}${urlPath}`;
  
  const h1Match = mdContent.match(/^#\s+(.+)$/m);
  const fallbackTitle = h1Match ? h1Match[1].trim() : 'Монография';
  
  // Prepare SEO meta tags
  const title = meta.title ? `${meta.title} | Элефантология` : `${fallbackTitle} | Элефантология`;
  const description = meta.description || 'Энциклопедия о слонах';
  const ogTags = `
    <title>${title}</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${fullUrl}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${fullUrl}">
    <meta property="og:type" content="article">
  `;
  
  // Inject SEO tags into head and content into body
  let outHTML = templateHTML;
  // Remove original OG tags globally
  outHTML = outHTML.replace(/<meta property="og:title"[^>]*>/ig, '');
  outHTML = outHTML.replace(/<meta property="og:description"[^>]*>/ig, '');
  outHTML = outHTML.replace(/<meta property="og:url"[^>]*>/ig, '');
  outHTML = outHTML.replace(/<meta property="og:type"[^>]*>/ig, '');
  
  // Now replace title with new tags (which include new OG tags)
  outHTML = outHTML.replace(/<title>.*?<\/title>/i, ogTags);
  outHTML = outHTML.replace('<div id="root"></div>', `<div id="root"><div id="article-prose-content" class="markdown-body">${htmlContent}</div></div>`);
  
  // Ensure the page loads this article by default using window state or similar, 
  // but since we render it for crawlers, we just need it in the HTML.
  // We can also inject a script to hydrate it if JS loads.
  outHTML = outHTML.replace('</body>', `<script>window.__PRERENDERED_ARTICLE__ = "${urlPath}";</script></body>`);
  
  // Write to dist/article/.../index.html
  const outDir = path.join(distDir, urlPath);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), outHTML);
});

console.log('SSG complete!');
