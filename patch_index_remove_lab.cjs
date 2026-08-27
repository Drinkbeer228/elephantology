const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove the entire <div id="view-module"> ... </div> block
// It ends right before <!-- FOOTER -->
html = html.replace(/<div id="view-module"[\s\S]*?<!-- FOOTER -->/, '<!-- FOOTER -->');

// 2. Remove the drawer mode switcher (ARTICLES vs MODULES)
html = html.replace(/<!-- DRAWER MODE SWITCHER \(ARTICLES vs MODULES\) -->[\s\S]*?<!-- ARTICLES VIEW INSIDE DRAWER -->/, '<!-- ARTICLES VIEW INSIDE DRAWER -->');

// 3. Remove the modules container from the drawer
html = html.replace(/<!-- MODULES VIEW INSIDE DRAWER \(hidden by default\) -->[\s\S]*?<\/div>\s*<!-- \/MODAL CONTAINER -->/, '</div>\n    <!-- /MODAL CONTAINER -->');

// 4. Remove AI Chat Modal and FAB
html = html.replace(/<!-- AI CHAT FAB -->[\s\S]*?<!-- AI CHAT MODAL -->[\s\S]*?<!-- \/AI CHAT MODAL -->/, '');

fs.writeFileSync('index.html', html);
