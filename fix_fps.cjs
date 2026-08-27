const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');
const renderRegex = /function render\(\) {\n\s*ctx.clearRect\(0,0,V_WIDTH,V_HEIGHT\);/;
if (code.match(renderRegex)) {
  const newRender = `let lastRenderTime = 0;
      const FPS = 35;
      const frameInterval = 1000 / FPS;
      function render(timestamp) {
        requestAnimationFrame(render);
        if (!timestamp) timestamp = 0;
        let delta = timestamp - lastRenderTime;
        if (delta < frameInterval) return;
        lastRenderTime = timestamp - (delta % frameInterval);

        ctx.clearRect(0,0,V_WIDTH,V_HEIGHT);`;
  code = code.replace(renderRegex, newRender);
  const endRegex = /requestAnimationFrame\(render\);\n\s*\}\n\n\s*render\(\);\n\s*\}/;
  const newEnd = `}\n\n      render();\n    }`;
  code = code.replace(endRegex, newEnd);
  fs.writeFileSync('index.html', code);
  console.log('Fixed FPS');
} else {
  console.log('Regex not matched');
}
