const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

content = content.replace(
  'id="main-view-container" class="bg-kingdom-card border border-kingdom-border rounded-2xl p-4 sm:p-6 shadow-2xl min-h-[600px] relative"',
  'id="main-view-container" class="bg-[#1b1d24]/50 backdrop-blur-sm border border-white/5 rounded-3xl p-4 sm:p-8 shadow-2xl min-h-[600px] relative transition-all duration-300"'
);

content = content.replace(
  '<noscript>',
  '<!--'
);
content = content.replace(
  '</noscript>',
  '-->'
);

fs.writeFileSync('index.html', content);
