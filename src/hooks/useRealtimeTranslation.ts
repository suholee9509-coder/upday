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
const failedSet = new Set<string>() // Track failed translations for retry

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

  /**
   * Translate all articles at once and wait for completion
   * Returns when ALL translations are done (for atomic UI update)
   * Includes automatic retry for previously failed translations
   */
  const translateAll = useCallback(
    async (
      articles: Array<{
        id: string
        title: string
        summary: string
        titleKo?: string
        summaryKo?: string
      }>,
      isRetry = false
    ): Promise<void> => {
      const needsTranslation = articles.filter(article => {
        // Skip if already has translation in DB
        if (article.titleKo && article.summaryKo) {
          // Cache DB translation
          translationCache[article.id] = { titleKo: article.titleKo, summaryKo: article.summaryKo }
          failedSet.delete(article.id) // Clear from failed if DB has translation
          return false
        }
        // Skip if already cached
        if (translationCache[article.id]) return false
        // Skip if already translating
        if (translatingSet.has(article.id)) return false
        // Include if previously failed (retry)
        if (failedSet.has(article.id)) return true
        return true
      })

      if (needsTranslation.length === 0) return

      let failedCount = 0

      // Translate all in parallel (no queue, direct API calls)
      await Promise.all(
        needsTranslation.map(async (article) => {
          try {
            translatingSet.add(article.id)
            const result = await translateToKorean(article.title, article.summary)
            if (result) {
              translationCache[article.id] = result
              failedSet.delete(article.id) // Success - remove from failed
              // Update DB in background for real UUIDs
              const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(article.id)
              if (supabase && isValidUUID) {
                supabase
                  .from('news_items')
                  .update({ title_ko: result.titleKo, summary_ko: result.summaryKo })
                  .eq('id', article.id)
                  .then(() => {})
              }
            } else {
              // Translation returned null - mark as failed for retry
              failedSet.add(article.id)
              failedCount++
            }
          } catch {
            failedSet.add(article.id)
            failedCount++
          } finally {
            translatingSet.delete(article.id)
          }
        })
      )

      // Force re-render after all translations complete
      if (mountedRef.current) {
        forceUpdate({})
      }

      // Auto-retry failed translations once after a delay (only on first attempt)
      if (failedCount > 0 && !isRetry && mountedRef.current) {
        console.log(`[Translation] ${failedCount} failed, retrying in 2s...`)
        setTimeout(() => {
          if (mountedRef.current) {
            const retryArticles = articles.filter(a => failedSet.has(a.id))
            if (retryArticles.length > 0) {
              translateAll(retryArticles, true).then(() => {
                if (mountedRef.current) forceUpdate({})
              })
            }
          }
        }, 2000)
      }
    },
    []
  )

  return {
    getTranslation,
    isTranslating,
    getCached,
    prefetchTranslations,
    translateAll,
  }
}
