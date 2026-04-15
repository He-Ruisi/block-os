# OCR 插件故障排查指南

## 问题：CORS 错误持续出现

### 错误信息
```
Access to fetch at 'https://lao3t2m4beyceb6c.aistudio-app.com/layout-parsing' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

### 根本原因
即使代码中设置了代理路径，但 **localStorage 中可能保存了旧的 HTTPS URL 配置**，导致插件仍然使用旧配置。

---

## 解决方案（按顺序执行）

### 步骤 1: 清理 localStorage 中的旧配置

**方法 A：使用浏览器开发者工具**

1. 打开浏览器开发者工具（F12）
2. 切换到 **Console** 标签页
3. 执行以下命令：

```javascript
// 清理 OCR 插件的旧配置
localStorage.removeItem('plugin:ocr-plugin:apiUrl')
localStorage.removeItem('plugin:ocr-plugin:apiToken')

// 验证清理结果
console.log('Cleared OCR plugin config')
```

4. 刷新页面（F5）

**方法 B：使用 Application 面板**

1. 打开浏览器开发者工具（F12）
2. 切换到 **Application** 标签页
3. 左侧菜单选择 **Local Storage** → `http://localhost:5173`
4. 找到并删除以下键：
   - `plugin:ocr-plugin:apiUrl`
   - `plugin:ocr-plugin:apiToken`
5. 刷新页面（F5）

---

### 步骤 2: 重启开发服务器

**重要**：Vite 代理配置只在服务器启动时加载。

```bash
# 停止当前服务器（Ctrl+C）
# 然后重新启动
bun run dev
```

---

### 步骤 3: 验证配置

1. 打开浏览器开发者工具（F12）
2. 切换到 **Console** 标签页
3. 查找以下日志：

```
[OCRPlugin] Activated
[OCRPlugin] Current config: {
  apiUrl: "/api/ocr/layout-parsing",
  apiToken: "74fc1211d4..."
}
```

4. 确认 `apiUrl` 是 `/api/ocr/layout-parsing`（**不是** `https://...`）

---

### 步骤 4: 测试 OCR 识别

1. 打开 OCR 插件
2. 上传一张图片或拍照
3. 点击"识别文字"
4. 查看 Console 日志：

```
[OCRService] Calling API: /api/ocr/layout-parsing
[OCRService] Response status: 200
```

5. 如果看到 `Response status: 200`，说明成功！

---

## 常见问题

### Q1: 清理配置后仍然报错
**A**: 确保已经重启开发服务器。Vite 代理配置需要重启才能生效。

### Q2: Console 显示 apiUrl 仍然是 HTTPS URL
**A**: 
1. 再次清理 localStorage
2. 硬刷新页面（Ctrl+Shift+R 或 Cmd+Shift+R）
3. 如果还不行，关闭浏览器标签页，重新打开

### Q3: 代理配置正确，但请求仍然失败
**A**: 检查网络连接，确保可以访问 PaddleOCR 服务器：
```bash
curl -I https://lao3t2m4beyceb6c.aistudio-app.com/layout-parsing
```

### Q4: 在官网测试正常，但在本地失败
**A**: 这是正常的！官网可能：
- 使用了相同的域名（没有跨域问题）
- 服务器端配置了 CORS 白名单
- 使用了服务器端代理

本地开发环境必须使用 Vite 代理来避免 CORS 问题。

---

## 调试技巧

### 1. 查看网络请求

1. 打开开发者工具 → **Network** 标签页
2. 点击"识别文字"按钮
3. 查找 `layout-parsing` 请求
4. 检查请求 URL：
   - ✅ 正确：`http://localhost:5173/api/ocr/layout-parsing`
   - ❌ 错误：`https://lao3t2m4beyceb6c.aistudio-app.com/layout-parsing`

### 2. 查看请求头

在 Network 面板中点击请求，查看 **Headers** 标签页：
- **Request URL**: 应该是 `http://localhost:5173/api/ocr/...`
- **Request Method**: POST
- **Status Code**: 200（成功）

### 3. 查看响应

在 Network 面板中点击请求，查看 **Response** 标签页：
- 应该看到 JSON 格式的识别结果
- 包含 `result.layoutParsingResults` 字段

---

## 手动测试代理

在浏览器 Console 中执行：

```javascript
// 测试代理是否工作
fetch('/api/ocr/layout-parsing', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'token 74fc1211d4321e9438158dae3d22f8005fd5e4e2'
  },
  body: JSON.stringify({
    file: 'test',
    fileType: 1,
    useDocOrientationClassify: false,
    useDocUnwarping: false,
    useChartRecognition: false
  })
})
.then(r => console.log('Status:', r.status))
.catch(e => console.error('Error:', e))
```

如果看到 `Status: 200` 或其他非 CORS 错误，说明代理工作正常。

---

## 终极解决方案

如果以上方法都不行，执行以下步骤：

1. **完全清理浏览器缓存**：
   - Chrome: Ctrl+Shift+Delete → 清除所有数据
   - 或使用隐私模式（Ctrl+Shift+N）

2. **删除 node_modules 和重新安装**：
   ```bash
   rm -rf node_modules
   bun install
   ```

3. **重启开发服务器**：
   ```bash
   bun run dev
   ```

4. **使用新的浏览器标签页**打开应用

---

## 生产环境部署

在生产环境中，你需要：

1. **配置服务器端代理**（Nginx、Apache 等）
2. **或者联系 PaddleOCR 服务提供商**，请求添加你的域名到 CORS 白名单
3. **或者使用自己的 OCR 服务**

示例 Nginx 配置：

```nginx
location /api/ocr/ {
    proxy_pass https://lao3t2m4beyceb6c.aistudio-app.com/;
    proxy_set_header Host lao3t2m4beyceb6c.aistudio-app.com;
    proxy_set_header X-Real-IP $remote_addr;
}
```

---

**更新时间**：2026-04-15  
**版本**：v1.12.1
