import fs from 'fs';
import path from 'path';
import { load } from 'js-yaml';

export const CANONICAL_DOMAIN = 'https://elephantology.ai.studio';

export function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const meta = { tags: [] };
  if (match) {
    try {
      const parsed = load(match[1]) || {};
      if (parsed.title) meta.title = String(parsed.title).trim();
      if (parsed.description || parsed.excerpt) {
        meta.description = String(parsed.description || parsed.excerpt).trim();
      }
      if (parsed.category) meta.category = String(parsed.category).trim();
      if (parsed.evidence_level || parsed.evidenceLevel) {
        meta.evidenceLevel = String(parsed.evidence_level || parsed.evidenceLevel).trim();
      }
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (parsed.date_published || parsed.datePublished) {
        const dateVal = String(parsed.date_published || parsed.datePublished).trim();
        meta.datePublished = dateRegex.test(dateVal) ? dateVal : undefined;
      }
      if (parsed.last_reviewed || parsed.lastReviewed) {
        const lastVal = String(parsed.last_reviewed || parsed.lastReviewed).trim();
        if (dateRegex.test(lastVal)) {
          meta.lastReviewed = lastVal;
          meta.dateModified = lastVal;
        }
      }
      if (Array.isArray(parsed.tags)) {
        meta.tags = parsed.tags.map(t => String(t).trim()).filter(Boolean);
      } else if (typeof parsed.tags === 'string') {
        meta.tags = parsed.tags.split(',').map(t => t.trim()).filter(Boolean);
      }
    } catch (e) {
      // Fallback regex parsing if yaml fails
      const yamlStr = match[1];
      const titleMatch = yamlStr.match(/title:\s*["']?([^"'\r\n]+)["']?/);
      if (titleMatch) meta.title = titleMatch[1].trim();

      const descMatch = yamlStr.match(/(?:description|excerpt):\s*["']?([^"'\r\n]+)["']?/);
      if (descMatch) meta.description = descMatch[1].trim();
      
      const catMatch = yamlStr.match(/category:\s*["']?([^"'\r\n]+)["']?/);
      if (catMatch) meta.category = catMatch[1].trim();

      const tagsMatch = yamlStr.match(/tags:\s*\[(.*?)\]/);
      if (tagsMatch) {
        meta.tags = tagsMatch[1].split(',').map(t => t.trim().replace(/['"]/g, ''));
      }
      
      const lastMatch = yamlStr.match(/last_reviewed:\s*["']?([^"'\r\n]+)["']?/);
      if (lastMatch) {
        meta.lastReviewed = lastMatch[1].trim();
        meta.dateModified = meta.lastReviewed;
      }

      const pubMatch = yamlStr.match(/date_published:\s*["']?([^"'\r\n]+)["']?/);
      if (pubMatch) {
        meta.datePublished = pubMatch[1].trim();
      }
    }
  }
  return meta;
}

export function generateSchemaJsonLd(meta, url) {
  const categoryName = meta.category || "Общая биология";
  const title = meta.title || "Монография";

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "ScholarlyArticle",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": url
      },
      "headline": title,
      "description": meta.description || "Академическая статья о слонах в энциклопедии Слонология.",
      "inLanguage": "ru",
      "author": {
        "@type": "Organization",
        "name": "Академическая Лига Слонологии",
        "url": CANONICAL_DOMAIN
      },
      "publisher": {
        "@type": "Organization",
        "name": "Слонология",
        "url": CANONICAL_DOMAIN,
        "logo": {
          "@type": "ImageObject",
          "url": `${CANONICAL_DOMAIN}/icons/icon.svg`
        }
      },
      "about": [
        {
          "@type": "Taxon",
          "name": "Elephantidae",
          "scientificName": "Elephantidae",
          "taxonRank": "family",
          "sameAs": "https://ru.wikipedia.org/wiki/%D0%A1%D0%BB%D0%BE%D0%BD%D0%BE%D0%B2%D1%8B%D0%B5"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Слонология",
          "item": `${CANONICAL_DOMAIN}/`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": categoryName,
          "item": `${CANONICAL_DOMAIN}/`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": title,
          "item": url
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "url": `${CANONICAL_DOMAIN}/`,
      "name": "Слонология",
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${CANONICAL_DOMAIN}/?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    }
  ];

  const scholarlyArticle = schemas[0];

  // Only attach datePublished if explicitly defined in frontmatter (never fake it with last_reviewed)
  if (meta.datePublished) {
    scholarlyArticle.datePublished = meta.datePublished;
  }
  
  if (meta.lastReviewed || meta.dateModified) {
    scholarlyArticle.dateModified = meta.lastReviewed || meta.dateModified;
  }

  const latinTaxa = [
    'Loxodonta africana', 'Elephas maximus', 'Mammuthus primigenius', 
    'Loxodonta cyclotis', 'Mammuthus', 'Deinotherium', 'Palaeoloxodon',
    'Proboscidea', 'Elephas', 'Loxodonta'
  ];
  
  if (Array.isArray(meta.tags)) {
    meta.tags.forEach(tag => {
      const isLatin = latinTaxa.some(latin => tag.toLowerCase() === latin.toLowerCase() || tag.toLowerCase().includes(latin.toLowerCase()));
      if (isLatin || /^[A-Z][a-z]+(\s+[a-z]+)?$/.test(tag)) {
        scholarlyArticle.about.push({
          "@type": "Taxon",
          "name": tag,
          "scientificName": tag,
          "taxonRank": tag.includes(' ') ? "species" : "genus"
        });
      }
    });
  }

  return `<script type="application/ld+json">\n${JSON.stringify(schemas, null, 2)}\n</script>`;
}

// CLI implementation for Sitemap Generation
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const args = Object.fromEntries(process.argv.slice(2).map(arg => {
    const [key, value] = arg.split('=');
    return [key.replace('--', ''), value];
  }));

  const docsDir = args.docs || './docs';
  const domain = args.domain || CANONICAL_DOMAIN;
  const outPath = args.out || './dist/sitemap.xml';

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

  const files = getFiles(docsDir);
  const urls = [];
  
  // Add homepage
  const today = new Date().toISOString().split('T')[0];
  urls.push(`  <url>\n    <loc>${domain}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`);

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const meta = parseFrontmatter(content);
    
    const relativePath = path.relative(docsDir, file).replace(/\\/g, '/');
    // Skip auxiliary files if not articles
    if (relativePath.startsWith('assets/')) return;

    const urlPath = `/article/${relativePath.replace(/\.md$/, '')}`;
    const fullUrl = `${domain}${urlPath}`;
    
    const priority = (meta.category === 'anatomy' || meta.category === 'taxonomy' || meta.category === 'ethogram') ? '0.9' : '0.8';
    const lastmod = meta.lastReviewed || meta.dateModified || today;
    
    urls.push(`  <url>\n    <loc>${fullUrl}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${priority}</priority>\n  </url>`);
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
  
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, sitemap);
  console.log(`✅ Sitemap successfully generated at ${outPath} with ${urls.length} URLs for ${domain}`);
}
