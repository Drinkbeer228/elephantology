const fs = require('fs');
let code = fs.readFileSync('docs/anatomy/skeletal_system_cranial.md', 'utf8');
code = code.replace(/<div id="skull-3d-viewer"[\s\S]*?<\/div>\n<\/div>/, '[sketchfab](https://sketchfab.com/3d-models/79b7f2e273f2457a93e1cccb13c27013)');
fs.writeFileSync('docs/anatomy/skeletal_system_cranial.md', code);
console.log('Reverted markdown');
