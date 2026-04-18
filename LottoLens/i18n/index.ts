/**
 * i18n/index.ts — Internationalization system for LottoLens.
 *
 * Provides a React context + hook (useI18n) that gives access to:
 *  - t(key, params?) — translate a key with optional interpolation
 *  - locale — current language ('pt' | 'en')
 *  - setLocale — switch language
 *
 * Default language: Portuguese (pt)
 * Persists choice to AsyncStorage.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import pt from './pt';
import en from './en';

export type Locale = 'pt' | 'en';

type Translations = typeof pt;

const dictionaries: Record<Locale, Translations> = { pt, en };

const LOCALE_KEY = '@lottolens_locale';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof Translations, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'pt',
  setLocale: () => {},
  t: (key) => String(key),
});

/**
 * Translates a key, replacing {param} placeholders with provided values.
 */
function translate(
  dict: Translations,
  key: keyof Translations,
  params?: Record<string, string | number>
): string {
  let text = dict[key] ?? String(key);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return text;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('pt');

  // Load saved locale on mount
  useEffect(() => {
    AsyncStorage.getItem(LOCALE_KEY).then((stored) => {
      if (stored === 'en' || stored === 'pt') {
        setLocaleState(stored);
      }
    });
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    AsyncStorage.setItem(LOCALE_KEY, newLocale);
  };

  const t = (
    key: keyof Translations,
    params?: Record<string, string | number>
  ): string => {
    return translate(dictionaries[locale], key, params);
  };

  return React.createElement(
    I18nContext.Provider,
    { value: { locale, setLocale, t } },
    children
  );
}

/**
 * Hook to access translations and language switching.
 *
 * Usage:
 *   const { t, locale, setLocale } = useI18n();
 *   <Text>{t('home_scan')}</Text>
 */
export function useI18n() {
  return useContext(I18nContext);
}
