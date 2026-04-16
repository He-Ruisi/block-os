# BlockOS 响应式测试指南

## 快速开始

### Windows 用户

双击运行 `test-responsive.bat` 或在命令行执行：

```bash
test-responsive.bat
```

### macOS/Linux 用户

在终端执行：

```bash
./test-responsive.sh
```

或手动启动：

```bash
bun run dev
```

## 测试文档

完整的测试文档位于 `docs/tests/` 目录：

- **[测试文档中心](docs/tests/README.md)** - 测试文档总入口
- **[开始响应式测试](docs/tests/start-responsive-test.md)** - 快速上手指南
- **[响应式测试矩阵](docs/tests/responsive-test-matrix.md)** - 完整测试矩阵
- **[响应式快速测试](docs/tests/responsive-quick-test.md)** - 5分钟快速验证
- **[响应式测试检查清单](docs/tests/responsive-checklist.md)** - 可打印的测试清单
- **[测试进度跟踪](docs/tests/test-progress.md)** - 实时测试进度

## 测试流程

1. **启动开发服务器**（1分钟）
   ```bash
   bun run dev
   ```

2. **浏览器模拟测试**（30分钟）
   - 打开 Chrome DevTools（F12）
   - 切换到设备模拟器（Ctrl+Shift+M）
   - 测试 iPad Pro / iPhone 14 Pro Max 等设备
   - 参考：[响应式快速测试](docs/tests/responsive-quick-test.md)

3. **真机测试**（1小时）
   - 确保电脑和移动设备在同一 WiFi
   - 在移动设备浏览器访问局域网地址（如 `http://192.168.1.100:5173`）
   - 参考：[响应式测试检查清单](docs/tests/responsive-checklist.md)

4. **自动化验证**（5分钟）
   - 打开浏览器控制台（F12）
   - 复制 `docs/tests/responsive-test-script.js` 内容并运行
   - 查看测试结果

5. **提交测试报告**（10分钟）
   - 填写 [测试报告模板](docs/tests/test-report-template.md)
   - 更新 [测试进度跟踪](docs/tests/test-progress.md)

## 测试重点

### P0 - 必测项（阻塞发布）

- ✅ AI 对话主路径（沉浸式模式 → 发送 → 写入编辑器）
- ✅ 布局响应式（桌面 / 平板 / 手机）
- ✅ 触摸交互（触摸目标 ≥ 44px，滑动手势）
- ✅ 数据持久化（刷新保持，关闭重开保持）

### P1 - 重要项（影响体验）

- 📝 项目和文档管理
- 📝 Block 捕获和搜索
- 📝 主题切换
- 📝 横竖屏切换

## 常见问题

### Q: 移动设备无法访问开发服务器？

**A**: 
1. 确保电脑和移动设备在同一 WiFi
2. 检查电脑防火墙是否阻止 5173 端口
3. 使用 Network 地址而不是 localhost
4. 尝试使用 ngrok：`ngrok http 5173`

### Q: 如何查看局域网地址？

**A**:
- Windows: `ipconfig`
- macOS/Linux: `ifconfig` 或 `hostname -I`
- 开发服务器启动时会显示 Network 地址

### Q: 触摸手势不响应？

**A**:
1. 确保在真机上测试（模拟器可能不支持）
2. 在 Safari 浏览器测试（iOS 推荐）
3. 检查浏览器是否支持 Touch Events

## 预计测试时间

- 浏览器模拟测试：30 分钟
- iPad 真机测试：30 分钟
- iPhone 真机测试：30 分钟
- 自动化验证：5 分钟
- 报告编写：10 分钟
- **总计：约 1.5 - 2 小时**

## 联系方式

如有问题，请查看：
- [测试文档中心](docs/tests/README.md)
- [项目架构文档](docs/ARCHITECTURE.md)
- [快速开始指南](docs/guide/QUICK_START.md)

---

**祝测试顺利！** 🚀
