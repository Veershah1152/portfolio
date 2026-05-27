-- ─── Portfolio Database Schema ───────────────────────────────────────────────
-- Run this in your Supabase SQL editor to set up all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Profile (single row) ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profile (
  id INT PRIMARY KEY DEFAULT 1,
  name TEXT NOT NULL DEFAULT 'Your Name',
  title TEXT DEFAULT 'Developer',
  bio TEXT DEFAULT 'Write your bio here.',
  bio_secondary TEXT,
  avatar_url TEXT,
  resume_url TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  email TEXT,
  location TEXT DEFAULT 'New Delhi, India',
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'busy', 'unavailable')),
  stats JSONB DEFAULT '{"ctfs": 0, "vulnerabilities": 0, "commits": 0, "streak": 0, "projects": 0}',
  terminal_title TEXT DEFAULT 'root@portfolio:~',
  marquee_items TEXT[] DEFAULT ARRAY['OPEN_TO_WORK', 'TYPESCRIPT', 'REACT', 'NEXT_JS'],
  roles TEXT[] DEFAULT ARRAY['/usr/bin/developer', '/usr/bin/builder'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default profile row
INSERT INTO profile (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ─── Projects ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  full_description TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  github_url TEXT,
  live_url TEXT,
  thumbnail_url TEXT,
  screenshots TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  completion_date DATE,
  achievements TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'STABLE' CHECK (status IN ('STABLE', 'BETA', 'ALPHA', 'ARCHIVED', 'WIP')),
  metrics JSONB DEFAULT '{}',
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Skills ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  percentage INT CHECK (percentage >= 0 AND percentage <= 100),
  icon_url TEXT,
  is_learning BOOLEAN DEFAULT false,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Timeline (Experience / Education / Certifications / Achievements) ────────
CREATE TABLE IF NOT EXISTS timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('work', 'education', 'achievement', 'certification')),
  title TEXT NOT NULL,
  organization TEXT,
  description TEXT,
  start_date DATE,
  end_date DATE,
  icon TEXT DEFAULT 'Briefcase',
  tags TEXT[] DEFAULT '{}',
  url TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Blog Posts ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_url TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  reading_time INT DEFAULT 5,
  views INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Contact Messages ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Row Level Security ───────────────────────────────────────────────────────

-- Profile: public read, authenticated write
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read profile" ON profile FOR SELECT USING (true);
CREATE POLICY "Authenticated update profile" ON profile FOR UPDATE USING (auth.role() = 'authenticated');

-- Projects: public read, authenticated write
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Authenticated manage projects" ON projects FOR ALL USING (auth.role() = 'authenticated');

-- Skills: public read, authenticated write
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Authenticated manage skills" ON skills FOR ALL USING (auth.role() = 'authenticated');

-- Timeline: public read, authenticated write
ALTER TABLE timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read timeline" ON timeline FOR SELECT USING (true);
CREATE POLICY "Authenticated manage timeline" ON timeline FOR ALL USING (auth.role() = 'authenticated');

-- Posts: public read published only, authenticated read all & write
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published posts" ON posts FOR SELECT USING (published = true);
CREATE POLICY "Authenticated manage posts" ON posts FOR ALL USING (auth.role() = 'authenticated');

-- Contact: public insert, authenticated read
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert contact" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated read contact" ON contact_messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update contact" ON contact_messages FOR UPDATE USING (auth.role() = 'authenticated');

-- ─── Storage Buckets ──────────────────────────────────────────────────────────
-- Run in Supabase Dashboard > Storage > New Bucket
-- Bucket: "portfolio-assets" (public)
-- Bucket: "linkedin-uploads" (private)

-- ─── Updated At Triggers ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_updated_at BEFORE UPDATE ON profile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_timeline_updated_at BEFORE UPDATE ON timeline
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Sample Seed Data ─────────────────────────────────────────────────────────

-- Sample skills
INSERT INTO skills (category, name, percentage, is_learning, order_index) VALUES
  ('Languages', 'Kotlin', 85, false, 1),
  ('Languages', 'Python', 80, false, 2),
  ('Languages', 'TypeScript', 72, false, 3),
  ('Languages', 'C / C++', 65, false, 4),
  ('Cybersecurity', 'Network Recon', 82, false, 1),
  ('Cybersecurity', 'Web Exploit', 74, false, 2),
  ('Cybersecurity', 'Linux Hardening', 78, false, 3),
  ('Android', 'Jetpack Compose', 80, false, 1),
  ('Android', 'Coroutines / Flow', 76, false, 2),
  ('AI / ML', 'PyTorch', 62, false, 1),
  ('AI / ML', 'LLM Tooling', 75, false, 2)
ON CONFLICT DO NOTHING;
