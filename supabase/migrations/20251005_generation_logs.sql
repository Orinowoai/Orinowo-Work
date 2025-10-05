-- generation_logs table for analytics
create extension if not exists pgcrypto;
create table if not exists public.generation_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  prompt text,
  duration int,
  country text,
  status text,
  is_cache_hit boolean default false,
  model_used text,
  cost_est numeric,
  latency numeric,
  created_at timestamp with time zone default now()
);

create index if not exists idx_generation_logs_created_at on public.generation_logs (created_at desc);
create index if not exists idx_generation_logs_status on public.generation_logs (status);
create index if not exists idx_generation_logs_country on public.generation_logs (country);
create index if not exists idx_generation_logs_prompt on public.generation_logs using gin (to_tsvector('simple', coalesce(prompt, '')));

-- helper function for daily counts
create or replace function public.daily_generation_counts(since_ts timestamp with time zone)
returns table(day text, count bigint)
language sql
as $$
  select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as day,
         count(*)::bigint as count
  from public.generation_logs
  where created_at >= since_ts
  group by 1
  order by 1;
$$;
