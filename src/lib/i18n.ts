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

// Get saved language - only restore if user has an active session
const getSavedLanguage = (): LanguageCode => {
  if (typeof window !== 'undefined') {
    // Only restore saved language for logged-in users
    const hasSession = Object.keys(localStorage).some(
      key => key.startsWith('sb-') && key.endsWith('-auth-token')
    )
    if (hasSession) {
      const saved = localStorage.getItem('upday-language')
      if (saved && (saved === 'en' || saved === 'ko')) {
        return saved
      }
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
    supportedLngs: ['en', 'ko'],
    load: 'languageOnly', // Don't load regional variants (en-US -> en)
    detection: {
      order: [], // Disable all auto-detection, use only explicit setting
    },
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
