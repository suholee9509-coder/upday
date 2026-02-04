/**
 * Bluesky Reach Analyzer
 *
 * Analyzes followers, engagement, and global reach
 * Usage: npx tsx scripts/bluesky/analyze-reach.ts
 */

import 'dotenv/config'
import { BskyAgent } from '@atproto/api'
import { config } from './config'

async function analyzeReach() {
  console.log('====================================')
  console.log('Bluesky Global Reach Analysis')
  console.log('====================================\n')

  const agent = new BskyAgent({ service: config.bluesky.service })

  await agent.login({
    identifier: config.bluesky.identifier,
    password: config.bluesky.appPassword,
  })

  const did = agent.session!.did

  // Get profile info
  const profile = await agent.getProfile({ actor: did })
  console.log('📊 Profile Stats:')
  console.log(`   Handle: @${profile.data.handle}`)
  console.log(`   Followers: ${profile.data.followersCount}`)
  console.log(`   Following: ${profile.data.followsCount}`)
  console.log(`   Posts: ${profile.data.postsCount}`)
  console.log('')

  // Get recent posts and their engagement
  const feed = await agent.getAuthorFeed({ actor: did, limit: 10 })

  console.log('📈 Recent Posts Engagement:')
  let totalLikes = 0
  let totalReposts = 0
  let totalReplies = 0

  for (const item of feed.data.feed) {
    const post = item.post
    totalLikes += post.likeCount || 0
    totalReposts += post.repostCount || 0
    totalReplies += post.replyCount || 0

    // @ts-ignore
    const text = post.record?.text?.substring(0, 50) || ''
    console.log(`   "${text}..."`)
    console.log(`      ❤️ ${post.likeCount || 0} | 🔁 ${post.repostCount || 0} | 💬 ${post.replyCount || 0}`)
  }

  console.log('')
  console.log('📊 Engagement Summary (last 10 posts):')
  console.log(`   Total Likes: ${totalLikes}`)
  console.log(`   Total Reposts: ${totalReposts}`)
  console.log(`   Total Replies: ${totalReplies}`)
  console.log(`   Avg Engagement: ${((totalLikes + totalReposts + totalReplies) / 10).toFixed(1)} per post`)
  console.log('')

  // Get followers to analyze global reach
  const followers = await agent.getFollowers({ actor: did, limit: 50 })

  console.log('🌍 Follower Analysis (sample of 50):')

  // Analyze follower handles for location hints
  const domains: Record<string, number> = {}
  const handles: string[] = []

  for (const follower of followers.data.followers) {
    handles.push(follower.handle)

    // Check for custom domains (indicates serious users)
    if (!follower.handle.endsWith('.bsky.social')) {
      const domain = follower.handle.split('.').slice(-2).join('.')
      domains[domain] = (domains[domain] || 0) + 1
    }
  }

  // Check for non-English handles (basic heuristic)
  const hasNonAscii = handles.filter(h => /[^\x00-\x7F]/.test(h))
  const hasNumbers = handles.filter(h => /\d/.test(h))

  console.log(`   Total Followers Analyzed: ${followers.data.followers.length}`)
  console.log(`   Custom Domain Users: ${Object.keys(domains).length}`)
  console.log(`   Handles with non-ASCII: ${hasNonAscii.length}`)
  console.log('')

  if (Object.keys(domains).length > 0) {
    console.log('   Custom Domains:')
    Object.entries(domains)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([domain, count]) => {
        console.log(`      ${domain}: ${count}`)
      })
  }

  console.log('')
  console.log('====================================')
  console.log('🌐 Global Reach Assessment')
  console.log('====================================')
  console.log('')
  console.log('Bluesky is a GLOBAL platform by default:')
  console.log('  ✅ No geographic restrictions on visibility')
  console.log('  ✅ All posts appear in global feeds')
  console.log('  ✅ Hashtags work globally (#AI, #Tech, etc.)')
  console.log('')
  console.log('To MAXIMIZE global reach:')
  console.log('  1. Post in English (done ✅)')
  console.log('  2. Use relevant hashtags')
  console.log('  3. Engage with international accounts')
  console.log('  4. Post during US/EU peak hours (14:00-22:00 UTC)')
  console.log('')

  // Check if account is new
  if ((profile.data.followersCount || 0) < 100) {
    console.log('💡 Your account is new. Engagement tips:')
    console.log('  - Follow relevant tech accounts')
    console.log('  - Reply to popular tech posts')
    console.log('  - Use hashtags like #Tech #AI #Startup')
    console.log('  - Post consistently (the bot handles this!)')
  }
}

analyzeReach().catch(console.error)
