/**
 * Post a single article from a specific category
 * Usage: npx tsx scripts/bluesky/post-one.ts [category]
 */
import 'dotenv/config'
import { fetchRssFeed } from './rss-parser'
import { loadState, saveState, isAlreadyPosted, markAsPosted } from './state'
import { initializeBlueskyClient, initializeKrClient, postFeedItem, verifyCredentials } from './bluesky-client'

const category = process.argv[2] || 'dev'

async function main() {
  const state = loadState()
  const feed = await fetchRssFeed()

  const items = feed.items
    .filter(i => i.category === category)
    .filter(i => !isAlreadyPosted(state, i.guid))

  if (items.length === 0) {
    console.log(`No unposted ${category} articles found`)
    return
  }

  const item = items[0]
  console.log(`Posting: ${item.title}`)

  await initializeBlueskyClient()
  await verifyCredentials()
  await initializeKrClient()

  await postFeedItem(item)
  const newState = markAsPosted(state, item.guid, item.pubDate)
  saveState(newState)

  console.log('Done!')
}

main().catch(e => { console.error(e); process.exit(1) })
