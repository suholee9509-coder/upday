import type { Category } from '@/types/news'

export const CATEGORIES: { id: Category; label: string; coverage: string }[] = [
  { id: 'ai', label: 'AI', coverage: 'Artificial intelligence, machine learning, LLMs' },
  { id: 'startup', label: 'Startup', coverage: 'Startups, funding, M&A' },
  { id: 'science', label: 'Science', coverage: 'Scientific research, medical breakthroughs' },
  { id: 'design', label: 'Design', coverage: 'Product design, UX, visual design' },
  { id: 'space', label: 'Space', coverage: 'Space exploration, aerospace' },
  { id: 'dev', label: 'Dev', coverage: 'Software development, open source, infrastructure' },
]

export const DEFAULT_PAGE_SIZE = 20
export const DEBOUNCE_MS = 300
