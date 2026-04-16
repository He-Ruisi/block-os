/**
 * 插件系统统一导出
 * 
 * 目录结构：
 * - core/       - 插件核心（类型定义、基类、工具）
 * - built-in/   - 内置插件（ocr-plugin 等）
 */

// 导出插件核心
export * from './core'

// 导出内置插件
export { OCRPlugin } from './built-in/ocr-plugin'
