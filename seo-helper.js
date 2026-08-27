import fs from 'fs';
import path from 'path';

export function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const meta = { tags: [] };
  if (match) {
    const yaml = match[1];
    const titleMatch = yaml.match(/title:\s*(.*)/);
    if (titleMatch) meta.title = titleMatch[1].replace(/['"]/g, '').trim();

    const descMatch = yaml.match(/description:\s*(.*)/);
    if (descMatch) meta.description = descMatch[1].replace(/['"]/g, '').trim();
    
    const catMatch = yaml.match(/category:\s*(.*)/);
    if (catMatch) meta.category = catMatch[1].replace(/['"]/g, '').trim();

    const tagsMatch = yaml.match(/tags:\s*\[(.*?)\]/);
    if (tagsMatch) {
      meta.tags = tagsMatch[1].split(',').map(t => t.trim().replace(/['"]/g, ''));
    }
    
    const dateMatch = yaml.match(/last_reviewed:\s*(.*)/);
    if (dateMatch) meta.dateModified = dateMatch[1].replace(/['"]/g, '').trim();
  }
  return meta;
}

export function generateSchemaJsonLd(meta, url) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "headline": meta.title || "Статья",
    "description": meta.description || "",
    "datePublished": meta.dateModified || new Date().toISOString().split('T')[0],
    "dateModified": meta.dateModified || new Date().toISOString().split('T')[0],
    "author": {
      "@type": "Organization",
      "name": "Академическая Лига Слонологии",
      "url": "https://elephantology.ru"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Слонология",
      "logo": {
        "@type": "ImageObject",
        "url": "https://elephantology.ru/assets/logo.png"
      }
    },
    "about": [
      {
        "@type": "Thing",
        "name": "Elephantidae",
        "sameAs": "https://ru.wikipedia.org/wiki/%D0%A1%D0%BB%D0%BE%D0%BD%D0%BE%D0%B2%D1%8B%D0%B5"
      }
    ]
  };

  const latinTaxa = [
    'Loxodonta africana', 'Elephas maximus', 'Mammuthus primigenius', 
    'Loxodonta cyclotis', 'Mammuthus', 'Deinotherium', 'Palaeoloxodon'
  ];
  
  meta.tags.forEach(tag => {
    const isLatin = latinTaxa.some(latin => tag.toLowerCase() === latin.toLowerCase() || tag.toLowerCase().includes(latin.toLowerCase()));
    if (isLatin || /^[A-Z][a-z]+ [a-z]+$/.test(tag)) { // Simple heuristic for latin names
      schema.about.push({
        "@type": "Taxon",
        "name": tag,
        "scientificName": tag,
        "taxonRank": tag.includes(' ') ? "species" : "genus"
      });
    }
  });

  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}

// CLI implementation for Sitemap Generation
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const args = Object.fromEntries(process.argv.slice(2).map(arg => {
    const [key, value] = arg.split('=');
    return [key.replace('--', ''), value];
  }));

  const docsDir = args.docs || './docs';
  const domain = args.domain || 'https://elephantology.ru';
  const outPath = args.out || './public/sitemap.xml';

  function getFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const stat = fs.statSync(path.join(dir, file));
      if (stat.isDirectory()) {
        fileList = getFiles(path.join(dir, file), fileList);
      } else if (file.endsWith('.md')) {
        fileList.push(path.join(dir, file));
      }
    }
    return fileList;
  }

  const files = getFiles(docsDir);
  const urls = [];
  
  // Add homepage
  urls.push(`  <url>\n    <loc>${domain}/</loc>\n    <priority>1.0</priority>\n    <changefreq>daily</changefreq>\n  </url>`);

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const meta = parseFrontmatter(content);
    
    // Convert path (e.g. docs/anatomy/test.md -> /article/anatomy/test)
    const relativePath = path.relative(docsDir, file).replace(/\\/g, '/');
    const urlPath = `/article/${relativePath.replace(/\.md$/, '')}`;
    const fullUrl = `${domain}${urlPath}`;
    
    const priority = (meta.category === 'anatomy' || meta.category === 'taxonomy') ? '0.8' : '0.6';
    const lastmod = meta.dateModified || new Date().toISOString().split('T')[0];
    
    urls.push(`  <url>\n    <loc>${fullUrl}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${priority}</priority>\n    <changefreq>weekly</changefreq>\n  </url>`);
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
  
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, sitemap);
  console.log(`✅ Sitemap successfully generated at ${outPath} with ${urls.length} URLs.`);
}
