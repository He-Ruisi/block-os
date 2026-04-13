# Supabase 数据库迁移指南

## 概述

本文档说明如何将现有的 Supabase 数据库迁移到最新的 schema 结构。

## 迁移原因

随着 BlockOS 功能的演进，数据模型发生了以下重要变化：

### 1. Blocks 表增强
- **版本快照系统** (`releases`): 支持用户主动发布 Block 版本
- **附属层系统** (`annotations`): 支持翻译、解释、评论、脚注
- **样式层** (`style`): 支持自定义 Block 样式
- **模板层** (`template`): 支持 Block 结构角色和导出规则
- **编辑历史** (`edit_history`): 追踪 Block 修改记录
- **来源信息重构** (`source`): 从多个字段合并为 JSONB 对象

### 2. Documents 表增强
- **隐式 Block** (`blocks`): 存储文档中的段落级 Block

### 3. Block Usages 表（新增）
- 独立存储 Block 使用记录，不内嵌在 Block 中

## 迁移步骤

### 方案 A：全新安装（推荐）

如果你的数据库是空的或测试数据可以丢弃：

1. 在 Supabase SQL Editor 中执行 `supabase-schema.sql`
2. 完成！

### 方案 B：保留现有数据迁移

如果你有重要数据需要保留：

#### 步骤 1: 备份现有数据

```sql
-- 导出现有数据（在 Supabase SQL Editor 中执行）
COPY (SELECT * FROM projects) TO '/tmp/projects_backup.csv' CSV HEADER;
COPY (SELECT * FROM documents) TO '/tmp/documents_backup.csv' CSV HEADER;
COPY (SELECT * FROM blocks) TO '/tmp/blocks_backup.csv' CSV HEADER;
```

或使用 Supabase Dashboard 的导出功能。

#### 步骤 2: 添加新字段

```sql
-- Documents 表
ALTER TABLE documents ADD COLUMN IF NOT EXISTS blocks jsonb DEFAULT '[]'::jsonb;

-- Blocks 表
ALTER TABLE blocks ADD COLUMN IF NOT EXISTS source jsonb DEFAULT '{"type": "editor", "capturedAt": null}'::jsonb;
ALTER TABLE blocks ADD COLUMN IF NOT EXISTS edit_history jsonb DEFAULT '[]'::jsonb;
ALTER TABLE blocks ADD COLUMN IF NOT EXISTS style jsonb;
ALTER TABLE blocks ADD COLUMN IF NOT EXISTS template jsonb;
ALTER TABLE blocks ADD COLUMN IF NOT EXISTS releases jsonb DEFAULT '[]'::jsonb;
ALTER TABLE blocks ADD COLUMN IF NOT EXISTS annotations jsonb DEFAULT '{}'::jsonb;
ALTER TABLE blocks ADD COLUMN IF NOT EXISTS derived_from text;
ALTER TABLE blocks ADD COLUMN IF NOT EXISTS context_document_id text;
ALTER TABLE blocks ADD COLUMN IF NOT EXISTS context_title text;
ALTER TABLE blocks ADD COLUMN IF NOT EXISTS modifications text;
```

#### 步骤 3: 迁移旧数据到新结构

```sql
-- 迁移 Blocks 表的 source 字段
UPDATE blocks 
SET source = jsonb_build_object(
  'type', COALESCE(source_type, 'editor'),
  'documentId', source_document_id,
  'aiMessageId', source_ai_message_id,
  'capturedAt', COALESCE(captured_at, created_at)
)
WHERE source IS NULL OR source = '{}'::jsonb;
```

#### 步骤 4: 创建新表

```sql
-- 创建 block_usages 表
CREATE TABLE IF NOT EXISTS block_usages (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  block_id text not null,
  release_version integer not null,
  document_id text not null,
  document_title text not null,
  inserted_at timestamptz not null default now()
);

-- 启用 RLS
ALTER TABLE block_usages ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can view own block usages"
  ON block_usages FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own block usages"
  ON block_usages FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own block usages"
  ON block_usages FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own block usages"
  ON block_usages FOR DELETE USING (auth.uid() = user_id);
```

#### 步骤 5: 创建索引

```sql
-- 新增索引
CREATE INDEX IF NOT EXISTS idx_blocks_implicit ON blocks(implicit);
CREATE INDEX IF NOT EXISTS idx_blocks_source_block_id ON blocks(source_block_id);
CREATE INDEX IF NOT EXISTS idx_block_usages_user_id ON block_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_block_usages_block_id ON block_usages(block_id);
CREATE INDEX IF NOT EXISTS idx_block_usages_document_id ON block_usages(document_id);

-- JSONB 字段索引
CREATE INDEX IF NOT EXISTS idx_blocks_source_type ON blocks USING gin ((source -> 'type'));
CREATE INDEX IF NOT EXISTS idx_blocks_releases ON blocks USING gin (releases);
CREATE INDEX IF NOT EXISTS idx_blocks_annotations ON blocks USING gin (annotations);
CREATE INDEX IF NOT EXISTS idx_documents_blocks ON documents USING gin (blocks);
```

#### 步骤 6: 创建触发器

```sql
-- 自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blocks_updated_at BEFORE UPDATE ON blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 步骤 7: 清理旧字段（可选）

⚠️ **警告**: 只有在确认新字段工作正常后才执行此步骤！

```sql
-- 删除旧的 source 相关字段
ALTER TABLE blocks DROP COLUMN IF EXISTS source_type;
ALTER TABLE blocks DROP COLUMN IF EXISTS source_document_id;
ALTER TABLE blocks DROP COLUMN IF EXISTS source_ai_message_id;
ALTER TABLE blocks DROP COLUMN IF EXISTS captured_at;
```

## 验证迁移

执行以下查询验证迁移是否成功：

```sql
-- 检查 Blocks 表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'blocks'
ORDER BY ordinal_position;

-- 检查 source 字段是否正确迁移
SELECT id, source, created_at
FROM blocks
LIMIT 5;

-- 检查新表是否创建
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('projects', 'documents', 'blocks', 'block_usages');
```

## 同步服务更新

迁移完成后，确保本地代码的同步服务能够正确处理新字段：

1. 检查 `src/services/syncService.ts` 是否支持所有新字段
2. 测试上传和下载功能
3. 验证 JSONB 字段的序列化/反序列化

## 回滚方案

如果迁移出现问题，可以：

1. 从备份恢复数据
2. 或者删除新字段：

```sql
ALTER TABLE documents DROP COLUMN IF EXISTS blocks;
ALTER TABLE blocks DROP COLUMN IF EXISTS source;
ALTER TABLE blocks DROP COLUMN IF EXISTS edit_history;
ALTER TABLE blocks DROP COLUMN IF EXISTS style;
ALTER TABLE blocks DROP COLUMN IF EXISTS template;
ALTER TABLE blocks DROP COLUMN IF EXISTS releases;
ALTER TABLE blocks DROP COLUMN IF EXISTS annotations;
DROP TABLE IF EXISTS block_usages;
```

## 常见问题

### Q: 迁移会影响现有数据吗？
A: 不会。新字段都有默认值，旧数据保持不变。

### Q: 需要停机吗？
A: 不需要。可以在线执行迁移。

### Q: 迁移需要多长时间？
A: 取决于数据量。通常几秒到几分钟。

### Q: 如何验证迁移成功？
A: 执行"验证迁移"部分的 SQL 查询，检查字段和数据。

## 技术支持

如果遇到问题，请查看：
- [Supabase 设置指南](./SUPABASE_SETUP.md)
- [架构文档](../ARCHITECTURE.md)
- [GitHub Issues](https://github.com/your-repo/issues)

---

**最后更新**: 2026-04-13  
**Schema 版本**: v2.0
