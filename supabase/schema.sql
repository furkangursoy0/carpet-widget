-- ═══════════════════════════════════════════════════════════════════
-- SCENEVA — Production Schema
-- Run this entire file in Supabase SQL Editor on first deploy.
--
-- Design principles:
--   • Collect the minimum data needed for the product to work
--   • Generated previews live behind signed URLs (auto-expire)
--   • Every widget is locked to an explicit domain allow-list
-- ═══════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ───────────────────────────────────────────────────────────────────
-- USERS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  brand_name text,
  store_url text,
  onboarded boolean default false,
  created_at timestamptz default now()
);

alter table public.users enable row level security;

create policy "users can read self" on public.users
  for select using (auth.uid() = id);

create policy "users can update self" on public.users
  for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email) values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────────────────────────────────────────────────────────────
-- WIDGETS
-- One per user for v1.
-- `allowed_domains` is the explicit whitelist of hostnames where the
-- widget may run. Empty = blocked everywhere (fail-closed).
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.widgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text default 'Main widget',
  embed_key text not null unique default encode(gen_random_bytes(16), 'hex'),
  format text not null default 'floating-button',  -- 'floating-button' | 'side-tab'
  position text default 'bottom-right',            -- floating: 'bottom-right'|'bottom-left'  •  side-tab: 'right'|'left'
  accent_color text default '#2458F5',
  border_radius int default 16,
  button_text text default 'See this rug in your room',
  button_shape text default 'pill',                -- floating only: 'pill' (text+icon) | 'circle' (icon only)
  status text default 'active',                    -- 'active' | 'paused'
  allowed_domains text[] default '{}',             -- e.g. {'nomadrugs.com','www.nomadrugs.com'}
  custom_image_selector text,                      -- optional CSS selector for product image
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.widgets enable row level security;

create policy "users manage own widgets" on public.widgets
  for all using (auth.uid() = user_id);

create index if not exists widgets_embed_key_idx on public.widgets(embed_key);
create index if not exists widgets_user_id_idx on public.widgets(user_id);

-- ───────────────────────────────────────────────────────────────────
-- USAGE_EVENTS
-- We intentionally don't store:
--   • IP addresses (only hashed, transiently, for rate limits)
--   • User-Agent strings (only parsed 'device' for analytics)
--   • Referrer headers (not used; would leak external context)
--   • URL query strings (stripped — UTMs / session tokens are PII risk)
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  widget_id uuid not null references public.widgets(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  event_type text not null,        -- 'opened' | 'uploaded' | 'generated' | 'downloaded' | 'shared' | 'error'
  page_url text,                   -- sanitized: origin + pathname only
  product_image_url text,
  product_title text,
  device text,                     -- 'desktop' | 'mobile' | 'tablet'
  result_storage_path text,        -- path inside `previews` bucket (signed URL minted on demand)
  error_code text,
  duration_ms int,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.usage_events enable row level security;

create policy "users read own events" on public.usage_events
  for select using (auth.uid() = user_id);

create index if not exists usage_events_user_created_idx on public.usage_events(user_id, created_at desc);
create index if not exists usage_events_widget_idx on public.usage_events(widget_id);
create index if not exists usage_events_type_idx on public.usage_events(event_type);

-- ───────────────────────────────────────────────────────────────────
-- SUBSCRIPTIONS (Lemon Squeezy state)
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  lemon_subscription_id text unique,
  lemon_customer_id text,
  lemon_variant_id text,
  plan text default 'growth',
  status text default 'pending',   -- 'pending' | 'active' | 'past_due' | 'cancelled' | 'expired'
  current_period_start timestamptz,
  current_period_end timestamptz,
  monthly_limit int default 1000,
  cancel_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.subscriptions enable row level security;

create policy "users read own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

create index if not exists subs_user_idx on public.subscriptions(user_id);
create index if not exists subs_lemon_sub_idx on public.subscriptions(lemon_subscription_id);

-- ───────────────────────────────────────────────────────────────────
-- USAGE_PERIODS (rolling monthly count cache)
-- `limit_email_sent_at` makes the "limit reached" email atomic — only
-- ever sent once per billing period, even under race conditions.
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.usage_periods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  generations_used int default 0,
  limit_email_sent_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, period_start)
);

alter table public.usage_periods enable row level security;

create policy "users read own usage" on public.usage_periods
  for select using (auth.uid() = user_id);

create index if not exists usage_periods_user_period_idx on public.usage_periods(user_id, period_start desc);

-- ───────────────────────────────────────────────────────────────────
-- RATE_LIMITS
-- Cheap per-IP throttle for /api/visualize. IPs are sha256-hashed
-- with a server-side pepper so the raw IP is never persisted.
-- Rows older than 1 hour can be GC'd by a cron job.
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.rate_limits (
  id bigserial primary key,
  widget_id uuid references public.widgets(id) on delete cascade,
  ip_hash text not null,
  bucket text not null,            -- 'visualize' | 'event'
  window_started_at timestamptz not null default now(),
  count int not null default 1
);

create index if not exists rate_limits_lookup_idx
  on public.rate_limits(widget_id, ip_hash, bucket, window_started_at desc);
create index if not exists rate_limits_gc_idx
  on public.rate_limits(window_started_at);

-- No RLS — service-role only.

-- ───────────────────────────────────────────────────────────────────
-- STORAGE buckets
-- Both buckets are PRIVATE. Visualize endpoint mints signed URLs
-- with a 30-day TTL when it returns the preview to the shopper.
-- ───────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('rooms',    'rooms',    false, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('previews', 'previews', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public;

drop policy if exists "previews are publicly readable" on storage.objects;
drop policy if exists "service role can write previews" on storage.objects;
create policy "service role manages preview buckets"
  on storage.objects for all
  using (bucket_id in ('previews', 'rooms') and auth.role() = 'service_role')
  with check (bucket_id in ('previews', 'rooms') and auth.role() = 'service_role');

-- ───────────────────────────────────────────────────────────────────
-- HELPER: get current period usage
-- ───────────────────────────────────────────────────────────────────
create or replace function public.current_period_usage(uid uuid)
returns table (used int, limit_total int, period_end_date date)
language sql stable as $$
  select
    coalesce(up.generations_used, 0) as used,
    coalesce(s.monthly_limit, 1000) as limit_total,
    coalesce(up.period_end, current_date + interval '30 days') as period_end_date
  from public.users u
  left join public.subscriptions s on s.user_id = u.id
  left join public.usage_periods up on up.user_id = u.id
    and current_date between up.period_start and up.period_end
  where u.id = uid;
$$;

-- ───────────────────────────────────────────────────────────────────
-- HELPER: atomic increment + return whether limit was just crossed
-- Returns:
--   used        — new count after increment
--   limit_total — current period limit
--   just_reached — true iff this call took the user from below to >= limit
--                  AND no limit-reached email has been sent this period.
-- The caller (visualize endpoint) sends the email only when just_reached
-- is true, and we stamp limit_email_sent_at in the same statement to
-- make the side-effect happen exactly once per period under any race.
-- ───────────────────────────────────────────────────────────────────
create or replace function public.increment_usage(uid uuid)
returns table (used int, limit_total int, just_reached boolean)
language plpgsql security definer set search_path = public as $$
declare
  pstart date;
  pend date;
  new_used int;
  lim int;
  prev_email_sent timestamptz;
begin
  select coalesce(s.current_period_start::date, current_date),
         coalesce(s.current_period_end::date, current_date + interval '30 days'),
         coalesce(s.monthly_limit, 1000)
    into pstart, pend, lim
  from public.subscriptions s where s.user_id = uid;

  if pstart is null then
    pstart := current_date;
    pend := current_date + interval '30 days';
    lim := 1000;
  end if;

  insert into public.usage_periods (user_id, period_start, period_end, generations_used)
  values (uid, pstart, pend, 1)
  on conflict (user_id, period_start) do update
    set generations_used = public.usage_periods.generations_used + 1,
        updated_at = now()
  returning generations_used, limit_email_sent_at into new_used, prev_email_sent;

  if new_used >= lim and prev_email_sent is null then
    update public.usage_periods
       set limit_email_sent_at = now()
     where user_id = uid and period_start = pstart;
    return query select new_used, lim, true;
  else
    return query select new_used, lim, false;
  end if;
end;
$$;

-- ───────────────────────────────────────────────────────────────────
-- HELPER: check + record rate-limit usage (sliding 1-minute window)
-- Returns true if the request is allowed, false if it should be denied.
-- ───────────────────────────────────────────────────────────────────
create or replace function public.check_rate_limit(
  w_id uuid,
  ip_h text,
  bucket_name text,
  per_minute int
) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  recent int;
begin
  select coalesce(sum(count), 0) into recent
  from public.rate_limits
  where widget_id = w_id
    and ip_hash = ip_h
    and bucket = bucket_name
    and window_started_at > now() - interval '1 minute';

  if recent >= per_minute then
    return false;
  end if;

  insert into public.rate_limits (widget_id, ip_hash, bucket, count)
  values (w_id, ip_h, bucket_name, 1);

  -- opportunistic GC: delete rows older than 1 hour, capped per call
  delete from public.rate_limits
   where ctid in (
     select ctid from public.rate_limits
     where window_started_at < now() - interval '1 hour'
     limit 200
   );

  return true;
end;
$$;
