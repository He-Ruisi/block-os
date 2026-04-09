---
inclusion: always
---

# Bun 包管理器默认配置

本项目使用 Bun 作为默认的包管理器和运行时环境。

## 包管理规则

- **安装依赖**: 使用 `bun install` 或 `bun add <package>` 安装包
- **移除依赖**: 使用 `bun remove <package>` 移除包
- **运行脚本**: 使用 `bun run <script>` 运行 package.json 中的脚本
- **执行文件**: 使用 `bun <file>` 直接运行 TypeScript/JavaScript 文件

## 类型检查

- 在进行代码修改后，使用 `bun run type-check` 或 `bun tsc --noEmit` 进行类型检查
- 确保所有 TypeScript 代码在提交前通过类型检查
- 如果项目中有 `tsconfig.json`，遵循其配置进行类型检查

## 开发工作流

1. 安装新包时，优先使用 `bun add <package>`
2. 代码修改后运行类型检查确保类型安全
3. 使用 `bun test` 运行测试（如果配置了测试）
4. 使用 `bun run dev` 启动开发服务器（如果配置了）

## Bun 路径

Bun 安装在: `~/.bun/bin/bun`

如果命令行中 `bun` 命令不可用，使用完整路径: `~/.bun/bin/bun`
