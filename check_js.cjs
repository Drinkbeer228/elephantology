const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const scriptMatches = content.match(/<script>([\s\S]*?)<\/script>/g);
if (scriptMatches) {
  scriptMatches.forEach((script, i) => {
    fs.writeFileSync(`script_${i}.js`, script.replace(/<\/?script>/g, ''));
  });
}
