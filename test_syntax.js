const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatches = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi);
if (scriptMatches) {
    scriptMatches.forEach((script, idx) => {
        const content = script.replace(/<script\b[^>]*>/i, '').replace(/<\/script>/i, '');
        try {
            require('vm').Script(content);
            console.log('Script ' + idx + ' syntax OK');
        } catch(e) {
            console.error('Script ' + idx + ' syntax error:', e.message);
        }
    });
}
