-- Unified Property Identity System: fictional competition-prototype schema.
-- Run through Supabase SQL Editor or `supabase db push`; never expose service keys to clients.
create extension if not exists pgcrypto;

create table if not exists citizens (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  mobile text not null,
  email text not null,
  pan_hash text not null unique,
  pan_masked text not null,
  created_at timestamptz not null default now()
);

create table if not exists property_passports (
  id uuid primary key default gen_random_uuid(),
  citizen_id uuid not null unique references citizens(id) on delete cascade,
  passport_id text not null unique,
  passport_signal text not null,
  issue_date date,
  credential_version text not null default 'CRED. 01',
  created_at timestamptz not null default now()
);

create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references property_passports(id) on delete cascade,
  property_number integer not null,
  address text not null,
  locality text,
  area text,
  survey_number text,
  registration_number text,
  purchase_date date,
  status text not null default 'in_review' check (status in ('in_review','verified')),
  created_at timestamptz not null default now(),
  unique (passport_id, property_number)
);

create table if not exists property_applications (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  application_id text not null unique,
  status text not null default 'created',
  created_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  document_type text not null,
  display_name text not null,
  is_fictional boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists verification_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references property_applications(id) on delete cascade,
  event_type text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists authentication_sessions (
  id uuid primary key default gen_random_uuid(),
  citizen_id uuid not null references citizens(id) on delete cascade,
  session_token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table citizens enable row level security;
alter table property_passports enable row level security;
alter table properties enable row level security;
alter table property_applications enable row level security;
alter table documents enable row level security;
alter table verification_events enable row level security;
alter table authentication_sessions enable row level security;

-- The application uses server-side service access. Add authenticated-user policies only with real auth claims.
