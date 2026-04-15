# OCR 插件使用指南

## 快速开始

### 1. 打开插件
1. 点击左侧 ActivityBar 的"插件"图标（🧩）
2. 在插件列表中找到"OCR 文字识别"
3. 点击"打开"按钮

### 2. 识别文字

#### 方式一：摄像头拍照
1. 点击"开启摄像头"按钮
2. 允许浏览器访问摄像头
3. 对准文字内容
4. 点击"拍照"按钮
5. 点击"识别文字"按钮

#### 方式二：上传图片
1. 点击"上传图片"按钮
2. 选择一张包含文字的图片
3. 点击"识别文字"按钮

### 3. 使用识别结果

识别完成后，你可以：
- **插入编辑器**：将识别的文字作为 SourceBlock 插入到当前文档
- **保存为 Block**：将识别结果保存为显式 Block，方便后续引用

---

## CORS 跨域问题解决方案

### 问题描述
在开发环境（localhost）访问 PaddleOCR API 时，可能会遇到 CORS 跨域错误：

```
Access to fetch at 'https://lao3t2m4beyceb6c.aistudio-app.com/layout-parsing' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

### 解决方案：使用 Vite 代理

项目已配置 Vite 代理，自动将 `/api/ocr/` 前缀的请求转发到 PaddleOCR 服务器。

**默认配置**：
- API 地址：`/api/ocr/layout-parsing`
- API Token：`74fc1211d4321e9438158dae3d22f8005fd5e4e2`

**工作原理**：
```
浏览器请求: http://localhost:5173/api/ocr/layout-parsing
    ↓ (Vite 代理转发)
实际请求: https://lao3t2m4beyceb6c.aistudio-app.com/layout-parsing
```

### 重要提示

⚠️ **修改 Vite 配置后需要重启开发服务器**

如果你修改了 `vite.config.ts` 中的代理配置，必须：
1. 停止当前开发服务器（Ctrl+C）
2. 重新启动：`bun run dev`

---

## 插件配置

### 修改 API 配置
1. 在插件列表中点击"设置"按钮（⚙️）
2. 修改 API 地址和 Token
3. 点击"保存配置"

### 配置说明

**API 地址**：
- 开发环境：使用 `/api/ocr/layout-parsing`（通过代理）
- 生产环境：使用完整 URL `https://...`（需要服务器支持 CORS）

**API Token**：
- 默认 Token 仅供测试使用
- 生产环境请使用自己的 Token

---

## 常见问题

### Q1: 识别失败，显示 CORS 错误
**A**: 确保使用代理路径 `/api/ocr/layout-parsing`，并重启开发服务器。

### Q2: 摄像头无法打开
**A**: 检查浏览器权限设置，确保允许访问摄像头。部分浏览器要求 HTTPS 才能访问摄像头。

### Q3: 识别速度慢
**A**: 识别速度取决于图片大小和网络状况。建议：
- 压缩图片到 1-3MB
- 使用清晰的图片
- 确保网络连接稳定

### Q4: 识别结果不准确
**A**: PaddleOCR 识别准确率受以下因素影响：
- 图片清晰度
- 文字大小和字体
- 背景复杂度
- 光照条件

建议使用清晰、对比度高的图片。

---

## 技术细节

### 代理配置（vite.config.ts）
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/ocr': {
        target: 'https://lao3t2m4beyceb6c.aistudio-app.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ocr/, ''),
        secure: false,
      },
    },
  },
})
```

### 配置持久化
插件配置保存在 localStorage 中：
- `plugin:ocr-plugin:apiUrl`
- `plugin:ocr-plugin:apiToken`

### 权限要求
OCR 插件需要以下权限：
- `editor:write` - 插入识别结果到编辑器
- `block:write` - 保存识别结果为 Block
- `storage:read` - 读取插件配置
- `storage:write` - 保存插件配置
- `network` - 调用 OCR API

---

**更新时间**：2026-04-15  
**版本**：v1.12.1
