const fs = require('fs');

let content = fs.readFileSync('prerender.js', 'utf8');

// Replace the string output to inject JSON stringified raw text
content = content.replace(
  /outHTML = outHTML\.replace\('<\/body>', `<script>window\.__PRERENDERED_ARTICLE__ = "\${urlPath}"; window\.__PRERENDERED_ARTICLE_DATA__ = .*?<\/script><\/body>'\);/s,
  "outHTML = outHTML.replace('</body>', `<script>window.__PRERENDERED_ARTICLE__ = \"${urlPath}\";</script></body>`);"
);

content = content.replace(
  /outHTML = outHTML\.replace\('<\/body>', `<script>window\.__PRERENDERED_ARTICLE__ = "\${urlPath}";<\/script><\/body>'\);/s,
  "const escapedRaw = JSON.stringify(content).replace(/</g, '\\\\u003c');\n  outHTML = outHTML.replace('</body>', `<script>window.__PRERENDERED_ARTICLE__ = \"${urlPath}\"; window.__PRERENDERED_RAW_MARKDOWN__ = ${escapedRaw};</script></body>`);"
);

fs.writeFileSync('prerender.js', content);
