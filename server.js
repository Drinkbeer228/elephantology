import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import pino from 'pino';
import { generateSchemaJsonLd, CANONICAL_DOMAIN } from './seo-helper.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const isProd = process.env.NODE_ENV === 'production';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(compression());
app.use(express.json());

// Helmet security headers configured to allow AI Studio iframe embedding and Vite dev mode
app.use(helmet({
  frameguard: false,
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
  hsts: isProd ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// In-memory cache for scanned markdown articles
let cachedArticles = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

// Helper to recursively get all markdown files in docs
function getMarkdownFiles(dir, baseDir = dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getMarkdownFiles(filePath, baseDir));
    } else if (file.endsWith('.md')) {
      const relativePath = path.relative(baseDir, filePath);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract title cleanly (prefer YAML title if non-empty, then # heading, then cleaned filename)
      const yamlTitleMatch = content.match(/^title:\s*["']?([^"'\r\n]+)["']?/m);
      const cleanContent = content.replace(/^---[\s\S]*?---\s*/, '');
      const h1Match = cleanContent.match(/^#\s+(.+)$/m);
      
      let title = '';
      if (yamlTitleMatch && yamlTitleMatch[1] && yamlTitleMatch[1].trim()) {
        title = yamlTitleMatch[1].trim();
      } else if (h1Match && h1Match[1] && h1Match[1].trim()) {
        title = h1Match[1].trim();
      }

      // Strip quotes, anchors {#...}, and markdown symbols from title
      title = title.replace(/^["']|["']$/g, '').replace(/\{.*?\}/g, '').replace(/[\*\_`#]/g, '').trim();

      if (!title || title.length === 0) {
        title = file.replace('.md', '').replace(/_/g, ' ');
        title = title.charAt(0).toUpperCase() + title.slice(1);
      }
      
      // Extract tags from YAML frontmatter if present
      const tagsMatch = content.match(/^tags:\s*\[(.*?)\]/m) || content.match(/^keywords:\s*\[(.*?)\]/m);
      let tags = [];
      if (tagsMatch && tagsMatch[1]) {
        tags = tagsMatch[1].split(',').map(t => t.replace(/["']/g, '').trim()).filter(Boolean);
      }

      // Extract evidence_level from YAML frontmatter if present
      const evidenceMatch = content.match(/^evidence_level:\s*["']?([^"'\r\n]+)["']?/m);
      let evidenceLevel = undefined;
      if (evidenceMatch && evidenceMatch[1]) {
        evidenceLevel = evidenceMatch[1].trim();
      }

      // Calculate approximate reading time
      const wordCount = cleanContent.split(/\s+/).length;
      const readingMinutes = Math.max(1, Math.ceil(wordCount / 180));
      const readingTime = `${readingMinutes} мин`;

      // Extract category from folder name
      const parts = relativePath.split(path.sep);
      const category = parts.length > 1 ? parts[0] : 'main';

      results.push({
        path: relativePath.replace(/\\/g, '/'),
        filename: file,
        title,
        category,
        size: stat.size,
        readingTime,
        tags,
        evidenceLevel,
        content: cleanContent.slice(0, 1000).replace(/[\r\n#*_`>-]+/g, ' ').trim(),
        excerpt: cleanContent.slice(0, 200).replace(/[\r\n#*_`>-]+/g, ' ').trim()
      });
    }
  });
  
  return results;
}

function getArticlesList() {
  const now = Date.now();
  if (!cachedArticles || now - lastCacheTime > CACHE_TTL_MS) {
    const docsDir = path.resolve(__dirname, 'docs');
    cachedArticles = getMarkdownFiles(docsDir);
    lastCacheTime = now;
  }
  return cachedArticles;
}

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    time: Date.now()
  });
});

// API endpoint to get all articles metadata (Removed as part of SSG migration)
// API endpoint to get single article content (Removed as part of SSG migration)


function cleanDescriptionText(raw) {
  if (!raw) return '';
  return raw
    .replace(/[\r\n#*_`>~\[\]\(\)\-\+]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);
}

function injectMetaTags(template, url) {
  const fallbackDomain = process.env.PROJECT_DOMAIN ? `https://${process.env.PROJECT_DOMAIN}` : CANONICAL_DOMAIN;

  if (url.startsWith('/article/')) {
    const articlePath = url.replace('/article/', '') + '.md';
    const articles = getArticlesList();
    const article = articles.find(a => a.path.replace(/\\/g, '/') === articlePath);
    
    if (article) {
      const title = (article.title || articlePath.replace('.md', '')) + ' — Слонология';
      const cleanDesc = cleanDescriptionText(article.excerpt || article.content) || 'Читайте академическую статью в энциклопедии Слонология.';
      const lang = article.lang || 'ru';

      template = template.replace(/<html\s+lang=["'][^"']*["']/i, `<html lang="${lang}"`);
      template = template.replace(
        /<title>.*?<\/title>/i,
        `<title>${title}</title>`
      );
      
      template = template.replace(
        /<meta property="og:title"[^>]*>/i,
        `<meta property="og:title" id="og-title" content="${title}">`
      );
      
      template = template.replace(
        /<meta property="og:description"[^>]*>/i,
        `<meta property="og:description" id="og-desc" content="${cleanDesc}">`
      );
      
      template = template.replace(
        /<meta name="description"[^>]*>/i,
        `<meta name="description" content="${cleanDesc}">`
      );

      // --- SEO Schema Injection ---
      const articleUrl = `${fallbackDomain}${url}`;
      const meta = {
        title: article.title,
        description: cleanDesc,
        category: article.category,
        tags: article.tags || []
      };
      
      const jsonLdScript = generateSchemaJsonLd(meta, articleUrl);
      template = template.replace('</head>', `  ${jsonLdScript}\n</head>`);
    }
  }
  
  // Update OG URL in all cases
  const fullUrl = `${fallbackDomain}${url}`;
  template = template.replace(
    /<meta property="og:url"[^>]*>/i,
    `<meta property="og:url" id="og-url" content="${fullUrl}">`
  );
  
  return template;
}

// Docs static serving removed to allow Vite middleware to intercept import.meta.glob requests

// PWA Static Assets & Service Worker
app.get('/sw.js', (req, res) => {
  res.set({
    'Content-Type': 'application/javascript',
    'Service-Worker-Allowed': '/',
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  });
  // Return a minimal service worker that unregisters itself to clean up legacy PWA
  res.send(`
    self.addEventListener('install', function(e) {
      self.skipWaiting();
    });
    self.addEventListener('activate', function(e) {
      self.registration.unregister()
        .then(function() {
          return self.clients.matchAll();
        })
        .then(function(clients) {
          clients.forEach(client => client.navigate(client.url))
        });
    });
  `);
});

app.get(['/manifest.json', '/manifest.webmanifest'], (req, res) => {
  res.set({
    'Content-Type': 'application/manifest+json',
    'Cache-Control': 'public, max-age=3600'
  });
  res.sendFile(path.join(__dirname, 'public', 'manifest.json'));
});

app.use('/icons', express.static(path.join(__dirname, 'public', 'icons'), {
  maxAge: '7d'
}));
app.use('/public', express.static(path.join(__dirname, 'public')));

if (!isProd) {
  // Dev mode: use Vite middleware
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  app.use(vite.middlewares);

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    try {
      let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      template = injectMetaTags(template, url);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
} else {
  // Prod mode: serve dist
  app.use(express.static(path.resolve(__dirname, 'dist'), {
    maxAge: '1y',
    etag: true,
    index: ['index.html']
  }));
  app.use('*', (req, res) => {
    try {
      const indexPath = path.resolve(__dirname, 'dist', 'index.html');
      if (!fs.existsSync(indexPath)) {
        return res.status(500).send('Production index.html not found. Please run build first.');
      }
      let template = fs.readFileSync(indexPath, 'utf-8');
      template = injectMetaTags(template, req.originalUrl);
      res.status(200).set({ 'Content-Type': 'text/html' }).send(template);
    } catch (err) {
      logger.error({ err }, 'Error serving index.html');
      res.status(500).send('Internal Server Error');
    }
  });
}

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Elephantology Wiki Server running on http://0.0.0.0:${PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
