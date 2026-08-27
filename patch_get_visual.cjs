const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const targetFunction = `    function getArticleScientificVisual(path, articleTitle) {
      if (!path) return '';`;

const newFunction = `    function getArticleScientificVisual(path, articleTitle) {
      if (!path) return '';
      
      // Inject Interactive Anatomy Model for Anatomy index
      if (path === 'anatomy/index.md') {
        setTimeout(() => {
          if (window.mountInteractiveAnatomy) {
            window.mountInteractiveAnatomy('interactive-anatomy-mount');
          }
        }, 100);
        return '<div id="interactive-anatomy-mount"></div>';
      }
`;

code = code.replace(targetFunction, newFunction);
fs.writeFileSync('index.html', code);
console.log('patched index.html');
