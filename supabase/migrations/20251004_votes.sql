-- Votes table for Spotlight voting

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  entry_id text not null,
  user_ip text not null,
  created_at timestamptz not null default now(),
  constraint votes_unique_per_ip unique (entry_id, user_ip)
);

alter table public.votes enable row level security;

-- Public can read aggregate/own; inserts via service role
do $$ begin
  drop policy if exists "service role all" on public.votes;
  create policy if not exists "read all" on public.votes for select using (true);
  -- writes happen via server role; no public insert policy
exception when others then null; end $$;
