const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// The views array
html = html.replace(/const views = \['view-home', 'view-modules-hub', 'view-reader', 'view-module-tree', 'view-module-xray', 'view-module-musth', 'view-module-gps', 'view-module-ethogram', 'view-module-skeleton', 'view-module-audio', 'view-module-vet', 'view-module-flashcards'\];/g, "const views = ['view-home', 'view-reader'];");
html = html.replace(/const views = \['view-home', 'view-modules-hub', 'view-module-tree', 'view-module-xray', 'view-module-musth', 'view-module-gps', 'view-module-ethogram', 'view-module-skeleton', 'view-module-audio', 'view-module-vet', 'view-module-flashcards'\];/g, "const views = ['view-home', 'view-reader'];");


fs.writeFileSync('index.html', html);
