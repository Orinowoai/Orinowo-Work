-- Competitions voting + logs and blog source attribution
-- Safe to re-run: guarded by IF NOT EXISTS

-- UUID extension (used by default id generators)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Voting table: one vote per (competition_id, user_id)
CREATE TABLE IF NOT EXISTS public.competition_votes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id uuid NOT NULL,
  entry_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(competition_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_competition_votes_competition ON public.competition_votes(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_votes_entry ON public.competition_votes(entry_id);
CREATE INDEX IF NOT EXISTS idx_competition_votes_user ON public.competition_votes(user_id);

-- Optional metadata logs for anti-abuse (non-critical)
CREATE TABLE IF NOT EXISTS public.vote_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid,
  competition_id uuid,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Blog post source attribution fields for RSS importer (idempotent)
ALTER TABLE IF EXISTS public.blog_posts
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS source_name text;

-- Basic trigger to keep updated_at fresh (if function exists in schema)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'set_updated_at'
  ) THEN
    CREATE TRIGGER competition_votes_set_updated_at
    BEFORE UPDATE ON public.competition_votes
    FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
  END IF;
END $$;
