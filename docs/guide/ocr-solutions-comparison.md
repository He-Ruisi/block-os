# OCR 解决方案对比

## 问题背景

PaddleOCR API 返回 403 Forbidden 错误，可能的原因：
- Token 验证失败或过期
- 服务器限制访问来源
- 代理请求被检测

## 解决方案对比

### 方案 1：优化代理配置（已实施）

**状态**：✅ 已优化，需重启服务器测试

**优点**：
- 无需修改代码
- 保持原有 PaddleOCR 高准确率

**缺点**：
- 可能仍然被服务器拒绝
- 依赖第三方 API 稳定性

**操作**：
```bash
# 重启开发服务器
bun run dev
```

---

### 方案 2：Tesseract.js（纯前端）

**状态**：🆕 备用方案已准备

**优点**：
- ✅ 完全免费，无需 API Key
- ✅ 纯前端实现，无 CORS 问题
- ✅ 支持中文和英文
- ✅ 离线可用

**缺点**：
- ⚠️ 识别速度较慢（3-10 秒）
- ⚠️ 准确率略低于 PaddleOCR
- ⚠️ 首次加载需要下载语言包（~2MB）

**安装**：
```bash
bun add tesseract.js
```

**使用**：
```typescript
// 在 OCRPanel.tsx 中替换
import { recognizeTextWithTesseract } from './ocrService.tesseract'

// 替换原来的 recognizeText 调用
const text = await recognizeTextWithTesseract(capturedBase64)
```

---

### 方案 3：百度 OCR API

**状态**：需要注册账号

**优点**：
- ✅ 官方服务，稳定可靠
- ✅ 高准确率
- ✅ 每天免费额度（500 次）

**缺点**：
- ⚠️ 需要注册百度账号
- ⚠️ 需要实名认证
- ⚠️ 超出免费额度需付费

**步骤**：
1. 注册 [百度 AI 开放平台](https://ai.baidu.com/)
2. 创建应用，获取 API Key 和 Secret Key
3. 在插件设置中配置

---

### 方案 4：OCR.space API

**状态**：需要注册账号

**优点**：
- ✅ 免费额度（25,000 次/月）
- ✅ 无需实名认证
- ✅ 支持多种语言

**缺点**：
- ⚠️ 识别速度较慢
- ⚠️ 准确率一般

**步骤**：
1. 注册 [OCR.space](https://ocr.space/ocrapi)
2. 获取免费 API Key
3. 在插件设置中配置：
   - API 地址：`https://api.ocr.space/parse/image`
   - API Token：你的 API Key

---

## 推荐方案

### 场景 1：快速测试功能
**推荐**：Tesseract.js
- 无需注册，立即可用
- 适合开发和测试

### 场景 2：生产环境使用
**推荐**：百度 OCR API
- 高准确率，稳定可靠
- 免费额度足够个人使用

### 场景 3：离线使用
**推荐**：Tesseract.js
- 唯一支持离线的方案
- 适合内网环境

---

## 当前状态

1. **已优化代理配置**：添加了必要的请求头
2. **已准备备用方案**：Tesseract.js 实现
3. **需要你决定**：
   - 重启服务器测试优化后的代理
   - 或切换到 Tesseract.js
   - 或注册百度 OCR API

---

## 快速切换到 Tesseract.js

如果你想立即使用 Tesseract.js：

1. **安装依赖**：
   ```bash
   bun add tesseract.js
   ```

2. **修改 OCRPanel.tsx**：
   ```typescript
   // 在文件顶部添加导入
   import { recognizeTextWithTesseract } from './ocrService.tesseract'
   
   // 在 runOCR 函数中替换（约第 96 行）
   const text = await recognizeTextWithTesseract(capturedBase64)
   // 删除原来的 recognizeText 调用和 API 配置读取
   ```

3. **测试**：
   - 上传图片
   - 等待 3-10 秒
   - 查看识别结果

---

**更新时间**：2026-04-15  
**版本**：v1.12.2
