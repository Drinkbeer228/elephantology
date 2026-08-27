const fs = require('fs');

let mainTsx = `import './index.css';
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Header } from './components/Header'
import { AIChatModal } from './components/AIChatModal'
import { SearchModal } from './components/SearchModal'
import { FactModal } from './components/FactModal'
import App from './App.tsx'

// Mount Header
const headerElement = document.getElementById('react-header');
if (headerElement) {
  ReactDOM.createRoot(headerElement).render(
    <React.StrictMode>
      <Header />
    </React.StrictMode>,
  )
}

const mainRootElement = document.getElementById('react-main-root');
if (mainRootElement) {
  // We mount the App directly into the main container
  ReactDOM.createRoot(mainRootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

const rootElement = document.getElementById('react-root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <SearchModal />
      <FactModal />
      <AIChatModal />
    </React.StrictMode>,
  )
}
`;

fs.writeFileSync('src/main.tsx', mainTsx);

// Because I wiped out <main> entirely, I need to restore #view-reader and #view-module inside index.html OUTSIDE of react-main-root, OR inside it.
// Actually, it's better to put them OUTSIDE of react-main-root so vanilla JS can still target them without interfering with React.

let html = fs.readFileSync('index.html', 'utf8');
const readerHtml = `
  <!-- VANILLA JS VIEWS (Kept outside React root to avoid conflicts) -->
  <div id="view-reader" class="hidden max-w-4xl mx-auto pb-16">
    <div id="active-view-banner" class="pb-3 mb-5 border-b border-[#34384a] flex items-center justify-between text-xs mt-6 px-4">
      <button onclick="showHome()" class="flex items-center gap-2 text-[#8e96ac] hover:text-white font-semibold text-xs transition-colors cursor-pointer">
        <i data-lucide="arrow-left" class="w-4 h-4"></i>
        <span>Назад к списку статей</span>
      </button>
      <span id="breadcrumb-category-name" class="text-[#8e96ac] font-mono text-[10px] uppercase"></span>
    </div>
    <div id="article-content-container" class="markdown-body p-4 sm:p-8 bg-[#1b1d24] border border-[#34384a] rounded-3xl shadow-xl"></div>
  </div>

  <div id="view-module" class="hidden max-w-6xl mx-auto pb-16">
    <div id="active-module-banner" class="pb-3 mb-5 border-b border-[#34384a] flex items-center justify-between text-xs mt-6 px-4">
      <button onclick="showHome()" class="flex items-center gap-2 text-[#8e96ac] hover:text-white font-semibold text-xs transition-colors cursor-pointer">
        <i data-lucide="arrow-left" class="w-4 h-4"></i>
        <span>Закрыть модуль</span>
      </button>
    </div>
    <div id="module-container" class="bg-[#1b1d24] border border-[#34384a] rounded-3xl p-2 sm:p-4 min-h-[60vh] relative shadow-xl overflow-hidden flex flex-col"></div>
  </div>
`;

html = html.replace('</main>', '</main>\n' + readerHtml);
fs.writeFileSync('index.html', html);

