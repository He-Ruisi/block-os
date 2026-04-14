-- BlockOS Supabase schema
-- Safe to re-run in Supabase SQL Editor
-- Last updated: 2026-04-14

-- ============================================================
-- Projects
-- ============================================================
create table if not exists projects (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  documents text[] not null default '{}',
  color text,
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table projects enable row level security;

drop policy if exists "Users can view own projects" on projects;
drop policy if exists "Users can insert own projects" on projects;
drop policy if exists "Users can update own projects" on projects;
drop policy if exists "Users can delete own projects" on projects;

create policy "Users can view own projects"
  on projects for select using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on projects for insert with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on projects for update using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on projects for delete using (auth.uid() = user_id);

-- ============================================================
-- Documents
-- ============================================================
create table if not exists documents (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '无标题文档',
  content text not null default '',
  blocks jsonb not null default '[]'::jsonb,
  project_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table documents enable row level security;

drop policy if exists "Users can view own documents" on documents;
drop policy if exists "Users can insert own documents" on documents;
drop policy if exists "Users can update own documents" on documents;
drop policy if exists "Users can delete own documents" on documents;

create policy "Users can view own documents"
  on documents for select using (auth.uid() = user_id);

create policy "Users can insert own documents"
  on documents for insert with check (auth.uid() = user_id);

create policy "Users can update own documents"
  on documents for update using (auth.uid() = user_id);

create policy "Users can delete own documents"
  on documents for delete using (auth.uid() = user_id);

-- ============================================================
-- Blocks
-- ============================================================
create table if not exists blocks (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  type text not null default 'text',
  implicit boolean not null default false,
  source jsonb not null default '{"type":"editor","capturedAt":null}'::jsonb,
  edit_history jsonb not null default '[]'::jsonb,
  style jsonb,
  template jsonb,
  releases jsonb not null default '[]'::jsonb,
  annotations jsonb not null default '{}'::jsonb,
  title text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  outgoing_links text[] not null default '{}',
  incoming_links text[] not null default '{}',
  is_derivative boolean not null default false,
  source_block_id text,
  derived_from text,
  context_document_id text,
  context_title text,
  modifications text
);

alter table blocks enable row level security;

drop policy if exists "Users can view own blocks" on blocks;
drop policy if exists "Users can insert own blocks" on blocks;
drop policy if exists "Users can update own blocks" on blocks;
drop policy if exists "Users can delete own blocks" on blocks;

create policy "Users can view own blocks"
  on blocks for select using (auth.uid() = user_id);

create policy "Users can insert own blocks"
  on blocks for insert with check (auth.uid() = user_id);

create policy "Users can update own blocks"
  on blocks for update using (auth.uid() = user_id);

create policy "Users can delete own blocks"
  on blocks for delete using (auth.uid() = user_id);

-- ============================================================
-- Block Usages
-- ============================================================
create table if not exists block_usages (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  block_id text not null,
  release_version integer not null,
  document_id text not null,
  document_title text not null,
  inserted_at timestamptz not null default now()
);

alter table block_usages enable row level security;

drop policy if exists "Users can view own block usages" on block_usages;
drop policy if exists "Users can insert own block usages" on block_usages;
drop policy if exists "Users can update own block usages" on block_usages;
drop policy if exists "Users can delete own block usages" on block_usages;

create policy "Users can view own block usages"
  on block_usages for select using (auth.uid() = user_id);

create policy "Users can insert own block usages"
  on block_usages for insert with check (auth.uid() = user_id);

create policy "Users can update own block usages"
  on block_usages for update using (auth.uid() = user_id);

create policy "Users can delete own block usages"
  on block_usages for delete using (auth.uid() = user_id);

-- ============================================================
-- Sessions
-- ============================================================
create table if not exists sessions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  date text not null,
  system_prompt text not null default '',
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table sessions enable row level security;

drop policy if exists "Users can view own sessions" on sessions;
drop policy if exists "Users can insert own sessions" on sessions;
drop policy if exists "Users can update own sessions" on sessions;
drop policy if exists "Users can delete own sessions" on sessions;

create policy "Users can view own sessions"
  on sessions for select using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on sessions for insert with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on sessions for update using (auth.uid() = user_id);

create policy "Users can delete own sessions"
  on sessions for delete using (auth.uid() = user_id);

-- ============================================================
-- Git Snapshots
-- ============================================================
create table if not exists git_commits (
  hash text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  author text not null default 'BlockOS User',
  files text[] not null default '{}',
  snapshot jsonb,
  created_at timestamptz not null default now()
);

alter table git_commits enable row level security;

drop policy if exists "Users can view own git commits" on git_commits;
drop policy if exists "Users can insert own git commits" on git_commits;
drop policy if exists "Users can update own git commits" on git_commits;
drop policy if exists "Users can delete own git commits" on git_commits;

create policy "Users can view own git commits"
  on git_commits for select using (auth.uid() = user_id);

create policy "Users can insert own git commits"
  on git_commits for insert with check (auth.uid() = user_id);

create policy "Users can update own git commits"
  on git_commits for update using (auth.uid() = user_id);

create policy "Users can delete own git commits"
  on git_commits for delete using (auth.uid() = user_id);

-- ============================================================
-- Indexes
-- ============================================================
create index if not exists idx_projects_user_id on projects(user_id);
create index if not exists idx_documents_user_id on documents(user_id);
create index if not exists idx_documents_project_id on documents(project_id);
create index if not exists idx_blocks_user_id on blocks(user_id);
create index if not exists idx_blocks_type on blocks(type);
create index if not exists idx_blocks_implicit on blocks(implicit);
create index if not exists idx_blocks_source_block_id on blocks(source_block_id);
create index if not exists idx_block_usages_user_id on block_usages(user_id);
create index if not exists idx_block_usages_block_id on block_usages(block_id);
create index if not exists idx_block_usages_document_id on block_usages(document_id);
create index if not exists idx_sessions_user_id on sessions(user_id);
create index if not exists idx_sessions_date on sessions(date);
create index if not exists idx_sessions_updated_at on sessions(updated_at);
create index if not exists idx_git_commits_user_id on git_commits(user_id);
create index if not exists idx_git_commits_created_at on git_commits(created_at);

drop index if exists idx_blocks_source_type;
drop index if exists idx_blocks_releases;
drop index if exists idx_blocks_annotations;
drop index if exists idx_documents_blocks;
drop index if exists idx_git_commits_snapshot;

create index idx_blocks_source_type on blocks using gin ((source -> 'type'));
create index idx_blocks_releases on blocks using gin (releases);
create index idx_blocks_annotations on blocks using gin (annotations);
create index idx_documents_blocks on documents using gin (blocks);
create index idx_git_commits_snapshot on git_commits using gin (snapshot);

-- ============================================================
-- updated_at trigger
-- ============================================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_projects_updated_at on projects;
drop trigger if exists update_documents_updated_at on documents;
drop trigger if exists update_blocks_updated_at on blocks;
drop trigger if exists update_sessions_updated_at on sessions;

create trigger update_projects_updated_at before update on projects
  for each row execute function update_updated_at_column();

create trigger update_documents_updated_at before update on documents
  for each row execute function update_updated_at_column();

create trigger update_blocks_updated_at before update on blocks
  for each row execute function update_updated_at_column();

create trigger update_sessions_updated_at before update on sessions
  for each row execute function update_updated_at_column();

do $$
begin
  raise notice 'BlockOS Supabase schema applied successfully.';
end $$;
