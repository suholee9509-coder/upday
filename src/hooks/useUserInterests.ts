import { useState, useEffect } from 'react'
import { supabase } from '@/lib/db'
import { useAuth } from './useAuth'

export interface UserInterests {
  id: string
  user_id: string
  categories: string[]
  keywords: string[]
  companies: string[]
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export function useUserInterests() {
  const { user, isAuthenticated } = useAuth()
  const [interests, setInterests] = useState<UserInterests | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setInterests(null)
      setIsLoading(false)
      return
    }

    fetchInterests()
  }, [user, isAuthenticated])

  const fetchInterests = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const client = supabase
      if (!client) throw new Error('Supabase client not initialized')

      const { data, error: fetchError } = await client
        .from('user_interests')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        // If no interests found, that's not an error
        if (fetchError.code === 'PGRST116') {
          setInterests(null)
        } else {
          throw fetchError
        }
      } else {
        setInterests(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch interests'))
      console.error('Failed to fetch user interests:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const updateInterests = async (
    updates: Partial<Pick<UserInterests, 'categories' | 'keywords' | 'companies'>>
  ) => {
    if (!user) return

    try {
      const client = supabase
      if (!client) throw new Error('Supabase client not initialized')

      const { data, error: updateError } = await client
        .from('user_interests')
        .upsert(
          {
            user_id: user.id,
            ...updates,
            onboarding_completed: true,
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single()

      if (updateError) throw updateError

      setInterests(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update interests'))
      console.error('Failed to update user interests:', err)
      throw err
    }
  }

  return {
    interests,
    isLoading,
    error,
    hasCompletedOnboarding: interests?.onboarding_completed ?? false,
    refetch: fetchInterests,
    updateInterests,
  }
}
