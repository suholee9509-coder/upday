# Twitter Auto-Post System

Automatically posts new articles from Upday's RSS feed to Twitter.

## Overview

This system monitors Upday's RSS feed and automatically posts new articles to Twitter. It runs every 30 minutes via GitHub Actions.

## Architecture

```
[RSS Feed] → [Parser] → [Filter (new articles)] → [Formatter] → [Twitter API] → [Tweet]
                                ↑                                      ↓
                         [State File] ←─────────────────────────────────
```

## Files

| File | Description |
|------|-------------|
| `config.ts` | Configuration and environment variables |
| `rss-parser.ts` | RSS feed fetching and parsing |
| `state.ts` | State management for tracking posted articles |
| `twitter-client.ts` | Twitter API client and tweet formatting |
| `auto-post.ts` | Main entry point script |

## Setup

### 1. Get Twitter API Credentials

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new Project and App
3. Generate API Key, API Secret, Access Token, and Access Secret
4. Make sure the app has **Read and Write** permissions

### 2. Add GitHub Secrets

Add these secrets to your GitHub repository:

| Secret | Description |
|--------|-------------|
| `TWITTER_API_KEY` | Twitter API Key (Consumer Key) |
| `TWITTER_API_SECRET` | Twitter API Secret (Consumer Secret) |
| `TWITTER_ACCESS_TOKEN` | Access Token |
| `TWITTER_ACCESS_SECRET` | Access Token Secret |

Go to: Repository → Settings → Secrets and variables → Actions → New repository secret

### 3. Enable GitHub Actions

The workflow file `.github/workflows/twitter-auto-post.yml` will run automatically every 30 minutes.

## Local Development

### Run Dry-Run (Test without posting)

```bash
npm run twitter:dry-run
```

### Run with Real Posting

```bash
# Set environment variables first
export TWITTER_API_KEY="your-api-key"
export TWITTER_API_SECRET="your-api-secret"
export TWITTER_ACCESS_TOKEN="your-access-token"
export TWITTER_ACCESS_SECRET="your-access-secret"

npm run twitter:post
```

### Test with Custom Feed URL

```bash
RSS_FEED_URL="http://localhost:5173/feed.xml" npm run twitter:dry-run
```

## Tweet Format

Each tweet follows this format (optimized for engagement):

```
{Emoji} {Article Title}

🔗 {Article URL}

#Category #Upday
```

Example:
```
🌌 SpaceX successfully lands Starship on Mars simulation test

🔗 https://updayapp.com/article/spacex-starship

#Space #Upday
```

## Category Emojis & Hashtags

| Category | Emoji | Hashtag |
|----------|-------|---------|
| ai | 🤖 | #AI |
| startups | 🚀 | #Startups |
| dev | 💻 | #Dev |
| product | 🎨 | #Product |
| research | 🔬 | #Research |
| space | 🌌 | #Space |
| default | 📰 | (none) |

**Note:** Only 2 hashtags are used (1 category + #Upday) for better reach. Excessive hashtags reduce engagement.

## State Management

The system tracks posted articles to avoid duplicates:

- State is stored in `/tmp/twitter-auto-post-state.json`
- GitHub Actions uses cache to persist state between runs
- Maximum 500 article GUIDs are tracked (older ones are removed)

## Rate Limits

- Maximum 5 posts per run (configurable in `config.ts`)
- 5 second delay between posts
- Runs every 30 minutes = max 10 posts per hour

## Troubleshooting

### "Configuration errors: TWITTER_API_KEY is required"

Make sure all GitHub secrets are set correctly.

### "Failed to verify credentials"

1. Check if API credentials are correct
2. Verify app has Read and Write permissions
3. Check if tokens are not expired

### "No new items to post"

- First run only posts articles from the last hour
- Subsequent runs post articles newer than the last posted one
- Check if RSS feed is updating with new articles

### State file issues

Delete the cache in GitHub Actions:
1. Go to Actions tab
2. Click on a workflow run
3. Click "..." menu → "Delete all caches"

## Manual Trigger

You can manually trigger the workflow:

1. Go to GitHub Actions
2. Select "Twitter Auto-Post" workflow
3. Click "Run workflow"
4. Optionally enable "dry_run" for testing

## Monitoring

Check workflow runs at:
`https://github.com/YOUR_USERNAME/upday/actions/workflows/twitter-auto-post.yml`

Each run logs:
- Number of items in feed
- Number of new items found
- Number of successfully posted tweets
- Any errors encountered
