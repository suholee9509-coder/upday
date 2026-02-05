-- Add Korean translation columns to news_items table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- Add Korean title column
ALTER TABLE news_items
ADD COLUMN IF NOT EXISTS title_ko TEXT;

-- Add Korean summary column
ALTER TABLE news_items
ADD COLUMN IF NOT EXISTS summary_ko TEXT;

-- Add index for faster queries when filtering by language availability
CREATE INDEX IF NOT EXISTS idx_news_items_title_ko ON news_items (title_ko) WHERE title_ko IS NOT NULL;

-- Verify columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'news_items'
AND column_name IN ('title_ko', 'summary_ko');
