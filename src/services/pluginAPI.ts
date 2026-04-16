// src/services/pluginAPI.ts

import type { Editor as TiptapEditor } from '@tiptap/react'
import type { Block } from '../types/block'
import type { PluginPermission } from '../types/plugin'

/** 插件 API 上下文 */
export interface PluginAPIContext {
  /** 插件 ID */
  pluginId: string
  /** 插件权限列表 */
  permissions: PluginPermission[]
}

/** 插件 API 接口 */
export interface IPluginAPI {
  // ---- 编辑器操作 ----
  
  /** 获取当前编辑器实例（需要 editor:read 权限） */
  getEditor(): TiptapEditor | null
  
  /** 在光标位置插入文本（需要 editor:write 权限） */
  insertToEditor(content: string): Promise<void>
  
  /** 在光标位置插入 SourceBlock（需要 editor:write 权限） */
  insertSourceBlock(content: string, source: 'ai' | 'inspiration' | 'import', label: string): Promise<void>
  
  /** 获取当前选中的文本（需要 editor:read 权限） */
  getSelectedText(): string | null
  
  // ---- Block 操作 ----
  
  /** 保存为显式 Block（需要 block:write 权限） */
  saveAsBlock(content: string, metadata: {
    title?: string
    tags?: string[]
    source?: { type: 'editor' | 'ai' | 'import'; documentId?: string }
  }): Promise<Block>
  
  /** 搜索 Block（需要 block:read 权限） */
  searchBlocks(query: string): Promise<Block[]>
  
  /** 获取 Block 详情（需要 block:read 权限） */
  getBlock(blockId: string): Promise<Block | null>
  
  // ---- 配置存储 ----
  
  /** 读取插件配置（需要 storage:read 权限） */
  getConfig<T = unknown>(key: string): T | null
  
  /** 保存插件配置（需要 storage:write 权限） */
  setConfig<T = unknown>(key: string, value: T): void
  
  /** 删除插件配置（需要 storage:write 权限） */
  removeConfig(key: string): void
  
  // ---- 通知 ----
  
  /** 显示成功提示 */
  showSuccess(message: string): void
  
  /** 显示错误提示 */
  showError(message: string): void
  
  /** 显示信息提示 */
  showInfo(message: string): void
}

/** 插件 API 实现类 */
export class PluginAPI implements IPluginAPI {
  constructor(
    private context: PluginAPIContext,
    private editorRef: React.MutableRefObject<TiptapEditor | null>
  ) {}
  
  private requirePermission(permission: PluginPermission): void {
    if (!this.context.permissions.includes(permission)) {
      throw new Error(`Plugin "${this.context.pluginId}" lacks permission: ${permission}`)
    }
  }
  
  getEditor(): TiptapEditor | null {
    this.requirePermission('editor:read')
    return this.editorRef.current
  }
  
  async insertToEditor(content: string): Promise<void> {
    this.requirePermission('editor:write')
    const editor = this.editorRef.current
    if (!editor) throw new Error('Editor not available')
    editor.chain().focus().insertContent(content).run()
  }
  
  async insertSourceBlock(content: string, source: 'ai' | 'inspiration' | 'import', label: string): Promise<void> {
    this.requirePermission('editor:write')
    const editor = this.editorRef.current
    if (!editor) throw new Error('Editor not available')
    
    const lines = content.split('\n').filter(l => l.trim())
    editor.chain().focus().insertContent({
      type: 'sourceBlock',
      attrs: { source, sourceLabel: label },
      content: lines.map(line => ({
        type: 'paragraph',
        content: [{ type: 'text', text: line }],
      })),
    }).run()
  }
  
  getSelectedText(): string | null {
    this.requirePermission('editor:read')
    const editor = this.editorRef.current
    if (!editor) return null
    const { from, to } = editor.state.selection
    if (from === to) return null
    return editor.state.doc.textBetween(from, to, '\n')
  }
  
  async saveAsBlock(content: string, metadata: {
    title?: string
    tags?: string[]
    source?: { type: 'editor' | 'ai' | 'import'; documentId?: string }
  }): Promise<Block> {
    this.requirePermission('block:write')
    const { blockStore } = await import('../storage/blockStore')
    const { generateUUID } = await import('../utils/uuid')
    
    const block: Block = {
      id: generateUUID(),
      content,
      type: 'text',
      source: metadata.source ? {
        ...metadata.source,
        capturedAt: new Date(),
      } : {
        type: 'import',
        capturedAt: new Date(),
      },
      metadata: {
        title: metadata.title,
        tags: metadata.tags || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }
    
    await blockStore.saveBlock(block)
    return block
  }
  
  async searchBlocks(query: string): Promise<Block[]> {
    this.requirePermission('block:read')
    const { blockStore } = await import('../storage/blockStore')
    return blockStore.searchBlocks(query)
  }
  
  async getBlock(blockId: string): Promise<Block | null> {
    this.requirePermission('block:read')
    const { blockStore } = await import('../storage/blockStore')
    return blockStore.getBlock(blockId)
  }
  
  getConfig<T = unknown>(key: string): T | null {
    this.requirePermission('storage:read')
    const storageKey = `plugin:${this.context.pluginId}:${key}`
    const value = localStorage.getItem(storageKey)
    return value ? JSON.parse(value) : null
  }
  
  setConfig<T = unknown>(key: string, value: T): void {
    this.requirePermission('storage:write')
    const storageKey = `plugin:${this.context.pluginId}:${key}`
    localStorage.setItem(storageKey, JSON.stringify(value))
  }
  
  removeConfig(key: string): void {
    this.requirePermission('storage:write')
    const storageKey = `plugin:${this.context.pluginId}:${key}`
    localStorage.removeItem(storageKey)
  }
  
  showSuccess(message: string): void {
    window.dispatchEvent(new CustomEvent('showToast', {
      detail: { type: 'success', message },
    }))
  }
  
  showError(message: string): void {
    window.dispatchEvent(new CustomEvent('showToast', {
      detail: { type: 'error', message },
    }))
  }
  
  showInfo(message: string): void {
    window.dispatchEvent(new CustomEvent('showToast', {
      detail: { type: 'info', message },
    }))
  }
}
