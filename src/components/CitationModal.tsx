import React, { useState, useEffect } from 'react';
import { Quote, X, Copy, Check, BookOpen, FileText, Code2, Sparkles } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface CitationModalDetail {
  title?: string;
  category?: string;
  quoteText?: string;
}

export function CitationModal() {
  const { t, isEn } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [articleTitle, setArticleTitle] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [activeTab, setActiveTab] = useState<'gost' | 'apa' | 'bibtex' | 'quote'>('gost');
  const [copied, setCopied] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<CitationModalDetail>;
      const { title, category, quoteText } = customEvent.detail || {};
      
      const docTitle = title || document.title.replace(' — Слонология', '').replace(' — Elephantology', '').replace('Энциклопедия «Слонология»', '').trim() || 'Academic Monograph';
      const cat = category || 'PROBOSCIDEA';
      
      setArticleTitle(docTitle);
      setCategoryName(cat);
      if (quoteText) {
        setSelectedText(quoteText);
        setActiveTab('quote');
      } else {
        setActiveTab(isEn ? 'apa' : 'gost');
      }
      setIsOpen(true);
    };
    window.addEventListener('openCitationModal', handleOpen);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('openCitationModal', handleOpen);
    };
  }, [isEn]);

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

  const fallbackTitle = isEn ? 'Academic Monograph' : 'Академическая статья';
  const citations = {
    gost: `Слонология: Академическая энциклопедия хоботных (Proboscidea). Статья «${articleTitle || fallbackTitle}». — 2026. URL: ${currentUrl} (дата обращения: ${dateFormattedRu}).`,
    apa: `Elephantology Research Compendium. (2026). ${articleTitle || fallbackTitle}. In Elephantology Digital Archive. Retrieved ${dateFormattedEn}, from ${currentUrl}`,
    bibtex: `@misc{elephantology2026_${(articleTitle || 'article').toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 16)},
  title = {${articleTitle || fallbackTitle}},
  author = {{Elephantology Research Compendium}},
  year = {2026},
  howpublished = {\\url{${currentUrl}}},
  note = {Энциклопедия «Слонология». Accessed: ${dateFormattedRu}}
}`,
    quote: selectedText 
      ? `> «${selectedText}»\n\n— ${isEn ? 'Source: Elephantology Encyclopedia' : 'Источник: Энциклопедия «Слонология»'}, «${articleTitle}» (${currentUrl})`
      : `> «${articleTitle}»\n\n— ${isEn ? 'Elephantology Digital Archive' : 'Энциклопедия «Слонология»'}, ${categoryName} (${currentUrl})`
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
      role="dialog"
      aria-modal="true"
      aria-label={t.citation.title}
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
      className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-[#FBF9F5] border border-[#C5BDB0] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative z-10 my-auto">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-[#DED8CD] flex items-center justify-between bg-[#F2EFE9]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-[#EAE5DC] border border-[#C5BDB0] flex items-center justify-center text-[#14532D] shrink-0">
              <Quote className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-[#14532D] uppercase tracking-wider font-mono">
                {t.citation.title}
              </h3>
              <p className="text-sm font-serif font-semibold text-[#1C1917] truncate max-w-sm sm:max-w-md">
                «{articleTitle}»
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label={t.citation.close}
            className="p-2 bg-[#FBF9F5] border border-[#DED8CD] text-[#78716C] hover:text-[#1C1917] hover:border-[#1C1917] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Format Selectors */}
        <div className="px-5 py-3 bg-[#F2EFE9] border-b border-[#DED8CD] flex items-center gap-2 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => { setActiveTab('gost'); setCopied(false); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 border font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'gost'
                ? 'bg-[#1C1917] text-[#FBF9F5] border-[#1C1917] font-semibold'
                : 'bg-[#FBF9F5] text-[#44403C] border-[#DED8CD] hover:text-[#1C1917]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>ГОСТ Р 7.0.5</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('apa'); setCopied(false); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 border font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'apa'
                ? 'bg-[#1C1917] text-[#FBF9F5] border-[#1C1917] font-semibold'
                : 'bg-[#FBF9F5] text-[#44403C] border-[#DED8CD] hover:text-[#1C1917]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>APA (7th Ed.)</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('bibtex'); setCopied(false); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 border font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'bibtex'
                ? 'bg-[#1C1917] text-[#FBF9F5] border-[#1C1917] font-semibold'
                : 'bg-[#FBF9F5] text-[#44403C] border-[#DED8CD] hover:text-[#1C1917]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>BibTeX</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('quote'); setCopied(false); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 border font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'quote'
                ? 'bg-[#1C1917] text-[#FBF9F5] border-[#1C1917] font-semibold'
                : 'bg-[#FBF9F5] text-[#44403C] border-[#DED8CD] hover:text-[#1C1917]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isEn ? 'Markdown Quote' : 'Markdown-цитата'}</span>
          </button>
        </div>

        {/* Citation Output Box */}
        <div className="p-5 sm:p-6 space-y-3 flex-1 overflow-y-auto">
          <div className="text-xs text-[#78716C]">
            {activeTab === 'gost' && (isEn ? 'GOST R 7.0.5-2008 Bibliographic Reference:' : 'Формат библиографической ссылки по ГОСТ Р 7.0.5-2008:')}
            {activeTab === 'apa' && (isEn ? 'APA 7th Edition Academic Citation:' : 'Академический формат APA 7-го издания:')}
            {activeTab === 'bibtex' && (isEn ? 'BibTeX entry for LaTeX, Zotero & Mendeley:' : 'Формат для LaTeX и библиографических менеджеров (Zotero, Mendeley):')}
            {activeTab === 'quote' && (isEn ? 'Formatted block quote with source attribution:' : 'Блок-цитата с указанием источника для конспектов и докладов:')}
          </div>

          <pre className="w-full bg-[#F2EFE9] p-4 border border-[#DED8CD] text-xs sm:text-sm text-[#1C1917] font-mono whitespace-pre-wrap break-words leading-relaxed select-all">
            {activeContent}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#F2EFE9] border-t border-[#DED8CD] flex items-center justify-between gap-3">
          <span className="text-[11px] text-[#78716C] hidden sm:inline font-mono">
            {isEn ? 'Elephantology Digital Archive' : 'Энциклопедия «Слонология»'}
          </span>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-[#FBF9F5] hover:bg-[#EAE5DC] border border-[#DED8CD] text-[#44403C] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              {t.citation.close}
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-2 px-5 py-2 bg-[#14532D] hover:bg-[#166534] text-[#FBF9F5] font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? (isEn ? 'Copied to clipboard' : 'Скопировано!') : (isEn ? 'Copy citation' : 'Скопировать ссылку')}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
