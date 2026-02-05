import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  LANGUAGES,
  changeLanguage as i18nChangeLanguage,
  getCurrentLanguage,
  type LanguageCode
} from '@/lib/i18n'

/**
 * Hook for language selection
 *
 * Usage in a language selector component:
 *
 * ```tsx
 * const { currentLanguage, languages, changeLanguage } = useLanguage()
 *
 * return (
 *   <select value={currentLanguage} onChange={(e) => changeLanguage(e.target.value as LanguageCode)}>
 *     {languages.map(lang => (
 *       <option key={lang.code} value={lang.code}>
 *         {lang.nativeLabel}
 *       </option>
 *     ))}
 *   </select>
 * )
 * ```
 */
export function useLanguage() {
  const { i18n } = useTranslation()
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(getCurrentLanguage())

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng as LanguageCode)
    }

    i18n.on('languageChanged', handleLanguageChange)
    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [i18n])

  const changeLanguage = (lang: LanguageCode) => {
    i18nChangeLanguage(lang)
  }

  const languages = Object.values(LANGUAGES)

  return {
    currentLanguage,
    languages,
    changeLanguage,
    LANGUAGES,
  }
}

export type { LanguageCode }
