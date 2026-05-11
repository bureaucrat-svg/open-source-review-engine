-- ============================================================
-- Open Source Review Engine — Supabase Schema
-- Run via: supabase db push  OR  paste in the Supabase SQL editor
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Enums ────────────────────────────────────────────────────
do $$ begin
  create type review_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null;
end $$;

-- ── Tables ───────────────────────────────────────────────────

-- reviews
create table if not exists public.reviews (
  id              uuid primary key default gen_random_uuid(),
  product_id      text not null,
  product_title   text not null,
  reviewer_name   text not null,
  reviewer_email  text not null,
  rating          smallint not null check (rating between 1 and 5),
  comment         text not null,
  status          review_status not null default 'pending',
  images          text[] not null default '{}',
  ip_address      inet,
  origin          text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- settings (key-value store)
create table if not exists public.settings (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

-- rate_limits
create table if not exists public.rate_limits (
  id            uuid primary key default gen_random_uuid(),
  identifier    text not null,
  count         integer not null default 0,
  window_start  timestamptz not null,
  created_at    timestamptz not null default now()
);

create index if not exists rate_limits_identifier_idx on public.rate_limits (identifier);

-- ── Default settings ─────────────────────────────────────────
insert into public.settings (key, value) values
  ('auto_approve', 'false'::jsonb),
  ('allowed_origins', '["http://localhost:3000"]'::jsonb)
on conflict (key) do nothing;

-- ── updated_at trigger ───────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reviews_updated_at on public.reviews;
create trigger reviews_updated_at
  before update on public.reviews
  for each row execute function public.handle_updated_at();

-- ── Row Level Security ───────────────────────────────────────

alter table public.reviews   enable row level security;
alter table public.settings  enable row level security;
alter table public.rate_limits enable row level security;

-- reviews: anonymous users can only read approved reviews
create policy "Public can read approved reviews"
  on public.reviews for select
  using (status = 'approved');

-- reviews: authenticated admin can do everything
create policy "Admin full access to reviews"
  on public.reviews for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- settings: only authenticated admin can read/write
create policy "Admin full access to settings"
  on public.settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- rate_limits: only service role (server-side API) can manage
-- (service role bypasses RLS by default)

-- ── Storage bucket ───────────────────────────────────────────
-- Create via Supabase Dashboard: Storage → New Bucket
-- Name: review-images
-- Public: OFF (Restricted)
-- Allowed MIME: image/jpeg, image/png, image/webp, image/gif
-- Max upload size: 5 MB
--
-- Policy (API write only):
-- INSERT: role = service_role
-- SELECT: role = service_role OR authenticated
