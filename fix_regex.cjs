const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// Replace the broken multiline regex with the correct single-line one
code = code.replace(
  /const matches = \[\.\.\.text\.matchAll\(\/###\\s\+\(\.\+\?\)\(\?:\\s\+\\{\.\*\?\\}\)\?\n\(\[\\s\\S\]\+\?\)\(\?=\n###\|\n##\|\$\)\/g\)/,
  'const matches = [...text.matchAll(/###\\\\s+(.+?)(?:\\\\s+\\\\{.*?\\\\})?\\\\n([\\\\s\\\\S]+?)(?=\\\\n###|\\\\n##|$)/g)'
);

// Fallback if the above doesn't match:
code = code.replace(
  /const matches = \[\.\.\.text\.matchAll\(\/###\\s\+\(\.\+\?\)\(\?:\\s\+\\{\.\*\?\\}\)\?[\s\S]*?g\)/,
  'const matches = [...text.matchAll(/###\\\\s+(.+?)(?:\\\\s+\\\\{.*?\\\\})?\\\\n([\\\\s\\\\S]+?)(?=\\\\n###|\\\\n##|$)/g)'
);

fs.writeFileSync('index.html', code);
