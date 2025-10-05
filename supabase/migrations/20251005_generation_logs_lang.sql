alter table if exists public.generation_logs
  add column if not exists english_prompt text,
  add column if not exists language_detected text;
