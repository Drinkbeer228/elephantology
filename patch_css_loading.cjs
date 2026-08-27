const fs = require('fs');

// 1. Add CSS import to main.tsx
let mainTsx = fs.readFileSync('src/main.tsx', 'utf8');
if (!mainTsx.includes("import '../assets/stylesheets/input.css'")) {
    mainTsx = "import '../assets/stylesheets/input.css';\n" + mainTsx;
    fs.writeFileSync('src/main.tsx', mainTsx);
}

// 2. Remove broken css link from index.html
let indexHtml = fs.readFileSync('index.html', 'utf8');
indexHtml = indexHtml.replace('<link rel="stylesheet" href="/assets/stylesheets/input.css">', '');
fs.writeFileSync('index.html', indexHtml);
