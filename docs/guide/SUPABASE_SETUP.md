# Supabase 配置指南

## 1. 创建 Supabase 项目

1. 访问 https://supabase.com 并登录
2. 点击 "New Project"
3. 填写项目名称（如 `blockos`）
4. 设置数据库密码
5. 选择区域（推荐选择离你最近的）

## 2. 关闭邮箱验证（重要！）

1. 进入项目 → Authentication → Providers
2. 点击 Email
3. 关闭 "Confirm email" 开关
4. 保存

这样用户注册后可以直接登录，无需邮箱验证。

## 3. 创建数据库表

1. 进入项目 → SQL Editor
2. 复制 `supabase-schema.sql` 文件的全部内容
3. 粘贴到 SQL Editor 中
4. 点击 "Run" 执行

## 4. 配置环境变量

1. 进入项目 → Settings → API
2. 复制 "Project URL" 和 "anon public" key
3. 填入 `.env` 文件：

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 5. 启动开发服务器

```bash
cd block-os
bun run dev
```

## 6. 测试

1. 打开浏览器访问 http://localhost:5173
2. 应该看到登录/注册页面
3. 点击"注册"，输入用户名和密码
4. 注册成功后自动登录
5. 进入主界面

## 数据库表结构

### projects 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | text | 主键 |
| user_id | uuid | 用户 ID |
| name | text | 项目名称 |
| description | text | 项目描述 |
| documents | text[] | 文档 ID 列表 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

### documents 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | text | 主键 |
| user_id | uuid | 用户 ID |
| title | text | 文档标题 |
| content | text | 文档内容（JSON） |
| project_id | text | 所属项目 ID |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

### blocks 表（卡片）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | text | 主键 |
| user_id | uuid | 用户 ID |
| content | text | 内容 |
| type | text | 类型 |
| tags | text[] | 标签 |
| title | text | 标题 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

## RLS 策略

所有表都启用了 Row Level Security（RLS），用户只能访问自己的数据。

## 注意事项

- 用户名会被转换为 `username@blockos.local` 格式的伪邮箱
- 密码最少 6 个字符
- 用户名最少 3 个字符
- 数据同时存储在本地 IndexedDB 和 Supabase 云端
