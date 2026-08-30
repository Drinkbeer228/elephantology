import fs from 'fs';
import path from 'path';
import { load } from 'js-yaml';

export const CANONICAL_DOMAIN = 'https://elephantology.ai.studio';

export function isValidDate(str) {
  if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const d = new Date(str);
  return !isNaN(d.getTime()) && d.toISOString().startsWith(str);
}

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
      if (parsed.date_published || parsed.datePublished) {
        const dateVal = String(parsed.date_published || parsed.datePublished).trim();
        meta.datePublished = isValidDate(dateVal) ? dateVal : undefined;
      }
      if (parsed.last_reviewed || parsed.lastReviewed) {
        const lastVal = String(parsed.last_reviewed || parsed.lastReviewed).trim();
        if (isValidDate(lastVal)) {
          meta.lastReviewed = lastVal;
          meta.dateModified = lastVal;
        }
      }
      if (parsed.lang) {
        meta.lang = String(parsed.lang).trim();
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
      if (lastMatch && isValidDate(lastMatch[1].trim())) {
        meta.lastReviewed = lastMatch[1].trim();
        meta.dateModified = meta.lastReviewed;
      }

      const pubMatch = yamlStr.match(/date_published:\s*["']?([^"'\r\n]+)["']?/);
      if (pubMatch && isValidDate(pubMatch[1].trim())) {
        meta.datePublished = pubMatch[1].trim();
      }
    }
  }
  return meta;
}

export function generateSchemaJsonLd(meta, url, includeWebSite = false) {
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
      "inLanguage": meta.lang || "ru",
      "author": meta.author ? {
        "@type": "Person",
        "name": meta.author
      } : {
        "@type": "Organization",
        "name": meta.lang === 'en' ? "Elephantology Editorial Board" : "Редакционная коллегия Слонологии",
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
          "item": `${CANONICAL_DOMAIN}/?category=${encodeURIComponent(meta.category || categoryName)}`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": title,
          "item": url
        }
      ]
    }
  ];

  if (includeWebSite) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "url": `${CANONICAL_DOMAIN}/`,
      "name": "Слонология",
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${CANONICAL_DOMAIN}/?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    });
  }

  const scholarlyArticle = schemas[0];

  // Only attach datePublished if explicitly defined in frontmatter (never fake it with last_reviewed)
  if (meta.datePublished && isValidDate(meta.datePublished)) {
    scholarlyArticle.datePublished = meta.datePublished;
  }
  
  if ((meta.lastReviewed || meta.dateModified) && isValidDate(meta.lastReviewed || meta.dateModified)) {
    scholarlyArticle.dateModified = meta.lastReviewed || meta.dateModified;
  }

  const KNOWN_ELEPHANT_TAXA = [
    'Loxodonta africana', 'Elephas maximus', 'Mammuthus primigenius', 
    'Loxodonta cyclotis', 'Mammuthus', 'Deinotherium', 'Palaeoloxodon',
    'Proboscidea', 'Elephas', 'Loxodonta'
  ];
  
  if (Array.isArray(meta.tags)) {
    meta.tags.forEach(tag => {
      const match = KNOWN_ELEPHANT_TAXA.find(tax => tax.toLowerCase() === tag.trim().toLowerCase());
      if (match) {
        scholarlyArticle.about.push({
          "@type": "Taxon",
          "name": match,
          "scientificName": match,
          "taxonRank": match.includes(' ') ? "species" : "genus"
        });
      }
    });
  }

  if (meta.scientificName || meta.taxon) {
    const taxName = meta.scientificName || meta.taxon;
    scholarlyArticle.about.push({
      "@type": "Taxon",
      "name": taxName,
      "scientificName": taxName,
      "taxonRank": meta.taxonRank || (taxName.includes(' ') ? "species" : "genus")
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
  
  // Find latest valid article modification date for homepage
  let latestArticleDate = '2026-08-24';
  const parsedFiles = files.map(file => {
    const content = fs.readFileSync(file, 'utf8');
    const meta = parseFrontmatter(content);
    const date = (meta.lastReviewed && isValidDate(meta.lastReviewed)) ? meta.lastReviewed : (meta.datePublished && isValidDate(meta.datePublished) ? meta.datePublished : null);
    if (date && date > latestArticleDate) {
      latestArticleDate = date;
    }
    return { file, content, meta };
  });

  // Add homepage with actual latest article content modification date
  urls.push(`  <url>
    <loc>${domain}/</loc>
    <xhtml:link rel="alternate" hreflang="ru" href="${domain}/" />
    <xhtml:link rel="alternate" hreflang="en" href="${domain}/?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${domain}/" />
    <lastmod>${latestArticleDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`);

  parsedFiles.forEach(({ file, meta }) => {
    const relativePath = path.relative(docsDir, file).replace(/\\/g, '/');
    // Skip auxiliary files if not articles
    if (relativePath.startsWith('assets/')) return;

    const urlPath = `/article/${relativePath.replace(/\.md$/, '')}`;
    const fullUrl = `${domain}${urlPath}`;
    
    const priority = (meta.category === 'anatomy' || meta.category === 'taxonomy' || meta.category === 'ethogram') ? '0.9' : '0.8';
    const lastmod = (meta.lastReviewed && isValidDate(meta.lastReviewed)) ? meta.lastReviewed : latestArticleDate;
    
    urls.push(`  <url>
    <loc>${fullUrl}</loc>
    <xhtml:link rel="alternate" hreflang="ru" href="${fullUrl}" />
    <xhtml:link rel="alternate" hreflang="en" href="${fullUrl}?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${fullUrl}" />
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`);
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;
  
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, sitemap);
  console.log(`✅ Sitemap successfully generated at ${outPath} with ${urls.length} URLs for ${domain}`);
}

