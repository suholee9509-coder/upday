import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/db'
import { useAuth } from './useAuth'
import { STORAGE_KEYS } from '@/lib/constants'

/**
 * Hook for managing pinned companies
 * - Requires authentication
 * - Cached in localStorage for instant loading
 * - Server-synced via Supabase
 * - Cache cleared when pins are removed
 */
export function usePinnedCompanies() {
  const { user, isAuthenticated } = useAuth()
  const [pinnedCompanies, setPinnedCompanies] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load pins from localStorage cache
  const loadFromCache = useCallback(() => {
    if (!user) return []

    try {
      const cached = localStorage.getItem(STORAGE_KEYS.PINNED_COMPANIES)
      if (!cached) return []

      const data = JSON.parse(cached)
      // Verify it's for the current user
      if (data.userId === user.id) {
        return data.pins || []
      }
      return []
    } catch (error) {
      console.error('Failed to load pinned companies from cache:', error)
      return []
    }
  }, [user])

  // Save pins to localStorage cache
  const saveToCache = useCallback((pins: string[]) => {
    if (!user) return

    try {
      localStorage.setItem(STORAGE_KEYS.PINNED_COMPANIES, JSON.stringify({
        userId: user.id,
        pins,
      }))
    } catch (error) {
      console.error('Failed to save pinned companies to cache:', error)
    }
  }, [user])

  // Clear cache
  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.PINNED_COMPANIES)
    } catch (error) {
      console.error('Failed to clear pinned companies cache:', error)
    }
  }, [])

  // Load pins from server (authenticated users only)
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

      const pins = data?.map(row => row.company_slug) || []
      // Update cache with server data
      saveToCache(pins)
      return pins
    } catch (error) {
      console.error('Failed to load pinned companies from server:', error)
      return []
    }
  }, [user, saveToCache])

  // Load pins when authenticated
  useEffect(() => {
    const loadPins = async () => {
      if (isAuthenticated && user) {
        // Load from cache first for instant display
        const cachedPins = loadFromCache()
        if (cachedPins.length > 0) {
          setPinnedCompanies(cachedPins)
          setIsLoading(false)
        }

        // Then sync with server in background
        const serverPins = await loadFromServer()
        setPinnedCompanies(serverPins)
        setIsLoading(false)
      } else {
        // Not authenticated: clear cache and pins
        clearCache()
        setPinnedCompanies([])
        setIsLoading(false)
      }
    }

    loadPins()
  }, [isAuthenticated, user, loadFromCache, loadFromServer, clearCache])

  const isPinned = useCallback((companyId: string) => {
    return pinnedCompanies.includes(companyId)
  }, [pinnedCompanies])

  const togglePin = useCallback(async (companyId: string) => {
    // Require login
    if (!isAuthenticated || !user) {
      window.dispatchEvent(new CustomEvent('open-login-modal'))
      return
    }

    const isCurrentlyPinned = pinnedCompanies.includes(companyId)
    const newPins = isCurrentlyPinned
      ? pinnedCompanies.filter(id => id !== companyId)
      : [...pinnedCompanies, companyId]

    // Optimistic update to state and cache
    setPinnedCompanies(newPins)
    saveToCache(newPins)

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
      // Revert optimistic update in state and cache
      setPinnedCompanies(pinnedCompanies)
      saveToCache(pinnedCompanies)
    }
  }, [isAuthenticated, user, pinnedCompanies, saveToCache])

  const pin = useCallback(async (companyId: string) => {
    // Require login
    if (!isAuthenticated || !user) {
      window.dispatchEvent(new CustomEvent('open-login-modal'))
      return
    }

    if (pinnedCompanies.includes(companyId)) return

    const newPins = [...pinnedCompanies, companyId]

    // Optimistic update to state and cache
    setPinnedCompanies(newPins)
    saveToCache(newPins)

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
      // Revert optimistic update in state and cache
      setPinnedCompanies(pinnedCompanies)
      saveToCache(pinnedCompanies)
    }
  }, [isAuthenticated, user, pinnedCompanies, saveToCache])

  const unpin = useCallback(async (companyId: string) => {
    // Require login
    if (!isAuthenticated || !user) {
      window.dispatchEvent(new CustomEvent('open-login-modal'))
      return
    }

    const newPins = pinnedCompanies.filter(id => id !== companyId)

    // Optimistic update to state and cache
    setPinnedCompanies(newPins)
    saveToCache(newPins)

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
      // Revert optimistic update in state and cache
      setPinnedCompanies(pinnedCompanies)
      saveToCache(pinnedCompanies)
    }
  }, [isAuthenticated, user, pinnedCompanies, saveToCache])

  return {
    pinnedCompanies,
    isPinned,
    togglePin,
    pin,
    unpin,
    isLoading,
  }
}
