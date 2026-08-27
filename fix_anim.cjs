const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// Fix initKingdomCanvas
content = content.replace('function initKingdomCanvas() {', 
`function initKingdomCanvas() {
      if (window.kingdomAnimId) {
        cancelAnimationFrame(window.kingdomAnimId);
        window.kingdomAnimId = null;
      }`);

// Fix render
content = content.replace('requestAnimationFrame(render);', 'window.kingdomAnimId = requestAnimationFrame(render);');

fs.writeFileSync('index.html', content);
