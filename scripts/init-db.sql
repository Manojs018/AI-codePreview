-- AI Code Review Platform Database Schema
-- PostgreSQL 15 + TimescaleDB

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  github_id INTEGER UNIQUE NOT NULL,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'developer' CHECK (role IN ('developer', 'manager', 'admin')),
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_github_id ON users(github_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- REPOSITORIES TABLE
-- ============================================================================
CREATE TABLE repositories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  github_repo_id INTEGER UNIQUE NOT NULL,
  owner VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  full_name VARCHAR(512) NOT NULL,
  description TEXT,
  private BOOLEAN DEFAULT false,
  webhook_id INTEGER,
  webhook_secret_encrypted TEXT,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{
    "autoReview": true,
    "minQualityScore": 70,
    "severityThreshold": "medium",
    "languages": [],
    "excludePatterns": ["*.min.js", "*.lock", "dist/*"]
  }'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_repos_github_id ON repositories(github_repo_id);
CREATE INDEX idx_repos_full_name ON repositories(full_name);
CREATE INDEX idx_repos_owner ON repositories(owner);
CREATE INDEX idx_repos_active ON repositories(is_active);

-- ============================================================================
-- REPOSITORY COLLABORATORS (Many-to-Many)
-- ============================================================================
CREATE TABLE repository_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  permission VARCHAR(50) DEFAULT 'read' CHECK (permission IN ('read', 'write', 'admin')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(repository_id, user_id)
);

CREATE INDEX idx_collab_repo ON repository_collaborators(repository_id);
CREATE INDEX idx_collab_user ON repository_collaborators(user_id);

-- ============================================================================
-- PULL REQUESTS TABLE
-- ============================================================================
CREATE TABLE pull_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
  github_pr_id INTEGER NOT NULL,
  pr_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  author_id UUID REFERENCES users(id),
  author_username VARCHAR(255),
  state VARCHAR(50) CHECK (state IN ('open', 'closed', 'merged')),
  base_branch VARCHAR(255),
  head_branch VARCHAR(255),
  base_sha VARCHAR(40),
  head_sha VARCHAR(40),
  files_changed INTEGER DEFAULT 0,
  additions INTEGER DEFAULT 0,
  deletions INTEGER DEFAULT 0,
  commits_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  closed_at TIMESTAMP,
  merged_at TIMESTAMP,
  UNIQUE(repository_id, github_pr_id)
);

CREATE INDEX idx_pr_repo ON pull_requests(repository_id);
CREATE INDEX idx_pr_author ON pull_requests(author_id);
CREATE INDEX idx_pr_state ON pull_requests(state);
CREATE INDEX idx_pr_repo_number ON pull_requests(repository_id, pr_number);
CREATE INDEX idx_pr_created ON pull_requests(created_at DESC);

-- ============================================================================
-- REVIEWS TABLE
-- ============================================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pull_request_id UUID REFERENCES pull_requests(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  quality_score DECIMAL(5,2) CHECK (quality_score >= 0 AND quality_score <= 100),
  total_issues INTEGER DEFAULT 0,
  critical_issues INTEGER DEFAULT 0,
  high_issues INTEGER DEFAULT 0,
  medium_issues INTEGER DEFAULT 0,
  low_issues INTEGER DEFAULT 0,
  info_issues INTEGER DEFAULT 0,
  files_analyzed INTEGER DEFAULT 0,
  lines_analyzed INTEGER DEFAULT 0,
  analysis_duration_ms INTEGER,
  ai_tokens_used INTEGER,
  ai_cost_usd DECIMAL(10,4),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_review_pr ON reviews(pull_request_id);
CREATE INDEX idx_review_status ON reviews(status);
CREATE INDEX idx_review_created ON reviews(created_at DESC);
CREATE INDEX idx_review_quality ON reviews(quality_score);

-- ============================================================================
-- ISSUES TABLE
-- ============================================================================
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  line_number INTEGER,
  end_line_number INTEGER,
  category VARCHAR(100) CHECK (category IN ('bug', 'security', 'performance', 'style', 'best-practice', 'maintainability')),
  severity VARCHAR(50) CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  suggested_fix TEXT,
  code_snippet TEXT,
  language VARCHAR(50),
  rule_id VARCHAR(255),
  github_comment_id BIGINT,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_issue_review ON issues(review_id);
CREATE INDEX idx_issue_severity ON issues(severity);
CREATE INDEX idx_issue_category ON issues(category);
CREATE INDEX idx_issue_file ON issues(file_path);
CREATE INDEX idx_issue_resolved ON issues(is_resolved);

-- ============================================================================
-- CODE QUALITY METRICS (TimescaleDB Hypertable)
-- ============================================================================
CREATE TABLE code_quality_metrics (
  time TIMESTAMPTZ NOT NULL,
  repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  pull_request_id UUID REFERENCES pull_requests(id) ON DELETE CASCADE,
  quality_score DECIMAL(5,2),
  issues_count INTEGER,
  critical_count INTEGER,
  high_count INTEGER,
  medium_count INTEGER,
  low_count INTEGER,
  pr_count INTEGER DEFAULT 1,
  files_changed INTEGER,
  lines_changed INTEGER,
  review_duration_ms INTEGER,
  PRIMARY KEY (time, repository_id, user_id)
);

-- Convert to TimescaleDB hypertable for efficient time-series queries
SELECT create_hypertable('code_quality_metrics', 'time');

-- Create continuous aggregates for faster analytics
CREATE MATERIALIZED VIEW daily_quality_metrics
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 day', time) AS day,
  repository_id,
  user_id,
  AVG(quality_score) AS avg_quality_score,
  SUM(issues_count) AS total_issues,
  SUM(pr_count) AS total_prs,
  AVG(review_duration_ms) AS avg_review_duration
FROM code_quality_metrics
GROUP BY day, repository_id, user_id;

CREATE MATERIALIZED VIEW weekly_quality_metrics
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 week', time) AS week,
  repository_id,
  user_id,
  AVG(quality_score) AS avg_quality_score,
  SUM(issues_count) AS total_issues,
  SUM(pr_count) AS total_prs
FROM code_quality_metrics
GROUP BY week, repository_id, user_id;

-- ============================================================================
-- WEBHOOK EVENTS LOG
-- ============================================================================
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  action VARCHAR(100),
  payload JSONB NOT NULL,
  signature VARCHAR(255),
  is_verified BOOLEAN DEFAULT false,
  processed BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

CREATE INDEX idx_webhook_repo ON webhook_events(repository_id);
CREATE INDEX idx_webhook_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_processed ON webhook_events(processed);
CREATE INDEX idx_webhook_created ON webhook_events(created_at DESC);

-- ============================================================================
-- AI ANALYSIS CACHE
-- ============================================================================
CREATE TABLE ai_analysis_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 of file content
  language VARCHAR(50) NOT NULL,
  analysis_result JSONB NOT NULL,
  quality_score DECIMAL(5,2),
  issues_count INTEGER,
  tokens_used INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP DEFAULT NOW(),
  use_count INTEGER DEFAULT 1
);

CREATE INDEX idx_cache_hash ON ai_analysis_cache(content_hash);
CREATE INDEX idx_cache_language ON ai_analysis_cache(language);
CREATE INDEX idx_cache_last_used ON ai_analysis_cache(last_used_at DESC);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP
);

CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_read ON notifications(is_read);
CREATE INDEX idx_notif_created ON notifications(created_at DESC);

-- ============================================================================
-- AUDIT LOGS
-- ============================================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repos_updated_at BEFORE UPDATE ON repositories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prs_updated_at BEFORE UPDATE ON pull_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR ANALYTICS
-- ============================================================================

-- Developer Dashboard View
CREATE VIEW developer_dashboard AS
SELECT
  u.id AS user_id,
  u.username,
  COUNT(DISTINCT pr.id) AS total_prs,
  AVG(r.quality_score) AS avg_quality_score,
  SUM(r.total_issues) AS total_issues,
  SUM(r.critical_issues) AS critical_issues,
  MAX(pr.created_at) AS last_pr_date
FROM users u
LEFT JOIN pull_requests pr ON u.id = pr.author_id
LEFT JOIN reviews r ON pr.id = r.pull_request_id
WHERE r.status = 'completed'
GROUP BY u.id, u.username;

-- Repository Health View
CREATE VIEW repository_health AS
SELECT
  r.id AS repository_id,
  r.full_name,
  COUNT(DISTINCT pr.id) AS total_prs,
  AVG(rev.quality_score) AS avg_quality_score,
  SUM(rev.critical_issues) AS total_critical_issues,
  SUM(rev.high_issues) AS total_high_issues,
  MAX(pr.created_at) AS last_pr_date
FROM repositories r
LEFT JOIN pull_requests pr ON r.id = pr.repository_id
LEFT JOIN reviews rev ON pr.id = rev.pull_request_id
WHERE rev.status = 'completed'
GROUP BY r.id, r.full_name;

-- Issue Trends View
CREATE VIEW issue_trends AS
SELECT
  DATE(i.created_at) AS date,
  i.category,
  i.severity,
  COUNT(*) AS issue_count
FROM issues i
GROUP BY DATE(i.created_at), i.category, i.severity
ORDER BY date DESC;

-- ============================================================================
-- SEED DATA (Development Only)
-- ============================================================================

-- Insert sample admin user
INSERT INTO users (github_id, username, email, role, avatar_url)
VALUES (1, 'admin', 'admin@example.com', 'admin', 'https://github.com/identicons/admin.png')
ON CONFLICT (github_id) DO NOTHING;

-- ============================================================================
-- GRANTS (Adjust based on your security requirements)
-- ============================================================================

-- Grant appropriate permissions to application user
-- CREATE USER ai_review_app WITH PASSWORD 'secure_password';
-- GRANT CONNECT ON DATABASE ai_code_review TO ai_review_app;
-- GRANT USAGE ON SCHEMA public TO ai_review_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ai_review_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ai_review_app;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE users IS 'Stores user accounts linked to GitHub';
COMMENT ON TABLE repositories IS 'GitHub repositories integrated with the platform';
COMMENT ON TABLE pull_requests IS 'Pull requests being reviewed';
COMMENT ON TABLE reviews IS 'AI-powered code reviews';
COMMENT ON TABLE issues IS 'Individual issues found during code review';
COMMENT ON TABLE code_quality_metrics IS 'Time-series metrics for analytics (TimescaleDB hypertable)';
COMMENT ON TABLE webhook_events IS 'Log of all GitHub webhook events received';
COMMENT ON TABLE ai_analysis_cache IS 'Cache AI analysis results to reduce costs';
COMMENT ON TABLE notifications IS 'User notifications';
COMMENT ON TABLE audit_logs IS 'Audit trail for security and compliance';
