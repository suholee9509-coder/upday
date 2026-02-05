import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { OnboardingModal } from './OnboardingModal'
import { useAuth } from '@/hooks/useAuth'
import { useUserInterests } from '@/hooks/useUserInterests'

// Routes where onboarding modal should NOT appear
const EXCLUDED_ROUTES = ['/', '/about', '/feedback', '/diversity', '/ethics']

export function OnboardingManager() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { isLoading: interestsLoading, hasCompletedOnboarding, refetch } = useUserInterests()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [hasChecked, setHasChecked] = useState(false)
  const [shouldNavigate, setShouldNavigate] = useState(false)

  useEffect(() => {
    // Wait for both auth and interests to load
    if (authLoading || interestsLoading) return

    // Don't show onboarding on excluded routes (landing page, about, etc.)
    if (EXCLUDED_ROUTES.includes(location.pathname)) {
      setShowOnboarding(false)
      return
    }

    // Not authenticated - never show onboarding
    if (!isAuthenticated) {
      setHasChecked(false)
      setShowOnboarding(false)
      return
    }

    // CRITICAL: If user already completed onboarding, NEVER show modal
    // This handles the case where modal might have been set to show before data loaded
    if (hasCompletedOnboarding) {
      setShowOnboarding(false)
      return
    }

    // User is authenticated but hasn't completed onboarding - show modal once per session
    if (!hasChecked) {
      setShowOnboarding(true)
      setHasChecked(true)
    }
  }, [isAuthenticated, hasCompletedOnboarding, authLoading, interestsLoading, hasChecked, location.pathname])

  // Navigate to My Feed after interests are loaded
  useEffect(() => {
    if (shouldNavigate && !interestsLoading && hasCompletedOnboarding) {
      navigate('/timeline/my')
      setShouldNavigate(false)
    }
  }, [shouldNavigate, interestsLoading, hasCompletedOnboarding, navigate])

  const handleComplete = async () => {
    setShowOnboarding(false)
    // Refetch interests to update the state
    await refetch()
    // Set flag to navigate once interests are loaded
    setShouldNavigate(true)
  }

  return (
    <OnboardingModal
      isOpen={showOnboarding}
      onComplete={handleComplete}
    />
  )
}
