const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf8');

const targetFunction = `      html = html.replace(/\\[(.*?)\\]\\((.*?)\\)/g, (match, label, href) => {
        if (href.endsWith('.pdf')) {
          const pdfName = href.split('/').pop();
          return \`<a href="/docs/assets/books/\${pdfName}" target="_blank" class="inline-flex items-center gap-1.5 font-semibold text-kingdom-gold hover:underline bg-kingdom-gold/10 px-2 py-0.5 rounded border border-kingdom-gold/30 my-1"><i data-lucide="file-down" class="w-4 h-4"></i> \${label} (PDF)</a>\`;
        }
        return \`<a href="\${href}" class="text-kingdom-gold hover:underline font-medium">\${label}</a>\`;
      });`;

const newFunction = `      // Embed Sketchfab 3D Models
      html = html.replace(/\\[sketchfab\\]\\((https?:\\/\\/sketchfab\\.com\\/(?:3d-models|models)\\/[a-zA-Z0-9-]*?([a-zA-Z0-9]{32}))\\)/g, (match, url, id) => {
          return \`<div class="sketchfab-embed-wrapper my-6 w-full aspect-video rounded-xl overflow-hidden border border-kingdom-border shadow-lg bg-black"><iframe class="w-full h-full" title="3D Model" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" src="https://sketchfab.com/models/\${id}/embed?autostart=1&ui_theme=dark"></iframe></div>\`;
      });
      // Existing Links
      html = html.replace(/\\[(.*?)\\]\\((.*?)\\)/g, (match, label, href) => {
        if (href.endsWith('.pdf')) {
          const pdfName = href.split('/').pop();
          return \`<a href="/docs/assets/books/\${pdfName}" target="_blank" class="inline-flex items-center gap-1.5 font-semibold text-kingdom-gold hover:underline bg-kingdom-gold/10 px-2 py-0.5 rounded border border-kingdom-gold/30 my-1"><i data-lucide="file-down" class="w-4 h-4"></i> \${label} (PDF)</a>\`;
        }
        return \`<a href="\${href}" class="text-kingdom-gold hover:underline font-medium" target="_blank">\${label}</a>\`;
      });`;

code = code.replace(targetFunction, newFunction);
fs.writeFileSync('script.js', code);
console.log('patched script.js for sketchfab');
