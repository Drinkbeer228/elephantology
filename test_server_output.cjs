const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('/tmp/article.html', 'utf8');
const dom = new JSDOM(html);
const scripts = dom.window.document.querySelectorAll('script:not([src])');

scripts.forEach((s, i) => {
  try {
    new Function(s.textContent);
    console.log(`Script ${i} is valid.`);
  } catch (err) {
    console.error(`Script ${i} syntax error:`, err.message);
  }
});
