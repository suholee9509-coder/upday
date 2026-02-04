import { useState, useEffect, useCallback } from 'react'

const SEARCH_HISTORY_KEY = 'upday_search_history'
const MAX_HISTORY_ITEMS = 8

export interface SearchHistoryItem {
  term: string
  timestamp: number
}

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Validate and migrate old format if needed
        if (Array.isArray(parsed)) {
          const normalized = parsed.map(item =>
            typeof item === 'string'
              ? { term: item, timestamp: Date.now() }
              : item
          )
          setHistory(normalized)
        }
      }
    } catch {
      // Invalid data, start fresh
      localStorage.removeItem(SEARCH_HISTORY_KEY)
    }
  }, [])

  // Save to localStorage
  const saveToStorage = useCallback((items: SearchHistoryItem[]) => {
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(items))
    } catch {
      // Storage full or unavailable
    }
  }, [])

  // Add a search term to history
  const addSearchTerm = useCallback((term: string) => {
    const trimmed = term.trim()
    if (!trimmed || trimmed.length < 2) return

    setHistory(prev => {
      // Remove duplicate if exists
      const filtered = prev.filter(item =>
        item.term.toLowerCase() !== trimmed.toLowerCase()
      )

      // Add new item at the beginning
      const newHistory = [
        { term: trimmed, timestamp: Date.now() },
        ...filtered
      ].slice(0, MAX_HISTORY_ITEMS)

      saveToStorage(newHistory)
      return newHistory
    })
  }, [saveToStorage])

  // Remove a specific search term
  const removeSearchTerm = useCallback((term: string) => {
    setHistory(prev => {
      const newHistory = prev.filter(item => item.term !== term)
      saveToStorage(newHistory)
      return newHistory
    })
  }, [saveToStorage])

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([])
    localStorage.removeItem(SEARCH_HISTORY_KEY)
  }, [])

  return {
    history,
    addSearchTerm,
    removeSearchTerm,
    clearHistory,
  }
}
