-- ============================================================
-- RESUME API - Database Schema
-- ============================================================
-- Entities: profile, experiences, education, skills,
--           projects, certifications, languages, contacts
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILE (core entity - one per user/resume)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name   VARCHAR(150)  NOT NULL,
  headline    VARCHAR(255),                          -- "Full-Stack Developer | 5 yrs exp"
  summary     TEXT,                                  -- "About me" paragraph
  avatar_url  VARCHAR(500),
  location    VARCHAR(150),
  website     VARCHAR(255),
  linkedin    VARCHAR(255),
  github      VARCHAR(255),
  available_for_hire BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. CONTACTS (one-to-many with profiles)
-- ============================================================
CREATE TABLE IF NOT EXISTS contacts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        VARCHAR(50) NOT NULL,   -- 'email', 'phone', 'twitter', 'custom'
  label       VARCHAR(100),           -- display label
  value       VARCHAR(255) NOT NULL,
  is_primary  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. EXPERIENCES (work history)
-- ============================================================
CREATE TABLE IF NOT EXISTS experiences (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company       VARCHAR(150) NOT NULL,
  role          VARCHAR(150) NOT NULL,
  location      VARCHAR(150),
  employment_type VARCHAR(50) DEFAULT 'full-time', -- full-time, part-time, freelance, internship
  description   TEXT,
  start_date    DATE NOT NULL,
  end_date      DATE,                              -- NULL means current job
  is_current    BOOLEAN DEFAULT FALSE,
  company_url   VARCHAR(255),
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. EXPERIENCE HIGHLIGHTS (bullets under each experience)
-- ============================================================
CREATE TABLE IF NOT EXISTS experience_highlights (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experience_id  UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  description    TEXT NOT NULL,
  sort_order     INT DEFAULT 0
);

-- ============================================================
-- 5. EDUCATION
-- ============================================================
CREATE TABLE IF NOT EXISTS education (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  institution   VARCHAR(150) NOT NULL,
  degree        VARCHAR(150),         -- "Bachelor's", "Master's", "Bootcamp", etc.
  field_of_study VARCHAR(150),
  description   TEXT,
  grade         VARCHAR(50),
  start_date    DATE NOT NULL,
  end_date      DATE,
  is_current    BOOLEAN DEFAULT FALSE,
  institution_url VARCHAR(255),
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. SKILL CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS skill_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,  -- "Frontend", "Backend", "DevOps"
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. SKILLS (many-to-one with skill_categories)
-- ============================================================
CREATE TABLE IF NOT EXISTS skills (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id  UUID NOT NULL REFERENCES skill_categories(id) ON DELETE CASCADE,
  name         VARCHAR(100) NOT NULL,
  level        SMALLINT CHECK (level BETWEEN 1 AND 5),  -- 1=beginner, 5=expert
  years_exp    DECIMAL(4,1),
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title        VARCHAR(150) NOT NULL,
  description  TEXT,
  repo_url     VARCHAR(255),
  live_url     VARCHAR(255),
  thumbnail_url VARCHAR(500),
  status       VARCHAR(50) DEFAULT 'completed',  -- completed, wip, archived
  is_featured  BOOLEAN DEFAULT FALSE,
  start_date   DATE,
  end_date     DATE,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. PROJECT TECHNOLOGIES (many-to-many: projects <-> tags)
-- ============================================================
CREATE TABLE IF NOT EXISTS project_technologies (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL
);

-- ============================================================
-- 10. CERTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS certifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title           VARCHAR(150) NOT NULL,
  issuing_org     VARCHAR(150) NOT NULL,
  issue_date      DATE NOT NULL,
  expiry_date     DATE,
  credential_id   VARCHAR(150),
  credential_url  VARCHAR(255),
  sort_order      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 11. LANGUAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS languages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  proficiency VARCHAR(50) DEFAULT 'intermediate',  -- native, fluent, advanced, intermediate, basic
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_contacts_profile_id          ON contacts(profile_id);
CREATE INDEX IF NOT EXISTS idx_experiences_profile_id       ON experiences(profile_id);
CREATE INDEX IF NOT EXISTS idx_exp_highlights_experience_id ON experience_highlights(experience_id);
CREATE INDEX IF NOT EXISTS idx_education_profile_id         ON education(profile_id);
CREATE INDEX IF NOT EXISTS idx_skill_categories_profile_id  ON skill_categories(profile_id);
CREATE INDEX IF NOT EXISTS idx_skills_category_id           ON skills(category_id);
CREATE INDEX IF NOT EXISTS idx_projects_profile_id          ON projects(profile_id);
CREATE INDEX IF NOT EXISTS idx_project_techs_project_id     ON project_technologies(project_id);
CREATE INDEX IF NOT EXISTS idx_certifications_profile_id    ON certifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_languages_profile_id         ON languages(profile_id);

-- ============================================================
-- auto-update updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ 
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles','contacts','experiences','education',
    'skills','projects','certifications','languages'
  ] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_updated_at ON %I;
       CREATE TRIGGER trg_updated_at
         BEFORE UPDATE ON %I
         FOR EACH ROW EXECUTE FUNCTION update_updated_at();',
      t, t
    );
  END LOOP;
END $$;
