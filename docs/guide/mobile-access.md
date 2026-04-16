# 手机访问 BlockOS 开发服务器

## 🎯 问题

手机无法访问 `http://localhost:5173`，因为 localhost 只能在本机访问。

## ✅ 解决方案

### 步骤 1：配置 Vite 允许局域网访问

已在 `vite.config.ts` 中添加：
```typescript
server: {
  host: '0.0.0.0', // 允许局域网访问
  port: 5173,
}
```

### 步骤 2：重启开发服务器

```bash
# 停止当前服务器（Ctrl+C）
# 重新启动
bun run dev
```

启动后，你会看到类似的输出：
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.2.101:5173/
```

### 步骤 3：获取局域网 IP 地址

**Windows**：
```bash
ipconfig
```
查找 "IPv4 地址"，通常是 `192.168.x.x` 或 `10.x.x.x`

**Mac/Linux**：
```bash
ifconfig | grep "inet "
```

**你的局域网 IP**：
- `192.168.2.101`（主要）
- `100.66.166.57`（可能是虚拟网卡）

### 步骤 4：在手机上访问

**确保手机和电脑在同一个 WiFi 网络**，然后在手机浏览器中访问：

```
http://192.168.2.101:5173
```

---

## 📱 手机访问注意事项

### 1. 摄像头权限

手机浏览器访问 HTTP 地址时，可能无法使用摄像头（需要 HTTPS）。

**解决方案**：
- 使用"上传图片"功能代替摄像头拍照
- 或者配置 HTTPS（见下文）

### 2. 防火墙设置

如果手机无法访问，检查电脑防火墙：

**Windows 防火墙**：
1. 打开"Windows 安全中心"
2. 选择"防火墙和网络保护"
3. 点击"允许应用通过防火墙"
4. 找到 Node.js 或 Bun，勾选"专用"和"公用"

**或者临时关闭防火墙测试**（不推荐长期使用）

### 3. 网络类型

确保电脑和手机连接的是**同一个 WiFi 网络**：
- 不能是访客网络（Guest Network）
- 不能是隔离的网络（AP Isolation）

---

## 🔒 配置 HTTPS（可选）

如果需要在手机上使用摄像头，需要配置 HTTPS。

### 方法 1：使用 mkcert（推荐）

1. **安装 mkcert**：
   ```bash
   # Windows (使用 Chocolatey)
   choco install mkcert
   
   # Mac
   brew install mkcert
   ```

2. **生成证书**：
   ```bash
   mkcert -install
   mkcert localhost 192.168.2.101
   ```

3. **配置 Vite**：
   ```typescript
   import { defineConfig } from 'vite'
   import fs from 'fs'
   
   export default defineConfig({
     server: {
       host: '0.0.0.0',
       port: 5173,
       https: {
         key: fs.readFileSync('./localhost+1-key.pem'),
         cert: fs.readFileSync('./localhost+1.pem'),
       },
     },
   })
   ```

4. **重启服务器**，访问：
   ```
   https://192.168.2.101:5173
   ```

### 方法 2：使用 ngrok（最简单）

1. **安装 ngrok**：
   - 访问 [ngrok.com](https://ngrok.com/)
   - 下载并注册账号

2. **启动隧道**：
   ```bash
   ngrok http 5173
   ```

3. **使用生成的 HTTPS URL**：
   ```
   https://xxxx-xx-xx-xx-xx.ngrok.io
   ```

---

## 🎨 响应式设计

BlockOS 已经适配了移动端：

- ✅ iPad 响应式布局
- ✅ 触摸手势支持
- ✅ 移动端导航栏
- ✅ 自适应字体和间距

在手机上访问时，界面会自动调整为移动端布局。

---

## 🐛 常见问题

### Q1: 手机显示"无法访问此网站"
**A**: 
1. 确认电脑和手机在同一 WiFi
2. 检查防火墙设置
3. 确认开发服务器正在运行
4. 尝试 ping 电脑 IP：`ping 192.168.2.101`

### Q2: 手机可以访问，但很慢
**A**: 
1. 检查 WiFi 信号强度
2. 关闭其他占用带宽的应用
3. 使用 5GHz WiFi（如果支持）

### Q3: 手机无法使用摄像头
**A**: 
1. 使用"上传图片"功能
2. 或配置 HTTPS（见上文）

### Q4: 手机访问后，电脑上的页面卡顿
**A**: 
1. 这是正常的，Vite 开发服务器会同时处理多个连接
2. 生产环境不会有这个问题

---

## 📝 快速参考

**你的访问地址**：
```
电脑：http://localhost:5173
手机：http://192.168.2.101:5173
```

**重启服务器**：
```bash
# Ctrl+C 停止
bun run dev
```

**查看 IP 地址**：
```bash
ipconfig  # Windows
ifconfig  # Mac/Linux
```

---

**更新时间**：2026-04-15  
**版本**：v1.12.3
