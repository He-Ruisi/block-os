# 启动开发服务器

## 快速启动

```bash
cd block-os
~/.bun/bin/bun run dev
```

## 访问地址

- **本地**: http://localhost:5173/
- **网络**: 使用 `--host` 参数暴露

## 常见问题

### Q: 为什么显示 "command not found"？

**原因**: Bun 没有添加到系统 PATH

**解决方案**:
1. 使用完整路径: `~/.bun/bin/bun run dev`
2. 或添加到 PATH:
   ```bash
   export PATH="$HOME/.bun/bin:$PATH"
   ```

### Q: 如何停止服务器？

- 按 `Ctrl + C`
- 或按 `q + Enter`

## 其他命令

```bash
# 类型检查
~/.bun/bin/bun run type-check

# 构建生产版本
~/.bun/bin/bun run build

# 预览生产版本
~/.bun/bin/bun run preview
```

## 开发服务器快捷键

- `h + Enter` - 显示帮助
- `r + Enter` - 重启服务器
- `u + Enter` - 显示 URL
- `o + Enter` - 在浏览器中打开
- `q + Enter` - 退出服务器

---

**Vite 版本**: 6.4.2  
**默认端口**: 5173
