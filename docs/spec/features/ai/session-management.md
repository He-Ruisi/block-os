# AI Session 管理

**状态**: 待实现  
**优先级**: P1  
**日期**: 2026-04-10

## 概述

每次 AI 对话保存为一个 Session，支持多 Session 管理、历史回溯和 JSON 导出。

## 数据模型

```typescript
interface Session {
  id: string
  title: string          // 自动取第一条用户消息前 20 字
  date: string           // "2026-04-10"（创建日期）
  createdAt: Date
  updatedAt: Date
  systemPrompt: string   // 本次对话使用的系统提示词
  messages: Message[]    // 完整消息历史
}
```

## 存储

- IndexedDB `sessions` store（版本升级到 4）
- 索引：`date`（按日期查询）、`updatedAt`（排序）
- 支持导出为 JSON 文件（File System Access API 或 Blob 下载）

## UI 设计

### 对话标签页顶部操作栏
```
[对话] [Block空间] [文档结构] [Session]    [+] [📋] [⚙]
                                           新建  历史  设置
```

- `+` 按钮：保存当前 Session，新建空白 Session
- `📋` 按钮：展开 Session 历史侧边栏

### Session 历史列表
- 按日期分组（今天 / 昨天 / 更早）
- 每条显示：标题 + 时间 + 消息数
- 点击恢复对话（加载 messages 和 systemPrompt）
- 右键菜单：重命名、导出 JSON、删除

## 自动保存逻辑

1. 首次发送消息时创建 Session（title = 用户消息前 20 字）
2. 每次 AI 回复完成后更新 Session（追加消息，更新 updatedAt）
3. 切换/新建 Session 时保存当前 Session

## JSON 导出格式

```json
{
  "id": "xxx",
  "title": "关于 React 性能优化的...",
  "date": "2026-04-10",
  "createdAt": "2026-04-10T09:00:00Z",
  "systemPrompt": "你是MiMo...",
  "messages": [
    { "id": "...", "role": "user", "content": "..." },
    { "id": "...", "role": "assistant", "content": "..." }
  ]
}
```

## 实现步骤

1. `types/chat.ts` 添加 `Session` 接口
2. `storage/database.ts` 升级版本，添加 `sessions` store
3. `storage/sessionStore.ts` 实现 CRUD
4. `services/sessionService.ts` 实现自动保存逻辑
5. `hooks/useSession.ts` 封装 Session 状态管理
6. `RightPanel.tsx` 集成 Session UI
