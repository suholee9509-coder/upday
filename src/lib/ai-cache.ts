/**
 * AI Response Cache Module
 * Caches AI summarization and classification results to reduce API costs
 *
 * Cache key: SHA-256 hash of content (first 32 chars)
 * TTL: 24 hours
 *
 * Requires Supabase table:
 * CREATE TABLE ai_response_cache (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   content_hash VARCHAR(32) UNIQUE NOT NULL,
 *   summary TEXT NOT NULL,
 *   category VARCHAR(20) NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
 * );
 * CREATE INDEX idx_cache_hash ON ai_response_cache(content_hash);
 * CREATE INDEX idx_cache_expires ON ai_response_cache(expires_at);
 */

import { supabase } from './db'
import type { Category } from '@/types/news'

export interface CachedAIResponse {
  summary: string
  category: Category
}

export interface CacheStats {
  hits: number
  misses: number
  hitRate: number
}

// In-memory stats tracking (reset on each run)
let cacheStats = { hits: 0, misses: 0 }

/**
 * Generate SHA-256 hash of content (truncated to 32 chars)
 */
export async function generateContentHash(content: string): Promise<string> {
  const normalizedContent = content.trim().toLowerCase().substring(0, 2000) // Limit for consistent hashing

  // Use Web Crypto API (works in browser and Cloudflare Workers)
  const encoder = new TextEncoder()
  const data = encoder.encode(normalizedContent)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32)
}

/**
 * Get cached AI response if available and not expired
 */
export async function getCachedResponse(contentHash: string): Promise<CachedAIResponse | null> {
  if (!supabase) return null

  try {
    const { data, error } = await supabase
      .from('ai_response_cache')
      .select('summary, category')
      .eq('content_hash', contentHash)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error || !data) {
      return null
    }

    cacheStats.hits++
    console.log(`[CACHE] HIT for hash ${contentHash.substring(0, 8)}...`)

    return {
      summary: data.summary,
      category: data.category as Category,
    }
  } catch {
    // Table might not exist, gracefully return null
    return null
  }
}

/**
 * Store AI response in cache
 */
export async function setCachedResponse(
  contentHash: string,
  response: CachedAIResponse
): Promise<void> {
  if (!supabase) return

  try {
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour TTL

    await supabase.from('ai_response_cache').upsert({
      content_hash: contentHash,
      summary: response.summary,
      category: response.category,
      expires_at: expiresAt.toISOString(),
    }, {
      onConflict: 'content_hash',
    })

    cacheStats.misses++
    console.log(`[CACHE] STORED for hash ${contentHash.substring(0, 8)}...`)
  } catch (error) {
    // Gracefully handle if table doesn't exist
    console.warn('[CACHE] Failed to store response:', error)
  }
}

/**
 * Get or process with AI (cache-through pattern)
 */
export async function getOrProcessWithCache(
  content: string,
  processFunc: () => Promise<CachedAIResponse>
): Promise<{ result: CachedAIResponse; fromCache: boolean }> {
  const contentHash = await generateContentHash(content)

  // Try cache first
  const cached = await getCachedResponse(contentHash)
  if (cached) {
    return { result: cached, fromCache: true }
  }

  // Process with AI
  const result = await processFunc()

  // Store in cache (fire and forget)
  setCachedResponse(contentHash, result).catch(() => {})

  return { result, fromCache: false }
}

/**
 * Get current cache stats
 */
export function getCacheStats(): CacheStats {
  const total = cacheStats.hits + cacheStats.misses
  return {
    hits: cacheStats.hits,
    misses: cacheStats.misses,
    hitRate: total > 0 ? cacheStats.hits / total : 0,
  }
}

/**
 * Reset cache stats (call at start of each ingestion run)
 */
export function resetCacheStats(): void {
  cacheStats = { hits: 0, misses: 0 }
}

/**
 * Clean expired cache entries (call periodically)
 */
export async function cleanExpiredCache(): Promise<number> {
  if (!supabase) return 0

  try {
    const { data, error } = await supabase
      .from('ai_response_cache')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id')

    if (error) {
      console.warn('[CACHE] Failed to clean expired entries:', error)
      return 0
    }

    const count = data?.length || 0
    if (count > 0) {
      console.log(`[CACHE] Cleaned ${count} expired entries`)
    }
    return count
  } catch {
    return 0
  }
}
