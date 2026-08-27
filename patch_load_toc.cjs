const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf-8');

code = code.replace(
  /attachGlossaryTermListeners\(proseContainer\);/,
  `attachGlossaryTermListeners(proseContainer);\n          renderArticleTOC();`
);

// Add the renderArticleTOC function
code += `
function renderArticleTOC() {
  const tocContainer = document.getElementById('article-toc');
  if (!tocContainer) return;
  if (!window.currentArticleToc || window.currentArticleToc.length === 0) {
    tocContainer.innerHTML = '<div class="text-gray-500 italic">Нет оглавления</div>';
    return;
  }
  
  let html = '';
  window.currentArticleToc.forEach(item => {
    const pl = item.level === 3 ? 'pl-4' : '';
    const color = item.level === 3 ? 'text-gray-400 hover:text-white' : 'text-gray-200 font-medium hover:text-kingdom-gold';
    html += \`<a href="#\${item.id}" class="toc-link block \${pl} \${color} transition-colors line-clamp-2 leading-snug cursor-pointer">\${item.title}</a>\`;
  });
  
  tocContainer.innerHTML = html;
  
  // Attach smooth scrolling
  tocContainer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = a.getAttribute('href').substring(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        // close mobile TOC if it's open
        const mobileToc = document.getElementById('mobile-toc-modal');
        if (mobileToc && !mobileToc.classList.contains('hidden')) {
           mobileToc.classList.add('hidden');
        }
        window.scrollTo({
          top: targetEl.getBoundingClientRect().top + window.scrollY - 80,
          behavior: 'smooth'
        });
      }
    });
  });

  // Setup ScrollSpy
  setupScrollSpy();
}

function setupScrollSpy() {
  if (window.tocObserver) {
    window.tocObserver.disconnect();
  }
  
  const links = document.querySelectorAll('#article-toc a');
  const ids = Array.from(links).map(a => a.getAttribute('href').substring(1));
  const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
  
  window.tocObserver = new IntersectionObserver((entries) => {
    // Determine which section is currently active
    // A simple approach is to highlight the last section that has scrolled past the top
    // For intersection observer, we can highlight elements as they intersect the top half
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(link => {
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('text-kingdom-gold', 'font-bold');
            link.classList.remove('text-gray-200', 'text-gray-400');
          } else {
            link.classList.remove('text-kingdom-gold', 'font-bold');
            // Restore proper classes based on level
            // To simplify, we can just let CSS handle it if we toggle a generic active class
          }
        });
      }
    });
  }, { rootMargin: '-80px 0px -60% 0px', threshold: 0 });
  
  sections.forEach(sec => window.tocObserver.observe(sec));
}
`;

fs.writeFileSync('script.js', code);
