-- Run this once against your Vercel Postgres (Neon) database.
-- In the Vercel dashboard: Storage -> your database -> Query, paste and run.

CREATE TABLE IF NOT EXISTS schemes (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  states TEXT[] NOT NULL DEFAULT '{}',
  category TEXT NOT NULL,
  title JSONB NOT NULL DEFAULT '{}',
  summary JSONB NOT NULL DEFAULT '{}',
  description JSONB NOT NULL DEFAULT '{}',
  eligibility JSONB NOT NULL DEFAULT '{}',
  benefits JSONB NOT NULL DEFAULT '{}',
  how_to_apply JSONB NOT NULL DEFAULT '{}',
  deadline DATE,
  source_name TEXT,
  source_url TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS schemes_states_idx ON schemes USING GIN (states);
CREATE INDEX IF NOT EXISTS schemes_category_idx ON schemes (category);
CREATE INDEX IF NOT EXISTS schemes_created_at_idx ON schemes (created_at);

CREATE TABLE IF NOT EXISTS pending_schemes (
  id SERIAL PRIMARY KEY,
  source_name TEXT,
  source_url TEXT,
  excerpt TEXT NOT NULL,
  matched_keyword TEXT,
  status TEXT NOT NULL DEFAULT 'pending_review',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scan_sources (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
