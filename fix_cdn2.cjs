const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const regex = /  <!-- Tailwind CSS & Lucide Icons & Marked Parser -->[\s\S]*?<\/script>/;

const replaceStr = `  <!-- Tailwind CSS & Lucide Icons & Marked Parser -->
  <link rel="stylesheet" href="/assets/stylesheets/tailwind.css">
  <script src="https://unpkg.com/lucide@latest"></script>`;

content = content.replace(regex, replaceStr);
fs.writeFileSync('index.html', content);
