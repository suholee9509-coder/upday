import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'
import { changeLanguage, type LanguageCode } from '@/lib/i18n'

export function LanguageToggle() {
  const { i18n } = useTranslation()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <span className="h-5 w-5" />
      </Button>
    )
  }

  const currentLang = i18n.language as LanguageCode
  const nextLang: LanguageCode = currentLang === 'en' ? 'ko' : 'en'

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => changeLanguage(nextLang)}
      aria-label={`Switch to ${nextLang === 'en' ? 'English' : '한국어'}`}
      title={nextLang === 'en' ? 'English' : '한국어'}
    >
      <span className="text-sm font-medium">
        {currentLang === 'en' ? 'EN' : '한'}
      </span>
    </Button>
  )
}
