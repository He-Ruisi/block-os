# Fix Skill 快速参考

## 🚀 快速使用

### 激活 Fix Skill
```
#fix [描述问题]
```

或直接说：
```
我遇到了一个 bug：[详细描述]
```

## 📋 工作流程

```
1. 扫描 bugs.md 查找相似问题 🔍
   ↓
2. 诊断问题（收集信息、定位源头）🔬
   ↓
3. 实施修复（改代码、类型检查）🔧
   ↓
4. 记录到 bugs.md（≤ 400 字）📝
   ↓
5. 验证和报告 ✅
```

## 📝 Bug 报告模板

```markdown
我遇到了一个 bug：

错误信息：
[完整的错误信息]

触发条件：
1. [步骤 1]
2. [步骤 2]
3. [步骤 3]

环境：
- 浏览器：[Chrome/Safari/Firefox]
- 系统：[macOS/Windows/Linux]
- 模式：[开发/生产]

期望行为：
[应该怎样]

实际行为：
[实际怎样]
```

## 📄 bugs.md 记录格式

```markdown
## #序号 - 简短标题 (YYYY-MM-DD) 🔴/🟡/🟢

**问题描述**:
- 现象：[错误或异常行为]
- 触发：[什么操作导致]
- 影响：[哪些功能受影响]

**根本原因**:
[1-2 句话说清楚]

**解决方案**:
- 修改文件：[路径]
- 核心改动：[关键变更]
- 预防措施：[如何避免]

**相关问题**: [#序号]

---
```

## 🎯 严重程度

- 🔴 **严重**：功能完全不可用
- 🟡 **中等**：影响部分功能
- 🟢 **轻微**：小问题或优化

## 🔍 查找相似问题

```bash
# 搜索关键词
grep -i "关键词" block-os/docs/bugs.md

# 查看最近 bug
tail -50 block-os/docs/bugs.md
```

## ✅ 验证清单

- [ ] 问题已修复
- [ ] 类型检查通过（`bun run type-check`）
- [ ] 没有引入新问题
- [ ] 已记录到 bugs.md
- [ ] 记录字数 ≤ 400 字

## 💡 字数控制技巧

### ✅ 好的写法（简洁）
```
useEditor hook 返回 null 导致初始化失败。
```

### ❌ 不好的写法（冗余）
```
当用户打开应用程序的时候，编辑器组件没有正确地初始化，
这是因为 React 的 useEditor hook 在某些情况下会返回 null...
```

## 📚 相关文档

- **详细指南**: [docs/guide/developer/bug-fixing-guide.md](./guide/developer/bug-fixing-guide.md)
- **Skill 配置**: [.kiro/skills/fix.md](../.kiro/skills/fix.md)
- **Bug 记录**: [docs/bugs.md](./bugs.md)

## 🎓 最佳实践

1. **修复前先查找** - 避免重复劳动
2. **记录要及时** - 修复后立即记录
3. **格式要统一** - 便于查找维护
4. **信息要准确** - 确保技术描述正确
5. **字数要控制** - 保持简洁 ≤ 400 字

## 📞 示例对话

```
用户：我遇到了一个 bug，编辑器打不开，控制台显示 
     "Cannot read property 'schema' of null"

AI：收到！我会使用 Fix Skill 来处理这个问题。

    1. 先扫描 bugs.md 查找相似问题...
    2. 定位错误源头...
    3. 实施修复...
    4. 记录到 bugs.md...
    
    ✅ Bug 已修复！
    
    问题：TipTap 编辑器初始化失败
    原因：useEditor hook 返回 null
    修复：添加空值检查
    
    已记录到 bugs.md (#001)
```

---

**快速访问**: 
- 打开 bugs.md: `code block-os/docs/bugs.md`
- 激活 Fix Skill: `#fix [问题描述]`
- 类型检查: `bun run type-check`
