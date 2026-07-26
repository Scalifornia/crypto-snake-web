import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { brand } from '../config/brand';
import type { Locale } from '../types/servigo';
import { defaultLanguage, languageStorageKey, supportedLanguages, translations, type TranslationKey } from './translations';

interface LanguageContextValue {
  language: Locale;
  setLanguage: (language: Locale) => void;
  t: (key: TranslationKey | string, values?: Record<string, string | number>) => string;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLanguage(): Locale {
  if (typeof window === 'undefined') {
    return defaultLanguage;
  }

  const stored = window.localStorage.getItem(languageStorageKey) as Locale | null;
  return stored && supportedLanguages.includes(stored) ? stored : defaultLanguage;
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Locale>(getInitialLanguage);

  const setLanguage = (nextLanguage: Locale) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(languageStorageKey, nextLanguage);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = brand.brandName;
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => {
    const t = (key: TranslationKey | string, values: Record<string, string | number> = {}) => {
      const dictionary = translations[language] as Record<string, string>;
      const fallback = translations[defaultLanguage] as Record<string, string>;
      const template = dictionary[key] ?? fallback[key] ?? key;
      const replacements = {
        brandName: brand.brandName,
        previousName: brand.previousName,
        ...values
      };

      return Object.entries(replacements).reduce(
        (text, [name, replacement]) => text.replaceAll(`{${name}}`, String(replacement)),
        template
      );
    };

    return { language, setLanguage, t };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
