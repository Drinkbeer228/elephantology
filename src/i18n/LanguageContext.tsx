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

  const t = lang === 'en' ? en : ru;
  const isEn = lang === 'en';

  return (
    <LanguageContext.Provider value={{ lang, isEn, t, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};
