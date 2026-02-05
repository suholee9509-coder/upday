import { useEffect, useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

// GitHub icon
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

// Google icon
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

interface LoginModalProps {
  isOpen?: boolean
  onClose?: () => void
}

export function LoginModal({ isOpen: controlledIsOpen, onClose: controlledOnClose }: LoginModalProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState<'github' | 'google' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { signInWithGithub, signInWithGoogle } = useAuth()

  // Handle controlled vs uncontrolled state
  const modalIsOpen = controlledIsOpen ?? isOpen
  const handleClose = useCallback(() => {
    if (controlledOnClose) {
      controlledOnClose()
    } else {
      setIsOpen(false)
    }
    setError(null)
    setIsLoading(null)
  }, [controlledOnClose])

  // Listen for custom event to open modal
  useEffect(() => {
    const handleOpenModal = () => setIsOpen(true)
    window.addEventListener('open-login-modal', handleOpenModal)
    return () => window.removeEventListener('open-login-modal', handleOpenModal)
  }, [])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalIsOpen) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [modalIsOpen, handleClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (modalIsOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [modalIsOpen])

  const handleGitHubLogin = async () => {
    setIsLoading('github')
    setError(null)
    const { error } = await signInWithGithub()
    if (error) {
      setError(error.message)
      setIsLoading(null)
    }
    // Don't reset loading - OAuth will redirect
  }

  const handleGoogleLogin = async () => {
    setIsLoading('google')
    setError(null)
    const { error } = await signInWithGoogle()
    if (error) {
      setError(error.message)
      setIsLoading(null)
    }
    // Don't reset loading - OAuth will redirect
  }

  if (!modalIsOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className={cn(
        'relative z-10 w-full max-w-md mx-4 bg-background rounded-xl shadow-2xl',
        'border border-border',
        'animate-in fade-in-0 zoom-in-95 duration-200'
      )}>
        {/* Close button */}
        <button
          onClick={handleClose}
          className={cn(
            'absolute top-4 right-4 p-1.5 rounded-md',
            'text-muted-foreground hover:text-foreground hover:bg-muted',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            'transition-colors'
          )}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 id="login-modal-title" className="text-xl font-semibold text-foreground">
              {t('login.title')}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('login.description')}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* OAuth buttons */}
          <div className="space-y-3">
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-center gap-3 h-12"
              onClick={handleGitHubLogin}
              disabled={isLoading !== null}
            >
              {isLoading === 'github' ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <GitHubIcon className="w-5 h-5" />
              )}
              {t('login.continueGithub')}
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full justify-center gap-3 h-12"
              onClick={handleGoogleLogin}
              disabled={isLoading !== null}
            >
              {isLoading === 'google' ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <GoogleIcon className="w-5 h-5" />
              )}
              {t('login.continueGoogle')}
            </Button>
          </div>

          {/* Terms */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            {t('login.terms')}{' '}
            <a href="/about" className="underline hover:text-foreground">
              {t('login.termsOfService')}
            </a>{' '}
            {t('login.and')}{' '}
            <a href="/about" className="underline hover:text-foreground">
              {t('login.privacyPolicy')}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
