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
const DEFAULT_TITLE = 'Upday - AI, 스타트업, 테크 뉴스 큐레이션'
const DEFAULT_DESCRIPTION = 'AI, 스타트업, 우주, 과학, 개발 분야의 최신 테크 뉴스를 한눈에. 매일 업데이트되는 큐레이션 뉴스 플랫폼.'
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
    title: 'AI 뉴스',
    description: '인공지능, 머신러닝, LLM, ChatGPT 등 최신 AI 기술 뉴스와 트렌드',
  },
  startup: {
    title: '스타트업 뉴스',
    description: '스타트업 펀딩, 인수합병, IPO 등 창업 생태계 최신 소식',
  },
  science: {
    title: '과학 뉴스',
    description: '과학 연구, 의학 발견, 물리학, 생물학 등 과학계 최신 뉴스',
  },
  space: {
    title: '우주 뉴스',
    description: 'NASA, SpaceX, 로켓, 위성, 우주 탐사 등 항공우주 분야 뉴스',
  },
  dev: {
    title: '개발자 뉴스',
    description: '프로그래밍, 오픈소스, GitHub, 개발 도구 등 개발자 커뮤니티 소식',
  },
  design: {
    title: '디자인 뉴스',
    description: 'UI/UX, 프로덕트 디자인, 디자인 툴 등 디자인 분야 최신 트렌드',
  },
}
