-- BlockOS Supabase 数据库建表脚本
-- 在 Supabase SQL Editor 中执行此脚本
-- 最后更新: 2026-04-13
-- 
-- 注意：此脚本可以安全地重复执行（幂等性）

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

-- 删除旧策略（如果存在）
drop policy if exists "Users can view own projects" on projects;
drop policy if exists "Users can insert own projects" on projects;
drop policy if exists "Users can update own projects" on projects;
drop policy if exists "Users can delete own projects" on projects;

-- 创建新策略
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

-- 添加新字段（如果不存在）
do $$ 
begin
  if not exists (select 1 from information_schema.columns 
                 where table_name='documents' and column_name='blocks') then
    alter table documents add column blocks jsonb default '[]'::jsonb;
  end if;
end $$;

alter table documents enable row level security;

-- 删除旧策略
drop policy if exists "Users can view own documents" on documents;
drop policy if exists "Users can insert own documents" on documents;
drop policy if exists "Users can update own documents" on documents;
drop policy if exists "Users can delete own documents" on documents;

-- 创建新策略
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
  source_block_id text
);

-- 添加新字段（如果不存在）
do $$ 
begin
  -- 来源信息 (BlockSource)
  if not exists (select 1 from information_schema.columns 
                 where table_name='blocks' and column_name='source') then
    alter table blocks add column source jsonb default '{"type": "editor", "capturedAt": null}'::jsonb;
  end if;
  
  -- 编辑历史
  if not exists (select 1 from information_schema.columns 
                 where table_name='blocks' and column_name='edit_history') then
    alter table blocks add column edit_history jsonb default '[]'::jsonb;
  end if;
  
  -- 样式层
  if not exists (select 1 from information_schema.columns 
                 where table_name='blocks' and column_name='style') then
    alter table blocks add column style jsonb;
  end if;
  
  -- 模板层
  if not exists (select 1 from information_schema.columns 
                 where table_name='blocks' and column_name='template') then
    alter table blocks add column template jsonb;
  end if;
  
  -- 版本快照
  if not exists (select 1 from information_schema.columns 
                 where table_name='blocks' and column_name='releases') then
    alter table blocks add column releases jsonb default '[]'::jsonb;
  end if;
  
  -- 附属层
  if not exists (select 1 from information_schema.columns 
                 where table_name='blocks' and column_name='annotations') then
    alter table blocks add column annotations jsonb default '{}'::jsonb;
  end if;
  
  -- 派生字段
  if not exists (select 1 from information_schema.columns 
                 where table_name='blocks' and column_name='derived_from') then
    alter table blocks add column derived_from text;
  end if;
  
  if not exists (select 1 from information_schema.columns 
                 where table_name='blocks' and column_name='context_document_id') then
    alter table blocks add column context_document_id text;
  end if;
  
  if not exists (select 1 from information_schema.columns 
                 where table_name='blocks' and column_name='context_title') then
    alter table blocks add column context_title text;
  end if;
  
  if not exists (select 1 from information_schema.columns 
                 where table_name='blocks' and column_name='modifications') then
    alter table blocks add column modifications text;
  end if;
end $$;

alter table blocks enable row level security;

-- 删除旧策略
drop policy if exists "Users can view own blocks" on blocks;
drop policy if exists "Users can insert own blocks" on blocks;
drop policy if exists "Users can update own blocks" on blocks;
drop policy if exists "Users can delete own blocks" on blocks;

-- 创建新策略
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

-- 删除旧策略
drop policy if exists "Users can view own block usages" on block_usages;
drop policy if exists "Users can insert own block usages" on block_usages;
drop policy if exists "Users can update own block usages" on block_usages;
drop policy if exists "Users can delete own block usages" on block_usages;

-- 创建新策略
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
drop index if exists idx_blocks_source_type;
drop index if exists idx_blocks_releases;
drop index if exists idx_blocks_annotations;
drop index if exists idx_documents_blocks;

create index idx_blocks_source_type on blocks using gin ((source -> 'type'));
create index idx_blocks_releases on blocks using gin (releases);
create index idx_blocks_annotations on blocks using gin (annotations);
create index idx_documents_blocks on documents using gin (blocks);

-- ============ 更新时间触发器 ============
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 删除旧触发器（如果存在）
drop trigger if exists update_projects_updated_at on projects;
drop trigger if exists update_documents_updated_at on documents;
drop trigger if exists update_blocks_updated_at on blocks;

-- 创建新触发器
create trigger update_projects_updated_at before update on projects
  for each row execute function update_updated_at_column();

create trigger update_documents_updated_at before update on documents
  for each row execute function update_updated_at_column();

create trigger update_blocks_updated_at before update on blocks
  for each row execute function update_updated_at_column();

-- ============ 数据迁移（如果有旧字段） ============
-- 迁移旧的 source 字段到新的 jsonb 结构
do $$
begin
  -- 检查是否存在旧字段
  if exists (select 1 from information_schema.columns 
             where table_name='blocks' and column_name='source_type') then
    
    -- 迁移数据
    update blocks 
    set source = jsonb_build_object(
      'type', coalesce(source_type, 'editor'),
      'documentId', source_document_id,
      'aiMessageId', source_ai_message_id,
      'capturedAt', coalesce(captured_at, created_at)
    )
    where source is null or source = '{}'::jsonb or source = '{"type": "editor", "capturedAt": null}'::jsonb;
    
    -- 删除旧字段（可选，谨慎操作）
    -- alter table blocks drop column if exists source_type;
    -- alter table blocks drop column if exists source_document_id;
    -- alter table blocks drop column if exists source_ai_message_id;
    -- alter table blocks drop column if exists captured_at;
  end if;
end $$;

-- 完成提示
do $$
begin
  raise notice 'BlockOS Schema v2.0 migration completed successfully!';
end $$;
