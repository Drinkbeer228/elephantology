import React, { createContext, useContext, useEffect } from 'react';
import { ru } from './ru';

export type Language = 'ru' | 'en';
type Translations = typeof ru;

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
  isEn: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'ru',
  setLang: () => {},
  t: ru,
  isEn: false,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = 'ru';
    }
  }, []);

  const value: LanguageContextType = {
    lang: 'ru',
    setLang: () => {},
    t: ru,
    isEn: false,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
