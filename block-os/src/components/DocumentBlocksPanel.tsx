import { useState, useEffect } from 'react'
import { documentStore, DocumentBlock } from '../storage/documentStore'
import './DocumentBlocksPanel.css'

export function DocumentBlocksPanel() {
  const [blocks, setBlocks] = useState<DocumentBlock[]>([])
  const [documentTitle, setDocumentTitle] = useState<string>('当前文档')
  const [isLoading, setIsLoading] = useState(true)

  // 加载文档 Block
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

  // 初始化和监听文档更新
  useEffect(() => {
    loadDocumentBlocks()

    // 定期刷新（每2秒）
    const interval = setInterval(() => {
      loadDocumentBlocks()
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // 获取节点类型图标
  const getNodeIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'heading':
        return '📌'
      case 'paragraph':
        return '📝'
      case 'listItem':
        return '•'
      default:
        return '◆'
    }
  }

  // 截断内容
  const truncateContent = (content: string, maxLength: number = 60) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <div className="document-blocks-panel">
      <div className="panel-header">
        <h3 className="panel-title">📄 {documentTitle}</h3>
        <div className="panel-subtitle">隐式 Block 结构</div>
      </div>

      <div className="panel-body">
        {isLoading ? (
          <div className="panel-empty">
            <div className="empty-icon">⏳</div>
            <div className="empty-text">加载中...</div>
          </div>
        ) : blocks.length === 0 ? (
          <div className="panel-empty">
            <div className="empty-icon">📝</div>
            <div className="empty-text">开始写作</div>
            <div className="empty-hint">每个段落都会自动成为一个 Block</div>
          </div>
        ) : (
          <div className="blocks-tree">
            {blocks.map((block, index) => (
              <div key={block.id} className="block-node">
                <div className="block-node-header">
                  <span className="block-icon">{getNodeIcon(block.nodeType)}</span>
                  <span className="block-index">#{index + 1}</span>
                  {block.links.length > 0 && (
                    <span className="block-links-count" title={`${block.links.length} 个链接`}>
                      🔗 {block.links.length}
                    </span>
                  )}
                </div>
                <div className="block-node-content">
                  {truncateContent(block.content)}
                </div>
                {block.links.length > 0 && (
                  <div className="block-node-links">
                    {block.links.map((linkId, i) => (
                      <span key={i} className="link-badge" title={linkId}>
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

      <div className="panel-footer">
        <div className="stats">
          <span className="stat-item">
            <span className="stat-label">段落:</span>
            <span className="stat-value">{blocks.length}</span>
          </span>
          <span className="stat-item">
            <span className="stat-label">链接:</span>
            <span className="stat-value">
              {blocks.reduce((sum, b) => sum + b.links.length, 0)}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}
