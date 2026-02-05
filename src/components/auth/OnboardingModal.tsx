import { useState, useEffect } from 'react'
import { X, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import { CompanyLogo } from '@/components/CompanyLogo'
import { supabase } from '@/lib/db'
import { useAuth } from '@/hooks/useAuth'
import { CATEGORIES, COMPANIES } from '@/lib/constants'

interface OnboardingModalProps {
  isOpen: boolean
  onComplete: () => void
}

export function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    )
  }

  const addKeyword = () => {
    const trimmed = keywordInput.trim()
    if (trimmed && keywords.length < 10 && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed])
      setKeywordInput('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword))
  }

  const toggleCompany = (companyId: string) => {
    setSelectedCompanies(prev =>
      prev.includes(companyId)
        ? prev.filter(c => c !== companyId)
        : [...prev, companyId]
    )
  }

  const handleSubmit = async () => {
    if (!user || selectedCategories.length === 0) return

    setIsSubmitting(true)
    try {
      const client = supabase
      if (!client) throw new Error('Supabase client not initialized')

      console.log('Saving onboarding data...', {
        user_id: user.id,
        categories: selectedCategories,
        keywords,
        companies: selectedCompanies
      })

      // Save user interests (upsert to handle existing data)
      const { error: interestsError } = await client
        .from('user_interests')
        .upsert({
          user_id: user.id,
          categories: selectedCategories,
          keywords: keywords,
          companies: selectedCompanies,
          onboarding_completed: true,
        }, {
          onConflict: 'user_id'
        })

      if (interestsError) {
        console.error('Failed to save user interests:', interestsError)
        throw interestsError
      }

      console.log('User interests saved successfully')

      // Save pinned companies (delete existing first to avoid duplicates)
      if (selectedCompanies.length > 0) {
        console.log('Saving pinned companies...')

        // Delete existing pins first
        const { error: deleteError } = await client
          .from('pinned_companies')
          .delete()
          .eq('user_id', user.id)

        if (deleteError) {
          console.error('Failed to delete existing pins:', deleteError)
        }

        // Insert new pins
        const { error: pinsError } = await client
          .from('pinned_companies')
          .insert(
            selectedCompanies.map(slug => ({
              user_id: user.id,
              company_slug: slug,
            }))
          )

        if (pinsError) {
          console.error('Failed to save pinned companies:', pinsError)
          throw pinsError
        }

        console.log('Pinned companies saved successfully')
      }

      console.log('Onboarding completed, calling onComplete()')
      onComplete()
    } catch (error) {
      console.error('Failed to save onboarding data:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to save your preferences: ${errorMessage}\n\nPlease try again or contact support.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Safety check: Only render if modal is open AND user is authenticated
  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] m-4 bg-background rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{t('onboarding.welcome')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('onboarding.customize')}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              {t('onboarding.categories')} <span className="text-destructive">*</span>
              <span className="text-xs text-muted-foreground ml-2">{t('onboarding.categoriesRequired')}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={cn(
                    'px-4 py-3 rounded-lg border text-sm font-medium transition-all',
                    selectedCategories.includes(category.id)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-foreground hover:border-primary/50'
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              {t('onboarding.keywords')} <span className="text-xs text-muted-foreground">{t('onboarding.keywordsOptional')}</span>
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addKeyword()
                  }
                }}
                placeholder={t('onboarding.keywordsPlaceholder')}
                className="flex-1 px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={keywords.length >= 10}
              />
              <button
                onClick={addKeyword}
                disabled={!keywordInput.trim() || keywords.length >= 10}
                className={cn(
                  'h-[42px] w-[42px] rounded-lg shrink-0 flex items-center justify-center',
                  'border border-border bg-background',
                  'hover:border-primary hover:bg-primary/5',
                  'transition-all disabled:opacity-50 disabled:pointer-events-none'
                )}
              >
                <Plus className="h-5 w-5 text-foreground" />
              </button>
            </div>
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {keywords.map(keyword => (
                  <span
                    key={keyword}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-accent-foreground rounded-md text-sm"
                  >
                    {keyword}
                    <button
                      onClick={() => removeKeyword(keyword)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Companies */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              {t('onboarding.companies')} <span className="text-xs text-muted-foreground">{t('onboarding.companiesOptional')}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto scrollbar-subtle">
              {COMPANIES.map(company => (
                <button
                  key={company.id}
                  onClick={() => toggleCompany(company.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium text-left transition-all',
                    selectedCompanies.includes(company.id)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-foreground hover:border-primary/50'
                  )}
                >
                  <div className="w-6 h-6 rounded bg-muted flex items-center justify-center flex-shrink-0">
                    <CompanyLogo companyId={company.id} size="xs" />
                  </div>
                  <span className="truncate">{company.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            {t('onboarding.footer')}
          </p>
          <Button
            onClick={handleSubmit}
            disabled={selectedCategories.length === 0 || isSubmitting}
            size="lg"
          >
            {isSubmitting ? t('onboarding.saving') : t('onboarding.getStarted')}
          </Button>
        </div>
      </div>
    </div>
  )
}
