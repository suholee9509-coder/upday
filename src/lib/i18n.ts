import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from '@/locales/en.json'
import ko from '@/locales/ko.json'

// Available languages
export const LANGUAGES = {
  en: { code: 'en', label: 'English', nativeLabel: 'English' },
  ko: { code: 'ko', label: 'Korean', nativeLabel: '한국어' },
} as const

export type LanguageCode = keyof typeof LANGUAGES

// Get saved language or default to English
const getSavedLanguage = (): LanguageCode => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('upday-language')
    if (saved && (saved === 'en' || saved === 'ko')) {
      return saved
    }
  }
  return 'en'
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ko: { translation: ko },
    },
    lng: getSavedLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes
    },
  })

// Change language and persist to localStorage
export const changeLanguage = (lang: LanguageCode) => {
  i18n.changeLanguage(lang)
  localStorage.setItem('upday-language', lang)
}

// Get current language
export const getCurrentLanguage = (): LanguageCode => {
  return (i18n.language as LanguageCode) || 'en'
}

export default i18n
