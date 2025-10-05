-- Spotlight content table

create table if not exists public.spotlight (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null check (type in ('artist','song','producer')),
  image_url text not null,
  month text not null, -- YYYY-MM
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_spotlight_month on public.spotlight(month);
create index if not exists idx_spotlight_type on public.spotlight(type);

alter table public.spotlight enable row level security;

-- Read for all; writes via service role/admin only
do $$ begin
  drop policy if exists "service role all" on public.spotlight;
  create policy if not exists "read all" on public.spotlight for select using (true);
  -- inserts/updates via service role only; no public write policies
exception when others then null; end $$;
