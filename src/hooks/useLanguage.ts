import { useState, useEffect } from 'react';
import { Language } from '../types';

export function useLanguage() {
  const [lang, setLang] = useState<Language>('ar');

  const isAr = lang === 'ar';

  useEffect(() => {
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, isAr]);

  return {
    lang,
    setLang,
    isAr,
  };
}
