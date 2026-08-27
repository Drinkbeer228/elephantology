const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// 1. Add handleRoute and updateDocumentMeta functions at the top of the script tag
const metaFunctions = `
    // SEO & Routing
    function updateDocumentMeta(title, description) {
      document.title = title;
      
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', title);
      
      let ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', window.location.href);

      if (description) {
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', description);
        
        let ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', description);
      }
    }

    function handleRoute() {
      const path = window.location.pathname;
      if (path.startsWith('/article/')) {
        let articlePath = path.replace('/article/', '') + '.md';
        loadArticle(articlePath, false);
      } else {
        showHome(false);
      }
    }
`;

code = code.replace("function copyArticleLink() {", metaFunctions + "\\n    function copyArticleLink() {");

// 2. Add popstate listener in initApp
code = code.replace("if (soundEnabled) {", "window.addEventListener('popstate', handleRoute);\n      handleRoute();\n      if (soundEnabled) {");

// 3. Update showHome to accept pushState
code = code.replace("function showHome() {", "function showHome(pushState = true) {\n      if (pushState) {\n        history.pushState(null, '', '/');\n        updateDocumentMeta('Энциклопедия «Слонология»', 'База знаний о слонах, их анатомии, экологии и эволюции.');\n      }");

// 4. Update loadArticle to accept pushState and update meta
code = code.replace("async function loadArticle(path) {", "async function loadArticle(path, pushState = true) {");

// Find where loadArticle sets HTML and add meta update
const metaUpdate = `
          if (pushState) {
            const urlPath = '/article/' + path.replace(/\\.md$/, '');
            if (window.location.pathname !== urlPath) {
              history.pushState(null, '', urlPath);
            }
          }
          const pageTitle = (article.title || path.replace('.md', '')) + ' — Слонология';
          updateDocumentMeta(pageTitle, article.excerpt || 'Читайте подробную статью в энциклопедии Слонология.');
`;
code = code.replace("if (window.resetToc) window.resetToc();", metaUpdate + "\\n          if (window.resetToc) window.resetToc();");

fs.writeFileSync('index.html', code);
console.log("Updated routing");
