-- ================================================================
--  Dialysis Unit — Initial Schema
--  Run this in your Supabase project's SQL Editor.
-- ================================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ── 1. patients ──────────────────────────────────────────────────
create table if not exists public.patients (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  birth_date  date not null,
  dry_weight  numeric(5,2) not null,
  schedule    text[] not null default '{}',
  created_at  timestamptz not null default now()
);

-- ── 2. dialysis_records ──────────────────────────────────────────
create table if not exists public.dialysis_records (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid not null references public.patients(id) on delete cascade,
  date        date not null,
  pre_weight  numeric(5,2) not null,
  pre_bp      text not null,
  uv          numeric(5,2) not null,
  post_bp     text not null,
  post_weight numeric(5,2) not null,
  notes       text,
  created_at  timestamptz not null default now()
);

-- ── 3. Indexes ───────────────────────────────────────────────────
create index if not exists idx_dialysis_records_patient_id
  on public.dialysis_records(patient_id);

create index if not exists idx_dialysis_records_date
  on public.dialysis_records(date desc);

-- ── 4. Row Level Security ────────────────────────────────────────
-- For an internal clinical tool, we allow full access.
-- Tighten these policies if you add authentication later.

alter table public.patients enable row level security;
alter table public.dialysis_records enable row level security;

-- Allow all operations (anon key)
create policy "Allow all on patients"
  on public.patients for all
  using (true)
  with check (true);

create policy "Allow all on dialysis_records"
  on public.dialysis_records for all
  using (true)
  with check (true);
