import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/db'
import { useAuth } from './useAuth'

const STORAGE_KEY = 'upday_pinned_companies'

/**
 * Hook for managing pinned companies
 * - Authenticated users: Server-synced via Supabase
 * - Non-authenticated users: localStorage only
 * - On login: Auto-migrate localStorage pins to server
 */
export function usePinnedCompanies() {
  const { user, isAuthenticated } = useAuth()
  const [pinnedCompanies, setPinnedCompanies] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMigrated, setHasMigrated] = useState(false)

  // Load pins from localStorage (for non-authenticated users)
  const loadFromLocalStorage = useCallback((): string[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }, [])

  // Save pins to localStorage
  const saveToLocalStorage = useCallback((pins: string[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pins))
    } catch {
      // Storage not available
    }
  }, [])

  // Load pins from server (for authenticated users)
  const loadFromServer = useCallback(async () => {
    if (!user) return []

    try {
      const client = supabase
      if (!client) throw new Error('Supabase client not initialized')

      const { data, error } = await client
        .from('pinned_companies')
        .select('company_slug')
        .eq('user_id', user.id)

      if (error) throw error

      return data?.map(row => row.company_slug) || []
    } catch (error) {
      console.error('Failed to load pinned companies from server:', error)
      return []
    }
  }, [user])

  // Migrate localStorage pins to server on login
  const migrateToServer = useCallback(async () => {
    if (!user || hasMigrated) return

    const localPins = loadFromLocalStorage()
    if (localPins.length === 0) {
      setHasMigrated(true)
      return
    }

    try {
      const client = supabase
      if (!client) throw new Error('Supabase client not initialized')

      // Get existing server pins
      const serverPins = await loadFromServer()

      // Find pins that need to be migrated (in localStorage but not on server)
      const pinsToMigrate = localPins.filter(slug => !serverPins.includes(slug))

      if (pinsToMigrate.length > 0) {
        const { error } = await client
          .from('pinned_companies')
          .insert(
            pinsToMigrate.map(slug => ({
              user_id: user.id,
              company_slug: slug,
            }))
          )

        if (error) throw error

        console.log(`Migrated ${pinsToMigrate.length} pins to server`)
      }

      // Clear localStorage after successful migration
      localStorage.removeItem(STORAGE_KEY)
      setHasMigrated(true)
    } catch (error) {
      console.error('Failed to migrate pins to server:', error)
    }
  }, [user, hasMigrated, loadFromLocalStorage, loadFromServer])

  // Initial load
  useEffect(() => {
    const loadPins = async () => {
      setIsLoading(true)

      if (isAuthenticated && user) {
        // Authenticated: migrate then load from server
        await migrateToServer()
        const serverPins = await loadFromServer()
        setPinnedCompanies(serverPins)
      } else {
        // Non-authenticated: load from localStorage
        const localPins = loadFromLocalStorage()
        setPinnedCompanies(localPins)
      }

      setIsLoading(false)
    }

    loadPins()
  }, [isAuthenticated, user, loadFromLocalStorage, loadFromServer, migrateToServer])

  // Sync to localStorage for non-authenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      saveToLocalStorage(pinnedCompanies)
    }
  }, [pinnedCompanies, isAuthenticated, saveToLocalStorage])

  const isPinned = useCallback((companyId: string) => {
    return pinnedCompanies.includes(companyId)
  }, [pinnedCompanies])

  const togglePin = useCallback(async (companyId: string) => {
    // Require login for authenticated features
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('open-login-modal'))
      return
    }

    if (!user) return

    const isCurrentlyPinned = pinnedCompanies.includes(companyId)

    // Optimistic update
    setPinnedCompanies(prev =>
      isCurrentlyPinned
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    )

    // Sync to server
    try {
      const client = supabase
      if (!client) throw new Error('Supabase client not initialized')

      if (isCurrentlyPinned) {
        // Unpin
        const { error } = await client
          .from('pinned_companies')
          .delete()
          .eq('user_id', user.id)
          .eq('company_slug', companyId)

        if (error) throw error
      } else {
        // Pin
        const { error } = await client
          .from('pinned_companies')
          .insert({
            user_id: user.id,
            company_slug: companyId,
          })

        if (error) throw error
      }
    } catch (error) {
      console.error('Failed to sync pin to server:', error)
      // Revert optimistic update
      setPinnedCompanies(prev =>
        isCurrentlyPinned
          ? [...prev, companyId]
          : prev.filter(id => id !== companyId)
      )
    }
  }, [isAuthenticated, user, pinnedCompanies])

  const pin = useCallback(async (companyId: string) => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('open-login-modal'))
      return
    }

    if (!user || pinnedCompanies.includes(companyId)) return

    // Optimistic update
    setPinnedCompanies(prev => [...prev, companyId])

    // Sync to server
    try {
      const client = supabase
      if (!client) throw new Error('Supabase client not initialized')

      const { error } = await client
        .from('pinned_companies')
        .insert({
          user_id: user.id,
          company_slug: companyId,
        })

      if (error) throw error
    } catch (error) {
      console.error('Failed to pin company:', error)
      // Revert optimistic update
      setPinnedCompanies(prev => prev.filter(id => id !== companyId))
    }
  }, [isAuthenticated, user, pinnedCompanies])

  const unpin = useCallback(async (companyId: string) => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('open-login-modal'))
      return
    }

    if (!user) return

    // Optimistic update
    setPinnedCompanies(prev => prev.filter(id => id !== companyId))

    // Sync to server
    try {
      const client = supabase
      if (!client) throw new Error('Supabase client not initialized')

      const { error } = await client
        .from('pinned_companies')
        .delete()
        .eq('user_id', user.id)
        .eq('company_slug', companyId)

      if (error) throw error
    } catch (error) {
      console.error('Failed to unpin company:', error)
      // Revert optimistic update
      setPinnedCompanies(prev => [...prev, companyId])
    }
  }, [isAuthenticated, user])

  return {
    pinnedCompanies,
    isPinned,
    togglePin,
    pin,
    unpin,
    isLoading,
  }
}
