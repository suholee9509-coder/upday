import { useParams, Navigate, Link } from 'react-router-dom'
import { useEffect, useState, useCallback, useRef } from 'react'
import { Header, Sidebar, SidebarProvider } from '@/components/layout'
import { FilterBar, TimelineFeed } from '@/components/news'
import type { TimelineFeedRef } from '@/components/news/TimelineFeed'
import { SEO, injectBreadcrumbSchema, injectCollectionPageSchema } from '@/components/SEO'
import { useNews } from '@/hooks/useNews'
import { COMPANIES } from '@/lib/constants'
import { CompanyLogo } from '@/components/CompanyLogo'
import { Building2, ExternalLink } from 'lucide-react'

// Company information for SEO
const COMPANY_INFO: Record<string, { fullName: string; description: string; website?: string }> = {
  openai: {
    fullName: 'OpenAI',
    description: 'OpenAI news and updates - ChatGPT, GPT-5, DALL-E, and AI research breakthroughs',
    website: 'https://openai.com',
  },
  anthropic: {
    fullName: 'Anthropic',
    description: 'Anthropic news and updates - Claude AI, Constitutional AI, and safety research',
    website: 'https://anthropic.com',
  },
  google: {
    fullName: 'Google',
    description: 'Google AI news - Gemini, DeepMind, Search, Cloud, and product launches',
    website: 'https://google.com',
  },
  microsoft: {
    fullName: 'Microsoft',
    description: 'Microsoft news - Azure, Copilot, Windows, GitHub, and enterprise AI',
    website: 'https://microsoft.com',
  },
  meta: {
    fullName: 'Meta',
    description: 'Meta news - Llama AI, Reality Labs, Instagram, WhatsApp, and metaverse updates',
    website: 'https://meta.com',
  },
  nvidia: {
    fullName: 'NVIDIA',
    description: 'NVIDIA news - GPUs, AI chips, CUDA, and gaming technology',
    website: 'https://nvidia.com',
  },
  xai: {
    fullName: 'xAI',
    description: 'xAI news - Grok AI, Elon Musk AI ventures, and research updates',
    website: 'https://x.ai',
  },
  mistral: {
    fullName: 'Mistral AI',
    description: 'Mistral AI news - Open source LLMs, European AI, and model releases',
    website: 'https://mistral.ai',
  },
  // Add remaining companies with similar structure
  vercel: { fullName: 'Vercel', description: 'Vercel news - Next.js, v0, frontend infrastructure, and web development', website: 'https://vercel.com' },
  supabase: { fullName: 'Supabase', description: 'Supabase news - Postgres, Firebase alternative, and backend services', website: 'https://supabase.com' },
  cloudflare: { fullName: 'Cloudflare', description: 'Cloudflare news - CDN, security, Workers, and edge computing', website: 'https://cloudflare.com' },
  linear: { fullName: 'Linear', description: 'Linear news - Issue tracking, project management, and team collaboration', website: 'https://linear.app' },
  figma: { fullName: 'Figma', description: 'Figma news - Design tools, FigJam, collaboration, and UI/UX', website: 'https://figma.com' },
  notion: { fullName: 'Notion', description: 'Notion news - Productivity, note-taking, wikis, and workspace tools', website: 'https://notion.so' },
  cursor: { fullName: 'Cursor', description: 'Cursor news - AI-powered code editor and development tools', website: 'https://cursor.sh' },
  github: { fullName: 'GitHub', description: 'GitHub news - Copilot, repositories, DevOps, and developer platform', website: 'https://github.com' },
  databricks: { fullName: 'Databricks', description: 'Databricks news - Data analytics, Spark, ML platforms, and enterprise data', website: 'https://databricks.com' },
  apple: { fullName: 'Apple', description: 'Apple news - iPhone, Mac, Vision Pro, and consumer technology', website: 'https://apple.com' },
  amazon: { fullName: 'Amazon', description: 'Amazon news - AWS, e-commerce, Alexa, and cloud services', website: 'https://amazon.com' },
  tesla: { fullName: 'Tesla', description: 'Tesla news - Electric vehicles, Autopilot, energy, and Elon Musk ventures', website: 'https://tesla.com' },
  stripe: { fullName: 'Stripe', description: 'Stripe news - Payments, fintech, APIs, and financial infrastructure', website: 'https://stripe.com' },
  shopify: { fullName: 'Shopify', description: 'Shopify news - E-commerce, online stores, and merchant tools', website: 'https://shopify.com' },
  slack: { fullName: 'Slack', description: 'Slack news - Team communication, Salesforce integration, and workplace collaboration', website: 'https://slack.com' },
  discord: { fullName: 'Discord', description: 'Discord news - Community platform, gaming, voice chat, and social features', website: 'https://discord.com' },
  reddit: { fullName: 'Reddit', description: 'Reddit news - Social media, communities, IPO, and platform updates', website: 'https://reddit.com' },
}

export function CompanyPage() {
  const { companyId } = useParams<{ companyId: string }>()
  const [currentDate, setCurrentDate] = useState(new Date())
  const timelineFeedRef = useRef<TimelineFeedRef>(null)

  // Validate company
  const validCompanyIds = COMPANIES.map(c => c.id)
  if (!companyId || !validCompanyIds.includes(companyId)) {
    return <Navigate to="/timeline/companies" replace />
  }

  const companyInfo = COMPANY_INFO[companyId]
  const companyMeta = COMPANIES.find(c => c.id === companyId)

  // Fetch news for this company
  const { items, hasMore, loading, error, loadMore, refresh, jumpToDate } = useNews({
    companyId,
  })

  const handleDateSelect = useCallback((date: Date) => {
    setCurrentDate(date)
    timelineFeedRef.current?.scrollToDate(date)
  }, [])

  const handleVisibleDateChange = useCallback((date: Date) => {
    setCurrentDate(date)
  }, [])

  // Inject structured data for SEO
  useEffect(() => {
    if (!companyInfo) return

    injectCollectionPageSchema({
      name: `${companyInfo.fullName} News`,
      description: companyInfo.description,
      url: `https://updayapp.com/company/${companyId}`,
      about: companyInfo.fullName,
    })

    injectBreadcrumbSchema([
      { name: 'Home', url: 'https://updayapp.com' },
      { name: 'Companies', url: 'https://updayapp.com/timeline/companies' },
      { name: companyInfo.fullName, url: `https://updayapp.com/company/${companyId}` },
    ])
  }, [companyId, companyInfo])

  if (!companyInfo) {
    return <Navigate to="/timeline/companies" replace />
  }

  return (
    <SidebarProvider>
      <SEO
        title={`${companyInfo.fullName} News`}
        description={companyInfo.description}
        url={`/company/${companyId}`}
      />

      <div className="min-h-screen bg-background">
        <Header />
        <Sidebar />

        <div className="lg:pl-64">
          <main className="min-h-[calc(100vh-4rem)]">
            {/* Company Header */}
            <div className="border-b bg-card/50 backdrop-blur-sm sticky top-16 z-10">
              <div className="container mx-auto px-4 py-6">
                {/* Breadcrumb */}
                <nav className="mb-4 text-sm text-muted-foreground">
                  <Link to="/" className="hover:text-foreground">Home</Link>
                  <span className="mx-2">/</span>
                  <Link to="/timeline/companies" className="hover:text-foreground">Companies</Link>
                  <span className="mx-2">/</span>
                  <span className="text-foreground">{companyInfo.fullName}</span>
                </nav>

                <div className="flex items-center gap-4 mb-4">
                  <CompanyLogo companyId={companyId} size="lg" />
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">
                      {companyInfo.fullName}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      {companyInfo.description}
                    </p>
                  </div>
                </div>

                {companyInfo.website && (
                  <a
                    href={companyInfo.website}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit Website
                  </a>
                )}
              </div>
            </div>

            {/* Filter Bar */}
            <FilterBar
              category={null}
              onCategoryChange={() => {}}
              onReset={() => {}}
              currentDate={currentDate}
              onDateSelect={handleDateSelect}
            />

            {/* Timeline Feed */}
            <div className="container mx-auto px-4 py-6">
              <TimelineFeed
                ref={timelineFeedRef}
                items={items}
                hasMore={hasMore}
                loading={loading}
                error={error}
                onLoadMore={loadMore}
                onRefresh={refresh}
                onJumpToDate={jumpToDate}
                onVisibleDateChange={handleVisibleDateChange}
              />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
