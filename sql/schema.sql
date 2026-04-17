-- ============================================================
-- Smile Vision AI — Supabase Database Schema
-- Supabase SQL Editor에서 실행하세요
-- ============================================================

-- 1. 고객(환자) 테이블
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  age INTEGER,
  gender TEXT CHECK (gender IN ('남', '여')),
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 시뮬레이션 세션 테이블
CREATE TABLE IF NOT EXISTS simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  -- 이미지 (Supabase Storage URL)
  before_image_url TEXT,
  after_natural_url TEXT,
  after_white_url TEXT,
  after_premium_url TEXT,
  -- AI 분석 점수
  score_whiteness INTEGER,
  score_alignment INTEGER,
  score_symmetry INTEGER,
  score_spacing INTEGER,
  total_score INTEGER,
  predicted_score INTEGER,
  -- AI 분석 결과
  findings JSONB,
  recommendation TEXT,
  -- 선택된 스타일
  selected_style TEXT DEFAULT 'natural',
  -- 상담 상태
  status TEXT DEFAULT '촬영완료' CHECK (status IN ('촬영완료', '상담중', '계약완료', '시술중', '시술완료')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 상담 이력 테이블
CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  simulation_id UUID REFERENCES simulations(id) ON DELETE SET NULL,
  treatment_type TEXT,
  price INTEGER,
  status TEXT DEFAULT '상담중' CHECK (status IN ('상담중', '계약완료', '시술중', '시술완료', '취소')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_simulations_patient ON simulations(patient_id);
CREATE INDEX IF NOT EXISTS idx_simulations_created ON simulations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultations_patient ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Storage 버킷 (Supabase Dashboard > Storage에서 생성)
-- 버킷명: smile-vision
-- Public: true (이미지 공개 접근)

-- RLS 정책 (필요시)
-- ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
