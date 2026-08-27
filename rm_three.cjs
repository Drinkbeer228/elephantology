const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');
const startIdx = code.indexOf('<script type="module">');
if (startIdx !== -1) {
    code = code.substring(0, startIdx);
    code += '</body>\n</html>';
    fs.writeFileSync('index.html', code);
    console.log('Removed three script');
} else {
    console.log('Not found');
}
