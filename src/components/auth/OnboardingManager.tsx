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

    // If user is authenticated and hasn't completed onboarding, show the modal
    if (isAuthenticated && !hasCompletedOnboarding && !hasChecked) {
      setShowOnboarding(true)
      setHasChecked(true)
    }

    // If user logs out, reset the check
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
