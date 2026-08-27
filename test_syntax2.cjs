const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatches = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi);
const script4 = scriptMatches[4].replace(/<script\b[^>]*>/i, '').replace(/<\/script>/i, '');
const lines = script4.split('\n');
console.log('--- Lines 1290 to 1310 ---');
for(let i = 1290; i <= 1310; i++) {
    console.log(i + ': ' + lines[i]);
}
