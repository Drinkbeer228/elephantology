const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatches = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
const code = scriptMatches[4][1];
const vm = require('vm');
const context = { console, window: {}, document: { addEventListener: ()=>{} }, localStorage: { getItem: ()=>'0', setItem: ()=>{} }, fetch: ()=>{} };
vm.createContext(context);
try {
  vm.runInContext(code, context);
  const md = fs.readFileSync('docs/anatomy/skeletal_system_cranial.md', 'utf8');
  const out = context.parseSimpleMarkdown(md);
  console.log('Parsed successfully:', out.substring(0,50));
} catch(e) {
  console.error(e);
}
