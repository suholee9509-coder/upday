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

    // Cleanup function not needed as we're updating existing tags
  }, [fullTitle, description, image, fullUrl, type, publishedTime, section])

  return null
}

// Category SEO presets
export const CATEGORY_SEO: Record<string, { title: string; description: string }> = {
  ai: {
    title: 'AI News',
    description: 'Breaking AI news: LLMs, machine learning, ChatGPT, and emerging AI trends updated in real-time.',
  },
  startup: {
    title: 'Startup News',
    description: 'Latest startup funding, acquisitions, IPOs, and founder stories as they happen.',
  },
  science: {
    title: 'Science News',
    description: 'Breaking scientific discoveries, research breakthroughs, and tech innovations.',
  },
  space: {
    title: 'Space News',
    description: 'Real-time updates on SpaceX, NASA, rocket launches, and space exploration.',
  },
  dev: {
    title: 'Developer News',
    description: 'Latest in programming, open source, GitHub updates, and developer tools.',
  },
  design: {
    title: 'Design News',
    description: 'Breaking product design, UI/UX trends, and creative tool updates.',
  },
}
