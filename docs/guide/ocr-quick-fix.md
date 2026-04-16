# OCR 插件 CORS 问题快速修复

## 🚨 如果你看到这个错误：

```
Access to fetch at 'https://lao3t2m4beyceb6c.aistudio-app.com/layout-parsing' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

## ⚡ 快速修复（3 步）

### 方法 1：自动修复（最简单）

1. **刷新页面**（F5）
2. 打开浏览器 Console（F12）
3. 查看是否有这条日志：
   ```
   [OCRPlugin] Updating API URL to use proxy
   ```
   
如果看到这条日志，说明已自动修复！✅

---

### 方法 2：手动清理（最快速）

1. 打开浏览器 Console（F12）
2. 粘贴并执行：
   ```javascript
   localStorage.removeItem('plugin:ocr-plugin:apiUrl')
   localStorage.removeItem('plugin:ocr-plugin:apiToken')
   location.reload()
   ```

---

### 方法 3：使用清理工具（最直观）

1. 在浏览器中打开：
   ```
   http://localhost:5173/scripts/clear-ocr-config.html
   ```
2. 点击"清理配置"按钮
3. 刷新 BlockOS 应用页面

---

## ✅ 验证修复

打开 OCR 插件 → 识别图片 → 查看 Console：

```
[OCRService] Calling API: /api/ocr/layout-parsing  ← 正确！
[OCRService] Response status: 200  ← 成功！
```

---

## ❓ 还是不行？

查看完整故障排查指南：[ocr-plugin-troubleshooting.md](./ocr-plugin-troubleshooting.md)

---

**更新时间**：2026-04-15  
**版本**：v1.12.2
