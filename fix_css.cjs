const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const cssToAdd = `
    .prose-kingdom h1,
    .prose-kingdom h2,
    .prose-kingdom h3,
    .prose-kingdom h4 {
      scroll-margin-top: 5rem;
    }
`;

html = html.replace('.prose-kingdom p {', cssToAdd + '\\n    .prose-kingdom p {');
fs.writeFileSync('index.html', html);
