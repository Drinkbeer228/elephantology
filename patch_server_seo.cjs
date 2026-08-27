const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// Add import for seo-helper
if (!code.includes("import { generateSchemaJsonLd } from './seo-helper.js';")) {
  code = code.replace("import express from 'express';", "import express from 'express';\nimport { generateSchemaJsonLd } from './seo-helper.js';");
}

// Update injectMetaTags
const oldInjectMetaTags = `
    if (article) {
      const title = (article.title || articlePath.replace('.md', '')) + ' — Слонология';
      const description = article.excerpt || 'Читайте подробную статью в энциклопедии Слонология.';
      
      template = template.replace(
        /<title>.*?<\\/title>/i,
        \`<title>\${title}</title>\`
      );
      
      template = template.replace(
        /<meta property="og:title"[^>]*>/i,
        \`<meta property="og:title" id="og-title" content="\${title}">\`
      );
      
      template = template.replace(
        /<meta property="og:description"[^>]*>/i,
        \`<meta property="og:description" id="og-desc" content="\${description}">\`
      );
      
      template = template.replace(
        /<meta name="description"[^>]*>/i,
        \`<meta name="description" content="\${description}">\`
      );
    }
`;

const newInjectMetaTags = `
    if (article) {
      const title = (article.title || articlePath.replace('.md', '')) + ' — Слонология';
      const description = article.excerpt || 'Читайте подробную статью в энциклопедии Слонология.';
      
      template = template.replace(
        /<title>.*?<\\/title>/i,
        \`<title>\${title}</title>\`
      );
      
      template = template.replace(
        /<meta property="og:title"[^>]*>/i,
        \`<meta property="og:title" id="og-title" content="\${title}">\`
      );
      
      template = template.replace(
        /<meta property="og:description"[^>]*>/i,
        \`<meta property="og:description" id="og-desc" content="\${description}">\`
      );
      
      template = template.replace(
        /<meta name="description"[^>]*>/i,
        \`<meta name="description" content="\${description}">\`
      );

      // --- SEO Schema Injection ---
      const domain = 'https://' + (process.env.PROJECT_DOMAIN || 'slonology.app');
      const articleUrl = domain + url;
      const meta = {
        title: article.title,
        description: description,
        category: article.category,
        tags: article.tags || []
      };
      
      const jsonLdScript = generateSchemaJsonLd(meta, articleUrl);
      template = template.replace('</head>', \`  \${jsonLdScript}\\n</head>\`);
    }
`;

code = code.replace(oldInjectMetaTags.trim(), newInjectMetaTags.trim());

fs.writeFileSync('server.js', code);
console.log('patched server.js with seo-helper integration');
