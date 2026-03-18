-- ============================================================
-- Migration 002 — fixes and additions
-- ============================================================

-- Add unique constraint on fitter_documents so upsert works
alter table fitter_documents
  add constraint fitter_documents_fitter_id_doc_type_key
  unique (fitter_id, doc_type);

-- Index for faster job geo queries
create index if not exists jobs_lat_lng_idx on jobs(lat, lng) where lat is not null and lng is not null;

-- Add cascade on affiliate_id FK in jobs
-- (jobs can exist without affiliates — already nullable, this is fine)

-- Ensure reviews have proper FK on job (cascade delete)
alter table reviews
  drop constraint if exists reviews_job_id_fkey,
  add constraint reviews_job_id_fkey
    foreign key (job_id) references jobs(id) on delete cascade;

-- Ensure messages cascade
alter table messages
  drop constraint if exists messages_job_id_fkey,
  add constraint messages_job_id_fkey
    foreign key (job_id) references jobs(id) on delete cascade;

-- Add full-text search on jobs
alter table jobs add column if not exists search_vector tsvector
  generated always as (
    to_tsvector('english', coalesce(title,'') || ' ' || coalesce(town,'') || ' ' || coalesce(postcode,'') || ' ' || coalesce(notes,''))
  ) stored;

create index if not exists jobs_search_idx on jobs using gin(search_vector);
