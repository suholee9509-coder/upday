import { useEffect } from 'react'
import { getCurrentLanguage } from '@/lib/i18n'

interface SEOProps {
  title?: string
  description?: string
  descriptionKo?: string // Korean description for search results
  image?: string
  url?: string
  type?: 'website' | 'article'
  publishedTime?: string
  section?: string
}

const BASE_URL = 'https://updayapp.com'
const DEFAULT_TITLE = 'Upday - Tech News, Faster'
const DEFAULT_DESCRIPTION = 'AI-summarized tech news in real-time. Stay ahead with the latest in AI, startups, science, and dev. No noise, just what matters.'
const DEFAULT_DESCRIPTION_KO = 'AI가 요약한 테크 뉴스를 실시간으로. AI, 스타트업, 과학, 개발 뉴스를 빠르게 확인하세요.'
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`

export function SEO({
  title,
  description,
  descriptionKo,
  image = DEFAULT_IMAGE,
  url = BASE_URL,
  type = 'website',
  publishedTime,
  section,
}: SEOProps) {
  const fullTitle = title ? `${title} | Upday` : DEFAULT_TITLE
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`

  // Use Korean description for meta (search results) when in Korean mode
  const currentLang = getCurrentLanguage()
  const metaDescription = currentLang === 'ko'
    ? (descriptionKo || DEFAULT_DESCRIPTION_KO)
    : (description || DEFAULT_DESCRIPTION)

  // Always use English for OG/social sharing
  const socialDescription = description || DEFAULT_DESCRIPTION

  useEffect(() => {
    // Update document title
    document.title = fullTitle

    // Update html lang attribute
    document.documentElement.lang = currentLang

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

    // Primary meta tags (language-aware for search results)
    updateMeta('meta[name="description"]', metaDescription)

    // Open Graph (always English for social sharing)
    updateMeta('meta[property="og:title"]', fullTitle)
    updateMeta('meta[property="og:description"]', socialDescription)
    updateMeta('meta[property="og:image"]', image)
    updateMeta('meta[property="og:url"]', fullUrl)
    updateMeta('meta[property="og:type"]', type)

    // Twitter (always English for social sharing)
    updateMeta('meta[name="twitter:title"]', fullTitle)
    updateMeta('meta[name="twitter:description"]', socialDescription)
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

  }, [fullTitle, metaDescription, socialDescription, image, fullUrl, type, publishedTime, section, currentLang])

  return null
}

// Category SEO presets (5 categories)
export const CATEGORY_SEO: Record<string, { title: string; description: string; descriptionKo: string }> = {
  ai: {
    title: 'AI News',
    description: 'Breaking AI news: LLMs, machine learning, ChatGPT, and emerging AI trends updated in real-time.',
    descriptionKo: 'AI 뉴스: LLM, 머신러닝, ChatGPT, 최신 AI 트렌드를 실시간으로 확인하세요.',
  },
  startups: {
    title: 'Startup News',
    description: 'Latest startup funding, acquisitions, IPOs, and founder stories as they happen.',
    descriptionKo: '스타트업 뉴스: 투자, 인수합병, IPO, 창업자 스토리를 실시간으로.',
  },
  dev: {
    title: 'Developer News',
    description: 'Latest in programming, open source, GitHub updates, and developer tools.',
    descriptionKo: '개발자 뉴스: 프로그래밍, 오픈소스, GitHub, 개발 도구 업데이트.',
  },
  product: {
    title: 'Product News',
    description: 'Breaking product design, UI/UX trends, launches, and creative tool updates.',
    descriptionKo: '프로덕트 뉴스: 제품 디자인, UI/UX 트렌드, 런칭, 크리에이티브 도구.',
  },
  research: {
    title: 'Research News',
    description: 'Scientific discoveries, space exploration, and research breakthroughs in real-time.',
    descriptionKo: '연구 뉴스: 과학 발견, 우주 탐사, 연구 성과를 실시간으로.',
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
