import React, { useState, useEffect } from 'react';
import { Quote, X, Copy, Check, BookOpen, FileText, Code2, Sparkles } from 'lucide-react';

interface CitationModalProps {
  currentArticlePath?: string;
}

export function CitationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [articleTitle, setArticleTitle] = useState('Анатомия и физиология хоботных');
  const [categoryName, setCategoryName] = useState('Анатомия');
  const [activeTab, setActiveTab] = useState<'gost' | 'apa' | 'bibtex' | 'quote'>('gost');
  const [copied, setCopied] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    const handleOpen = (e: any) => {
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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('openCitationModal', handleOpen);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const today = new Date();
  const dateFormattedRu = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
  const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dateFormattedEn = `${monthsEn[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
  const currentUrl = window.location.href;

  const citations = {
    gost: `Элефантология: Академическая энциклопедия хоботных (Proboscidea). Статья «${articleTitle}». — 2026. URL: ${currentUrl} (дата обращения: ${dateFormattedRu}).`,
    apa: `Elephantology Research Guild. (2026). ${articleTitle}. In Elephantology Knowledge Base. Retrieved ${dateFormattedEn}, from ${currentUrl}`,
    bibtex: `@misc{elephantology2026_${articleTitle.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 16)},
  title = {${articleTitle}},
  author = {{Elephantology Research Guild}},
  year = {2026},
  howpublished = {\\url{${currentUrl}}},
  note = {Энциклопедия «Элефантология». Дата обращения: ${dateFormattedRu}}
}`,
    quote: selectedText 
      ? `> «${selectedText}»\n\n— Источник: Энциклопедия «Элефантология», статья «${articleTitle}» (${currentUrl})`
      : `> «${articleTitle} — фундаментальный материал из академической базы знаний по биологии хоботных.»\n\n— Энциклопедия «Элефантология», раздел ${categoryName} (${currentUrl})`
  };

  const activeContent = citations[activeTab];

  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(activeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-[99998] flex items-center justify-center p-4 animate-fade-in overflow-y-auto"
      style={{ isolation: 'isolate' }}
    >
      <div className="bg-[#181a24] border border-[#34384a] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative z-10 my-auto">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#34384a] flex items-center justify-between bg-[#13141b]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-kingdom-gold/10 border border-kingdom-gold/30 flex items-center justify-center text-kingdom-gold">
              <Quote className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Цитирование статьи
              </h3>
              <p className="text-xs text-gray-400 truncate max-w-sm sm:max-w-md">
                «{articleTitle}»
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl bg-[#242733] border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Format Selectors */}
        <div className="px-4 pt-3 pb-2 bg-[#151720] border-b border-[#34384a] flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <button
            onClick={() => { setActiveTab('gost'); setCopied(false); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'gost'
                ? 'bg-kingdom-gold text-black font-bold shadow-sm'
                : 'bg-[#202330] text-gray-300 hover:text-white hover:bg-[#282c3c]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>ГОСТ Р 7.0.5</span>
          </button>

          <button
            onClick={() => { setActiveTab('apa'); setCopied(false); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'apa'
                ? 'bg-kingdom-gold text-black font-bold shadow-sm'
                : 'bg-[#202330] text-gray-300 hover:text-white hover:bg-[#282c3c]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>APA (7th)</span>
          </button>

          <button
            onClick={() => { setActiveTab('bibtex'); setCopied(false); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'bibtex'
                ? 'bg-kingdom-gold text-black font-bold shadow-sm'
                : 'bg-[#202330] text-gray-300 hover:text-white hover:bg-[#282c3c]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>BibTeX</span>
          </button>

          <button
            onClick={() => { setActiveTab('quote'); setCopied(false); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'quote'
                ? 'bg-kingdom-gold text-black font-bold shadow-sm'
                : 'bg-[#202330] text-gray-300 hover:text-white hover:bg-[#282c3c]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Markdown Цитата</span>
          </button>
        </div>

        {/* Citation Output Box */}
        <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>
                {activeTab === 'gost' && 'Формат библиографической ссылки по российскому ГОСТ Р 7.0.5-2008:'}
                {activeTab === 'apa' && 'Academic American Psychological Association (APA 7th Edition):'}
                {activeTab === 'bibtex' && 'Формат для LaTeX и библиографических менеджеров (Zotero, Mendeley):'}
                {activeTab === 'quote' && 'Блок-цитата с указанием источника для конспектов и докладов:'}
              </span>
            </div>

            <div className="relative group">
              <pre className="w-full bg-[#11131a] p-4 rounded-xl border border-[#34384a] text-xs sm:text-sm text-gray-200 font-mono whitespace-pre-wrap break-words leading-relaxed select-all">
                {activeContent}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#13141b] border-t border-[#34384a] flex items-center justify-between gap-3">
          <span className="text-[11px] text-gray-500 hidden sm:inline font-mono">
            Энциклопедия «Элефантология» • Открытая база знаний
          </span>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#242733] hover:bg-[#2c303f] border border-white/10 text-gray-300 text-xs font-semibold transition-all cursor-pointer"
            >
              Закрыть
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-kingdom-gold hover:bg-amber-400 text-black font-bold text-xs shadow-[0_0_12px_rgba(255,209,102,0.25)] transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Скопировано в буфер!' : 'Скопировать ссылку'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
