-- ============================================================
-- Smile Vision AI — SaaS 운영 스키마
-- 실행 위치: Supabase Dashboard → SQL Editor → New Query
-- URL: https://supabase.com/dashboard/project/udilhdamqlurwjqzlgam/sql/new
-- ============================================================

-- 1. users 테이블 (회원 + 요금제 + 본사 관리자 플래그)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  clinic TEXT,
  role TEXT DEFAULT '상담실장',
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'max')),
  is_admin BOOLEAN DEFAULT false,
  last_login_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. api_call_logs 테이블 (과금 추적 + Rate Limit 집계 기준)
CREATE TABLE IF NOT EXISTS api_call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email TEXT,
  clinic TEXT,
  endpoint TEXT NOT NULL DEFAULT 'gemini',
  model TEXT,
  prompt_chars INT,
  response_chars INT,
  status_code INT,
  latency_ms INT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_call_logs_user_id ON api_call_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_call_logs_created_at ON api_call_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_call_logs_user_month ON api_call_logs(user_id, created_at DESC);

-- 3. RLS (데모 단계: anon_full, 정식 운영 시 강화)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_call_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_full_users" ON users;
CREATE POLICY "anon_full_users" ON users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_full_api_call_logs" ON api_call_logs;
CREATE POLICY "anon_full_api_call_logs" ON api_call_logs FOR ALL USING (true) WITH CHECK (true);

-- 4. 본사 관리자 계정 (심재우)
INSERT INTO users (email, name, clinic, role, tier, is_admin)
VALUES ('jaiwshim@gmail.com', '심재우', '디지털스마일치과', '상담실장', 'max', true)
ON CONFLICT (email) DO UPDATE
  SET is_admin = true, tier = 'max';

-- 5. 결과 확인
SELECT email, name, clinic, role, tier, is_admin, created_at FROM users;
