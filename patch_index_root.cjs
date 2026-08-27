const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace everything inside <main> with <div id="react-main-root"></div>
const mainContentRegex = /<main class="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 pb-6 pt-4 lg:pt-6">[\s\S]*?<\/main>/g;
html = html.replace(mainContentRegex, '<main class="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pb-12 pt-4 lg:pt-8" id="react-main-root"></main>');

fs.writeFileSync('index.html', html);
