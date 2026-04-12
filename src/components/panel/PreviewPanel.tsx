import { useState, useEffect, useCallback } from 'react'
import type { Block } from '../../types/block'
import { DEFAULT_STYLE_THEMES, DEFAULT_DOCUMENT_TEMPLATES } from '../../types/block'
import { blockStore } from '../../storage/blockStore'
import { documentStore } from '../../storage/documentStore'
import { exportBlocks } from '../../services/exportService'
import './PreviewPanel.css'

export function PreviewPanel() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [selectedThemeId, setSelectedThemeId] = useState('editing')
  const [selectedTemplateId, setSelectedTemplateId] = useState('novel')
  const [previewContent, setPreviewContent] = useState('')
  const [previewFormat, setPreviewFormat] = useState<'markdown' | 'html' | 'plain-text'>('plain-text')
  const [isLoading, setIsLoading] = useState(true)
  const [copySuccess, setCopySuccess] = useState(false)

  const selectedTheme = DEFAULT_STYLE_THEMES.find(t => t.id === selectedThemeId) ?? DEFAULT_STYLE_THEMES[0]
  const selectedTemplate = DEFAULT_DOCUMENT_TEMPLATES.find(t => t.id === selectedTemplateId) ?? DEFAULT_DOCUMENT_TEMPLATES[0]

  // 加载当前文档的 Block
  const loadBlocks = useCallback(async () => {
    try {
      setIsLoading(true)
      const docId = documentStore.getCurrentDocumentId()
      if (!docId) {
        // 没有文档时加载所有显式 Block
        const allBlocks = await blockStore.getAllBlocks()
        setBlocks(allBlocks.filter(b => !b.implicit))
        return
      }
      const doc = await documentStore.getDocument(docId)
      if (!doc) { setBlocks([]); return }

      // 从文档的隐式 Block 构建预览用 Block 列表
      const previewBlocks: Block[] = doc.blocks.map(db => ({
        id: db.id,
        content: db.content,
        type: db.nodeType === 'heading' ? 'heading' as const : 'text' as const,
        source: { type: 'editor' as const, documentId: docId, capturedAt: new Date() },
        metadata: { tags: [], createdAt: new Date(), updatedAt: new Date() },
        template: {
          role: db.nodeType === 'heading' ? 'heading' as const : 'paragraph' as const,
          level: db.nodeType === 'heading' ? 1 : undefined,
        },
      }))
      setBlocks(previewBlocks)
    } catch (error) {
      console.error('Failed to load blocks for preview:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadBlocks() }, [loadBlocks])

  // 定期刷新
  useEffect(() => {
    const interval = setInterval(loadBlocks, 3000)
    return () => clearInterval(interval)
  }, [loadBlocks])

  // 生成预览
  useEffect(() => {
    if (blocks.length === 0) {
      setPreviewContent('')
      return
    }
    const result = exportBlocks(blocks, selectedTemplateId, selectedThemeId)
    setPreviewContent(result.content)
    setPreviewFormat(result.format)
  }, [blocks, selectedTemplateId, selectedThemeId])

  const handleCopy = async () => {
    if (!previewContent) return
    try {
      await navigator.clipboard.writeText(previewContent)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch {
      console.error('Failed to copy')
    }
  }

  const handleDownload = () => {
    if (!previewContent) return
    const ext = previewFormat === 'markdown' ? 'md' : previewFormat === 'html' ? 'html' : 'txt'
    const blob = new Blob([previewContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `export-${selectedTemplate.name}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="preview-panel">
      {/* 样式主题选择 */}
      <div className="preview-controls">
        <div className="control-group">
          <label className="control-label">样式主题</label>
          <div className="theme-chips">
            {DEFAULT_STYLE_THEMES.map(theme => (
              <button
                key={theme.id}
                className={`theme-chip ${selectedThemeId === theme.id ? 'active' : ''}`}
                onClick={() => setSelectedThemeId(theme.id)}
              >
                {theme.id === 'editing' ? '✏️' : theme.id === 'preview' ? '👁' : '📝'}
                {' '}{theme.name}
              </button>
            ))}
          </div>
        </div>

        <div className="control-group">
          <label className="control-label">导出模板</label>
          <div className="template-chips">
            {DEFAULT_DOCUMENT_TEMPLATES.map(tmpl => (
              <button
                key={tmpl.id}
                className={`template-chip ${selectedTemplateId === tmpl.id ? 'active' : ''}`}
                onClick={() => setSelectedTemplateId(tmpl.id)}
              >
                {tmpl.id === 'novel' ? '📖' : tmpl.id === 'blog' ? '📰' : '📋'}
                {' '}{tmpl.name}
              </button>
            ))}
          </div>
        </div>

        {/* 当前配置摘要 */}
        <div className="config-summary">
          <span className="summary-item">
            AI块: {selectedTemplate.exportRules.aiBlocks === 'merge-as-paragraph' ? '融入正文' : selectedTemplate.exportRules.aiBlocks === 'keep-as-quote' ? '保留引用' : '移除'}
          </span>
          <span className="summary-divider">·</span>
          <span className="summary-item">
            格式: {selectedTemplate.exportRules.format === 'markdown' ? 'Markdown' : selectedTemplate.exportRules.format === 'html' ? 'HTML' : '纯文本'}
          </span>
          <span className="summary-divider">·</span>
          <span className="summary-item">
            来源标签: {selectedTheme.showSourceLabels ? '显示' : '隐藏'}
          </span>
        </div>
      </div>

      {/* 预览区域 */}
      <div className={`preview-body theme-${selectedThemeId}`}>
        {isLoading ? (
          <div className="preview-empty">
            <div className="empty-icon">⏳</div>
            <div className="empty-text">加载中...</div>
          </div>
        ) : blocks.length === 0 ? (
          <div className="preview-empty">
            <div className="empty-icon">📄</div>
            <div className="empty-text">当前文档为空</div>
            <div className="empty-hint">在编辑器中写入内容后，这里会显示预览</div>
          </div>
        ) : previewFormat === 'html' ? (
          <div
            className="preview-content preview-html"
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />
        ) : (
          <pre className="preview-content preview-text">{previewContent}</pre>
        )}
      </div>

      {/* 底部操作栏 */}
      {blocks.length > 0 && (
        <div className="preview-footer">
          <span className="block-count">{blocks.length} 个段落</span>
          <div className="footer-actions">
            <button className="action-btn" onClick={handleCopy} disabled={!previewContent}>
              {copySuccess ? '✓ 已复制' : '📋 复制'}
            </button>
            <button className="action-btn action-btn-primary" onClick={handleDownload} disabled={!previewContent}>
              ⬇ 导出文件
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
