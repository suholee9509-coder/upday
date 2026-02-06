/**
 * Real-time translation hook for on-demand Korean translation
 * Translates articles when user switches to Korean mode
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { translateToKorean } from '@/lib/ai'
import { supabase } from '@/lib/db'

interface TranslationCache {
  [articleId: string]: {
    titleKo: string
    summaryKo: string
  }
}

// Module-level cache (persists across component remounts)
const translationCache: TranslationCache = {}
const translatingSet = new Set<string>()

// Queue for batch translation
let translationQueue: Array<{
  id: string
  title: string
  summary: string
  resolve: (result: { titleKo: string; summaryKo: string } | null) => void
}> = []
let batchTimeout: ReturnType<typeof setTimeout> | null = null

const BATCH_DELAY = 10 // ms to wait before processing batch (minimal delay to collect items)
const MAX_CONCURRENT = 15 // Max concurrent translations (higher for faster batch processing)

/**
 * Process translation queue in batches
 */
async function processTranslationQueue() {
  if (translationQueue.length === 0) return

  const batch = translationQueue.splice(0, MAX_CONCURRENT)

  await Promise.all(
    batch.map(async (item) => {
      try {
        translatingSet.add(item.id)
        const result = await translateToKorean(item.title, item.summary)

        if (result) {
          // Cache the result
          translationCache[item.id] = result

          // Update DB in background (don't await)
          // Skip DB update for mock data (non-UUID IDs)
          const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id)
          if (supabase && isValidUUID) {
            supabase
              .from('news_items')
              .update({
                title_ko: result.titleKo,
                summary_ko: result.summaryKo,
              })
              .eq('id', item.id)
              .then(({ error }) => {
                if (error) console.warn('[Translation] DB update failed:', error.message)
              })
          }
        }

        item.resolve(result)
      } catch (error) {
        console.error('[Translation] Failed:', error)
        item.resolve(null)
      } finally {
        translatingSet.delete(item.id)
      }
    })
  )

  // Process remaining items
  if (translationQueue.length > 0) {
    processTranslationQueue()
  }
}

/**
 * Queue an article for translation
 */
function queueTranslation(
  id: string,
  title: string,
  summary: string
): Promise<{ titleKo: string; summaryKo: string } | null> {
  // Check cache first
  if (translationCache[id]) {
    return Promise.resolve(translationCache[id])
  }

  // Check if already translating
  if (translatingSet.has(id)) {
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (!translatingSet.has(id)) {
          clearInterval(check)
          resolve(translationCache[id] || null)
        }
      }, 100)
    })
  }

  return new Promise((resolve) => {
    translationQueue.push({ id, title, summary, resolve })

    // Debounce batch processing
    if (batchTimeout) clearTimeout(batchTimeout)
    batchTimeout = setTimeout(processTranslationQueue, BATCH_DELAY)
  })
}

/**
 * Hook for real-time translation
 */
export function useRealtimeTranslation() {
  const [, forceUpdate] = useState({})
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  /**
   * Get Korean translation for an article
   * Returns cached value immediately, or triggers translation
   */
  const getTranslation = useCallback(
    async (
      id: string,
      title: string,
      summary: string,
      existingTitleKo?: string,
      existingSummaryKo?: string
    ): Promise<{ titleKo: string; summaryKo: string } | null> => {
      // Use existing translation if available
      if (existingTitleKo && existingSummaryKo) {
        return { titleKo: existingTitleKo, summaryKo: existingSummaryKo }
      }

      // Check cache
      if (translationCache[id]) {
        return translationCache[id]
      }

      // Queue for translation
      const result = await queueTranslation(id, title, summary)

      // Trigger re-render if still mounted
      if (mountedRef.current) {
        forceUpdate({})
      }

      return result
    },
    []
  )

  /**
   * Check if translation is in progress
   */
  const isTranslating = useCallback((id: string) => {
    return translatingSet.has(id)
  }, [])

  /**
   * Get cached translation (synchronous)
   */
  const getCached = useCallback((id: string) => {
    return translationCache[id] || null
  }, [])

  /**
   * Prefetch translations for a list of articles
   */
  const prefetchTranslations = useCallback(
    (
      articles: Array<{
        id: string
        title: string
        summary: string
        titleKo?: string
        summaryKo?: string
      }>
    ) => {
      for (const article of articles) {
        // Skip if already has translation
        if (article.titleKo && article.summaryKo) continue
        // Skip if already cached or translating
        if (translationCache[article.id] || translatingSet.has(article.id)) continue

        // Queue for translation
        queueTranslation(article.id, article.title, article.summary)
      }
    },
    []
  )

  return {
    getTranslation,
    isTranslating,
    getCached,
    prefetchTranslations,
  }
}
