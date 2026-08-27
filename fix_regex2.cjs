const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(
  /const matches = \[\.\.\.text\.matchAll\(\/###\\\\s\+\(\.\+\?\)\(\?:\\\\s\+\\\\{\.\*\?\\}\)\?\\\\n\(\[\\\\s\\\\S\]\+\?\)\(\?=\\\\n###|\\\\n##\|\$\)\/g\)/,
  'const matches = [...text.matchAll(/###\\\\s+(.+?)(?:\\\\s+\\\\{.*?\\\\})?\\\\n([\\\\s\\\\S]+?)(?=\\\\n###|\\\\n##|$)/g)'
);

// Actually, in JS string, '\\s' produces '\s'. 
// To output `\s` into the file, we write `\\s`.
// I will just use split and join to be absolutely safe.
let target = "const matches = [...text.matchAll(/###\\\\s+(.+?)(?:\\\\s+\\\\{.*?\\\\})?\\\\n([\\\\s\\\\S]+?)(?=\\\\n###|\\\\n##|$)/g)];";
let correct = "const matches = [...text.matchAll(/###\\s+(.+?)(?:\\s+\\{.*?\\})?\\n([\\s\\S]+?)(?=\\n###|\\n##|$)/g)];";
code = code.split(target).join(correct);

fs.writeFileSync('index.html', code);
