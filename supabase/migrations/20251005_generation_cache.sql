-- Cache for generated tracks to avoid recomputation

create table if not exists public.generation_cache (
  id uuid primary key default gen_random_uuid(),
  prompt text not null,
  duration int not null,
  audio_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists generation_cache_prompt_duration_idx on public.generation_cache(prompt, duration);
create index if not exists generation_cache_created_idx on public.generation_cache(created_at);

alter table public.generation_cache enable row level security;

-- Read allowed; writes via service role
do $$ begin
  drop policy if exists "read cache" on public.generation_cache;
  create policy if not exists "read cache" on public.generation_cache for select using (true);
exception when others then null; end $$;
