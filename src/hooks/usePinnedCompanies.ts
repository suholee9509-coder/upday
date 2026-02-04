import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'upday_pinned_companies'

export function usePinnedCompanies() {
  const [pinnedCompanies, setPinnedCompanies] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pinnedCompanies))
    } catch {
      // Storage not available
    }
  }, [pinnedCompanies])

  const isPinned = useCallback((companyId: string) => {
    return pinnedCompanies.includes(companyId)
  }, [pinnedCompanies])

  const togglePin = useCallback((companyId: string) => {
    setPinnedCompanies(prev => {
      if (prev.includes(companyId)) {
        return prev.filter(id => id !== companyId)
      } else {
        return [...prev, companyId]
      }
    })
  }, [])

  const pin = useCallback((companyId: string) => {
    setPinnedCompanies(prev => {
      if (prev.includes(companyId)) return prev
      return [...prev, companyId]
    })
  }, [])

  const unpin = useCallback((companyId: string) => {
    setPinnedCompanies(prev => prev.filter(id => id !== companyId))
  }, [])

  return {
    pinnedCompanies,
    isPinned,
    togglePin,
    pin,
    unpin,
  }
}
