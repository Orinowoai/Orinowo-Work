-- Sponsors catalog for partnerships

create table if not exists public.sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  tagline text,
  website text,
  active boolean not null default true,
  region text,
  created_at timestamptz not null default now()
);

alter table public.sponsors enable row level security;

-- Public can read sponsors; writes via service role
do $$ begin
  drop policy if exists "read active sponsors" on public.sponsors;
  create policy if not exists "read active sponsors" on public.sponsors for select using (true);
exception when others then null; end $$;
