-- Tracks table for generated audio

create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  prompt text,
  duration int,
  audio_url text,
  category text,
  created_at timestamptz not null default now()
);

alter table public.tracks enable row level security;

-- Basic read policy; writes via service role in server
do $$ begin
  drop policy if exists "read all tracks" on public.tracks;
  create policy if not exists "read all tracks" on public.tracks for select using (true);
exception when others then null; end $$;
