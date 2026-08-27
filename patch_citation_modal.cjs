const fs = require('fs');
let content = fs.readFileSync('src/components/CitationModal.tsx', 'utf8');

content = content.replace(
  /const win = window as any;\s*win\.openCitationModal = \(.*?\) => \{[\s\S]*?\};\s*const handleKeyDown/s,
  `const handleOpen = (e: any) => {
      const { title, category, quoteText } = e.detail || {};
      const win = window as any;
      const allArticles = win.allArticles || [];
      const currentPath = win.currentArticlePath || window.location.pathname;
      const found = allArticles.find((a: any) => a.path === currentPath);
      
      const docTitle = title || (found ? found.title : document.title.replace(' — Элефантология', '').replace('Энциклопедия «Элефантология»', '')) || 'Научная монография';
      const cat = category || (found && found.category ? found.category.toUpperCase() : 'ЭНЦИКЛОПЕДИЯ');
      
      setArticleTitle(docTitle);
      setCategoryName(cat);
      if (quoteText) {
        setSelectedText(quoteText);
        setActiveTab('quote');
      }
      setIsOpen(true);
    };
    window.addEventListener('openCitationModal', handleOpen);
    const handleKeyDown`
);

content = content.replace(
  /window\.removeEventListener\('keydown', handleKeyDown\);/,
  `window.removeEventListener('keydown', handleKeyDown);\n      window.removeEventListener('openCitationModal', handleOpen);`
);

fs.writeFileSync('src/components/CitationModal.tsx', content);
