import type { NewsItem, Category } from '@/types/news'

const mockNews: Omit<NewsItem, 'body'>[] = [
  // Today
  {
    id: '1',
    title: 'OpenAI Announces GPT-5 with Revolutionary Reasoning Capabilities',
    summary: 'OpenAI unveiled GPT-5, featuring breakthrough reasoning abilities and 40% improvement on complex problem-solving benchmarks. The model demonstrates unprecedented understanding of context.',
    category: 'ai',
    source: 'TechCrunch',
    sourceUrl: 'https://techcrunch.com/example-1',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Stripe Acquires AI Startup for $1.2 Billion',
    summary: 'Payment giant Stripe completed its largest acquisition, buying AI fraud detection startup SecureAI. The deal signals growing importance of AI in fintech security.',
    category: 'startup',
    source: 'Bloomberg',
    sourceUrl: 'https://bloomberg.com/example-2',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'SpaceX Successfully Tests Starship Orbital Refueling',
    summary: 'SpaceX achieved a major milestone with successful in-orbit fuel transfer between two Starship vehicles. This technology is crucial for future Mars missions.',
    category: 'space',
    source: 'Space News',
    sourceUrl: 'https://spacenews.com/example-3',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'React 20 Released with Built-in State Management',
    summary: 'Meta released React 20 featuring native state management, eliminating the need for external libraries like Redux. Performance improvements of up to 50% reported.',
    category: 'dev',
    source: 'Dev.to',
    sourceUrl: 'https://dev.to/example-4',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Figma Introduces AI-Powered Design Generation',
    summary: 'Figma launched an AI feature that generates complete UI designs from text descriptions. Designers can now create wireframes and mockups in seconds.',
    category: 'design',
    source: 'Designer News',
    sourceUrl: 'https://designernews.co/example-5',
    publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  // Yesterday
  {
    id: '6',
    title: 'CRISPR Gene Therapy Cures First Patient with Sickle Cell Disease',
    summary: 'A landmark medical achievement as gene therapy completely cured a patient suffering from sickle cell disease. FDA fast-tracks approval for broader use.',
    category: 'science',
    source: 'Nature',
    sourceUrl: 'https://nature.com/example-6',
    publishedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '7',
    title: 'Anthropic Raises $4B in New Funding Round',
    summary: 'Claude maker Anthropic secured $4 billion in funding led by Google and Salesforce. The company plans to accelerate AI safety research and model development.',
    category: 'ai',
    source: 'The Verge',
    sourceUrl: 'https://theverge.com/example-7',
    publishedAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '8',
    title: 'Apple Vision Pro 2 Leaks Reveal 50% Weight Reduction',
    summary: 'Leaked schematics show Apple\'s next-gen headset will be significantly lighter with improved battery life. Launch expected in Q3 2026.',
    category: 'design',
    source: 'MacRumors',
    sourceUrl: 'https://macrumors.com/example-8',
    publishedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '9',
    title: 'NASA Confirms Water Ice on Mars Surface',
    summary: 'Mars Reconnaissance Orbiter detected significant water ice deposits near the equator. This discovery dramatically improves prospects for future human missions.',
    category: 'space',
    source: 'NASA',
    sourceUrl: 'https://nasa.gov/example-9',
    publishedAt: new Date(Date.now() - 32 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '10',
    title: 'Y Combinator Launches $500M AI Fund',
    summary: 'Startup accelerator Y Combinator announced a dedicated AI fund to back early-stage AI companies. Applications open for the summer batch.',
    category: 'startup',
    source: 'TechCrunch',
    sourceUrl: 'https://techcrunch.com/example-10',
    publishedAt: new Date(Date.now() - 34 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  // 2 days ago
  {
    id: '11',
    title: 'TypeScript 6.0 Brings Native Pattern Matching',
    summary: 'Microsoft released TypeScript 6.0 with native pattern matching syntax. The feature eliminates complex switch statements and improves code readability.',
    category: 'dev',
    source: 'Microsoft DevBlog',
    sourceUrl: 'https://devblogs.microsoft.com/example-11',
    publishedAt: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '12',
    title: 'Quantum Computer Solves Previously Impossible Chemistry Problem',
    summary: 'Google\'s quantum computer simulated a complex molecular interaction that classical computers couldn\'t handle. Breakthrough could accelerate drug discovery.',
    category: 'science',
    source: 'Science Daily',
    sourceUrl: 'https://sciencedaily.com/example-12',
    publishedAt: new Date(Date.now() - 52 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '13',
    title: 'Claude Opus 4.5 Sets New Benchmark Records',
    summary: 'Anthropic\'s latest model achieves state-of-the-art performance across all major benchmarks. Extended thinking capability enables complex reasoning tasks.',
    category: 'ai',
    source: 'Anthropic Blog',
    sourceUrl: 'https://anthropic.com/example-13',
    publishedAt: new Date(Date.now() - 54 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '14',
    title: 'Blue Origin Launches First Commercial Space Station Module',
    summary: 'Jeff Bezos\'s space company successfully deployed the first module of its commercial space station. Full station expected to be operational by 2028.',
    category: 'space',
    source: 'Ars Technica',
    sourceUrl: 'https://arstechnica.com/example-14',
    publishedAt: new Date(Date.now() - 56 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '15',
    title: 'Notion Acquires Linear in $800M Deal',
    summary: 'Productivity tool Notion acquired project management startup Linear. The combined company aims to create an all-in-one workspace for engineering teams.',
    category: 'startup',
    source: 'The Information',
    sourceUrl: 'https://theinformation.com/example-15',
    publishedAt: new Date(Date.now() - 58 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
]

export function getMockNews(options?: {
  category?: Category
  q?: string
  cursor?: string
  limit?: number
}): { items: Omit<NewsItem, 'body'>[]; hasMore: boolean } {
  const { category, q, cursor, limit = 20 } = options || {}

  let filtered = [...mockNews]

  // Filter by category
  if (category) {
    filtered = filtered.filter((item) => item.category === category)
  }

  // Filter by search query
  if (q) {
    const query = q.toLowerCase()
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query)
    )
  }

  // Sort by publishedAt descending
  filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  // Apply cursor-based pagination
  if (cursor) {
    const cursorIndex = filtered.findIndex((item) => item.publishedAt === cursor)
    if (cursorIndex !== -1) {
      filtered = filtered.slice(cursorIndex + 1)
    }
  }

  // Apply limit
  const items = filtered.slice(0, limit)
  const hasMore = filtered.length > limit

  return { items, hasMore }
}

export { mockNews }
