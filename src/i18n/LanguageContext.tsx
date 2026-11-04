import React, { createContext, useContext, useState, useEffect } from 'react';
import { ru } from './ru';
import { en } from './en';

type Language = 'ru' | 'en';
type Translations = typeof ru;

interface LanguageContextType {
  lang: Language;
  isEn: boolean;
  t: Translations;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'ru',
  isEn: false,
  t: ru,
  setLang: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'ru' || saved === 'en') ? saved : 'ru';
  });

  useEffect(() => {
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  // On a prerendered /en/article/... page (see prerender.js __PRERENDERED_LOCALE__),
  // adopt EN on first load so the full-translation corpus is used.
  useEffect(() => {
    if ((window as any).__PRERENDERED_LOCALE__ === 'en') {
      try { localStorage.setItem('language', 'en'); } catch { /* private mode */ }
      setLang('en');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const t = lang === 'en' ? en : ru;
  const isEn = lang === 'en';

  return (
    <LanguageContext.Provider value={{ lang, isEn, t, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};
