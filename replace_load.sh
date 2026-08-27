sed -i '1554,1580c\
          if (window.resetToc) window.resetToc();\
          proseContainer.innerHTML = articleHeaderHtml + parseSimpleMarkdown(rawMd);\
          \
          // Render TOC\
          const tocContainer = document.getElementById("article-toc");\
          if (tocContainer && window.getToc) {\
            const toc = window.getToc();\
            if (toc.length > 0) {\
              tocContainer.innerHTML = toc.map(item => {\
                const pl = item.depth === 2 ? "" : "pl-3 text-[11px] opacity-80 border-l border-kingdom-border/50 ml-1";\
                return `<a href="#${item.id}" class="hover:text-kingdom-gold transition-colors ${pl}">${item.text}</a>`;\
              }).join("");\
            } else {\
              tocContainer.innerHTML = "<span class=\\"text-kingdom-muted opacity-50\\">Оглавление пусто</span>";\
            }\
          }\
          \
          // Render Prev / Next Navigation\
          const navContainer = document.getElementById("article-navigation");\
          if (navContainer) {\
            const idx = allArticles.findIndex(a => a.path === path);\
            let navHtml = "";\
            if (idx > 0) {\
              const prev = allArticles[idx - 1];\
              navHtml += `<button onclick="loadArticle(\\'${prev.path}\\')" class="flex flex-col items-start p-4 bg-kingdom-card border border-kingdom-border hover:border-kingdom-gold/50 rounded-xl transition-all cursor-pointer w-full text-left group">\n                <span class="text-[10px] text-kingdom-muted mb-1 flex items-center gap-1 group-hover:text-kingdom-gold transition-colors"><i data-lucide="arrow-left" class="w-3 h-3"></i> Предыдущая статья</span>\n                <span class="font-bold text-white text-sm line-clamp-1">${prev.title || prev.path.split("/").pop()}</span>\n              </button>`;\
            } else {\
              navHtml += `<div></div>`; // empty placeholder\
            }\
            if (idx !== -1 && idx < allArticles.length - 1) {\
              const next = allArticles[idx + 1];\
              navHtml += `<button onclick="loadArticle(\\'${next.path}\\')" class="flex flex-col items-end p-4 bg-kingdom-card border border-kingdom-border hover:border-kingdom-gold/50 rounded-xl transition-all cursor-pointer w-full text-right group">\n                <span class="text-[10px] text-kingdom-muted mb-1 flex items-center gap-1 group-hover:text-kingdom-gold transition-colors">Следующая статья <i data-lucide="arrow-right" class="w-3 h-3"></i></span>\n                <span class="font-bold text-white text-sm line-clamp-1">${next.title || next.path.split("/").pop()}</span>\n              </button>`;\
            }\
            navContainer.innerHTML = navHtml;\
          }\
          \
          attachGlossaryTermListeners(proseContainer);\
          updateBookmarkButton();\
          renderCategoryArticles(currentCategory);\
          updateActiveViewBanner("article", article.title || path, article.category);\
          scrollToMainView();\
          if (window.lucide) lucide.createIcons();\
' index.html
