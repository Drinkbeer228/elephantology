sed -i '277,286c\
  <div id="view-reader" class="hidden max-w-[90rem] mx-auto pb-16 px-4">\
    <div id="active-view-banner" class="pb-3 mb-5 border-b border-[#34384a] flex items-center justify-between text-xs mt-6">\
      <button onclick="showHome()" class="flex items-center gap-2 text-[#8e96ac] hover:text-white font-semibold text-xs transition-colors cursor-pointer">\
        <i data-lucide="arrow-left" class="w-4 h-4"></i>\
        <span>Назад к списку статей</span>\
      </button>\
      <span id="breadcrumb-category-name" class="text-[#8e96ac] font-mono text-[10px] uppercase"></span>\
    </div>\
    <div class="flex flex-col lg:flex-row gap-8">\
      <div class="lg:w-3/4 flex-grow relative">\
        <div id="article-prose-content" class="markdown-body p-4 sm:p-8 bg-[#1b1d24] border border-[#34384a] rounded-3xl shadow-xl prose-kingdom"></div>\
        <div id="article-navigation" class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4"></div>\
      </div>\
      <aside class="hidden lg:block lg:w-1/4 shrink-0">\
        <div class="sticky top-24 bg-kingdom-card/50 border border-kingdom-border rounded-2xl p-5 shadow-lg max-h-[calc(100vh-8rem)] overflow-y-auto">\
          <h4 class="text-kingdom-gold font-bold text-sm mb-4 flex items-center gap-2">\
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>\
            Оглавление\
          </h4>\
          <nav id="article-toc" class="flex flex-col gap-2.5 text-xs text-gray-400"></nav>\
        </div>\
      </aside>\
    </div>\
  </div>\
' index.html
