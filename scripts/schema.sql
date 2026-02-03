-- Supabase SQL Schema for upday news platform
-- Run this in Supabase SQL Editor to create the database schema
-- Updated: 2026-02-04 (v2 - new categories + company support)

-- Create news_items table
CREATE TABLE IF NOT EXISTS news_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('ai', 'startups', 'dev', 'product', 'research')),
  companies TEXT[] DEFAULT '{}',  -- associated company slugs (e.g., ["openai", "microsoft"])
  source TEXT NOT NULL,
  source_url TEXT NOT NULL UNIQUE,
  image_url TEXT, -- og:image or RSS enclosure image
  published_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news_items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_category ON news_items(category);
CREATE INDEX IF NOT EXISTS idx_news_companies ON news_items USING GIN(companies);

-- Full-text search index on title and summary
CREATE INDEX IF NOT EXISTS idx_news_search ON news_items
  USING GIN(to_tsvector('english', title || ' ' || summary));

-- Enable Row Level Security (optional but recommended)
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows public read access
CREATE POLICY "Allow public read access" ON news_items
  FOR SELECT
  USING (true);

-- Create a policy for authenticated insert/update (for ingestion pipeline)
CREATE POLICY "Allow authenticated insert" ON news_items
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow authenticated update" ON news_items
  FOR UPDATE
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');


-- =============================================================================
-- MIGRATION SCRIPT (for existing databases)
-- Run this if you have existing data with old categories
-- =============================================================================

-- Step 1: Add companies column if not exists
-- ALTER TABLE news_items ADD COLUMN IF NOT EXISTS companies TEXT[] DEFAULT '{}';

-- Step 2: Migrate categories
-- UPDATE news_items SET category = 'startups' WHERE category = 'startup';
-- UPDATE news_items SET category = 'product' WHERE category = 'design';
-- UPDATE news_items SET category = 'research' WHERE category IN ('science', 'space');

-- Step 3: Update category constraint (requires dropping and recreating)
-- ALTER TABLE news_items DROP CONSTRAINT IF EXISTS news_items_category_check;
-- ALTER TABLE news_items ADD CONSTRAINT news_items_category_check
--   CHECK (category IN ('ai', 'startups', 'dev', 'product', 'research'));

-- Step 4: Create companies index
-- CREATE INDEX IF NOT EXISTS idx_news_companies ON news_items USING GIN(companies);
