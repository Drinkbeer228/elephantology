const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');
content = content.replace(/      if \(window\.kingdomAnimId\) \{\n        cancelAnimationFrame\(window\.kingdomAnimId\);\n        window\.kingdomAnimId = null;\n      \}\n/, '');
fs.writeFileSync('index.html', content);
