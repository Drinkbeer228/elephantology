const fs = require('fs');
let content = fs.readFileSync('src/lib/searchEngine.ts', 'utf8');

const newEntry = `  'ethogram/cooperation-and-problem-solving.md': [
    'кооперация', 'инсайт', 'орудия', 'совместное вытягивание', 'читерство', 'loose-string', 
    'головоломки', 'обогащение среды', 'стереотипии', 'когнитивная этология', 'кандула', 'мухобойки'
  ],
`;

content = content.replace(/('ethogram\/fission-fusion-social-structure\.md': \[)/, newEntry + "$1");
fs.writeFileSync('src/lib/searchEngine.ts', content);
