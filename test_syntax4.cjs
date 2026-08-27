const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatches = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
const script4 = scriptMatches[4][1].trim();
const lines = script4.split('\n');
console.log('--- Lines 1110 to 1120 ---');
for(let i = 1110; i <= 1120; i++) {
    console.log(i + ': ' + lines[i]);
}
