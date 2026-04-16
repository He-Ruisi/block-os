# OCR 插件 403 Forbidden 错误解决方案

## 🚨 问题描述

```
POST http://localhost:5173/api/ocr/layout-parsing net::ERR_ABORTED 403 (Forbidden)
```

## 🔍 问题原因

403 错误表示服务器拒绝了请求，可能的原因：

1. **Token 验证失败**：API Token 无效或过期
2. **请求头缺失**：服务器要求特定的请求头
3. **IP 限制**：服务器限制了访问来源
4. **代理被检测**：服务器检测到请求来自代理

## ✅ 解决方案

### 方案 1：使用官方 API（推荐）

如果你有自己的 PaddleOCR API 账号：

1. 登录 [百度 AI 开放平台](https://ai.baidu.com/)
2. 创建应用，获取 API Key 和 Secret Key
3. 在 OCR 插件设置中配置你的 API 地址和 Token

### 方案 2：使用备用 OCR 服务

可以使用其他免费的 OCR API：

#### Tesseract.js（纯前端，无需后端）

1. 安装依赖：
   ```bash
   bun add tesseract.js
   ```

2. 修改 `src/plugins/ocr-plugin/ocrService.ts`：
   ```typescript
   import Tesseract from 'tesseract.js'
   
   export async function recognizeText(
     base64Image: string,
     apiUrl: string,
     apiToken: string
   ): Promise<string> {
     try {
       const { data: { text } } = await Tesseract.recognize(
         `data:image/jpeg;base64,${base64Image}`,
         'chi_sim+eng', // 中文简体 + 英文
         {
           logger: m => console.log(m)
         }
       )
       return text || '（未识别到文字内容）'
     } catch (error) {
       throw new Error(`识别失败：${(error as Error).message}`)
     }
   }
   ```

#### OCR.space API（免费额度）

1. 注册 [OCR.space](https://ocr.space/ocrapi)，获取免费 API Key
2. 在插件设置中配置：
   - API 地址：`https://api.ocr.space/parse/image`
   - API Token：你的 API Key

### 方案 3：临时禁用 OCR 功能

如果暂时不需要 OCR 功能，可以：

1. 在插件列表中卸载 OCR 插件
2. 或者在 `src/App.tsx` 中注释掉插件注册：
   ```typescript
   // pluginRegistry.registerPlugin(OCRPlugin)
   ```

### 方案 4：检查网络和 Token

1. **验证 Token 是否有效**：
   ```bash
   curl -X POST https://lao3t2m4beyceb6c.aistudio-app.com/layout-parsing \
     -H "Content-Type: application/json" \
     -H "Authorization: token 74fc1211d4321e9438158dae3d22f8005fd5e4e2" \
     -d '{"file":"test","fileType":1,"useDocOrientationClassify":false,"useDocUnwarping":false,"useChartRecognition":false}'
   ```

2. **检查是否需要 VPN**：某些 API 可能有地区限制

3. **联系 API 提供商**：确认 Token 是否过期或被限制

---

## 🔧 已实施的优化

我已经优化了 Vite 代理配置，添加了必要的请求头：

- `User-Agent`: 模拟真实浏览器
- `Origin` 和 `Referer`: 设置为目标服务器域名
- `Accept` 和 `Accept-Language`: 标准请求头

**重启开发服务器以应用新配置**：

```bash
# Ctrl+C 停止
bun run dev
```

---

## 📝 关于 IndexedDB Lock 错误

```
Uncaught (in promise) AbortError: Lock broken by another request with the 'steal' option.
```

这个错误不影响 OCR 功能，是自动同步服务的并发问题。解决方法：

1. **关闭其他标签页**：只保留一个 BlockOS 标签页
2. **清理浏览器缓存**：Ctrl+Shift+Delete
3. **重启浏览器**

---

## 🎯 推荐方案

如果你只是想测试 OCR 功能，我推荐使用 **Tesseract.js**：

**优点**：
- ✅ 完全免费，无需 API Key
- ✅ 纯前端实现，无需后端
- ✅ 支持中文和英文
- ✅ 无 CORS 问题

**缺点**：
- ⚠️ 识别速度较慢（3-10 秒）
- ⚠️ 准确率略低于 PaddleOCR

---

## 📞 需要帮助？

如果以上方案都不行，请提供以下信息：

1. 浏览器 Console 的完整错误日志
2. Network 面板中的请求详情（Headers、Response）
3. 你的网络环境（是否使用 VPN、代理等）

---

**更新时间**：2026-04-15  
**版本**：v1.12.2
