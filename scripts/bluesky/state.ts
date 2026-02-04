/**
 * State Management for Bluesky Auto-Post
 *
 * Tracks which articles have been posted to avoid duplicates
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { dirname } from 'path'
import { config } from './config'

interface PostState {
  lastPostedTime: string | null
  postedGuids: string[]
  lastRunTime: string | null
  stats: {
    totalPosted: number
    lastRunPosted: number
  }
}

const DEFAULT_STATE: PostState = {
  lastPostedTime: null,
  postedGuids: [],
  lastRunTime: null,
  stats: {
    totalPosted: 0,
    lastRunPosted: 0,
  },
}

// Maximum GUIDs to keep in state (to prevent unbounded growth)
const MAX_GUIDS = 500

/**
 * Load state from file
 */
export function loadState(): PostState {
  try {
    if (existsSync(config.stateFilePath)) {
      const data = readFileSync(config.stateFilePath, 'utf-8')
      const state = JSON.parse(data) as PostState
      console.log(
        `Loaded state: lastPostedTime=${state.lastPostedTime}, ${state.postedGuids.length} GUIDs tracked`
      )
      return state
    }
  } catch (error) {
    console.warn('Failed to load state, using default:', error)
  }
  return { ...DEFAULT_STATE }
}

/**
 * Save state to file
 */
export function saveState(state: PostState): void {
  try {
    // Ensure directory exists
    const dir = dirname(config.stateFilePath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }

    // Trim GUIDs if too many
    if (state.postedGuids.length > MAX_GUIDS) {
      state.postedGuids = state.postedGuids.slice(-MAX_GUIDS)
    }

    writeFileSync(config.stateFilePath, JSON.stringify(state, null, 2))
    console.log(`State saved to ${config.stateFilePath}`)
  } catch (error) {
    console.error('Failed to save state:', error)
    throw error
  }
}

/**
 * Check if an article has already been posted
 */
export function isAlreadyPosted(state: PostState, guid: string): boolean {
  return state.postedGuids.includes(guid)
}

/**
 * Mark an article as posted
 */
export function markAsPosted(state: PostState, guid: string, pubDate: Date): PostState {
  return {
    ...state,
    lastPostedTime: pubDate.toISOString(),
    postedGuids: [...state.postedGuids, guid],
    lastRunTime: new Date().toISOString(),
    stats: {
      totalPosted: state.stats.totalPosted + 1,
      lastRunPosted: state.stats.lastRunPosted + 1,
    },
  }
}

/**
 * Reset last run stats (call at start of each run)
 */
export function resetRunStats(state: PostState): PostState {
  return {
    ...state,
    stats: {
      ...state.stats,
      lastRunPosted: 0,
    },
  }
}

/**
 * Get the date to filter articles from
 * Returns null if this is the first run
 */
export function getFilterDate(state: PostState): Date | null {
  if (state.lastPostedTime) {
    return new Date(state.lastPostedTime)
  }
  // First run: post articles from the last 4 hours (matches crawl cycle)
  const fourHoursAgo = new Date()
  fourHoursAgo.setHours(fourHoursAgo.getHours() - 4)
  return fourHoursAgo
}
