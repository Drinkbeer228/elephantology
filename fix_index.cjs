const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const brokenRegexPart1 = "const matches = [...text.matchAll(/###\\s+(.+?)(?:\\s+\\{.*?\\})?\\n([\\s\\S]+?)(?=\\n###|\\n##|$)/g)];";
const brokenRegexPart2 = "const matches = [...text.matchAll(/###\\s+(.+?)(?:\\s+\\{.*?\\})?\n([\\s\\S]+?)(?=\n###|\n##|$)/g)];";
code = code.replace(brokenRegexPart2, brokenRegexPart1);

const brokenReplacePart1 = "const def = m[2].trim().replace(/\\n+/g, ' ');";
const brokenReplacePart2 = "const def = m[2].trim().replace(/\n+/g, ' ');";
code = code.replace(brokenReplacePart2, brokenReplacePart1);

// What about other literal newlines that were broken?
// Let's just fix anything inside <script> that has \n as literal newline where it shouldn't.
// Wait, the error the user sees:
// SyntaxError: Invalid escape in identifier: '\'
// Could it be something else?

fs.writeFileSync('index.html', code);
