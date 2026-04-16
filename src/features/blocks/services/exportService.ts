import type {
  Block,
  StyleTheme,
  DocumentTemplate,
  AIBlockExportStrategy,
  AnnotationType,
} from '@/types/models/block'
import { DEFAULT_STYLE_THEMES, DEFAULT_DOCUMENT_TEMPLATES } from '@/types/models/block'

// ============================================================
// 导出服务 — 同一份内容，不同样式+模板 → 不同形态输出
// ============================================================

/** 导出结果 */
export interface ExportResult {
  content: string
  format: 'markdown' | 'html' | 'plain-text'
  templateName: string
  themeName: string
}

/** 获取所有可用样式主题 */
export function getStyleThemes(): StyleTheme[] {
  return [...DEFAULT_STYLE_THEMES]
}

/** 获取所有可用文档模板 */
export function getDocumentTemplates(): DocumentTemplate[] {
  return [...DEFAULT_DOCUMENT_TEMPLATES]
}

/** 根据 ID 获取样式主题 */
export function getThemeById(id: string): StyleTheme | undefined {
  return DEFAULT_STYLE_THEMES.find(t => t.id === id)
}

/** 根据 ID 获取文档模板 */
export function getTemplateById(id: string): DocumentTemplate | undefined {
  return DEFAULT_DOCUMENT_TEMPLATES.find(t => t.id === id)
}

/**
 * 根据模板的 AI 块策略处理内容
 * - merge-as-paragraph: AI 内容融入正文
 * - keep-as-quote: AI 内容保留为引用块
 * - remove: 移除 AI 内容
 */
function applyAIBlockStrategy(
  block: Block,
  strategy: AIBlockExportStrategy,
  format: 'markdown' | 'html' | 'plain-text'
): string {
  const isAI = block.type === 'ai-generated' || block.source.type === 'ai'

  if (!isAI) return block.content

  switch (strategy) {
    case 'remove':
      return ''
    case 'keep-as-quote':
      if (format === 'markdown') return `> ${block.content.replace(/\n/g, '\n> ')}`
      if (format === 'html') return `<blockquote>${block.content}</blockquote>`
      return `  "${block.content}"`
    case 'merge-as-paragraph':
    default:
      return block.content
  }
}

/** 对纯文本应用首行缩进 */
function applyIndent(text: string, indent: boolean): string {
  if (!indent) return text
  return text
    .split('\n')
    .map(line => (line.trim() ? `　　${line}` : line))
    .join('\n')
}

/**
 * 将 Block 列表按模板+样式导出
 *
 * @param blocks - 要导出的 Block 列表（已排序）
 * @param templateId - 文档模板 ID
 * @param _themeId - 样式主题 ID（预留，当前导出主要由模板驱动）
 */
export function exportBlocks(
  blocks: Block[],
  templateId: string,
  _themeId = 'editing'
): ExportResult {
  const template = getTemplateById(templateId) ?? DEFAULT_DOCUMENT_TEMPLATES[0]
  const theme = getThemeById(_themeId) ?? DEFAULT_STYLE_THEMES[0]
  const { format, aiBlocks, indentFirstLine, includeAnnotations } = template.exportRules

  const lines: string[] = []

  for (const block of blocks) {
    const processed = applyAIBlockStrategy(block, aiBlocks, format)
    if (!processed) continue

    const role = block.template?.role ?? inferRole(block.type)
    const level = block.template?.level ?? 1

    switch (format) {
      case 'markdown':
        lines.push(formatMarkdown(processed, role, level))
        break
      case 'html':
        lines.push(formatHTML(processed, role, level))
        break
      case 'plain-text':
      default:
        lines.push(formatPlainText(processed, role, level, indentFirstLine))
        break
    }

    // 附属层：按模板配置追加 annotation 内容
    if (includeAnnotations && includeAnnotations.length > 0 && block.annotations) {
      const annotationLines = formatAnnotations(block, includeAnnotations, format)
      if (annotationLines) lines.push(annotationLines)
    }
  }

  let content = lines.join('\n\n')
  if (format === 'plain-text' && indentFirstLine) {
    content = applyIndent(content, true)
  }

  return {
    content,
    format,
    templateName: template.name,
    themeName: theme.name,
  }
}

// ---------- 格式化辅助 ----------

function inferRole(type: Block['type']): 'paragraph' | 'heading' | 'list' | 'code' {
  switch (type) {
    case 'heading': return 'heading'
    case 'list': return 'list'
    case 'code': return 'code'
    default: return 'paragraph'
  }
}

function formatMarkdown(text: string, role: string, level: number): string {
  switch (role) {
    case 'heading': return `${'#'.repeat(level)} ${text}`
    case 'quote': return `> ${text.replace(/\n/g, '\n> ')}`
    case 'code': return `\`\`\`\n${text}\n\`\`\``
    case 'list': return `- ${text}`
    case 'separator': return '---'
    default: return text
  }
}

function formatHTML(text: string, role: string, level: number): string {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  switch (role) {
    case 'heading': return `<h${level}>${escaped}</h${level}>`
    case 'quote': return `<blockquote><p>${escaped}</p></blockquote>`
    case 'code': return `<pre><code>${escaped}</code></pre>`
    case 'list': return `<ul><li>${escaped}</li></ul>`
    case 'separator': return '<hr />'
    default: return `<p>${escaped}</p>`
  }
}

function formatPlainText(text: string, role: string, _level: number, indent: boolean): string {
  switch (role) {
    case 'heading': return text.toUpperCase()
    case 'quote': return `"${text}"`
    case 'separator': return '————————'
    case 'list': return `• ${text}`
    default: return indent ? `　　${text}` : text
  }
}

// ---------- 附属层格式化 ----------

const ANNOTATION_LABELS: Record<AnnotationType, string> = {
  translation: '翻译',
  explanation: '注释',
  comment: '评论',
  footnote: '脚注',
}

/** 格式化 Block 的附属层内容（取每种类型的最新记录） */
function formatAnnotations(
  block: Block,
  types: AnnotationType[],
  format: 'markdown' | 'html' | 'plain-text'
): string {
  const parts: string[] = []

  for (const type of types) {
    const list = block.annotations?.[type]
    if (!list || list.length === 0) continue
    const latest = list[list.length - 1]
    const label = ANNOTATION_LABELS[type]

    switch (format) {
      case 'markdown':
        parts.push(`> **${label}**: ${latest.content}`)
        break
      case 'html':
        parts.push(`<aside class="annotation annotation--${type}"><strong>${label}</strong>: ${latest.content}</aside>`)
        break
      case 'plain-text':
        parts.push(`  [${label}] ${latest.content}`)
        break
    }
  }

  return parts.join('\n')
}
