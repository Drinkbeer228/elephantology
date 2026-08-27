const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// The replacement logic:
const metaFunction = `
function injectMetaTags(template, url) {
  if (url.startsWith('/article/')) {
    const articlePath = url.replace('/article/', '') + '.md';
    const docsDir = path.join(__dirname, 'docs');
    const articles = getMarkdownFiles(docsDir);
    const article = articles.find(a => a.path.replace(/\\\\/g, '/') === articlePath);
    
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
  }
  
  // Update OG URL in all cases
  const fullUrl = 'https://' + (process.env.PROJECT_DOMAIN || 'slonology.app') + url;
  template = template.replace(
    /<meta property="og:url"[^>]*>/i,
    \`<meta property="og:url" id="og-url" content="\${fullUrl}">\`
  );
  
  return template;
}
`;

code = code.replace("const isProd = process.env.NODE_ENV === 'production';", metaFunction + "\\nconst isProd = process.env.NODE_ENV === 'production';");

// Dev mode
code = code.replace(
  "template = await vite.transformIndexHtml(url, template);",
  "template = await vite.transformIndexHtml(url, template);\n      template = injectMetaTags(template, url);"
);

// Prod mode: we must change express.static so it doesn't serve index.html directly for / requests, or we intercept everything that isn't a file.
// We can change index: 'index.html' to index: false, and then let the fallback handle it.
const prodRegex = /app\.use\(express\.static\(path\.resolve\(__dirname, 'dist'\), \{\s*extensions: \['html'\],\s*index: 'index\.html'\s*\}\)\);[\s\S]*?app\.use\('\*', \(req, res\) => \{\s*res\.sendFile\(path\.resolve\(__dirname, 'dist', 'index\.html'\)\);\s*\}\);/;

const prodReplacement = `
  app.use(express.static(path.resolve(__dirname, 'dist'), {
    index: false
  }));
  app.use('*', (req, res) => {
    let template = fs.readFileSync(path.resolve(__dirname, 'dist', 'index.html'), 'utf-8');
    template = injectMetaTags(template, req.originalUrl);
    res.status(200).set({ 'Content-Type': 'text/html' }).send(template);
  });
`;

code = code.replace(prodRegex, prodReplacement.trim());

fs.writeFileSync('server.js', code);
console.log("Updated server.js");
