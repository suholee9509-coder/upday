-- Supabase SQL Schema for upday news platform
-- Run this in Supabase SQL Editor to create the database schema

-- Create news_items table
CREATE TABLE IF NOT EXISTS news_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('ai', 'startup', 'science', 'design', 'space', 'dev')),
  source TEXT NOT NULL,
  source_url TEXT NOT NULL UNIQUE,
  image_url TEXT, -- og:image or RSS enclosure image
  published_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration: Add image_url column if table already exists
-- ALTER TABLE news_items ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news_items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_category ON news_items(category);

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
