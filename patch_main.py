import re

with open('src/main.tsx', 'r') as f:
    code = f.read()

regex = r"(const res = await fetch\(\`/api/article\?path=\$\{encodeURIComponent\(safePath\)\}\`\);[\s\S]*?)(const html = await marked\.parse\(md\);[\s\S]*?if \(contentEl\) contentEl\.innerHTML = html;)"

replacement = """    const res = await fetch(`/api/article?path=${encodeURIComponent(safePath)}`);
    if (!res.ok) throw new Error('Статья не найдена');
    let md = await res.text();
    
    (window as any).resetToc();
    
    // Clean frontmatter
    let frontmatterTitle = null;
    let metadata = {
      evidenceLevel: null,
      difficulty: null,
      lastReviewed: null,
      referenceCount: 0,
      category: safePath.split('/')[0] || null
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
        
        const refMatches = fm.match(/^[ \t]*-[ \t]+id:/gm);
        if (refMatches) metadata.referenceCount = refMatches.length;

        (window as any).currentEvidenceLevel = metadata.evidenceLevel;
        
        md = parts.slice(2).join('---').trim();
      }
    }

    const titleMatch = md.match(/^#\s+(.+)$/m);
    const title = frontmatterTitle || (titleMatch ? titleMatch[1].trim() : 'Чтение');

    const catName = document.getElementById('breadcrumb-category-name');
    if (catName) {
       const catMap: any = { ecology: 'Экология', anatomy: 'Анатомия', ethogram: 'Этология', veterinary: 'Ветеринария', taxonomy: 'Таксономия', conservation: 'Охрана' };
       catName.textContent = catMap[metadata.category] || 'Каталог';
    }
    
    const titleEl = document.getElementById('breadcrumb-article-title');
    if (titleEl) titleEl.textContent = title;

    let html = await marked.parse(md);
    
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
      metaHtml += ` <span class="text-gray-600">·</span> <span class="bg-kingdom-gold/15 text-kingdom-gold px-2 py-0.5 rounded border border-kingdom-gold/30 font-bold">${metadata.evidenceLevel}</span>`;
    }
    metaHtml += `</div>`;

    // Inject Metadata Row after H1
    if (html.includes('</h1>')) {
      html = html.replace('</h1>', `</h1>${metaHtml}`);
    } else {
      html = metaHtml + html;
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
                // Show modal
                showFootnoteModal(footnoteLi.innerHTML);
             }
          }
        });
      });
    }
"""

match = re.search(regex, code)
if not match:
    print("No match")
    exit(1)

code = code.replace(match.group(0), replacement)

footnote_modal = """
function showFootnoteModal(htmlContent: string) {
  let modal = document.getElementById('footnote-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'footnote-modal';
    modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in';
    modal.style.isolation = 'isolate';
    
    const content = document.createElement('div');
    content.className = 'bg-[#181a24] border border-[#34384a] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative text-gray-200 text-sm p-6';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-1';
    closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
    
    const body = document.createElement('div');
    body.id = 'footnote-modal-body';
    body.className = 'prose prose-invert max-w-none prose-a:text-kingdom-gold prose-p:leading-relaxed text-sm pr-6';
    
    content.appendChild(closeBtn);
    content.appendChild(body);
    modal.appendChild(content);
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }
  
  const body = document.getElementById('footnote-modal-body');
  if (body) body.innerHTML = htmlContent;
  
  // Clean up backref link
  const backrefs = body?.querySelectorAll('.footnote-backref');
  if (backrefs) {
     backrefs.forEach(el => el.remove());
  }

  modal.style.display = 'flex';
}

(window as any).loadArticle = async (path: string) => {"""

code = code.replace("(window as any).loadArticle = async (path: string) => {", footnote_modal)

with open('src/main.tsx', 'w') as f:
    f.write(code)

print("Done")
