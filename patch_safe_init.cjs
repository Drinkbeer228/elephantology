const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace('init3DViewerIfPresent();', 'if (window.init3DViewerIfPresent) window.init3DViewerIfPresent(); else setTimeout(() => window.init3DViewerIfPresent && window.init3DViewerIfPresent(), 500);');

fs.writeFileSync('index.html', code);
