# Phase 4: 本地存储与版本控制

## 优先级
P1 - 重要功能

## 目标
实现本地文件系统集成和 Git 版本控制。

## 功能需求

### 1. 文件系统读写
- 选择本地工作目录
- 读取 Markdown 文件
- 保存编辑内容
- 文件监听（外部修改同步）

### 2. Git 集成
- 自动提交变更
- 提交历史查看
- 版本回退
- 分支管理（可选）

### 3. Session 管理
- 工作区状态保存
- 打开的文件记录
- 编辑器状态恢复
- 多工作区支持

## 技术方案

### 文件系统 API
```typescript
interface FileSystem {
  selectDirectory(): Promise<string>
  readFile(path: string): Promise<string>
  writeFile(path: string, content: string): Promise<void>
  watchDirectory(path: string, onChange: () => void): void
}
```

### Git 操作
- 使用 `isomorphic-git` 库
- 或调用系统 Git 命令
- 自动提交策略配置

### Session 持久化
- LocalStorage 存储配置
- IndexedDB 存储大数据
- 启动时恢复状态

## 验收标准
- [ ] 可以选择并打开本地目录
- [ ] 文件修改自动保存
- [ ] Git 自动提交工作正常
- [ ] 重启后恢复工作状态

## 依赖
- Phase 3 Block 系统完成
- 文件系统权限处理
