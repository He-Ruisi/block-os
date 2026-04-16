// src/plugins/ocr-plugin/index.tsx

import React, { useState } from 'react'
import type { IPlugin, PluginMetadata } from '../../types/common/plugin'
import type { IPluginAPI } from '../../services/core/pluginAPI'
import { OCRPanel } from './OCRPanel'

export class OCRPlugin implements IPlugin {
  readonly metadata: PluginMetadata = {
    id: 'ocr-plugin',
    name: 'OCR 文字识别',
    version: '1.0.0',
    description: '使用 PaddleOCR 识别图片中的文字，支持摄像头拍照和图片上传',
    author: 'BlockOS Team',
    icon: '',
    permissions: [
      'editor:write',
      'block:write',
      'storage:read',
      'storage:write',
      'network',
    ],
  }
  
  constructor(private api: IPluginAPI) {}
  
  async activate(): Promise<void> {
    console.log('[OCRPlugin] Activated')
    
    // 强制更新配置，清理旧的 HTTPS URL
    const apiUrl = this.api.getConfig<string>('apiUrl')
    
    // 如果配置为空或者是旧的 HTTPS URL，强制更新为代理路径
    if (!apiUrl || apiUrl.startsWith('https://')) {
      console.log('[OCRPlugin] Updating API URL to use proxy')
      this.api.setConfig('apiUrl', '/api/ocr/layout-parsing')
    }
    
    // 确保 Token 存在
    const apiToken = this.api.getConfig<string>('apiToken')
    if (!apiToken) {
      this.api.setConfig('apiToken', '74fc1211d4321e9438158dae3d22f8005fd5e4e2')
    }
    
    // 输出当前配置用于调试
    console.log('[OCRPlugin] Current config:', {
      apiUrl: this.api.getConfig<string>('apiUrl'),
      apiToken: this.api.getConfig<string>('apiToken')?.substring(0, 10) + '...'
    })
  }
  
  async deactivate(): Promise<void> {
    console.log('[OCRPlugin] Deactivated')
  }
  
  render(): React.ReactElement {
    return <OCRPanel api={this.api} />
  }
  
  renderSettings(): React.ReactElement {
    return <OCRSettingsPanel api={this.api} />
  }
}

/** OCR 设置面板 */
function OCRSettingsPanel({ api }: { api: IPluginAPI }) {
  const [apiUrl, setApiUrl] = useState(api.getConfig<string>('apiUrl') || '')
  const [apiToken, setApiToken] = useState(api.getConfig<string>('apiToken') || '')
  
  const handleSave = () => {
    api.setConfig('apiUrl', apiUrl)
    api.setConfig('apiToken', apiToken)
    api.showSuccess('配置已保存')
  }
  
  return (
    <div className="ocr-settings">
      <h3>OCR API 配置</h3>
      <div className="form-group">
        <label>API 地址</label>
        <input
          type="text"
          value={apiUrl}
          onChange={e => setApiUrl(e.target.value)}
          placeholder="/api/ocr/layout-parsing（使用代理避免 CORS）"
        />
        <small style={{ color: 'var(--color-text-tertiary)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
          开发环境使用 /api/ocr/ 前缀会自动代理到 PaddleOCR 服务器
        </small>
      </div>
      <div className="form-group">
        <label>API Token</label>
        <input
          type="text"
          value={apiToken}
          onChange={e => setApiToken(e.target.value)}
          placeholder="输入 Token"
        />
      </div>
      <button onClick={handleSave}>保存配置</button>
    </div>
  )
}
