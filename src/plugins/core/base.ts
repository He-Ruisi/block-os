/**
 * 插件基类（可选）
 * 
 * 提供插件的默认实现，简化插件开发
 * 
 * 使用示例：
 * ```typescript
 * export class MyPlugin extends BasePlugin {
 *   constructor() {
 *     super({
 *       id: 'my-plugin',
 *       name: '我的插件',
 *       version: '1.0.0',
 *       description: '插件描述',
 *       author: '作者',
 *       permissions: ['editor:read'],
 *     })
 *   }
 * 
 *   async activate() {
 *     // 初始化逻辑
 *   }
 * 
 *   render() {
 *     return <div>插件 UI</div>
 *   }
 * }
 * ```
 */

import type React from 'react'
import type { IPlugin, PluginMetadata } from './types'

export abstract class BasePlugin implements IPlugin {
  readonly metadata: PluginMetadata

  constructor(metadata: PluginMetadata) {
    this.metadata = metadata
  }

  /**
   * 激活插件（默认实现为空）
   * 子类可以重写此方法以添加初始化逻辑
   */
  async activate(): Promise<void> {
    // 默认实现为空
  }

  /**
   * 停用插件（默认实现为空）
   * 子类可以重写此方法以添加清理逻辑
   */
  async deactivate(): Promise<void> {
    // 默认实现为空
  }

  /**
   * 渲染插件 UI（必须由子类实现）
   */
  abstract render(): React.ReactElement

  /**
   * 渲染插件配置界面（可选）
   * 子类可以重写此方法以提供配置界面
   */
  renderSettings?(): React.ReactElement
}
