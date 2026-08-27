const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const replacement = `      // Embed Sketchfab 3D Models
      html = html.replace(/\\[sketchfab\\]\\((https?:\\/\\/sketchfab\\.com\\/(?:3d-models|models)\\/[a-zA-Z0-9-]*?([a-zA-Z0-9]{32}))\\)/g, (match, url, id) => {
          return '<div class="sketchfab-embed-wrapper my-6 w-full aspect-video rounded-xl overflow-hidden border border-kingdom-border shadow-lg bg-black"><iframe class="w-full h-full" title="3D Model" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" src="https://sketchfab.com/models/' + id + '/embed?autostart=0&ui_theme=dark"></iframe></div>';
      });

      // 9. Links (PDFs & Internal/External)
      html = html.replace(/\\[(.*?)\\]\\((.*?)\\)/g, (match, label, href) => {`;

code = code.replace(
    /      \/\/ 9\. Links \(PDFs & Internal\/External\)\n      html = html\.replace\(\/\\\[\(\.\*\?\)\\\]\\\\\(\(\.\*\?\)\\\)\/g, \(match, label, href\) => \{/,
    replacement
);

fs.writeFileSync('index.html', code);
console.log('patched sketchfab into index.html');
