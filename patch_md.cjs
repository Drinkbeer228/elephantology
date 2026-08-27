const fs = require('fs');
let code = fs.readFileSync('docs/anatomy/skeletal_system_cranial.md', 'utf8');

const targetStr = `[sketchfab](https://sketchfab.com/3d-models/79b7f2e273f2457a93e1cccb13c27013)`;
const newStr = `<div id="skull-3d-viewer" class="w-full aspect-video bg-[#1e2230] rounded-xl overflow-hidden relative shadow-lg my-6 border border-kingdom-border flex items-center justify-center">
  <div id="viewer-loading" class="text-kingdom-gold font-pixel text-xs animate-pulse">Загрузка 3D модели (DAE)...</div>
</div>`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, newStr);
    fs.writeFileSync('docs/anatomy/skeletal_system_cranial.md', code);
    console.log('patched markdown');
} else {
    console.log('could not find sketchfab link in markdown');
}
