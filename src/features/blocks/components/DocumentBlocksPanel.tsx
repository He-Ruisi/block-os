import { useState, useEffect } from 'react'
import type { DocumentBlock } from '@/types/models/document'
import { documentStore } from '@/storage/documentStore'
import '@/styles/modules/blocks.css'

export function DocumentBlocksPanel() {
  const [blocks, setBlocks] = useState<DocumentBlock[]>([])
  const [documentTitle, setDocumentTitle] = useState<string>('当前文档')
  const [isLoading, setIsLoading] = useState(true)

  const loadDocumentBlocks = async () => {
    try {
      setIsLoading(true)
      const docId = documentStore.getCurrentDocumentId()

      if (!docId) {
        setBlocks([])
        return
      }

      const doc = await documentStore.getDocument(docId)
      if (doc) {
        setBlocks(doc.blocks)
        setDocumentTitle(doc.title)
      }
    } catch (error) {
      console.error('Failed to load document blocks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadDocumentBlocks()
    const interval = setInterval(() => {
      void loadDocumentBlocks()
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const getNodeIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'heading':
        return '📰'
      case 'paragraph':
        return '📝'
      case 'listItem':
        return '•'
      default:
        return '○'
    }
  }

  const truncateContent = (content: string, maxLength = 60) =>
    (content.length <= maxLength ? content : `${content.substring(0, maxLength)}...`)

  return (
    <div className="document-blocks-panel">
      <div className="document-blocks-panel__header">
        <h3 className="document-blocks-panel__title">📄 {documentTitle}</h3>
        <div className="document-blocks-panel__subtitle">隐式 Block 结构</div>
      </div>

      <div className="document-blocks-panel__body">
        {isLoading ? (
          <div className="document-blocks-panel__empty">
            <div className="document-blocks-panel__empty-icon">⏳</div>
            <div className="document-blocks-panel__empty-text">加载中...</div>
          </div>
        ) : blocks.length === 0 ? (
          <div className="document-blocks-panel__empty">
            <div className="document-blocks-panel__empty-icon">📝</div>
            <div className="document-blocks-panel__empty-text">开始写作</div>
            <div className="document-blocks-panel__empty-hint">每个段落都会自动成为一个 Block</div>
          </div>
        ) : (
          <div className="document-blocks-panel__tree">
            {blocks.map((block, index) => (
              <div key={block.id} className="document-blocks-panel__node">
                <div className="document-blocks-panel__node-header">
                  <span className="document-blocks-panel__icon">{getNodeIcon(block.nodeType)}</span>
                  <span className="document-blocks-panel__index">#{index + 1}</span>
                  {block.links.length > 0 && (
                    <span className="document-blocks-panel__links-count" title={`${block.links.length} 个链接`}>
                      🔗 {block.links.length}
                    </span>
                  )}
                </div>
                <div className="document-blocks-panel__node-content">
                  {truncateContent(block.content)}
                </div>
                {block.links.length > 0 && (
                  <div className="document-blocks-panel__node-links">
                    {block.links.map((linkId, i) => (
                      <span key={i} className="document-blocks-panel__link-badge" title={linkId}>
                        → {linkId.substring(0, 8)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="document-blocks-panel__footer">
        <div className="document-blocks-panel__stats">
          <span className="document-blocks-panel__stat-item">
            <span className="document-blocks-panel__stat-label">段落:</span>
            <span className="document-blocks-panel__stat-value">{blocks.length}</span>
          </span>
          <span className="document-blocks-panel__stat-item">
            <span className="document-blocks-panel__stat-label">链接:</span>
            <span className="document-blocks-panel__stat-value">
              {blocks.reduce((sum, block) => sum + block.links.length, 0)}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}
