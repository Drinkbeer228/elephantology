const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Replace everything inside parseSimpleMarkdown
const oldParserRegex = /function parseSimpleMarkdown\(md\) \{[\s\S]*?\/\/\s*Plain Paragraph\s*if \(line\.length > 0\) \{\s*result\.push\(.*?\);\s*\}\s*\}\s*return result\.join\('\\n'\);\s*\}/;

const newParser = `function parseSimpleMarkdown(md) {
      if (!md) return '';
      let html = md;
      
      // 1. Strip YAML Frontmatter block (e.g. --- ... ---)
      html = html.replace(/^---[\\s\\S]*?---\\s*/, '');
      // 2. Strip stray frontmatter lines like title: "", description: "", category: ...
      html = html.replace(/^(title|description|category|layout|author|date|tags|toc|comments)\\s*:\\s*".*?"\\s*$/gim, '');
      html = html.replace(/^(title|description|category|layout|author|date|tags|toc|comments)\\s*:\\s*'.*?'\\s*$/gim, '');
      html = html.replace(/^(title|description|category|layout|author|date|tags|toc|comments)\\s*:\\s*.*$/gim, '');

      // Embed Sketchfab 3D Models explicitly before marked parses it, because marked might wrap it in a p tag if we use HTML but block HTML is left alone.
      html = html.replace(/\\[sketchfab\\]\\((https?:\\/\\/sketchfab\\.com\\/(?:3d-models|models)\\/[a-zA-Z0-9-]*?([a-zA-Z0-9]{32}))\\)/g, (match, url, id) => {
          return \`<div class="sketchfab-embed-wrapper my-6 w-full aspect-video rounded-xl overflow-hidden border border-kingdom-border shadow-lg bg-black">
            <iframe class="w-full h-full" title="3D Model" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" src="https://sketchfab.com/models/\${id}/embed?autostart=0&ui_theme=dark"></iframe>
          </div>\`;
      });
      
      // Use full-featured marked parser if available (loaded via Vite main.tsx)
      if (window.marked) {
        // First, normalize MkDocs Callouts so they can be parsed by marked
        // e.g. "!!! warning" or "??? tip"
        // Since marked doesn't have native callouts without complex block extensions,
        // we can let our custom renderer handle it if we ensure they are parsed as paragraphs.
        // We actually already have a renderer override for paragraphs starting with !!!.
        return window.marked.parse(html);
      }

      return "<p>Markdown parser failed to load.</p>";
    }`;

html = html.replace(oldParserRegex, newParser);
fs.writeFileSync('index.html', html);
console.log("Updated parseSimpleMarkdown in index.html");
