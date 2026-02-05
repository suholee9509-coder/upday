import { useState, useEffect } from 'react'
import { OnboardingModal } from './OnboardingModal'
import { useAuth } from '@/hooks/useAuth'
import { useUserInterests } from '@/hooks/useUserInterests'

export function OnboardingManager() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { isLoading: interestsLoading, hasCompletedOnboarding, refetch } = useUserInterests()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    // Wait for both auth and interests to load
    if (authLoading || interestsLoading) return

    // CRITICAL: Only show onboarding if ALL conditions are met:
    // 1. User is authenticated
    // 2. User hasn't completed onboarding
    // 3. We haven't checked yet this session
    if (isAuthenticated && !hasCompletedOnboarding && !hasChecked) {
      setShowOnboarding(true)
      setHasChecked(true)
    }

    // If user logs out, reset the check and hide modal
    if (!isAuthenticated) {
      setHasChecked(false)
      setShowOnboarding(false)
    }
  }, [isAuthenticated, hasCompletedOnboarding, authLoading, interestsLoading, hasChecked])

  const handleComplete = async () => {
    setShowOnboarding(false)
    // Refetch interests to update the state
    await refetch()
  }

  return (
    <OnboardingModal
      isOpen={showOnboarding}
      onComplete={handleComplete}
    />
  )
}
