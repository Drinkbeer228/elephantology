import React, { useEffect, useState } from 'react';
import { ArticleCatalog } from './components/ArticleCatalog';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'article'>('home');
  const [articleTitle, setArticleTitle] = useState('');

  useEffect(() => {
    const win = window as any;
    const originalLoadArticle = win.loadArticle;
    win.loadArticle = async (path: string) => {
       setCurrentView('article');
       if (originalLoadArticle) {
           await originalLoadArticle(path);
           const titleEl = document.querySelector('#view-reader h1');
           if (titleEl) setArticleTitle(titleEl.textContent || 'Статья');
       }
    };
    const originalShowHome = win.showHome;
    win.showHome = () => {
       setCurrentView('home');
       setArticleTitle('');
       if (originalShowHome) originalShowHome();
    };
  }, []);

  return (
    <>
      {currentView === 'home' && (
         <ArticleCatalog />
      )}
      
      {/* Floating Status Widget */}
      <div className="fixed bottom-4 right-4 z-50 bg-[#1b1d24] border border-[#34384a] p-3 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center gap-3 animate-fade-in hover:border-kingdom-gold/30 transition-colors">
        <div className="w-6 h-6 rounded-full bg-kingdom-gold/10 border border-kingdom-gold/30 flex items-center justify-center shrink-0">
          <span className="text-kingdom-gold font-bold text-xs animate-pulse">⚛️</span>
        </div>
        <div>
          <h3 className="text-gray-300 font-pixel text-[9px] sm:text-[10px]">React + Vite SPA</h3>
          <p className="text-[8px] text-[#8e96ac]">Энциклопедия «Слонология»</p>
        </div>
      </div>
    </>
  );
}
