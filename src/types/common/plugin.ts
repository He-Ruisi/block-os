// src/types/plugin.ts

import type React from 'react'

/** 插件元数据 */
export interface PluginMetadata {
  id: string                    // 插件唯一标识（kebab-case）
  name: string                  // 插件显示名称
  version: string               // 语义化版本号
  description: string           // 插件描述
  author: string                // 作者
  icon?: string                 // 图标（lucide-react 图标名或 emoji）
  permissions: PluginPermission[] // 所需权限列表
}

/** 插件权限类型 */
export type PluginPermission =
  | 'editor:read'       // 读取编辑器内容
  | 'editor:write'      // 写入编辑器内容
  | 'block:read'        // 读取 Block
  | 'block:write'       // 创建/修改 Block
  | 'storage:read'      // 读取插件配置
  | 'storage:write'     // 写入插件配置
  | 'network'           // 发起网络请求

/** 插件生命周期接口 */
export interface IPlugin {
  /** 插件元数据 */
  readonly metadata: PluginMetadata
  
  /** 激活插件（安装后调用） */
  activate(): Promise<void> | void
  
  /** 停用插件（卸载前调用） */
  deactivate(): Promise<void> | void
  
  /** 渲染插件 UI（返回 React 组件） */
  render(): React.ReactElement
  
  /** 获取插件配置界面（可选） */
  renderSettings?(): React.ReactElement
}

/** 插件状态 */
export type PluginStatus = 'installed' | 'active' | 'inactive' | 'error'

/** 插件注册表条目 */
export interface PluginRegistryEntry {
  metadata: PluginMetadata
  instance: IPlugin | null
  status: PluginStatus
  error?: string
  installedAt: Date
  lastActivatedAt?: Date
}
