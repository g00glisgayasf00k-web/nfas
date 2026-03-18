-- ============================================================
-- National Flatpack Assembly Service — Supabase Schema
-- Migration: 001_initial_schema
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for fuzzy text search

-- ============================================================
-- ENUMS
-- ============================================================

create type user_role as enum ('customer', 'fitter', 'affiliate', 'admin');
create type job_status as enum ('open', 'claimed', 'closed', 'cancelled');
create type fitter_status as enum ('contacted', 'booked', 'completed', 'no_response', 'cancelled');
create type doc_status as enum ('pending', 'approved', 'rejected');
create type reviewer_role as enum ('customer', 'fitter');

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================

create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          user_role not null default 'customer',
  first_name    text not null default '',
  last_name     text not null default '',
  display_name  text generated always as (first_name || ' ' || last_name) stored,
  email         text not null,
  telephone     text,
  address_line1 text,
  address_line2 text,
  town          text,
  postcode      text,
  bio           text,                          -- fitters only
  avatar_url    text,                          -- fitters only
  credits       integer not null default 0,   -- fitters only
  is_verified   boolean not null default false, -- fitters: docs approved
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- FITTER DOCUMENTS
-- ============================================================

create table fitter_documents (
  id          uuid primary key default uuid_generate_v4(),
  fitter_id   uuid not null references profiles(id) on delete cascade,
  doc_type    text not null, -- 'public_liability' | 'dbs' | 'driving_licence' | 'photo'
  storage_path text not null,
  status      doc_status not null default 'pending',
  reviewed_at timestamptz,
  reviewed_by uuid references profiles(id),
  notes       text,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- FITTER SERVICE AREA
-- ============================================================

create table fitter_areas (
  id         uuid primary key default uuid_generate_v4(),
  fitter_id  uuid not null unique references profiles(id) on delete cascade,
  postcode   text not null,
  lat        double precision not null,
  lng        double precision not null,
  radius_mi  integer not null default 10,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- CREDIT PACKS (configured by admin)
-- ============================================================

create table credit_packs (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  credits     integer not null,
  price_pence integer not null, -- price in pence (GBP)
  badge       text,             -- e.g. 'Best Value'
  is_one_time boolean not null default false,
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- CREDIT TRANSACTIONS
-- ============================================================

create table credit_transactions (
  id             uuid primary key default uuid_generate_v4(),
  fitter_id      uuid not null references profiles(id) on delete cascade,
  amount         integer not null, -- positive = credit, negative = debit
  reason         text not null,    -- 'pack_purchase' | 'lead_unlock' | 'refund' | 'admin_grant'
  job_id         uuid,             -- set on lead_unlock
  stripe_payment_intent text,
  created_at     timestamptz not null default now()
);

-- ============================================================
-- FURNITURE INVENTORY ITEMS (admin-managed catalogue)
-- ============================================================

create table inventory_items (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  category     text not null,    -- 'Wardrobe', 'Bed Frame', etc.
  base_time_min integer not null default 45, -- assembly minutes
  base_price   numeric(8,2) not null default 30.00,
  is_active    boolean not null default true,
  sort_order   integer not null default 0
);

-- ============================================================
-- JOBS
-- ============================================================

create table jobs (
  id              uuid primary key default uuid_generate_v4(),
  customer_id     uuid not null references profiles(id) on delete cascade,
  title           text not null,
  status          job_status not null default 'open',
  -- Location
  address_line1   text,
  town            text not null,
  postcode        text not null,
  lat             double precision,
  lng             double precision,
  -- Details
  notes           text,
  preferred_date  date,
  -- Calculated totals (denormalised for speed)
  total_items     integer not null default 0,
  est_time_min    integer not null default 0,
  est_price       numeric(8,2) not null default 0,
  credit_cost     integer not null default 1,
  -- Affiliate tracking
  affiliate_id    uuid references profiles(id),
  -- Timestamps
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- JOB ITEMS (line items within a job)
-- ============================================================

create table job_items (
  id             uuid primary key default uuid_generate_v4(),
  job_id         uuid not null references jobs(id) on delete cascade,
  inventory_id   uuid references inventory_items(id),
  name           text not null,    -- copied at time of job creation
  quantity       integer not null default 1,
  time_min       integer not null default 45,
  unit_price     numeric(8,2) not null default 30.00,
  sort_order     integer not null default 0
);

-- ============================================================
-- LEAD UNLOCKS (fitter purchases a lead)
-- ============================================================

create table lead_unlocks (
  id          uuid primary key default uuid_generate_v4(),
  job_id      uuid not null references jobs(id) on delete cascade,
  fitter_id   uuid not null references profiles(id) on delete cascade,
  credits_spent integer not null,
  fitter_status fitter_status,
  unlocked_at   timestamptz not null default now(),
  unique (job_id, fitter_id)
);

-- ============================================================
-- MESSAGES
-- ============================================================

create table messages (
  id          uuid primary key default uuid_generate_v4(),
  job_id      uuid not null references jobs(id) on delete cascade,
  sender_id   uuid not null references profiles(id) on delete cascade,
  receiver_id uuid not null references profiles(id) on delete cascade,
  body        text not null,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- REVIEWS
-- ============================================================

create table reviews (
  id            uuid primary key default uuid_generate_v4(),
  job_id        uuid not null references jobs(id) on delete cascade,
  reviewer_id   uuid not null references profiles(id) on delete cascade,
  reviewee_id   uuid not null references profiles(id) on delete cascade,
  reviewer_role reviewer_role not null,
  rating        smallint not null check (rating between 1 and 5),
  comment       text,
  created_at    timestamptz not null default now(),
  unique (job_id, reviewer_id)
);

-- ============================================================
-- AFFILIATE EARNINGS
-- ============================================================

create table affiliate_earnings (
  id           uuid primary key default uuid_generate_v4(),
  affiliate_id uuid not null references profiles(id) on delete cascade,
  job_id       uuid not null references jobs(id) on delete cascade,
  job_value    numeric(8,2) not null,
  rate         numeric(5,4) not null, -- e.g. 0.015 = 1.5%
  earned       numeric(8,2) not null,
  paid_at      timestamptz,
  created_at   timestamptz not null default now(),
  unique (affiliate_id, job_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

create index jobs_customer_id_idx    on jobs(customer_id);
create index jobs_status_idx         on jobs(status);
create index jobs_postcode_idx       on jobs(postcode);
create index jobs_created_at_idx     on jobs(created_at desc);
create index lead_unlocks_fitter_idx on lead_unlocks(fitter_id);
create index lead_unlocks_job_idx    on lead_unlocks(job_id);
create index messages_job_id_idx     on messages(job_id);
create index messages_receiver_idx   on messages(receiver_id) where read_at is null;
create index reviews_reviewee_idx    on reviews(reviewee_id);
create index fitter_docs_fitter_idx  on fitter_documents(fitter_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

create or replace function handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on profiles
  for each row execute procedure handle_updated_at();

create trigger jobs_updated_at before update on jobs
  for each row execute procedure handle_updated_at();

-- ============================================================
-- NEW USER TRIGGER (auto-create profile on signup)
-- ============================================================

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, role, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'customer'),
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles           enable row level security;
alter table fitter_documents   enable row level security;
alter table fitter_areas       enable row level security;
alter table credit_packs       enable row level security;
alter table credit_transactions enable row level security;
alter table inventory_items    enable row level security;
alter table jobs               enable row level security;
alter table job_items          enable row level security;
alter table lead_unlocks       enable row level security;
alter table messages           enable row level security;
alter table reviews            enable row level security;
alter table affiliate_earnings enable row level security;

-- ── Profiles ──
create policy "Users can view their own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

create policy "Fitter profiles are publicly readable"
  on profiles for select using (role = 'fitter' and is_verified = true);

-- ── Jobs ──
create policy "Anyone can view open jobs"
  on jobs for select using (status = 'open');

create policy "Customers can view their own jobs"
  on jobs for select using (auth.uid() = customer_id);

create policy "Fitters can view jobs they unlocked"
  on jobs for select using (
    exists (
      select 1 from lead_unlocks
      where lead_unlocks.job_id = jobs.id
      and lead_unlocks.fitter_id = auth.uid()
    )
  );

create policy "Customers can create jobs"
  on jobs for insert with check (auth.uid() = customer_id);

create policy "Customers can update their own open jobs"
  on jobs for update using (auth.uid() = customer_id and status = 'open');

-- ── Job Items ──
create policy "Job items readable with job"
  on job_items for select using (
    exists (
      select 1 from jobs
      where jobs.id = job_items.job_id
      and (
        jobs.status = 'open'
        or jobs.customer_id = auth.uid()
        or exists (
          select 1 from lead_unlocks
          where lead_unlocks.job_id = jobs.id
          and lead_unlocks.fitter_id = auth.uid()
        )
      )
    )
  );

create policy "Customers can insert job items"
  on job_items for insert with check (
    exists (
      select 1 from jobs
      where jobs.id = job_items.job_id
      and jobs.customer_id = auth.uid()
    )
  );

-- ── Lead Unlocks ──
create policy "Fitters can see their own unlocks"
  on lead_unlocks for select using (fitter_id = auth.uid());

create policy "Customers can see who unlocked their jobs"
  on lead_unlocks for select using (
    exists (select 1 from jobs where jobs.id = job_id and jobs.customer_id = auth.uid())
  );

-- ── Messages ──
create policy "Participants can read their messages"
  on messages for select using (
    auth.uid() = sender_id or auth.uid() = receiver_id
  );

create policy "Participants can send messages"
  on messages for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from lead_unlocks lu
      join jobs j on j.id = lu.job_id
      where lu.job_id = messages.job_id
      and (lu.fitter_id = auth.uid() or j.customer_id = auth.uid())
    )
  );

create policy "Receivers can mark messages as read"
  on messages for update using (auth.uid() = receiver_id);

-- ── Reviews ──
create policy "Reviews are publicly readable"
  on reviews for select using (true);

create policy "Participants can submit one review per job"
  on reviews for insert with check (
    auth.uid() = reviewer_id
    and exists (
      select 1 from lead_unlocks lu
      join jobs j on j.id = lu.job_id
      where lu.job_id = reviews.job_id
      and j.status = 'closed'
      and (lu.fitter_id = auth.uid() or j.customer_id = auth.uid())
    )
  );

-- ── Credit Packs ──
create policy "Anyone can view active credit packs"
  on credit_packs for select using (is_active = true);

-- ── Credit Transactions ──
create policy "Fitters can view their own transactions"
  on credit_transactions for select using (fitter_id = auth.uid());

-- ── Inventory Items ──
create policy "Anyone can view active inventory items"
  on inventory_items for select using (is_active = true);

-- ── Fitter Areas ──
create policy "Fitters can manage their own area"
  on fitter_areas for all using (fitter_id = auth.uid());

create policy "Anyone can read fitter areas"
  on fitter_areas for select using (true);

-- ── Fitter Documents ──
create policy "Fitters can manage their own documents"
  on fitter_documents for all using (fitter_id = auth.uid());

-- ── Affiliate Earnings ──
create policy "Affiliates can view their own earnings"
  on affiliate_earnings for select using (affiliate_id = auth.uid());

-- ============================================================
-- DATABASE FUNCTIONS
-- ============================================================

-- Get unread message count for a user
create or replace function get_unread_count(user_id uuid)
returns integer language sql stable security definer as $$
  select count(*)::integer
  from messages
  where receiver_id = user_id
  and read_at is null;
$$;

-- Get average rating for a user
create or replace function get_avg_rating(user_id uuid)
returns numeric language sql stable security definer as $$
  select round(avg(rating)::numeric, 1)
  from reviews
  where reviewee_id = user_id;
$$;

-- Unlock a lead: deduct credits, create unlock record, update job status
create or replace function unlock_lead(
  p_fitter_id uuid,
  p_job_id    uuid
) returns jsonb language plpgsql security definer as $$
declare
  v_job         jobs%rowtype;
  v_fitter      profiles%rowtype;
  v_credit_cost integer;
  v_already     boolean;
begin
  -- Get job
  select * into v_job from jobs where id = p_job_id;
  if not found then
    return jsonb_build_object('error', 'Job not found');
  end if;
  if v_job.status != 'open' then
    return jsonb_build_object('error', 'This job is no longer available');
  end if;

  -- Get fitter
  select * into v_fitter from profiles where id = p_fitter_id;
  if not found or v_fitter.role != 'fitter' then
    return jsonb_build_object('error', 'Not a registered fitter');
  end if;

  -- Check already unlocked
  select exists(
    select 1 from lead_unlocks
    where job_id = p_job_id and fitter_id = p_fitter_id
  ) into v_already;
  if v_already then
    return jsonb_build_object('error', 'Already unlocked');
  end if;

  -- Check credits
  v_credit_cost := v_job.credit_cost;
  if v_fitter.credits < v_credit_cost then
    return jsonb_build_object('error', 'Insufficient credits');
  end if;

  -- Deduct credits
  update profiles set credits = credits - v_credit_cost where id = p_fitter_id;

  -- Record transaction
  insert into credit_transactions (fitter_id, amount, reason, job_id)
  values (p_fitter_id, -v_credit_cost, 'lead_unlock', p_job_id);

  -- Create unlock
  insert into lead_unlocks (job_id, fitter_id, credits_spent)
  values (p_job_id, p_fitter_id, v_credit_cost);

  -- Mark job as claimed
  update jobs set status = 'claimed', updated_at = now() where id = p_job_id;

  return jsonb_build_object('success', true, 'credits_remaining', v_fitter.credits - v_credit_cost);
end;
$$;

-- Mark job complete: update fitter status, close job, fire affiliate earnings
create or replace function complete_job(
  p_fitter_id uuid,
  p_job_id    uuid
) returns jsonb language plpgsql security definer as $$
declare
  v_job      jobs%rowtype;
  v_unlock   lead_unlocks%rowtype;
  v_rate     numeric;
  v_earned   numeric;
begin
  select * into v_job from jobs where id = p_job_id;
  if not found then return jsonb_build_object('error', 'Job not found'); end if;

  select * into v_unlock
  from lead_unlocks
  where job_id = p_job_id and fitter_id = p_fitter_id;
  if not found then return jsonb_build_object('error', 'Not your lead'); end if;

  -- Update fitter status
  update lead_unlocks
  set fitter_status = 'completed'
  where job_id = p_job_id and fitter_id = p_fitter_id;

  -- Close the job
  update jobs set status = 'closed', updated_at = now() where id = p_job_id;

  -- Affiliate commission if applicable
  if v_job.affiliate_id is not null and v_job.est_price > 0 then
    v_rate := case
      when v_job.est_price >= 1000 then 0.025
      when v_job.est_price >= 500  then 0.020
      else 0.015
    end;
    v_earned := round(v_job.est_price * v_rate, 2);

    insert into affiliate_earnings (affiliate_id, job_id, job_value, rate, earned)
    values (v_job.affiliate_id, p_job_id, v_job.est_price, v_rate, v_earned)
    on conflict (affiliate_id, job_id) do nothing;
  end if;

  return jsonb_build_object('success', true);
end;
$$;

-- ============================================================
-- REALTIME (enable for messaging)
-- ============================================================

alter publication supabase_realtime add table messages;

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fitter-documents',
  'fitter-documents',
  false,
  10485760, -- 10MB
  array['image/jpeg','image/png','image/webp','application/pdf']
) on conflict (id) do nothing;

-- Fitters can upload their own documents
create policy "Fitters can upload own documents"
  on storage.objects for insert
  with check (
    bucket_id = 'fitter-documents'
    and auth.uid()::text = (storage.foldername(name))[2]
  );

-- Fitters can read their own documents
create policy "Fitters can read own documents"
  on storage.objects for select
  using (
    bucket_id = 'fitter-documents'
    and auth.uid()::text = (storage.foldername(name))[2]
  );

-- Admins can read all fitter documents (via service role in API routes)
