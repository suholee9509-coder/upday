/**
 * Discord Auto-Post Script
 *
 * Fetches latest articles from RSS feed and posts to Discord
 * Usage: npx tsx scripts/discord/auto-post.ts
 * Dry run: DRY_RUN=true npx tsx scripts/discord/auto-post.ts
 */

import 'dotenv/config'
import { config } from './config'
import { postFeedItem, testWebhook } from './discord-client'
import { fetchRssFeed, type FeedItem } from '../bluesky/rss-parser'
import * as fs from 'fs'

const DRY_RUN = process.env.DRY_RUN === 'true'

interface PostState {
  lastPostedGuid: string | null
  postedGuids: string[]
  lastRunAt: string | null
}

function loadState(): PostState {
  try {
    if (fs.existsSync(config.stateFilePath)) {
      const data = fs.readFileSync(config.stateFilePath, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.warn('Failed to load state, starting fresh:', error)
  }

  return {
    lastPostedGuid: null,
    postedGuids: [],
    lastRunAt: null,
  }
}

function saveState(state: PostState): void {
  try {
    // Keep only last 100 posted GUIDs to prevent file from growing too large
    if (state.postedGuids.length > 100) {
      state.postedGuids = state.postedGuids.slice(-100)
    }
    fs.writeFileSync(config.stateFilePath, JSON.stringify(state, null, 2))
  } catch (error) {
    console.error('Failed to save state:', error)
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  console.log('====================================')
  console.log('Discord Auto-Post Script')
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`)
  console.log('====================================\n')

  // Load state
  const state = loadState()
  console.log(`Last run: ${state.lastRunAt || 'Never'}`)
  console.log(`Previously posted: ${state.postedGuids.length} articles\n`)

  // Fetch RSS feed
  console.log(`Fetching feed: ${config.rssFeedUrl}`)
  const feed = await fetchRssFeed()
  const items = feed.items

  if (items.length === 0) {
    console.log('No items in feed')
    return
  }

  console.log(`Found ${items.length} items in feed\n`)

  // Filter out already posted items
  const newItems = items.filter(item => !state.postedGuids.includes(item.guid))

  if (newItems.length === 0) {
    console.log('No new items to post')
    state.lastRunAt = new Date().toISOString()
    saveState(state)
    return
  }

  console.log(`New items to post: ${newItems.length}`)

  // Limit posts per run
  const itemsToPost = newItems.slice(0, config.posting.maxPostsPerRun)
  console.log(`Posting ${itemsToPost.length} items (max per run: ${config.posting.maxPostsPerRun})\n`)

  // Post each item
  let successCount = 0
  let failCount = 0

  for (const item of itemsToPost) {
    try {
      console.log(`\n--- Posting ---`)
      console.log(`Title: ${item.title}`)
      console.log(`Category: ${item.category}`)
      console.log(`Link: ${item.link}`)

      if (DRY_RUN) {
        console.log('[DRY RUN] Would post this item')
        successCount++
      } else {
        await postFeedItem(item)
        successCount++

        // Update state
        state.postedGuids.push(item.guid)
        state.lastPostedGuid = item.guid
      }

      // Delay between posts
      if (itemsToPost.indexOf(item) < itemsToPost.length - 1) {
        console.log(`Waiting ${config.posting.delayBetweenPosts}ms...`)
        await sleep(config.posting.delayBetweenPosts)
      }
    } catch (error) {
      console.error(`Failed to post: ${item.title}`, error)
      failCount++
    }
  }

  // Update state
  state.lastRunAt = new Date().toISOString()
  if (!DRY_RUN) {
    saveState(state)
  }

  // Summary
  console.log('\n====================================')
  console.log('Summary')
  console.log('====================================')
  console.log(`Total posted: ${successCount}`)
  console.log(`Failed: ${failCount}`)
  console.log(`Remaining new items: ${newItems.length - itemsToPost.length}`)
  console.log('====================================\n')
}

// Run if called directly
main().catch(error => {
  console.error('Script failed:', error)
  process.exit(1)
})
