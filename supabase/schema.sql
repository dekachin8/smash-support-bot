-- SMASH Support Bot - Database Schema
-- Created: March 5, 2026
-- Purpose: Store conversations, messages, escalations, ratings, and analytics

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CONVERSATIONS TABLE
-- ============================================================================
-- Tracks each support conversation session
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL UNIQUE,
  student_email TEXT,  -- Optional: if student provides it
  language_detected TEXT DEFAULT 'es' CHECK (language_detected IN ('en', 'es')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  total_messages INTEGER DEFAULT 0,
  escalated BOOLEAN DEFAULT false,
  escalated_at TIMESTAMPTZ,
  escalation_reason TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),  -- 1-5 stars, or null
  rating_comment TEXT,
  rated_at TIMESTAMPTZ,
  user_agent TEXT,  -- Browser/device info
  ip_address INET,  -- For rate limiting
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_conversations_session_id ON conversations(session_id);
CREATE INDEX idx_conversations_started_at ON conversations(started_at DESC);
CREATE INDEX idx_conversations_escalated ON conversations(escalated) WHERE escalated = true;
CREATE INDEX idx_conversations_language ON conversations(language_detected);

-- Comments
COMMENT ON TABLE conversations IS 'Support conversation sessions with students';
COMMENT ON COLUMN conversations.session_id IS 'Client-generated session identifier';
COMMENT ON COLUMN conversations.language_detected IS 'Auto-detected language (en or es)';
COMMENT ON COLUMN conversations.escalated IS 'Whether conversation was escalated to Tim';

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================
-- Stores individual messages within conversations (with PII masked)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,  -- ALWAYS masked before storage
  content_raw TEXT,  -- Original content with PII (for debugging only, short retention)
  has_pii BOOLEAN DEFAULT false,  -- Flag if PII was detected and masked
  pii_types TEXT[],  -- Array: ['credit_card', 'password', 'ssn']
  template_matched INTEGER,  -- Which template number was used (1-18)
  screenshot_url TEXT,  -- S3/storage URL if student uploaded screenshot
  screenshot_analyzed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_has_pii ON messages(has_pii) WHERE has_pii = true;
CREATE INDEX idx_messages_template ON messages(template_matched) WHERE template_matched IS NOT NULL;

-- Comments
COMMENT ON TABLE messages IS 'Individual messages within conversations (PII masked)';
COMMENT ON COLUMN messages.content IS 'Message content with PII masked (***CARD***, ***PASSWORD***, etc.)';
COMMENT ON COLUMN messages.content_raw IS 'Original unmasked content (auto-delete after 7 days)';
COMMENT ON COLUMN messages.pii_types IS 'Types of PII detected: credit_card, password, ssn, etc.';

-- ============================================================================
-- ESCALATIONS TABLE
-- ============================================================================
-- Tracks escalations to tim@languages4.com
CREATE TABLE escalations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,  -- Auto-detected reason or manual trigger
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  telegram_sent BOOLEAN DEFAULT false,
  telegram_sent_at TIMESTAMPTZ,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,  -- 'tim' or 'auto'
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_escalations_conversation_id ON escalations(conversation_id);
CREATE INDEX idx_escalations_resolved ON escalations(resolved) WHERE resolved = false;
CREATE INDEX idx_escalations_created_at ON escalations(created_at DESC);

-- Comments
COMMENT ON TABLE escalations IS 'Escalated conversations requiring human support';
COMMENT ON COLUMN escalations.reason IS 'Why conversation was escalated (out-of-scope, complex issue, etc.)';

-- ============================================================================
-- RATINGS TABLE
-- ============================================================================
-- Detailed ratings and feedback from students
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  helpful BOOLEAN,  -- Thumbs up/down (optional, in addition to stars)
  comment TEXT,  -- Optional feedback
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ratings_conversation_id ON ratings(conversation_id);
CREATE INDEX idx_ratings_rating ON ratings(rating);
CREATE INDEX idx_ratings_created_at ON ratings(created_at DESC);

-- Comments
COMMENT ON TABLE ratings IS 'Student feedback and ratings for conversations';

-- ============================================================================
-- ANALYTICS_EVENTS TABLE
-- ============================================================================
-- Tracks usage metrics and analytics events
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,  -- 'session_start', 'message_sent', 'template_matched', 'escalation', etc.
  event_data JSONB,  -- Flexible data storage for event-specific info
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_analytics_events_conversation_id ON analytics_events(conversation_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_data ON analytics_events USING gin(event_data);

-- Comments
COMMENT ON TABLE analytics_events IS 'Usage analytics and event tracking';
COMMENT ON COLUMN analytics_events.event_data IS 'JSON data specific to event type';

-- ============================================================================
-- TEMPLATE_USAGE TABLE
-- ============================================================================
-- Tracks how often each template is used (for optimization)
CREATE TABLE template_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_number INTEGER NOT NULL CHECK (template_number >= 1 AND template_number <= 18),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  trigger_phrase TEXT,  -- Which phrase triggered this template
  language TEXT DEFAULT 'es' CHECK (language IN ('en', 'es')),
  effective BOOLEAN,  -- Was this template helpful? (based on no follow-up questions)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_template_usage_template_number ON template_usage(template_number);
CREATE INDEX idx_template_usage_created_at ON template_usage(created_at DESC);
CREATE INDEX idx_template_usage_effective ON template_usage(effective) WHERE effective IS NOT NULL;

-- Comments
COMMENT ON TABLE template_usage IS 'Tracks template usage frequency and effectiveness';

-- ============================================================================
-- RATE_LIMIT TABLE
-- ============================================================================
-- Simple rate limiting (10 requests per minute per IP)
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address INET NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  blocked BOOLEAN DEFAULT false,
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_rate_limits_ip ON rate_limits(ip_address);
CREATE INDEX idx_rate_limits_window ON rate_limits(window_start);
CREATE INDEX idx_rate_limits_blocked ON rate_limits(blocked) WHERE blocked = true;

-- Comments
COMMENT ON TABLE rate_limits IS 'IP-based rate limiting (10 req/min)';

-- ============================================================================
-- AUTO-CLEANUP POLICIES
-- ============================================================================
-- Delete raw PII content after 7 days
CREATE OR REPLACE FUNCTION cleanup_raw_pii() RETURNS void AS $$
BEGIN
  UPDATE messages 
  SET content_raw = NULL 
  WHERE content_raw IS NOT NULL 
    AND created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Delete old rate limit records (keep only last 24 hours)
CREATE OR REPLACE FUNCTION cleanup_rate_limits() RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits 
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (run daily at 3 AM)
-- Note: Supabase doesn't have pg_cron by default, so this would need to be triggered
-- via an external cron job or Vercel cron endpoint

-- ============================================================================
-- TRIGGERS
-- ============================================================================
-- Update conversations.updated_at on any message
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET 
    updated_at = NOW(),
    total_messages = total_messages + 1
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_timestamp
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- ============================================================================
-- VIEWS FOR ANALYTICS
-- ============================================================================

-- Conversation summary view
CREATE OR REPLACE VIEW conversation_summary AS
SELECT 
  DATE(started_at) as date,
  language_detected,
  COUNT(*) as total_conversations,
  AVG(total_messages) as avg_messages_per_conversation,
  COUNT(*) FILTER (WHERE escalated = true) as escalations,
  COUNT(*) FILTER (WHERE rating IS NOT NULL) as rated_conversations,
  AVG(rating) as avg_rating,
  ROUND(COUNT(*) FILTER (WHERE escalated = true)::numeric / COUNT(*)::numeric * 100, 2) as escalation_rate
FROM conversations
GROUP BY DATE(started_at), language_detected
ORDER BY date DESC;

-- Template effectiveness view
CREATE OR REPLACE VIEW template_effectiveness AS
SELECT 
  template_number,
  COUNT(*) as usage_count,
  COUNT(*) FILTER (WHERE effective = true) as effective_count,
  COUNT(*) FILTER (WHERE effective = false) as ineffective_count,
  ROUND(COUNT(*) FILTER (WHERE effective = true)::numeric / COUNT(*)::numeric * 100, 2) as effectiveness_rate
FROM template_usage
WHERE effective IS NOT NULL
GROUP BY template_number
ORDER BY usage_count DESC;

-- Daily metrics view
CREATE OR REPLACE VIEW daily_metrics AS
SELECT 
  DATE(created_at) as date,
  event_type,
  COUNT(*) as event_count
FROM analytics_events
GROUP BY DATE(created_at), event_type
ORDER BY date DESC, event_count DESC;

-- ============================================================================
-- RLS POLICIES (if using Supabase auth)
-- ============================================================================
-- For now, disable RLS since this is a standalone bot
-- Enable if you add authentication later
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE escalations DISABLE ROW LEVEL SECURITY;
ALTER TABLE ratings DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE template_usage DISABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- INITIAL DATA / SEED (optional)
-- ============================================================================
-- Could add seed data for testing here

-- ============================================================================
-- GRANTS (for serverless functions)
-- ============================================================================
-- Ensure service role can access all tables
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================================================
-- COMPLETE
-- ============================================================================
COMMENT ON SCHEMA public IS 'SMASH Support Bot database schema - v1.0';
