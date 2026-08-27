const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatches = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi);
if (scriptMatches) {
    scriptMatches.forEach((script, idx) => {
        const content = script.replace(/<script\b[^>]*>/i, '').replace(/<\/script>/i, '');
        // only evaluate if it has non-whitespace content
        if (content.trim().length > 0 && !content.includes('importmap')) {
            try {
                // For ES modules it will throw syntax error on import, so we replace them for simple syntax check
                const safeContent = content.replace(/import .*/g, '');
                new (require('vm').Script)(safeContent);
                console.log('Script ' + idx + ' syntax OK');
            } catch(e) {
                console.error('Script ' + idx + ' syntax error:', e.message);
                
                // Let's print the specific block if it fails
                const lines = content.split('\n');
                const errLine = e.stack.split('\n')[0];
                console.error('Line reference in stack:', errLine);
            }
        }
    });
}
