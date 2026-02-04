import { useEffect } from 'react'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
  publishedTime?: string
  section?: string
}

const BASE_URL = 'https://updayapp.com'
const DEFAULT_TITLE = 'Upday - Tech News, Faster'
const DEFAULT_DESCRIPTION = 'AI-summarized tech news in real-time. Stay ahead with the latest in AI, startups, science, and dev. No noise, just what matters.'
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url = BASE_URL,
  type = 'website',
  publishedTime,
  section,
}: SEOProps) {
  const fullTitle = title ? `${title} | Upday` : DEFAULT_TITLE
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`

  useEffect(() => {
    // Update document title
    document.title = fullTitle

    // Helper to update or create meta tag
    const updateMeta = (selector: string, content: string, attr: string = 'content') => {
      let element = document.querySelector(selector) as HTMLMetaElement
      if (!element) {
        element = document.createElement('meta')
        const [attrName, attrValue] = selector.replace(/[\[\]'"]/g, '').split('=')
        if (attrName === 'name' || attrName === 'property') {
          element.setAttribute(attrName, attrValue)
        }
        document.head.appendChild(element)
      }
      element.setAttribute(attr, content)
    }

    // Primary meta tags
    updateMeta('meta[name="description"]', description)

    // Open Graph
    updateMeta('meta[property="og:title"]', fullTitle)
    updateMeta('meta[property="og:description"]', description)
    updateMeta('meta[property="og:image"]', image)
    updateMeta('meta[property="og:url"]', fullUrl)
    updateMeta('meta[property="og:type"]', type)

    // Twitter
    updateMeta('meta[name="twitter:title"]', fullTitle)
    updateMeta('meta[name="twitter:description"]', description)
    updateMeta('meta[name="twitter:image"]', image)
    updateMeta('meta[name="twitter:url"]', fullUrl)

    // Article specific
    if (type === 'article' && publishedTime) {
      updateMeta('meta[property="article:published_time"]', publishedTime)
    }
    if (section) {
      updateMeta('meta[property="article:section"]', section)
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = fullUrl

  }, [fullTitle, description, image, fullUrl, type, publishedTime, section])

  return null
}

// Category SEO presets (5 categories)
export const CATEGORY_SEO: Record<string, { title: string; description: string }> = {
  ai: {
    title: 'AI News',
    description: 'Breaking AI news: LLMs, machine learning, ChatGPT, and emerging AI trends updated in real-time.',
  },
  startups: {
    title: 'Startup News',
    description: 'Latest startup funding, acquisitions, IPOs, and founder stories as they happen.',
  },
  dev: {
    title: 'Developer News',
    description: 'Latest in programming, open source, GitHub updates, and developer tools.',
  },
  product: {
    title: 'Product News',
    description: 'Breaking product design, UI/UX trends, launches, and creative tool updates.',
  },
  research: {
    title: 'Research News',
    description: 'Scientific discoveries, space exploration, and research breakthroughs in real-time.',
  },
}

/**
 * Inject BreadcrumbList structured data
 */
export function injectBreadcrumbSchema(items: { name: string; url: string }[]) {
  const existingScript = document.querySelector('script[data-schema="breadcrumb"]')
  if (existingScript) {
    existingScript.remove()
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.setAttribute('data-schema', 'breadcrumb')
  script.textContent = JSON.stringify(schema)
  document.head.appendChild(script)
}

/**
 * Inject NewsArticle structured data for individual news items
 */
export function injectNewsArticleSchema(article: {
  title: string
  summary: string
  imageUrl?: string
  publishedAt: string
  source: string
  sourceUrl: string
  category: string
}) {
  const existingScript = document.querySelector('script[data-schema="news-article"]')
  if (existingScript) {
    existingScript.remove()
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.summary,
    image: article.imageUrl || `${BASE_URL}/og-image.png`,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: {
      '@type': 'Organization',
      name: article.source,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Upday',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
      },
    },
    articleSection: article.category,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.sourceUrl,
    },
  }

  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.setAttribute('data-schema', 'news-article')
  script.textContent = JSON.stringify(schema)
  document.head.appendChild(script)
}

/**
 * Inject ItemList structured data for news feed
 */
export function injectItemListSchema(items: { title: string; url: string; position: number }[]) {
  const existingScript = document.querySelector('script[data-schema="item-list"]')
  if (existingScript) {
    existingScript.remove()
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.slice(0, 10).map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.title,
      url: item.url,
    })),
  }

  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.setAttribute('data-schema', 'item-list')
  script.textContent = JSON.stringify(schema)
  document.head.appendChild(script)
}

/**
 * Inject CollectionPage structured data for category pages
 * Following Google's guidelines for collection/category pages
 */
export function injectCollectionPageSchema(page: {
  name: string
  description: string
  url: string
  about: string
}) {
  const existingScript = document.querySelector('script[data-schema="collection-page"]')
  if (existingScript) {
    existingScript.remove()
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: page.name,
    description: page.description,
    url: page.url,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Upday',
      url: 'https://updayapp.com',
    },
    about: {
      '@type': 'Thing',
      name: page.about,
    },
    inLanguage: 'en',
    publisher: {
      '@type': 'Organization',
      name: 'Upday',
      url: 'https://updayapp.com',
    },
  }

  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.setAttribute('data-schema', 'collection-page')
  script.textContent = JSON.stringify(schema)
  document.head.appendChild(script)
}
