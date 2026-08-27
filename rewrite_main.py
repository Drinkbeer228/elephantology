import re

with open('src/main.tsx', 'r') as f:
    code = f.read()

# We want to replace everything from `(window as any).loadArticle = async` to `// Setup Leaflet default icons for Vite`
regex = r"\(window as any\)\.loadArticle = async \(path: string\) => \{[\s\S]*?\};\n\n\/\/ Setup Leaflet default icons for Vite"

new_load_article = r"""(window as any).loadArticle = async (path: string) => {
  const banner = document.getElementById('kingdom-banner-container');
  if (banner) banner.style.display = 'none';
  const mainRoot = document.getElementById('react-main-root');
  if (mainRoot) mainRoot.style.display = 'none';
  const viewReader = document.getElementById('view-reader');
  if (viewReader) viewReader.style.display = 'block';

  try {
    const safePath = path.endsWith('.md') ? path : `${path}.md`;
    const res = await fetch(`/api/article?path=${encodeURIComponent(safePath)}`);
    if (!res.ok) throw new Error('Статья не найдена');
    let md = await res.text();
    
    (window as any).resetToc();
    
    // Clean frontmatter
    let frontmatterTitle = null;
    let metadata: any = {
      evidenceLevel: null,
      difficulty: null,
      lastReviewed: null,
      referenceCount: 0,
      category: safePath.split('/')[0] || null,
      tags: []
    };

    if (md.startsWith('---')) {
      const parts = md.split('---');
      if (parts.length >= 3) {
        const fm = parts[1];
        
        const fmTitleMatch = fm.match(/^title:\s*["']?([^"'\n]+)["']?/m);
        if (fmTitleMatch) frontmatterTitle = fmTitleMatch[1].trim();

        metadata.evidenceLevel = fm.match(/^evidence_level:\s*["']?([^"'\n]+)["']?/m)?.[1]?.trim() || null;
        metadata.difficulty = fm.match(/^difficulty:\s*["']?([^"'\n]+)["']?/m)?.[1]?.trim() || null;
        metadata.lastReviewed = fm.match(/^last_reviewed:\s*["']?([^"'\n]+)["']?/m)?.[1]?.trim() || null;
        
        const tagsMatch = fm.match(/^tags:\s*\[(.*?)\]/m);
        if (tagsMatch) {
            metadata.tags = tagsMatch[1].split(',').map((t: string) => t.trim().replace(/['"]/g, ''));
        }

        const refMatches = fm.match(/^[ \t]*-[ \t]+id:/gm);
        if (refMatches) metadata.referenceCount = refMatches.length;

        (window as any).currentEvidenceLevel = metadata.evidenceLevel;
        
        md = parts.slice(2).join('---').trim();
      }
    }

    const titleMatch = md.match(/^#\s+(.+)$/m);
    const title = frontmatterTitle || (titleMatch ? titleMatch[1].trim() : 'Чтение');

    const catMapTitle: any = { ecology: 'Экология', anatomy: 'Анатомия', ethogram: 'Этология', veterinary: 'Ветеринария', taxonomy: 'Таксономия', conservation: 'Охрана' };
    const breadcrumbCategory = catMapTitle[metadata.category] || 'Каталог';
    
    const catName = document.getElementById('breadcrumb-category-name');
    if (catName) {
       catName.textContent = breadcrumbCategory;
    }
    
    const titleEl = document.getElementById('breadcrumb-article-title');
    if (titleEl) titleEl.textContent = title;

    let html = await marked.parse(md);
    
    let breadcrumbHtml = `<nav class="flex items-center gap-2 mb-6 text-[11px] font-mono tracking-wider text-gray-500 uppercase flex-wrap">
        <a href="javascript:void(0)" onclick="window.showHome()" class="hover:text-kingdom-gold transition-colors">Главная</a>
        <span class="text-gray-700">/</span>
        <span class="text-gray-400">${breadcrumbCategory}</span>
        <span class="text-gray-700">/</span>
        <span class="text-gray-300 truncate max-w-[150px] sm:max-w-xs">${title}</span>
    </nav>`;
    
    html = breadcrumbHtml + html;

    // Build Metadata Row HTML
    const diffMap: any = { beginner: 'Начальный', intermediate: 'Средний', advanced: 'Продвинутый' };
    const diffText = diffMap[metadata.difficulty?.toLowerCase()] || metadata.difficulty || 'Стандарт';
    const catMapFull: any = { ecology: 'ЭКОЛОГИЯ И СРЕДА ОБИТАНИЯ', anatomy: 'АНАТОМИЯ И ФИЗИОЛОГИЯ', ethogram: 'ЭТОЛОГИЯ И ПОВЕДЕНИЕ', veterinary: 'ВЕТЕРИНАРИЯ И ПАТОЛОГИИ', taxonomy: 'ТАКСОНОМИЯ И ЭВОЛЮЦИЯ', conservation: 'ОХРАНА И СОХРАНЕНИЕ ВИДОВ' };
    const catText = catMapFull[metadata.category?.toLowerCase()] || 'КАТАЛОГ';
    
    let metaHtml = `<div class="flex flex-wrap items-center gap-x-2 gap-y-2 mt-4 mb-8 text-xs font-mono uppercase tracking-wider text-gray-400">`;
    metaHtml += `<span>${catText}</span> <span class="text-gray-600">·</span> `;
    metaHtml += `<span class="text-kingdom-gold">${diffText}</span> <span class="text-gray-600">·</span> `;
    metaHtml += `<span>${metadata.referenceCount} ИСТОЧНИКОВ</span>`;
    if (metadata.lastReviewed) {
      metaHtml += ` <span class="text-gray-600">·</span> <span>ПРОВЕРЕНО: ${metadata.lastReviewed}</span>`;
    }
    if (metadata.evidenceLevel) {
      metaHtml += ` <span class="text-gray-600">·</span> <span class="bg-[#242733] text-gray-400 px-2 py-0.5 rounded border border-[#34384a] font-medium">${metadata.evidenceLevel}</span>`;
    }
    metaHtml += `</div>`;

    // Inject Metadata Row after H1
    if (html.includes('</h1>')) {
      html = html.replace('</h1>', `</h1>${metaHtml}`);
    } else {
      html = metaHtml + html;
    }

    // Add related articles block
    try {
        const articlesRes = await fetch('/api/articles');
        if (articlesRes.ok) {
            const allArticles = await articlesRes.json();
            
            // Extract exact explicit cross-references from the article's markdown (e.g. `(path/to/article.md)`)
            const explicitLinksMatches = [...md.matchAll(/\(([^)]+\.md)\)/g)].map(m => m[1]);
            const explicitLinks = explicitLinksMatches.map(l => l.startsWith('/') ? l.substring(1) : l); // simple normalization

            const narrowTags = (metadata.tags || []).filter((t: string) => !['слон', 'слоны', 'анатомия', 'экология', 'ветеринария'].includes(t.toLowerCase()));
            
            const related = allArticles
                .filter((a: any) => a.path !== safePath && (a.tags || explicitLinks.includes(a.path)))
                .map((a: any) => {
                    let score = 0;
                    let relationSub = '';
                    
                    if (explicitLinks.includes(a.path)) {
                        score += 100; // Explicit links get highest priority
                        relationSub = 'Упоминается в статье';
                    } else {
                        const intersection = a.tags.filter((t: string) => narrowTags.includes(t));
                        if (intersection.length >= 2) {
                            score += 50 + intersection.length;
                            relationSub = `По теме: ${intersection.slice(0, 2).join(', ')}`;
                        } else if (intersection.length === 1) {
                            score += 10;
                            relationSub = `По теме: ${intersection[0]}`;
                        } else if (a.category === metadata.category) {
                            score += 1;
                            relationSub = `Из раздела «${catText}»`;
                        }
                    }
                    return { ...a, score, relationSub };
                })
                .filter((a: any) => a.score > 0)
                .sort((a: any, b: any) => b.score - a.score)
                .slice(0, 3);
                
            if (related.length > 0) {
                let relatedHtml = `<div class="mt-16 pt-8 border-t border-[#34384a]">`;
                relatedHtml += `<h3 class="text-lg font-bold text-white mb-4">С этим связано:</h3>`;
                relatedHtml += `<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">`;
                related.forEach((a: any) => {
                    const catMapEmoji: any = { ecology: '🌍', anatomy: '🐘', ethogram: '🧠', veterinary: '🩺', taxonomy: '🧬', conservation: '🛡️' };
                    const emoji = catMapEmoji[a.category] || '📖';
                    
                    relatedHtml += `
                      <a href="javascript:void(0)" onclick="window.loadArticle('${a.path}')" class="block p-4 rounded-xl border border-[#34384a] bg-[#181a22] hover:border-kingdom-gold hover:bg-[#242733] transition-all group">
                        <div class="flex items-center gap-2 mb-2">
                           <div class="text-lg filter drop-shadow-md">${emoji}</div>
                           <div class="text-[10px] text-gray-500 font-mono uppercase truncate">${a.relationSub}</div>
                        </div>
                        <h4 class="font-bold text-sm text-gray-300 group-hover:text-white mb-1 line-clamp-2">${a.title}</h4>
                      </a>`;
                });
                relatedHtml += `</div></div>`;
                html += relatedHtml;
            }
        }
    } catch (e) {
        console.error("Could not fetch related articles", e);
    }

    const contentEl = document.getElementById('article-prose-content');
    if (contentEl) {
      contentEl.innerHTML = html;
      
      // Setup Footnote Popovers
      const footnoteLinks = contentEl.querySelectorAll('sup a[href^="#fn:"]');
      footnoteLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = link.getAttribute('href')?.substring(1);
          if (targetId) {
             const footnoteLi = document.getElementById(targetId);
             if (footnoteLi) {
                // Show popover
                showFootnotePopover(footnoteLi.innerHTML, link as HTMLElement);
             }
          }
        });
      });
    }

    if ((window as any).lucide && (window as any).lucide.createIcons) {
      (window as any).lucide.createIcons();
    }
    
    const toc = (window as any).getToc();
    const tocHtml = toc.map((t: any) => {
      const pl = t.depth === 2 ? 'pl-0' : 'pl-4';
      return `<a href="javascript:void(0)" onclick="document.getElementById('${t.id}')?.scrollIntoView({behavior: 'smooth'})" class="hover:text-kingdom-gold transition-colors block ${pl}">${t.text}</a>`;
    }).join('');
    const tocEl = document.getElementById('article-toc');
    if (tocEl) tocEl.innerHTML = tocHtml || '<div class="text-kingdom-muted">Нет оглавления</div>';
    
    window.scrollTo({top: 0, behavior: 'smooth'});
  } catch(err: any) {
    const contentEl = document.getElementById('article-prose-content');
    if (contentEl) contentEl.innerHTML = `<div class="text-red-500 text-center py-10 font-bold">Ошибка загрузки статьи: ${err.message}</div>`;
  }
};

// Setup Leaflet default icons for Vite"""

# We need to escape the backslashes manually in a string replace, or use a function.
def replace_func(match):
    return new_load_article

code = re.sub(regex, replace_func, code)

with open('src/main.tsx', 'w') as f:
    f.write(code)

print("Done complete replace")
