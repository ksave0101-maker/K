'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Locale = 'en' | 'th' | 'zh' | 'ko' | 'vi';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    // Load saved locale from localStorage
    const savedLocale = localStorage.getItem('customer-dashboard-locale') as Locale;
    if (savedLocale && ['en', 'th', 'zh', 'ko', 'vi'].includes(savedLocale)) {
      setLocaleState(savedLocale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('customer-dashboard-locale', newLocale);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  return context ?? { locale: 'en' as Locale, setLocale: () => {} };
}
