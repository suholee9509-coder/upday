# upday

**Timeline-based global news platform** that organizes AI-summarized news chronologically, enabling users to grasp what's changing in the world without reading full articles.

🌐 **Live**: [updayapp.com](https://updayapp.com)

---

## 🎯 Features

### Core
- **Timeline Feed** - Chronological news with date grouping
- **AI Summaries** - 2-3 line summaries for quick scanning
- **Category Filtering** - AI, Startups, Dev, Product, Research
- **Company Tracking** - Follow 25+ tech companies (OpenAI, Anthropic, Google, etc.)
- **Search** - Keyword search across title + summary

### Personalization (Login Required)
- **My Feed** - Personalized timeline with importance scoring
  - Auto-filters important news based on your interests
  - News clustering (group related articles)
  - Weekly navigation (last 12 weeks)
- **Pin Companies** - Quick access to favorite companies
- **Interest Settings** - Customize categories, keywords, companies

### OAuth Authentication
- GitHub OAuth
- Google OAuth
- Auto-onboarding on first login

---

## 🏗️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui (Monet theme)
- **Backend**: Cloudflare Workers + Supabase
- **Auth**: Supabase Auth (OAuth)
- **Database**: PostgreSQL (Supabase)
- **RSS Crawling**: Cloudflare Workers (scheduled every 4 hours)
- **Deployment**: Cloudflare Pages

---

## 📂 Project Structure

```
src/
├── components/
│   ├── ui/          # shadcn/ui components
│   ├── layout/      # Header, Sidebar
│   ├── news/        # NewsCard, TimelineFeed
│   ├── timeline/    # WeeklyBar (My Feed)
│   ├── auth/        # LoginModal, OnboardingModal
│   └── ...
├── hooks/
│   ├── useAuth.ts           # Authentication
│   ├── useUserInterests.ts  # User interests
│   ├── useMyFeed.ts         # Personalized feed
│   ├── usePinnedCompanies.ts # Pin management
│   └── useNews.ts           # News fetching
├── lib/
│   ├── importance.ts    # Importance scoring algorithm
│   ├── clustering.ts    # News clustering
│   ├── db.ts           # Supabase client
│   └── ...
├── pages/
│   ├── TimelinePage.tsx    # Main feed
│   ├── MyFeedPage.tsx      # Personalized feed
│   ├── SettingsPage.tsx    # User settings
│   └── ...
└── workers/
    ├── ingest.ts       # RSS crawling worker
    └── feedback.ts     # Feedback email API
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- Supabase account (for database & auth)
- Cloudflare account (for workers)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/upday.git
cd upday

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your Supabase credentials
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

```bash
# Run Supabase migrations
npx supabase db push

# Or manually execute SQL files:
# 1. scripts/schema.sql (news_items table)
# 2. scripts/schema-auth.sql (auth tables)
```

### OAuth Setup (Supabase Dashboard)

1. Go to **Authentication > Providers**
2. Enable **GitHub OAuth**
   - Create OAuth App at https://github.com/settings/developers
   - Set callback URL: `https://your-project.supabase.co/auth/v1/callback`
3. Enable **Google OAuth**
   - Create OAuth credentials at https://console.cloud.google.com/apis/credentials
   - Set redirect URI: `https://your-project.supabase.co/auth/v1/callback`

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📊 Data Pipeline

### RSS Crawling
Automated news ingestion from 50+ sources every 4 hours.

```bash
# Deploy crawling worker
wrangler deploy -c wrangler-ingest.toml

# Test locally
npx wrangler dev -c wrangler-ingest.toml
```

### Categories & Sources
- **AI**: TechCrunch, VentureBeat, The Verge AI, etc.
- **Startups**: TechCrunch, VentureBeat, Tech.eu, etc.
- **Dev**: GitHub Blog, Dev.to, CSS-Tricks, etc.
- **Product**: Product Hunt, Nielsen Norman Group, UX Collective, etc.
- **Research**: MIT News, NASA, Nature, ArXiv, etc.

### Company Tagging
Automatic company detection using keyword matching (25 companies supported).

---

## 🎨 Design System

Built with **Tailwind CSS** and **shadcn/ui** components.

### Color Theme (Monet)
- Light mode: Rose/Violet/Amber gradients
- Dark mode: OKLCH-based design tokens
- Automatic theme switching

### Key Components
- `Button`, `Badge`, `Card`, `Input` - Base UI
- `Header`, `Sidebar` - Layout
- `NewsCard` - Individual news item
- `TimelineFeed` - Date-grouped feed
- `WeeklyBar` - Week navigation (My Feed)

See [CLAUDE.md](CLAUDE.md) for detailed design system documentation.

---

## 📱 Features by Route

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Landing page | No |
| `/timeline` | Main feed (Live Feed) | No |
| `/timeline/my` | My Feed (personalized) | **Yes** |
| `/ai`, `/startups`, `/dev`, `/product`, `/research` | Category feeds | No |
| `/timeline/companies` | Company browser | No |
| `/settings` | Account & interests | **Yes** |

---

## 🔐 Authentication Flow

1. User clicks "My Feed" or "Pin" button → Login modal appears
2. OAuth login (GitHub/Google)
3. **First login**: Onboarding modal for interest setup
4. Subsequent logins: Direct access to personalized features

---

## 🎯 My Feed Algorithm

### Importance Scoring (0-100)
```
- Category match: 30 points
- Keyword match: 25 points (max)
- Company match: 20 points
- Tier-1 company: 15 points
- Funding/M&A: 10 points
- Product launch: 10 points
- Multi-source boost: +20%
```

**Display threshold**: 40+ points

### News Clustering
- Groups related articles about the same event
- Based on: title similarity, category, companies, time proximity (48h)
- Display: Representative article + "+N related" button

### Weekly Timeline
- Last 12 weeks available
- Horizontal scroll navigation
- Default: Current week

---

## 📦 Deployment

### Frontend (Cloudflare Pages)
```bash
npm run build
wrangler deploy
```

### Workers
```bash
# Main site
wrangler deploy

# RSS ingestion
wrangler deploy -c wrangler-ingest.toml

# Feedback API
wrangler deploy -c wrangler-feedback.toml
```

---

## 🛠️ Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production

# Database
npm run seed             # Seed initial data
npm run monitor          # Check crawling stats

# Backfill commands
npm run backfill:companies       # Add company tags
npm run backfill:images          # Add og:images
npm run backfill:titles          # Fill missing titles
npm run backfill:dates           # Fix published dates

# Social media auto-posting
npm run bluesky:post     # Post to Bluesky
npm run discord:post     # Post to Discord
npm run telegram:post    # Post to Telegram
```

---

## 📝 Documentation

- [CLAUDE.md](CLAUDE.md) - Detailed dev documentation for AI assistants
- [PRD](docs/prd.txt) - Product requirements
- [Architecture](docs/IA.txt) - Information architecture

---

## 🤝 Contributing

This is a personal project, but suggestions and bug reports are welcome!

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

---

## 🔗 Links

- **Website**: https://updayapp.com
- **Bluesky**: @updayapp.bsky.social
- **Discord**: https://discord.gg/GUkAsmpa
- **Telegram**: @updayapp

---

Built with ❤️ using React, TypeScript, and Cloudflare
