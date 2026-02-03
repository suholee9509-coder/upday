-- AI Response Cache Table
-- Stores AI-generated summaries and classifications to reduce API costs
-- TTL: 24 hours (managed by expires_at column)

CREATE TABLE IF NOT EXISTS ai_response_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_hash VARCHAR(32) UNIQUE NOT NULL,
  summary TEXT NOT NULL,
  category VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Index for fast hash lookups
CREATE INDEX IF NOT EXISTS idx_ai_cache_hash ON ai_response_cache(content_hash);

-- Index for efficient expired entry cleanup
CREATE INDEX IF NOT EXISTS idx_ai_cache_expires ON ai_response_cache(expires_at);

-- Comment for documentation
COMMENT ON TABLE ai_response_cache IS 'Caches AI summarization and classification results to reduce API costs. TTL: 24 hours.';
