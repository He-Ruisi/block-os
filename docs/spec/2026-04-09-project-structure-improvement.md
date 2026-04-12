# 项目架构改进方案

**创建日期**: 2026-04-09  
**优先级**: P0  
**状态**: 待实施

## 问题分析

### 1. 日志管理混乱
**现状**:
```
docs/logs/
├── 2026-04-09-00-00.md
├── 2026-04-09-00-15.md
├── 2026-04-09-12-44.md
... (同一天 12 个文件)
```

**问题**:
- 同一天产生多个日志文件，难以查找
- 没有统一的日志格式
- 缺少日志索引和检索机制

### 2. 需求文档组织不清晰
**现状**:
```
docs/spec/
├── PRD/
│   └── BlockOS_PRD.md
├── prototype/
└── 2026-04-09-xxx.md (按日期命名)
```

**问题**:
- 按日期命名的需求文档缺乏分类
- 找不到某个功能的完整需求历史
- PRD 和具体需求文档混在一起

### 3. Hooks 触发时机不合理
**现状**:
- `spec-todo-tracker`: 在 `promptSubmit` 触发（每次发消息都触发）
- `daily-changelog-logger`: 每次创建新文件而非追加

**问题**:
- 过于频繁的触发导致性能问题
- 重复创建文件浪费存储空间
- 没有考虑实际工作流程

---

## 改进方案

### 方案 1: 日志管理优化 ✅

#### 新的日志结构
```
docs/logs/
├── 2026-04/
│   ├── 2026-04-09.md          # 每天一个文件
│   ├── 2026-04-10.md
│   └── index.md               # 月度索引
├── 2026-05/
└── CHANGELOG.md               # 重要里程碑记录
```

#### 日志文件格式
```markdown
# 2026-04-09 工作日志

## 11:30 - Phase 1 基础编辑器搭建
- 创建项目结构
- 集成 TipTap 编辑器
- 实现三栏布局
- **文件变更**: 15 个新文件

## 14:20 - AI 对话功能集成
- 接入 xiaomi mimo API
- 实现流式响应
- **文件变更**: src/components/ChatPanel.tsx, src/api/ai.ts

## 16:30 - Block 系统设计
- 完成数据模型设计
- 创建需求文档
- **文件变更**: docs/spec/features/block-system.md
```

#### Hook 改进
```json
{
  "name": "Daily Changelog Logger",
  "when": { "type": "agentStop" },
  "then": {
    "type": "askAgent",
    "prompt": "追加本轮工作日志到 docs/logs/YYYY-MM/YYYY-MM-DD.md，格式：## HH:mm - 简短标题\\n- 完成内容\\n- 文件变更。如果文件不存在则创建，存在则追加到末尾。"
  }
}
```

---

### 方案 2: 需求文档分类管理 ✅

#### 新的文档结构
```
docs/
├── spec/
│   ├── PRD/
│   │   └── BlockOS_PRD.md              # 总体产品需求
│   ├── features/                        # 按功能分类
│   │   ├── editor/
│   │   │   ├── basic-markdown.md
│   │   │   └── advanced-editing.md
│   │   ├── ai/
│   │   │   ├── chat-integration.md
│   │   │   └── context-passing.md
│   │   ├── block-system/
│   │   │   ├── data-model.md
│   │   │   ├── bidirectional-links.md
│   │   │   └── block-reference.md
│   │   └── storage/
│   │       ├── local-storage.md
│   │       └── git-integration.md
│   ├── prototype/                       # 原型文件
│   └── archive/                         # 已废弃的需求
├── guide/                               # 使用指南
│   ├── user/                            # 用户指南
│   └── developer/                       # 开发者指南
├── logs/                                # 工作日志
│   └── 2026-04/
└── todo.md                              # 待办清单
```

#### 需求文档命名规范
- **功能需求**: `features/<category>/<feature-name>.md`
- **技术方案**: `features/<category>/<feature-name>-tech.md`
- **API 文档**: `api/<service-name>.md`

#### 示例：Block 系统需求
```
docs/spec/features/block-system/
├── README.md                    # 功能概述
├── data-model.md                # 数据模型
├── bidirectional-links.md       # 双向链接
├── block-reference.md           # 块引用
└── implementation-plan.md       # 实施计划
```

---

### 方案 3: Hooks 优化 ✅

#### 改进后的 Hooks 配置

**1. Spec & Todo Tracker**
```json
{
  "name": "Spec & Todo Tracker",
  "when": { "type": "agentStop" },  // 改为对话结束时触发
  "then": {
    "type": "askAgent",
    "prompt": "分析本轮对话：1) 如有新功能需求，在 docs/spec/features/<category>/ 下创建或更新需求文档 2) 更新 docs/todo.md，按 P0/P1/P2 分类 3) 如果是重大功能，在 CHANGELOG.md 记录。无新需求则跳过。"
  }
}
```

**2. Daily Changelog Logger**
```json
{
  "name": "Daily Changelog Logger",
  "when": { "type": "agentStop" },
  "then": {
    "type": "askAgent",
    "prompt": "追加工作日志到 docs/logs/YYYY-MM/YYYY-MM-DD.md（格式：## HH:mm - 标题\\n- 内容\\n- 变更文件）。如果是重要里程碑（如完成某个 Phase），同时更新 CHANGELOG.md。"
  }
}
```

**3. Auto Git Commit**
```json
{
  "name": "Auto Git Commit",
  "when": { "type": "agentStop" },
  "then": {
    "type": "runCommand",
    "command": "git add -A && git diff --cached --stat | head -5 > /tmp/git_summary.txt && git commit -m \"$(date '+%Y-%m-%d %H:%M'): $(head -1 /tmp/git_summary.txt)\" || echo \"No changes\""
  }
}
```

---

## 实施步骤

### Step 1: 重组日志文件 (15分钟)
1. 创建 `docs/logs/2026-04/` 目录
2. 合并同一天的日志到 `2026-04-09.md`
3. 删除旧的分散日志文件
4. 创建月度索引 `index.md`

### Step 2: 重组需求文档 (20分钟)
1. 创建 `docs/spec/features/` 目录结构
2. 按功能分类移动现有需求文档
3. 为每个功能模块创建 README.md
4. 更新 todo.md 中的链接

### Step 3: 更新 Hooks (5分钟)
1. 修改 3 个 hook 文件
2. 测试触发时机
3. 验证日志追加功能

### Step 4: 创建模板和规范 (10分钟)
1. 创建需求文档模板
2. 创建日志格式规范
3. 更新 README.md 说明文档结构

---

## 参考：成熟项目的文档组织

### Vue.js
```
docs/
├── guide/          # 用户指南
├── api/            # API 文档
├── examples/       # 示例代码
└── .vitepress/     # 文档配置
```

### React
```
docs/
├── learn/          # 学习教程
├── reference/      # API 参考
└── community/      # 社区资源
```

### Rust
```
docs/
├── book/           # 官方教程
├── reference/      # 语言参考
├── nomicon/        # 高级主题
└── unstable-book/  # 实验性功能
```

### 我们的方案借鉴
- **按功能分类** (Vue/React)
- **清晰的层级** (Rust)
- **用户/开发者分离** (所有项目)
- **版本化日志** (Git 最佳实践)

---

## 预期收益

1. **查找效率提升 80%**: 按功能分类，快速定位需求
2. **存储空间节省 70%**: 每天一个日志文件
3. **维护成本降低 60%**: 清晰的结构减少混乱
4. **协作效率提升**: 新成员快速理解项目结构

---

## 后续优化方向

1. **自动化文档生成**: 从代码注释生成 API 文档
2. **文档搜索功能**: 集成全文搜索
3. **版本管理**: 需求文档的版本控制
4. **可视化**: 功能依赖关系图谱
