const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/import \{ FactModal \} from '.\/components\/FactModal';\n/, "");
content = content.replace(/<FactModal \/>\n/, "");

// Replace window methods with event listeners
content = content.replace(/\(window as any\)\.showHome = showHome;\s*\(window as any\)\.loadArticle = showArticle;/s, 
`  useEffect(() => {
    const handleShowHome = () => showHome();
    const handleLoadArticle = (e: any) => showArticle(e.detail);
    window.addEventListener('show-home', handleShowHome);
    window.addEventListener('load-article', handleLoadArticle);
    return () => {
      window.removeEventListener('show-home', handleShowHome);
      window.removeEventListener('load-article', handleLoadArticle);
    };
  }, []);`);

fs.writeFileSync('src/App.tsx', content);
