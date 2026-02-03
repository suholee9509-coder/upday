import type { Category, Company, CompanyGroup } from '@/types/news'

export const CATEGORIES: { id: Category; label: string; coverage: string }[] = [
  { id: 'ai', label: 'AI', coverage: 'Artificial intelligence, LLM, ML, generative AI' },
  { id: 'startups', label: 'Startups', coverage: 'Funding, M&A, entrepreneurship, unicorns' },
  { id: 'dev', label: 'Dev', coverage: 'Programming, open source, infrastructure, DevOps' },
  { id: 'product', label: 'Product', coverage: 'Product launches, UX, design, product strategy' },
  { id: 'research', label: 'Research', coverage: 'Scientific research, papers, space, biotech' },
]

export const COMPANY_GROUPS: { id: CompanyGroup; label: string }[] = [
  { id: 'ai-llm', label: 'AI & LLM' },
  { id: 'developer-tools', label: 'Developer Tools' },
  { id: 'productivity-saas', label: 'Productivity & SaaS' },
  { id: 'commerce-platform', label: 'Commerce & Platform' },
]

export const COMPANIES: Company[] = [
  // Tier 1: AI Leaders
  { id: 'openai', name: 'OpenAI', group: 'ai-llm' },
  { id: 'anthropic', name: 'Anthropic', group: 'ai-llm' },
  { id: 'google', name: 'Google', group: 'ai-llm' },
  { id: 'microsoft', name: 'Microsoft', group: 'ai-llm' },
  { id: 'meta', name: 'Meta', group: 'ai-llm' },
  { id: 'nvidia', name: 'NVIDIA', group: 'ai-llm' },
  { id: 'xai', name: 'xAI', group: 'ai-llm' },
  { id: 'mistral', name: 'Mistral', group: 'ai-llm' },

  // Tier 2: Dev & Infra
  { id: 'vercel', name: 'Vercel', group: 'developer-tools' },
  { id: 'supabase', name: 'Supabase', group: 'developer-tools' },
  { id: 'cloudflare', name: 'Cloudflare', group: 'developer-tools' },
  { id: 'linear', name: 'Linear', group: 'developer-tools' },
  { id: 'figma', name: 'Figma', group: 'productivity-saas' },
  { id: 'notion', name: 'Notion', group: 'productivity-saas' },
  { id: 'cursor', name: 'Cursor', group: 'developer-tools' },
  { id: 'github', name: 'GitHub', group: 'developer-tools' },
  { id: 'databricks', name: 'Databricks', group: 'developer-tools' },

  // Tier 3: Tech Giants & Growth
  { id: 'apple', name: 'Apple', group: 'commerce-platform' },
  { id: 'amazon', name: 'Amazon', group: 'commerce-platform' },
  { id: 'tesla', name: 'Tesla', group: 'commerce-platform' },
  { id: 'stripe', name: 'Stripe', group: 'commerce-platform' },
  { id: 'shopify', name: 'Shopify', group: 'commerce-platform' },
  { id: 'slack', name: 'Slack', group: 'productivity-saas' },
  { id: 'discord', name: 'Discord', group: 'productivity-saas' },
  { id: 'reddit', name: 'Reddit', group: 'commerce-platform' },
]

export const DEFAULT_PAGE_SIZE = 20
export const DEBOUNCE_MS = 300

// LocalStorage keys
export const STORAGE_KEYS = {
  PINNED_COMPANIES: 'upday_pinned_companies',
  THEME: 'upday_theme',
} as const
