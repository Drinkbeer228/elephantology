import React from 'react';
import { Search, BookOpen } from 'lucide-react';

export function Header() {
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
            <h1 className="font-bold text-sm sm:text-base text-white group-hover:text-kingdom-gold transition-colors duration-300 tracking-wide">
              ЭЛЕФАНТОЛОГИЯ
            </h1>
            <span className="text-[9px] text-kingdom-gold uppercase tracking-[0.2em] font-bold">
              Монография
            </span>
          </div>
        </button>

        {/* Search Bar */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-search', { detail: { force: true } }))}
          className="flex-1 max-w-md hidden md:flex items-center justify-between bg-black/40 hover:bg-black/60 border border-white/10 hover:border-kingdom-gold/40 rounded-xl px-4 py-2.5 text-sm text-gray-400 transition-all group focus:outline-none focus-visible:ring-1 focus-visible:ring-kingdom-gold shadow-inner cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-gray-500 group-hover:text-kingdom-gold transition-colors" />
            <span className="font-medium">Поиск по энциклопедии...</span>
          </div>
        </button>

        {/* Actions Toolbar */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile Search Button */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-search', { detail: { force: true } }))}
            title="Поиск статей"
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-[#1b1d24] border border-white/10 text-gray-300 hover:text-white hover:border-kingdom-gold/40 transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
