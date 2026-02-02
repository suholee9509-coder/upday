import type { NewsItem, Category } from '@/types/news'

const mockNews: Omit<NewsItem, 'body'>[] = [
  // Today
  {
    id: '1',
    title: 'OpenAI Announces GPT-5 with Revolutionary Reasoning Capabilities',
    summary: 'OpenAI unveiled GPT-5, featuring breakthrough reasoning abilities and 40% improvement on complex problem-solving benchmarks. The model demonstrates unprecedented understanding of context.',
    category: 'ai',
    source: 'TechCrunch',
    sourceUrl: 'https://techcrunch.com/category/artificial-intelligence/',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Stripe Acquires AI Startup for $1.2 Billion',
    summary: 'Payment giant Stripe completed its largest acquisition, buying AI fraud detection startup SecureAI. The deal signals growing importance of AI in fintech security.',
    category: 'startup',
    source: 'Bloomberg',
    sourceUrl: 'https://www.bloomberg.com/technology',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=300&fit=crop',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'SpaceX Successfully Tests Starship Orbital Refueling',
    summary: 'SpaceX achieved a major milestone with successful in-orbit fuel transfer between two Starship vehicles. This technology is crucial for future Mars missions.',
    category: 'space',
    source: 'SpaceNews',
    sourceUrl: 'https://spacenews.com/section/launch/',
    imageUrl: 'https://images.unsplash.com/photo-1516849841765-e9f75c960c03?w=400&h=300&fit=crop',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'React 20 Released with Built-in State Management',
    summary: 'Meta released React 20 featuring native state management, eliminating the need for external libraries like Redux. Performance improvements of up to 50% reported.',
    category: 'dev',
    source: 'Dev.to',
    sourceUrl: 'https://dev.to/t/react',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Figma Introduces AI-Powered Design Generation',
    summary: 'Figma launched an AI feature that generates complete UI designs from text descriptions. Designers can now create wireframes and mockups in seconds.',
    category: 'design',
    source: 'Figma',
    sourceUrl: 'https://www.figma.com/blog/',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
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
    sourceUrl: 'https://www.nature.com/news',
    imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=300&fit=crop',
    publishedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '7',
    title: 'Anthropic Raises $4B in New Funding Round',
    summary: 'Claude maker Anthropic secured $4 billion in funding led by Google and Salesforce. The company plans to accelerate AI safety research and model development.',
    category: 'ai',
    source: 'The Verge',
    sourceUrl: 'https://www.theverge.com/ai-artificial-intelligence',
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=300&fit=crop',
    publishedAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '8',
    title: 'Apple Vision Pro 2 Leaks Reveal 50% Weight Reduction',
    summary: 'Leaked schematics show Apple\'s next-gen headset will be significantly lighter with improved battery life. Launch expected in Q3 2026.',
    category: 'design',
    source: 'MacRumors',
    sourceUrl: 'https://www.macrumors.com/guide/apple-vision-pro/',
    imageUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=400&h=300&fit=crop',
    publishedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '9',
    title: 'NASA Confirms Water Ice on Mars Surface',
    summary: 'Mars Reconnaissance Orbiter detected significant water ice deposits near the equator. This discovery dramatically improves prospects for future human missions.',
    category: 'space',
    source: 'NASA',
    sourceUrl: 'https://www.nasa.gov/mars/',
    imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400&h=300&fit=crop',
    publishedAt: new Date(Date.now() - 32 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '10',
    title: 'Y Combinator Launches $500M AI Fund',
    summary: 'Startup accelerator Y Combinator announced a dedicated AI fund to back early-stage AI companies. Applications open for the summer batch.',
    category: 'startup',
    source: 'TechCrunch',
    sourceUrl: 'https://techcrunch.com/category/startups/',
    imageUrl: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=300&fit=crop',
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
    sourceUrl: 'https://devblogs.microsoft.com/typescript/',
    imageUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400&h=300&fit=crop',
    publishedAt: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '12',
    title: 'Quantum Computer Solves Previously Impossible Chemistry Problem',
    summary: 'Google\'s quantum computer simulated a complex molecular interaction that classical computers couldn\'t handle. Breakthrough could accelerate drug discovery.',
    category: 'science',
    source: 'Science Daily',
    sourceUrl: 'https://www.sciencedaily.com/news/matter_energy/quantum_computing/',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
    publishedAt: new Date(Date.now() - 52 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '13',
    title: 'Claude Opus 4.5 Sets New Benchmark Records',
    summary: 'Anthropic\'s latest model achieves state-of-the-art performance across all major benchmarks. Extended thinking capability enables complex reasoning tasks.',
    category: 'ai',
    source: 'Anthropic',
    sourceUrl: 'https://www.anthropic.com/news',
    imageUrl: 'https://images.unsplash.com/photo-1680795456548-93c3dab1d6e0?w=400&h=300&fit=crop',
    publishedAt: new Date(Date.now() - 54 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '14',
    title: 'Blue Origin Launches First Commercial Space Station Module',
    summary: 'Jeff Bezos\'s space company successfully deployed the first module of its commercial space station. Full station expected to be operational by 2028.',
    category: 'space',
    source: 'Ars Technica',
    sourceUrl: 'https://arstechnica.com/space/',
    imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=300&fit=crop',
    publishedAt: new Date(Date.now() - 56 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '15',
    title: 'Notion Acquires Linear in $800M Deal',
    summary: 'Productivity tool Notion acquired project management startup Linear. The combined company aims to create an all-in-one workspace for engineering teams.',
    category: 'startup',
    source: 'Hacker News',
    sourceUrl: 'https://news.ycombinator.com/',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
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
