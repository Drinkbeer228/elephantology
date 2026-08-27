const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf-8');

// Replace table start
code = code.replace(
  /'<div class="overflow-x-auto my-4"><table class="w-full text-xs text-left border-collapse bg-kingdom-card rounded-xl overflow-hidden border border-kingdom-border">'/g,
  `'<div class="table-wrapper"><div class="table-scroll-container"><table class="w-full text-xs text-left border-collapse bg-kingdom-card"></div>'`
);
// Fix the closing tags. Actually, wait. The replace above was buggy. I'll just write a regex.

fs.writeFileSync('script.js', code);
