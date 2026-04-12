-- BlockOS Supabase 数据库建表脚本
-- 在 Supabase SQL Editor 中执行此脚本

-- ============ Projects 表 ============
create table if not exists projects (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  documents text[] default '{}',
  color text,
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS 策略：用户只能访问自己的项目
alter table projects enable row level security;

create policy "Users can view own projects"
  on projects for select using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on projects for insert with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on projects for update using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on projects for delete using (auth.uid() = user_id);

-- ============ Documents 表 ============
create table if not exists documents (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '无标题文档',
  content text default '',
  project_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table documents enable row level security;

create policy "Users can view own documents"
  on documents for select using (auth.uid() = user_id);

create policy "Users can insert own documents"
  on documents for insert with check (auth.uid() = user_id);

create policy "Users can update own documents"
  on documents for update using (auth.uid() = user_id);

create policy "Users can delete own documents"
  on documents for delete using (auth.uid() = user_id);

-- ============ Blocks 表（卡片） ============
create table if not exists blocks (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  type text not null default 'text',
  implicit boolean default false,
  source_type text not null default 'editor',
  source_document_id text,
  source_ai_message_id text,
  captured_at timestamptz not null default now(),
  title text,
  tags text[] default '{}',
  outgoing_links text[] default '{}',
  incoming_links text[] default '{}',
  is_derivative boolean default false,
  source_block_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table blocks enable row level security;

create policy "Users can view own blocks"
  on blocks for select using (auth.uid() = user_id);

create policy "Users can insert own blocks"
  on blocks for insert with check (auth.uid() = user_id);

create policy "Users can update own blocks"
  on blocks for update using (auth.uid() = user_id);

create policy "Users can delete own blocks"
  on blocks for delete using (auth.uid() = user_id);

-- ============ 索引 ============
create index if not exists idx_projects_user_id on projects(user_id);
create index if not exists idx_documents_user_id on documents(user_id);
create index if not exists idx_documents_project_id on documents(project_id);
create index if not exists idx_blocks_user_id on blocks(user_id);
create index if not exists idx_blocks_type on blocks(type);
