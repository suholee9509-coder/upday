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

    // CRITICAL: Only show onboarding if ALL conditions are met:
    // 1. User is authenticated (must be true)
    // 2. User hasn't completed onboarding (must be false)
    // 3. We haven't checked yet this session
    //
    // IMPORTANT: isAuthenticated must be checked FIRST to prevent showing
    // onboarding modal to unauthenticated users
    if (!isAuthenticated) {
      // Not authenticated - reset state and never show onboarding
      setHasChecked(false)
      setShowOnboarding(false)
      return
    }

    // User is authenticated - check if onboarding needed
    if (!hasCompletedOnboarding && !hasChecked) {
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
