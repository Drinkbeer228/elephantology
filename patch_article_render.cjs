const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The React root #react-main-root must exist in the HTML so that App can mount in it.
// Wait, I replaced <main> with <main id="react-main-root"></main> earlier. Let's verify it exists.
if (!html.includes('react-main-root')) {
   console.log("Error: react-main-root not found!");
} else {
   console.log("react-main-root found!");
}
