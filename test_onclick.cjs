const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html);
const elements = dom.window.document.querySelectorAll('[onclick]');

elements.forEach((el, i) => {
  const code = el.getAttribute('onclick');
  try {
    new Function(code);
  } catch (err) {
    console.error(`Element ${i} onclick syntax error:`, err.message, 'Code:', code);
  }
});
