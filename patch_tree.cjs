const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const targetAcacia = `        // Tree 2: Broad Acacia (x: 410, y: 68)
        ctx.fillStyle = trunkColor;
        ctx.fillRect(412, 72, 6, 28);
        ctx.fillRect(400, 76, 12, 3);
        ctx.fillRect(418, 74, 14, 3);
        ctx.fillStyle = leafColor;
        ctx.beginPath();
        ctx.ellipse(415, 66, 26, 10, 0, 0, Math.PI*2);
        ctx.fill();`;

const newAcacia = `        // Tree 2: Broad Acacia (x: 410, y: 68)
        ctx.fillStyle = trunkColor;
        ctx.fillRect(412, 72, 6, 28);
        ctx.fillRect(400, 76, 12, 3);
        ctx.fillRect(418, 74, 14, 3);
        ctx.fillStyle = leafColor;
        ctx.beginPath();
        ctx.ellipse(415 + windSway * 1.2, 66, 26, 10, 0, 0, Math.PI*2);
        ctx.fill();`;

code = code.replace(targetAcacia, newAcacia);
fs.writeFileSync('index.html', code);
