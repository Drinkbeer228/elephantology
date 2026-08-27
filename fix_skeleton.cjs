const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');
code = code.replace(
  'id="skeleton-placeholder-text">',
  'id="skeleton-placeholder-text" class="absolute inset-0 flex items-center justify-center pointer-events-none text-kingdom-muted text-[11px] text-center px-4 hidden">'
);
fs.writeFileSync('index.html', code);
