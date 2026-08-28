import React from 'react';
import { BookOpen } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export function Header() {
  const { t, lang, setLang } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-[#121318]/80 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Logo */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('show-home'))}
          className="flex items-center gap-3 group focus:outline-none shrink-0 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#242733] to-[#1b1d24] border border-white/10 flex items-center justify-center text-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] group-hover:border-kingdom-gold/50 transition-all duration-300">
            <BookOpen className="w-5 h-5 text-kingdom-gold" />
          </div>
          <div className="flex flex-col items-start text-left">
            <h1 className="font-bold text-base sm:text-lg text-white group-hover:text-kingdom-gold transition-colors duration-300 tracking-[0.15em] uppercase font-serif">
              {t.header.title}
            </h1>
          </div>
        </button>

        <div className="flex items-center">
          <button
            onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
            className="px-3 py-1.5 text-xs font-semibold tracking-wider uppercase border border-white/10 rounded-lg hover:border-kingdom-gold/40 hover:text-kingdom-gold transition-colors text-gray-400 bg-black/20"
          >
            {lang === 'ru' ? 'EN' : 'RU'}
          </button>
        </div>
      </div>
    </header>
  );
}

