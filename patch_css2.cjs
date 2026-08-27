const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf-8');

css = css.replace(
  /background: linear-gradient\(to right, transparent, #1b1d24\);/,
  `background: linear-gradient(to right, transparent, rgba(27, 29, 36, 0.9));`
);

fs.writeFileSync('src/index.css', css);
