const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');

// Insert the floating action button and the mobile bottom sheet modal before the </body> tag.
const mobileTocHTML = `
  <!-- MOBILE TOC FAB -->
  <button id="mobile-toc-fab" onclick="document.getElementById('mobile-toc-modal').classList.remove('hidden')" class="lg:hidden fixed bottom-6 right-6 z-40 bg-kingdom-gold text-black p-3.5 rounded-full shadow-[0_4px_20px_rgba(255,209,102,0.4)] flex items-center justify-center cursor-pointer transition-transform hover:scale-105" style="display: none;">
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
  </button>

  <!-- MOBILE TOC MODAL -->
  <div id="mobile-toc-modal" class="fixed inset-0 bg-black/85 backdrop-blur-md z-50 hidden flex flex-col justify-end p-0">
    <div class="bg-kingdom-card border-t-2 border-kingdom-gold w-full max-w-2xl mx-auto rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden relative">
      <!-- HEADER -->
      <div class="p-5 bg-kingdom-surface border-b border-kingdom-border flex items-center justify-between shrink-0">
        <h3 class="text-kingdom-gold font-bold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
          Оглавление статьи
        </h3>
        <button onclick="document.getElementById('mobile-toc-modal').classList.add('hidden')" class="p-2 hover:bg-kingdom-border/50 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <!-- BODY -->
      <div class="p-5 overflow-y-auto pb-10">
        <nav id="mobile-article-toc" class="flex flex-col gap-4 text-sm text-gray-400"></nav>
      </div>
    </div>
  </div>
`;

if (!html.includes('id="mobile-toc-fab"')) {
  html = html.replace('</body>', mobileTocHTML + '\n</body>');
  fs.writeFileSync('index.html', html);
}
