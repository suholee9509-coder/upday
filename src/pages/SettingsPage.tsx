import { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { X, Plus, LogOut, Trash2, Globe, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/Header'
import { Sidebar, SidebarProvider } from '@/components/layout/Sidebar'
import { SEO } from '@/components/SEO'
import { Button } from '@/components/ui'
import { CompanyLogo } from '@/components/CompanyLogo'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useUserInterests } from '@/hooks/useUserInterests'
import { useLanguage, type LanguageCode } from '@/hooks/useLanguage'
import { CATEGORIES, COMPANIES } from '@/lib/constants'

export function SettingsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading: authLoading, signOut, deleteAccount } = useAuth()
  const { interests, isLoading: interestsLoading, updateInterests } = useUserInterests()
  const { currentLanguage, languages, changeLanguage } = useLanguage()

  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Load initial values from interests
  useEffect(() => {
    if (interests) {
      setSelectedCategories(interests.categories || [])
      setKeywords(interests.keywords || [])
      setSelectedCompanies(interests.companies || [])
    }
  }, [interests])

  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/timeline" replace />
  }

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

  const handleSave = async () => {
    if (selectedCategories.length === 0) {
      setSaveMessage({ text: t('settings.selectAtLeastOne'), type: 'error' })
      return
    }

    setIsSaving(true)
    setSaveMessage(null)

    try {
      await updateInterests({
        categories: selectedCategories,
        keywords: keywords,
        companies: selectedCompanies,
      })

      setSaveMessage({ text: t('settings.saveSuccess'), type: 'success' })
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      setSaveMessage({ text: t('settings.saveFailed'), type: 'error' })
      console.error('Failed to save settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)

    try {
      const { error } = await deleteAccount()

      if (error) {
        alert('Failed to delete account. Please try again or contact support.')
        console.error('Failed to delete account:', error)
      } else {
        // Redirect to home page after successful deletion
        navigate('/timeline')
      }
    } catch (error) {
      alert('Failed to delete account. Please try again.')
      console.error('Failed to delete account:', error)
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (authLoading || interestsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted-foreground/20 border-t-primary" />
      </div>
    )
  }

  return (
    <>
      <SEO
        title={t('settings.title')}
        description={t('settings.description')}
        noindex
      />

      <SidebarProvider>
        <div className="min-h-screen bg-background flex">
          {/* Sidebar - visible on lg+ */}
          <Sidebar />

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            <Header
              showLogo={false}
              showMobileMenu={true}
              pageTitle={t('settings.title')}
              pageDescription={t('settings.description')}
            />

            <main id="main-content" className="flex-1">
              <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
              <h1 className="text-3xl font-bold text-foreground mb-8">{t('settings.title')}</h1>

              {/* Account Section */}
              <section className="mb-12">
                <h2 className="text-xl font-semibold text-foreground mb-4">{t('settings.account')}</h2>
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center gap-4">
                    {user?.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt=""
                        className="w-16 h-16 rounded-full shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-2xl font-medium text-primary">
                          {(user?.user_metadata?.name || user?.email || '?')[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-medium text-foreground truncate">
                        {user?.user_metadata?.name || user?.email?.split('@')[0]}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('settings.signedInWith')}: {user?.user_metadata?.provider || user?.app_metadata?.provider || 'OAuth'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex sm:justify-end">
                    <Button
                      onClick={handleSignOut}
                      variant="outline"
                      className="gap-2 w-full sm:w-auto"
                    >
                      <LogOut className="h-4 w-4" />
                      {t('nav.logOut')}
                    </Button>
                  </div>
                </div>
              </section>

              {/* Language Section */}
              <section className="mb-12">
                <h2 className="text-xl font-semibold text-foreground mb-4">{t('settings.language')}</h2>
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground mb-3">{t('settings.selectLanguage')}</p>
                      <div className="flex gap-2" role="group" aria-label={t('settings.language')}>
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code as LanguageCode)}
                            aria-pressed={currentLanguage === lang.code}
                            className={cn(
                              'px-4 py-2.5 rounded-lg border text-sm font-medium transition-all flex items-center gap-2',
                              currentLanguage === lang.code
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border bg-background text-foreground hover:border-primary/50'
                            )}
                          >
                            {currentLanguage === lang.code && <Check className="h-4 w-4" aria-hidden="true" />}
                            {lang.nativeLabel}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Interest Settings Section */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">{t('settings.interestSettings')}</h2>
                <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                  {/* Categories */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      {t('onboarding.categories')} <span className="text-destructive">*</span>
                      <span className="text-xs text-muted-foreground ml-2">{t('onboarding.categoriesRequired')}</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3" role="group" aria-label={t('onboarding.categories')}>
                      {CATEGORIES.map(category => (
                        <button
                          key={category.id}
                          onClick={() => toggleCategory(category.id)}
                          aria-pressed={selectedCategories.includes(category.id)}
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
                        aria-label="Add keyword"
                        className={cn(
                          'h-[42px] w-[42px] rounded-lg shrink-0 flex items-center justify-center',
                          'border border-border bg-background',
                          'hover:border-primary hover:bg-primary/5',
                          'transition-all disabled:opacity-50 disabled:pointer-events-none'
                        )}
                      >
                        <Plus className="h-5 w-5 text-foreground" aria-hidden="true" />
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
                              aria-label={`Remove ${keyword}`}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-3 w-3" aria-hidden="true" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Companies */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      {t('onboarding.companies')}{' '}
                      <span className="text-xs text-muted-foreground">{t('settings.companiesSynced')}</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto scrollbar-subtle" role="group" aria-label={t('onboarding.companies')}>
                      {COMPANIES.map(company => (
                        <button
                          key={company.id}
                          onClick={() => toggleCompany(company.id)}
                          aria-pressed={selectedCompanies.includes(company.id)}
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

                  {/* Save Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    {saveMessage && (
                      <p
                        className={cn(
                          'text-sm font-medium',
                          saveMessage.type === 'success' ? 'text-green-600' : 'text-destructive'
                        )}
                      >
                        {saveMessage.text}
                      </p>
                    )}
                    <Button
                      onClick={handleSave}
                      disabled={selectedCategories.length === 0 || isSaving}
                      size="lg"
                      className="ml-auto"
                    >
                      {isSaving ? t('settings.saving') : t('settings.saveChanges')}
                    </Button>
                  </div>
                </div>
              </section>

              {/* Account Management Section */}
              <section className="mt-12">
                <h2 className="text-xl font-semibold text-foreground mb-4">{t('settings.accountManagement')}</h2>
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-foreground mb-1">
                        {t('nav.deleteAccount')}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.deleteAccountWarning')}
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowDeleteModal(true)}
                      variant="outline"
                      className="gap-2 shrink-0 text-destructive/70 border-destructive/50 hover:text-destructive hover:border-destructive hover:bg-destructive/5"
                    >
                      <Trash2 className="h-4 w-4" />
                      {t('nav.deleteAccount')}
                    </Button>
                  </div>
                </div>
              </section>

              {/* Delete Confirmation Modal */}
              {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                  <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-lg">
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {t('settings.confirmDelete')}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      {t('settings.deleteConfirmMessage')}
                    </p>
                    <ul className="text-sm text-muted-foreground mb-6 space-y-2 list-disc list-inside">
                      <li>{t('settings.deleteItem1')}</li>
                      <li>{t('settings.deleteItem2')}</li>
                      <li>{t('settings.deleteItem3')}</li>
                    </ul>
                    <p className="text-sm font-medium text-destructive mb-6">
                      {t('settings.deleteWarning')}
                    </p>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => setShowDeleteModal(false)}
                        variant="outline"
                        className="flex-1"
                        disabled={isDeleting}
                      >
                        {t('settings.cancel')}
                      </Button>
                      <Button
                        onClick={handleDeleteAccount}
                        variant="destructive"
                        className="flex-1"
                        disabled={isDeleting}
                      >
                        {isDeleting ? t('settings.deleting') : t('nav.deleteAccount')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </>
  )
}
