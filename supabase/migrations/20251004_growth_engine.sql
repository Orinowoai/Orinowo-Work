-- Orinowo growth engine schema: credits, events, referrals, challenges

-- Ensure UUID gen is available
create extension if not exists pgcrypto;

create table if not exists public.credits_balance (
  user_id uuid primary key,
  balance integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  event text not null,
  properties jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null, -- referrer
  code text unique not null,
  accepted_by uuid null,
  accepted_at timestamptz null,
  created_at timestamptz not null default now()
);

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  theme text not null,
  prize_credits integer not null default 500,
  starts_at timestamptz not null default now(),
  ends_at timestamptz null,
  created_at timestamptz not null default now()
);

-- Detailed credits transaction ledger for auditing
create table if not exists public.credits_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  delta integer not null,
  reason text not null,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Submissions per challenge
create table if not exists public.challenge_submissions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null,
  title text null,
  description text null,
  track_url text not null,
  submitted_at timestamptz not null default now(),
  unique (challenge_id, user_id)
);

-- RLS policies (adjust to your auth schema)
alter table public.credits_balance enable row level security;
alter table public.events enable row level security;
alter table public.referrals enable row level security;
alter table public.challenges enable row level security;
alter table public.credits_transactions enable row level security;
alter table public.challenge_submissions enable row level security;

-- Tight RLS (owner-based) for end users; service role bypasses RLS automatically
-- credits_balance: users can only read/write their own row
do $$ begin
  drop policy if exists "service role all" on public.credits_balance;
  create policy if not exists "select own" on public.credits_balance for select using (auth.uid() = user_id);
  create policy if not exists "insert own" on public.credits_balance for insert with check (auth.uid() = user_id);
  create policy if not exists "update own" on public.credits_balance for update using (auth.uid() = user_id);
exception when others then null; end $$;

-- events: optional read of own events, otherwise server-side only
do $$ begin
  drop policy if exists "service role all" on public.events;
  create policy if not exists "read own events" on public.events for select using (auth.uid() = user_id);
  -- inserts are done by service role; no public insert policy
exception when others then null; end $$;

-- referrals: creator can read own; invited can read their accepted
do $$ begin
  drop policy if exists "service role all" on public.referrals;
  create policy if not exists "read related" on public.referrals for select using (auth.uid() = user_id or auth.uid() = accepted_by);
  create policy if not exists "insert own" on public.referrals for insert with check (auth.uid() = user_id);
exception when others then null; end $$;

-- challenges: everyone can read
do $$ begin
  drop policy if exists "service role all" on public.challenges;
  create policy if not exists "read all" on public.challenges for select using (true);
  -- creates/updates via service role only
exception when others then null; end $$;

-- credits_transactions: users can read own; inserts via service role or RPC only
do $$ begin
  drop policy if exists "read own tx" on public.credits_transactions;
  create policy if not exists "read own tx" on public.credits_transactions for select using (auth.uid() = user_id);
  -- No public insert/update policies; writes happen via RPC or service role
exception when others then null; end $$;

-- challenge_submissions: public read, users insert/update own
do $$ begin
  drop policy if exists "read all submissions" on public.challenge_submissions;
  drop policy if exists "insert own submission" on public.challenge_submissions;
  drop policy if exists "update own submission" on public.challenge_submissions;
  create policy if not exists "read all submissions" on public.challenge_submissions for select using (true);
  create policy if not exists "insert own submission" on public.challenge_submissions for insert with check (auth.uid() = user_id);
  create policy if not exists "update own submission" on public.challenge_submissions for update using (auth.uid() = user_id);
exception when others then null; end $$;

-- Helpful indexes
create index if not exists idx_events_user_created on public.events(user_id, created_at desc);
create index if not exists idx_events_event_created on public.events(event, created_at desc);
create index if not exists idx_referrals_code on public.referrals(code);
create index if not exists idx_referrals_user on public.referrals(user_id);
create index if not exists idx_challenges_starts on public.challenges(starts_at desc);
create index if not exists idx_challenge_submissions_challenge on public.challenge_submissions(challenge_id);
create index if not exists idx_challenge_submissions_user on public.challenge_submissions(user_id);
create index if not exists idx_credits_tx_user_created on public.credits_transactions(user_id, created_at desc);

-- Trigger to maintain updated_at on credits_balance
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

do $$ begin
  perform 1 from pg_trigger where tgname = 'trg_credits_balance_updated_at';
  if not found then
    create trigger trg_credits_balance_updated_at before update on public.credits_balance
    for each row execute function public.set_updated_at();
  end if;
end $$;

-- Atomic credits adjustment function (writes ledger + updates balance)
create or replace function public.adjust_credits(
  p_user_id uuid,
  p_delta integer,
  p_reason text,
  p_meta jsonb default '{}'::jsonb
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_balance integer;
begin
  -- write ledger row
  insert into public.credits_transactions(user_id, delta, reason, meta)
  values (p_user_id, p_delta, p_reason, coalesce(p_meta, '{}'::jsonb));

  -- try update existing balance
  update public.credits_balance
    set balance = greatest(0, balance + p_delta), updated_at = now()
  where user_id = p_user_id
  returning balance into v_new_balance;

  if not found then
    insert into public.credits_balance(user_id, balance, updated_at)
    values (p_user_id, greatest(0, p_delta), now())
    returning balance into v_new_balance;
  end if;

  return v_new_balance;
end;
$$;
