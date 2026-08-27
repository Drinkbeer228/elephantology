const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// replace contents of <script> with spaces to keep line numbers
html = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, (match, p1) => {
  return '<script>' + p1.replace(/[^\n]/g, ' ') + '</script>';
});

const regex = /<(\/?)(div|section|main)[^>]*>/ig;
let match;
const stack = [];
let error = null;

const lines = html.split('\n');
function getLineNumber(index) {
  let chars = 0;
  for(let i=0; i<lines.length; i++) {
    chars += lines[i].length + 1;
    if(chars > index) return i + 1;
  }
  return -1;
}

while ((match = regex.exec(html)) !== null) {
  const isClosing = match[1] === '/';
  const tag = match[2].toLowerCase();
  const line = getLineNumber(match.index);
  
  if (isClosing) {
    if (stack.length === 0) {
      error = `Extra closing tag </${tag}> at line ${line}`;
      break;
    }
    const last = stack.pop();
    if (last.tag !== tag) {
      error = `Mismatched tags: <${last.tag}> at line ${last.line} closed by </${tag}> at line ${line}`;
      break;
    }
  } else {
    stack.push({tag, line, full: match[0]});
  }
}

if (error) console.log(error);
else if (stack.length > 0) console.log("Unclosed tags remaining:", stack.slice(-5).map(t => `<${t.tag}> at line ${t.line}`).join(', '));
else console.log("All div/section/main tags match perfectly!");
