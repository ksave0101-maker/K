'use client';

import { useLocale } from '@/lib/LocaleContext';
import { getT } from '@/lib/translations';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import CountryFlag from './CountryFlag';

type LanguageCode = 'ko' | 'en' | 'cn' | 'ms' | 'th' | 'vn';

type LanguageSwitcherProps = {
  allowedCodes?: LanguageCode[];
  showBruneiAlias?: boolean;
};

export default function LanguageSwitcher({ allowedCodes, showBruneiAlias = false }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = getT(locale);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allLanguages = [
    { code: 'ko' as const, name: t.korean || '한국어', flag: 'KR' as const },
    { code: 'en' as const, name: t.english || 'English', flag: 'GB' as const },
    { code: 'cn' as const, name: t.chinese || '中文', flag: 'CN' as const },
    { code: 'ms' as const, name: t.malay || 'Bahasa Melayu', flag: 'MY' as const },
    { code: 'th' as const, name: t.thai || 'ไทย', flag: 'TH' as const },
    { code: 'vn' as const, name: t.vietnamese || 'Tiếng Việt', flag: 'VN' as const },
  ];

  const bruneiAlias = { code: 'ms' as const, name: t.brunei || 'Brunei', flag: 'BN' as const };

  const filteredLanguages = allowedCodes && allowedCodes.length > 0
    ? allLanguages.filter(lang => allowedCodes.includes(lang.code))
    : allLanguages;

  const languages = showBruneiAlias ? [...filteredLanguages, bruneiAlias] : filteredLanguages;

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-100 rounded-lg transition-colors min-w-[15rem]"
        aria-label={t.selectLanguage || 'Change language'}
      >
        <Globe className="w-5 h-5 text-gray-600" />
        <CountryFlag country={currentLanguage.flag} size="sm" />
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
          {currentLanguage.name}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[18rem] bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-[130] overflow-visible">
          <div className="grid grid-cols-2 gap-1.5">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => {
                  try {
                    setLocale(language.code);
                    // Persist legacy key for other parts of the app
                    try {
                      localStorage.setItem('k_system_lang', language.code);
                    } catch (_) {}
                    try {
                      localStorage.setItem('locale', language.code);
                    } catch (_) {}
                    // Broadcast changes for listeners that rely on window events
                    try {
                      window.dispatchEvent(new CustomEvent('k-system-lang', { detail: language.code }));
                      window.dispatchEvent(new CustomEvent('locale-changed', { detail: { locale: language.code } }));
                    } catch (_) {}
                  } catch (e) {}
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors ${
                  locale === language.code ? 'bg-orange-50 ring-1 ring-orange-200 text-orange-700 font-medium' : 'text-gray-700'
                }`}
              >
                <CountryFlag country={language.flag} size="sm" />
                <span className="whitespace-nowrap">{language.name}</span>
                {locale === language.code && (
                  <span className="ml-auto text-orange-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
