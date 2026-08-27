const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /setTimeout\(renderFlashcard, 150\);\n\s*\}\n\s*\}\n\s*\};\n\s*\/\/ --- SEO LOGIC ---/g;
const replacement = `setTimeout(renderFlashcard, 150);\n    }\n\n    // --- SEO LOGIC ---`;
if (regex.test(html)) {
  html = html.replace(regex, replacement);
  fs.writeFileSync('index.html', html);
  console.log('Fixed syntax error!');
} else {
  console.log('Did not match');
}
