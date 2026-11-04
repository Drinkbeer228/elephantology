import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import markedFootnote from 'marked-footnote';
import { parseFrontmatter, generateSchemaJsonLd, CANONICAL_DOMAIN } from './seo-helper.js';

marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  }
}));
marked.use(markedFootnote());

const renderer = new marked.Renderer();

const docsDir = './docs';
const docsEnDir = './docs_en';
const distDir = './dist';
const domain = CANONICAL_DOMAIN;
const templatePath = path.join(distDir, 'index.html');

if (!fs.existsSync(templatePath)) {
  console.error("No index.html found in dist. Run vite build first.");
  process.exit(1);
}

const templateHTML = fs.readFileSync(templatePath, 'utf8');

function getFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'assets') {
        fileList = getFiles(fullPath, fileList);
      }
    } else if (file.endsWith('.md')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

import pLimit from 'p-limit';

async function prerenderFile(file, opts = {}) {
  const { isEn = false } = opts;
  try {
    const content = fs.readFileSync(file, 'utf8');
    const meta = parseFrontmatter(content) || {};
    
    // Strip frontmatter from content for rendering
    const mdContent = content.replace(/^---\r?\n[\s\S]*?\r?\n---/, '').trim();
    const htmlContent = await marked.parse(mdContent, { renderer, gfm: true });
    
    const baseDir = isEn ? docsEnDir : docsDir;
    const relativePath = path.relative(baseDir, file).replace(/\\/g, '/');
    const slug = relativePath.replace(/\.md$/, '');
    const urlPath = `${isEn ? '/en/article' : '/article'}/${slug}`;
    const ruFullUrl = `${domain}/article/${slug}`;
    const fullUrl = `${domain}${urlPath}`;
    
    const h1Match = mdContent.match(/^#\s+(.+)$/m);
    const fallbackTitle = h1Match ? h1Match[1].trim() : (isEn ? 'Monograph' : 'Монография');
    
    // Prepare SEO meta tags & Structured Data (JSON-LD)
    const siteSuffix = isEn ? 'Elephantology' : 'Слонология';
    const title = meta.title ? `${meta.title} | ${siteSuffix}` : `${fallbackTitle} | ${siteSuffix}`;
    const description = meta.description || (isEn
      ? 'Academic digital encyclopedia about elephants (Elephantidae).'
      : 'Академическая цифровая энциклопедия о слонах (Elephantidae).');
    // og:image only if a real asset exists (old ai.studio image was lost in migration)
    const hasOgImage = fs.existsSync(path.join(distDir, 'assets', 'images', 'og-home-elephants.jpg'));
    const ogImage = `${domain}/assets/images/og-home-elephants.jpg`;

    const jsonLdScript = generateSchemaJsonLd(meta, fullUrl);

    const headInjection = `
      <title>${title}</title>
      <meta name="description" content="${description}">
      <link rel="canonical" href="${fullUrl}">
      <link rel="alternate" hreflang="ru" href="${isEn ? ruFullUrl : fullUrl}">
      <link rel="alternate" hreflang="en" href="${isEn ? fullUrl : fullUrl + '?lang=en'}">
      <link rel="alternate" hreflang="x-default" href="${isEn ? ruFullUrl : fullUrl}">
      <meta property="og:title" content="${title}">
      <meta property="og:description" content="${description}">
      <meta property="og:url" content="${fullUrl}">
      <meta property="og:type" content="article">
      ${hasOgImage ? `<meta property="og:image" content="${ogImage}">` : ''}
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="${title}">
      <meta name="twitter:description" content="${description}">
      ${hasOgImage ? `<meta name="twitter:image" content="${ogImage}">` : ''}
      ${jsonLdScript}
    `;
    
    let outHTML = templateHTML;
    // EN pages are always lang="en"; RU pages honor meta.lang if specified
    if (isEn) {
      outHTML = outHTML.replace(/<html\s+lang=["'][^"']*["']/i, '<html lang="en"');
    } else if (meta.lang) {
      outHTML = outHTML.replace(/<html\s+lang=["'][^"']*["']/i, `<html lang="${meta.lang}"`);
    }

    // Remove default/original tags from template to avoid duplicates
    outHTML = outHTML.replace(/<title>.*?<\/title>/is, '');
    outHTML = outHTML.replace(/<meta name="description"[^>]*>/ig, '');
    outHTML = outHTML.replace(/<link rel="canonical"[^>]*>/ig, '');
    outHTML = outHTML.replace(/<meta property="og:title"[^>]*>/ig, '');
    outHTML = outHTML.replace(/<meta property="og:description"[^>]*>/ig, '');
    outHTML = outHTML.replace(/<meta property="og:url"[^>]*>/ig, '');
    outHTML = outHTML.replace(/<meta property="og:type"[^>]*>/ig, '');
    outHTML = outHTML.replace(/<meta property="og:image"[^>]*>/ig, '');
    outHTML = outHTML.replace(/<meta name="twitter:[^"]*"[^>]*>/ig, '');

    // Inject new head tags right before </head>
    outHTML = outHTML.replace('</head>', `${headInjection}\n</head>`);

    // Inject pre-rendered prose content inside #root
    outHTML = outHTML.replace('<div id="root"></div>', `<div id="root"><div id="article-prose-content" class="markdown-body">${htmlContent}</div></div>`);
    
    // Inject state hydration marker
    const hydrationScript = '<script>window.__PRERENDERED_ARTICLE__ = "/article/' + slug +
';window.__PRERENDERED_LOCALE__ = "' + (isEn ? 'en' : 'ru') + '";</script>';
    outHTML = outHTML.replace('</body>', hydrationScript + '</body>');
    
    // Write to dist/article/.../index.html
    const outDir = path.join(distDir, urlPath);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), outHTML);
    return true;
  } catch (err) {
    console.error(`Failed to prerender ${file}:`, err?.message || err);
    return false;
  }
}

async function runPrerender() {
  const files = getFiles(docsDir);
  const enFiles = fs.existsSync(docsEnDir) ? getFiles(docsEnDir) : [];
  console.log(`Starting SSG prerender pipeline for ${files.length} RU + ${enFiles.length} EN articles on domain ${domain}...`);

  const limit = pLimit(10);
  const jobs = [
    ...files.map(file => () => prerenderFile(file)),
    ...enFiles.map(file => () => prerenderFile(file, { isEn: true })),
  ];
  const results = await Promise.all(jobs.map(job => limit(job)));
  const successful = results.filter(Boolean).length;

  console.log(`✅ SSG prerender complete: ${successful}/${jobs.length} article pages generated.`);
}

runPrerender().catch(err => {
  console.error("SSG prerender failed:", err);
  process.exit(1);
});
