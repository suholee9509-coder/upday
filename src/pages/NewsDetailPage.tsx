import { useParams, Navigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Header, Sidebar, SidebarProvider } from '@/components/layout'
import { SEO, injectNewsArticleSchema, injectBreadcrumbSchema } from '@/components/SEO'
import { supabase } from '@/lib/db'
import type { NewsItem } from '@/types/news'
import { ExternalLink, Calendar, Building2 } from 'lucide-react'
import { Badge } from '@/components/ui'
import { CompanyLogo } from '@/components/CompanyLogo'
import { CATEGORIES } from '@/lib/constants'

export function NewsDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [news, setNews] = useState<NewsItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) {
      setNotFound(true)
      return
    }

    async function fetchNews() {
      try {
        const { data, error } = await supabase
          .from('news_items')
          .select('*')
          .eq('id', id)
          .single()

        if (error || !data) {
          setNotFound(true)
          return
        }

        setNews(data as NewsItem)

        // Inject structured data for SEO
        injectNewsArticleSchema({
          title: data.title,
          summary: data.summary,
          imageUrl: data.image_url,
          publishedAt: data.published_at,
          source: data.source,
          sourceUrl: data.source_url,
          category: data.category,
        })

        // Inject breadcrumb
        const categoryInfo = CATEGORIES.find(c => c.id === data.category)
        injectBreadcrumbSchema([
          { name: 'Home', url: 'https://updayapp.com' },
          { name: categoryInfo?.name || 'News', url: `https://updayapp.com/${data.category}` },
          { name: data.title, url: `https://updayapp.com/news/${data.id}` },
        ])
      } catch (err) {
        console.error('Error fetching news:', err)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [id])

  if (notFound) {
    return <Navigate to="/timeline" replace />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted-foreground/20 border-t-primary" />
      </div>
    )
  }

  if (!news) return null

  const categoryInfo = CATEGORIES.find(c => c.id === news.category)
  const publishedDate = new Date(news.published_at)

  return (
    <SidebarProvider>
      <SEO
        title={news.title}
        description={news.summary}
        image={news.image_url || undefined}
        url={`/news/${news.id}`}
        type="article"
        publishedTime={news.published_at}
        section={categoryInfo?.name}
      />

      <div className="min-h-screen bg-background">
        <Header />
        <Sidebar />

        <div className="lg:pl-64">
          <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8">
            <article className="max-w-3xl mx-auto">
              {/* Breadcrumb */}
              <nav className="mb-6 text-sm text-muted-foreground">
                <Link to="/" className="hover:text-foreground">Home</Link>
                <span className="mx-2">/</span>
                <Link to={`/${news.category}`} className="hover:text-foreground capitalize">
                  {news.category}
                </Link>
                <span className="mx-2">/</span>
                <span className="text-foreground">Article</span>
              </nav>

              {/* Category Badge */}
              {categoryInfo && (
                <Badge
                  variant="secondary"
                  className="mb-4"
                  style={{ backgroundColor: `${categoryInfo.color}20`, color: categoryInfo.color }}
                >
                  {categoryInfo.name}
                </Badge>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                {news.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={news.published_at}>
                    {publishedDate.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>{news.source}</span>
                </div>
              </div>

              {/* Image */}
              {news.image_url && (
                <img
                  src={news.image_url}
                  alt={news.title}
                  className="w-full rounded-lg mb-6"
                  loading="eager"
                />
              )}

              {/* Summary */}
              <div className="prose prose-lg dark:prose-invert mb-8">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {news.summary}
                </p>
              </div>

              {/* Body */}
              {news.body && (
                <div className="prose prose-lg dark:prose-invert mb-8">
                  <div dangerouslySetInnerHTML={{ __html: news.body }} />
                </div>
              )}

              {/* Companies */}
              {news.companies && news.companies.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-sm font-semibold mb-3 text-muted-foreground">
                    Related Companies
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {news.companies.map((companyId) => (
                      <Link
                        key={companyId}
                        to={`/company/${companyId}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                      >
                        <CompanyLogo companyId={companyId} size="sm" />
                        <span className="text-sm font-medium capitalize">
                          {companyId}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Read Original */}
              <a
                href={news.source_url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Read Original Article
                <ExternalLink className="h-4 w-4" />
              </a>
            </article>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
