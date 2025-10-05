-- Track statistics for leaderboard and earnings

create table if not exists public.track_stats (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.tracks(id) on delete cascade,
  plays int not null default 0,
  likes int not null default 0,
  downloads int not null default 0,
  earnings numeric not null default 0,
  sponsor_clicks int not null default 0,
  last_updated timestamptz not null default now()
);

create index if not exists track_stats_track_id_idx on public.track_stats(track_id);

alter table public.track_stats enable row level security;

-- Read policy (public readable); writes should use service role
do $$ begin
  drop policy if exists "read all track_stats" on public.track_stats;
  create policy if not exists "read all track_stats" on public.track_stats for select using (true);
exception when others then null; end $$;
