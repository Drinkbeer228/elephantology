const fs = require('fs');
let content = fs.readFileSync('src/lib/searchEngine.ts', 'utf8');

content = content.replace(/'ethogram\/social_matrix_hierarchy\.md': \[\s*[^\]]+\]\s*,?/g, "");
content = content.replace(/'ethogram\/social_patterns\.md': \[\s*[^\]]+\]\s*,?/g, "");

const newEntry = `  'ethogram/fission-fusion-social-structure.md': [
    'стадо', 'семья', 'матриархат', 'матриарх', 'старая самка', 'иерархия', 'самки', 'сестры', 
    'социальная структура', 'клан', 'родство', 'воспитание слонят', 'поведение', 'социальное поведение', 
    'игры', 'приветствие', 'объятия хоботами', 'ритуалы', 'fission-fusion', 'транслокация'
  ],
`;

content = content.replace(/('ethogram\/chemosensory_communication\.md': \[)/, newEntry + "$1");
fs.writeFileSync('src/lib/searchEngine.ts', content);
