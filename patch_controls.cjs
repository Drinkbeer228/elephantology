const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(/if \\(controls\\.state !== -1\\) \\{.*?\\}/g, '');
code = code.replace(/controls\\.autoRotateSpeed = 1\\.0;/g, "controls.autoRotateSpeed = 1.0; controls.addEventListener('start', () => controls.autoRotate = false);");

fs.writeFileSync('index.html', code);
