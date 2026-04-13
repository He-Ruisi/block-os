-- BlockOS Supabase 数据库建表脚本
-- 在 Supabase SQL Editor 中执行此脚本
-- 最后更新: 2026-04-13

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
  blocks jsonb default '[]'::jsonb,  -- DocumentBlock[] 文档中的隐式 Block
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
  
  -- 内容
  content text not null,
  type text not null default 'text',
  implicit boolean default false,
  
  -- 来源信息 (BlockSource)
  source jsonb not null default '{
    "type": "editor",
    "capturedAt": null
  }'::jsonb,
  
  -- 编辑历史 (BlockEditRecord[])
  edit_history jsonb default '[]'::jsonb,
  
  -- 样式层 (BlockStyle, 可选)
  style jsonb,
  
  -- 模板层 (BlockTemplate, 可选)
  template jsonb,
  
  -- 元数据
  title text,
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- 关系
  outgoing_links text[] default '{}',
  incoming_links text[] default '{}',
  
  -- 版本派生
  is_derivative boolean default false,
  source_block_id text,
  derived_from text,
  context_document_id text,
  context_title text,
  modifications text,
  
  -- 版本快照 (BlockRelease[])
  releases jsonb default '[]'::jsonb,
  
  -- 附属层 (BlockAnnotations)
  annotations jsonb default '{}'::jsonb
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

-- ============ Block Usages 表（独立存储） ============
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

create policy "Users can view own block usages"
  on block_usages for select using (auth.uid() = user_id);

create policy "Users can insert own block usages"
  on block_usages for insert with check (auth.uid() = user_id);

create policy "Users can update own block usages"
  on block_usages for update using (auth.uid() = user_id);

create policy "Users can delete own block usages"
  on block_usages for delete using (auth.uid() = user_id);

-- ============ 索引 ============
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

-- ============ JSONB 字段索引（提升查询性能） ============
create index if not exists idx_blocks_source_type on blocks using gin ((source -> 'type'));
create index if not exists idx_blocks_releases on blocks using gin (releases);
create index if not exists idx_blocks_annotations on blocks using gin (annotations);
create index if not exists idx_documents_blocks on documents using gin (blocks);

-- ============ 更新时间触发器 ============
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_projects_updated_at before update on projects
  for each row execute function update_updated_at_column();

create trigger update_documents_updated_at before update on documents
  for each row execute function update_updated_at_column();

create trigger update_blocks_updated_at before update on blocks
  for each row execute function update_updated_at_column();

-- ============ 数据迁移说明 ============
-- 如果已有旧数据，需要执行以下迁移：
--
-- 1. 添加新字段（如果表已存在）:
-- ALTER TABLE documents ADD COLUMN IF NOT EXISTS blocks jsonb DEFAULT '[]'::jsonb;
-- ALTER TABLE blocks ADD COLUMN IF NOT EXISTS source jsonb DEFAULT '{"type": "editor", "capturedAt": null}'::jsonb;
-- ALTER TABLE blocks ADD COLUMN IF NOT EXISTS edit_history jsonb DEFAULT '[]'::jsonb;
-- ALTER TABLE blocks ADD COLUMN IF NOT EXISTS style jsonb;
-- ALTER TABLE blocks ADD COLUMN IF NOT EXISTS template jsonb;
-- ALTER TABLE blocks ADD COLUMN IF NOT EXISTS releases jsonb DEFAULT '[]'::jsonb;
-- ALTER TABLE blocks ADD COLUMN IF NOT EXISTS annotations jsonb DEFAULT '{}'::jsonb;
--
-- 2. 迁移旧的 source 字段到新的 jsonb 结构:
-- UPDATE blocks SET source = jsonb_build_object(
--   'type', source_type,
--   'documentId', source_document_id,
--   'aiMessageId', source_ai_message_id,
--   'capturedAt', captured_at
-- ) WHERE source IS NULL OR source = '{}'::jsonb;
--
-- 3. 删除旧字段（可选，谨慎操作）:
-- ALTER TABLE blocks DROP COLUMN IF EXISTS source_type;
-- ALTER TABLE blocks DROP COLUMN IF EXISTS source_document_id;
-- ALTER TABLE blocks DROP COLUMN IF EXISTS source_ai_message_id;
-- ALTER TABLE blocks DROP COLUMN IF EXISTS captured_at;
