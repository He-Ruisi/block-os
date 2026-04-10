import { useState, useEffect } from 'react'
import { Block, blockStore } from '../../storage/blockStore'
import { formatDateTime } from '../../utils/date'
import './BlockDerivativeSelector.css'

interface BlockDerivativeSelectorProps {
  sourceBlockId: string
  onSelect: (block: Block) => void
  onCancel: () => void
}

export function BlockDerivativeSelector({ 
  sourceBlockId, 
  onSelect, 
  onCancel 
}: BlockDerivativeSelectorProps) {
  const [sourceBlock, setSourceBlock] = useState<Block | null>(null)
  const [derivatives, setDerivatives] = useState<Block[]>([])
  const [selectedBlockId, setSelectedBlockId] = useState<string>(sourceBlockId)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDerivativeTree()
  }, [sourceBlockId])

  const loadDerivativeTree = async () => {
    try {
      setIsLoading(true)
      const tree = await blockStore.getDerivativeTree(sourceBlockId)
      setSourceBlock(tree.source)
      setDerivatives(tree.derivatives)
    } catch (error) {
      console.error('Failed to load derivative tree:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = () => {
    const selectedBlock = selectedBlockId === sourceBlockId 
      ? sourceBlock 
      : derivatives.find(d => d.id === selectedBlockId)
    
    if (selectedBlock) {
      onSelect(selectedBlock)
    }
  }

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  const formatDate = (date: Date) => formatDateTime(date)

  return (
    <div className="derivative-selector-overlay" onClick={onCancel}>
      <div className="derivative-selector-content" onClick={(e) => e.stopPropagation()}>
        <div className="derivative-selector-header">
          <h3>选择 Block 版本</h3>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>

        <div className="derivative-selector-body">
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-icon">⏳</div>
              <div className="loading-text">加载中...</div>
            </div>
          ) : (
            <>
              {/* 源 Block */}
              {sourceBlock && (
                <div className="block-section">
                  <div className="section-title">
                    <span className="section-icon">🌟</span>
                    源 Block
                  </div>
                  <div 
                    className={`block-option ${selectedBlockId === sourceBlock.id ? 'selected' : ''}`}
                    onClick={() => setSelectedBlockId(sourceBlock.id)}
                  >
                    <div className="block-option-header">
                      <input
                        type="radio"
                        checked={selectedBlockId === sourceBlock.id}
                        onChange={() => setSelectedBlockId(sourceBlock.id)}
                      />
                      <div className="block-option-title">
                        {sourceBlock.metadata.title || '无标题'}
                      </div>
                    </div>
                    <div className="block-option-content">
                      {truncateContent(sourceBlock.content)}
                    </div>
                    <div className="block-option-meta">
                      <span className="meta-item">
                        📅 {formatDate(sourceBlock.metadata.createdAt)}
                      </span>
                      <span className="meta-item">
                        🏷️ {sourceBlock.metadata.tags.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 派生版本 */}
              {derivatives.length > 0 && (
                <div className="block-section">
                  <div className="section-title">
                    <span className="section-icon">🌿</span>
                    派生版本 ({derivatives.length})
                  </div>
                  {derivatives.map((derivative) => (
                    <div 
                      key={derivative.id}
                      className={`block-option ${selectedBlockId === derivative.id ? 'selected' : ''}`}
                      onClick={() => setSelectedBlockId(derivative.id)}
                    >
                      <div className="block-option-header">
                        <input
                          type="radio"
                          checked={selectedBlockId === derivative.id}
                          onChange={() => setSelectedBlockId(derivative.id)}
                        />
                        <div className="block-option-title">
                          {derivative.metadata.title || '无标题'}
                        </div>
                      </div>
                      <div className="block-option-content">
                        {truncateContent(derivative.content)}
                      </div>
                      <div className="block-option-meta">
                        <span className="meta-item">
                          📄 {derivative.derivation?.contextTitle}
                        </span>
                        <span className="meta-item">
                          📅 {formatDate(derivative.metadata.createdAt)}
                        </span>
                      </div>
                      {derivative.derivation?.modifications && (
                        <div className="block-option-modifications">
                          💬 {derivative.derivation.modifications}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {derivatives.length === 0 && sourceBlock && (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <div className="empty-text">暂无派生版本</div>
                  <div className="empty-hint">
                    引用此 Block 并修改后会自动创建派生版本
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="derivative-selector-footer">
          <button className="btn-secondary" onClick={onCancel}>
            取消
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSelect}
            disabled={!selectedBlockId}
          >
            选择此版本
          </button>
        </div>
      </div>
    </div>
  )
}
