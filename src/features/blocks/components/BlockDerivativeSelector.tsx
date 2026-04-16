import { useState, useEffect } from 'react'
import type { Block } from '@/types/models/block'
import { blockStore } from '@/storage/blockStore'
import { formatDateTime } from '@/utils/date'
import '@/styles/modules/blocks.css'
import '@/styles/modules/common-patterns.css'

interface BlockDerivativeSelectorProps {
  sourceBlockId: string
  onSelect: (block: Block) => void
  onCancel: () => void
}

export function BlockDerivativeSelector({
  sourceBlockId,
  onSelect,
  onCancel,
}: BlockDerivativeSelectorProps) {
  const [sourceBlock, setSourceBlock] = useState<Block | null>(null)
  const [derivatives, setDerivatives] = useState<Block[]>([])
  const [selectedBlockId, setSelectedBlockId] = useState<string>(sourceBlockId)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    void loadDerivativeTree()
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
      : derivatives.find(item => item.id === selectedBlockId)

    if (selectedBlock) {
      onSelect(selectedBlock)
    }
  }

  const truncateContent = (content: string, maxLength = 100) =>
    (content.length <= maxLength ? content : `${content.substring(0, maxLength)}...`)

  const formatDate = (date: Date) => formatDateTime(date)

  return (
    <div className="block-derivative-selector__overlay" onClick={onCancel}>
      <div className="block-derivative-selector__content" onClick={e => e.stopPropagation()}>
        <div className="block-derivative-selector__header">
          <h3 className="block-derivative-selector__title">选择 Block 版本</h3>
          <button className="block-derivative-selector__close-button" onClick={onCancel}>×</button>
        </div>

        <div className="block-derivative-selector__body scroll-area">
          {isLoading ? (
            <div className="empty-state">
              <div className="empty-state__icon">⏳</div>
              <div className="empty-state__text">加载中...</div>
            </div>
          ) : (
            <>
              {sourceBlock && (
                <div className="block-derivative-selector__section">
                  <div className="block-derivative-selector__section-title">
                    <span className="block-derivative-selector__section-icon">🌟</span>
                    源 Block
                  </div>
                  <div
                    className={`card-interactive block-derivative-selector__option ${selectedBlockId === sourceBlock.id ? 'card-highlighted' : ''}`}
                    onClick={() => setSelectedBlockId(sourceBlock.id)}
                  >
                    <div className="block-derivative-selector__option-header">
                      <input
                        type="radio"
                        checked={selectedBlockId === sourceBlock.id}
                        onChange={() => setSelectedBlockId(sourceBlock.id)}
                      />
                      <div className="block-derivative-selector__option-title">
                        {sourceBlock.metadata.title || '无标题'}
                      </div>
                    </div>
                    <div className="block-derivative-selector__option-content">
                      {truncateContent(sourceBlock.content)}
                    </div>
                    <div className="block-derivative-selector__option-meta">
                      <span className="block-derivative-selector__meta-item">{formatDate(sourceBlock.metadata.createdAt)}</span>
                      <span className="block-derivative-selector__meta-item">{sourceBlock.metadata.tags.join(', ')}</span>
                    </div>
                  </div>
                </div>
              )}

              {derivatives.length > 0 && (
                <div className="block-derivative-selector__section">
                  <div className="block-derivative-selector__section-title">
                    <span className="block-derivative-selector__section-icon">🌿</span>
                    派生版本 ({derivatives.length})
                  </div>
                  {derivatives.map(derivative => (
                    <div
                      key={derivative.id}
                      className={`card-interactive block-derivative-selector__option ${selectedBlockId === derivative.id ? 'card-highlighted' : ''}`}
                      onClick={() => setSelectedBlockId(derivative.id)}
                    >
                      <div className="block-derivative-selector__option-header">
                        <input
                          type="radio"
                          checked={selectedBlockId === derivative.id}
                          onChange={() => setSelectedBlockId(derivative.id)}
                        />
                        <div className="block-derivative-selector__option-title">
                          {derivative.metadata.title || '无标题'}
                        </div>
                      </div>
                      <div className="block-derivative-selector__option-content">
                        {truncateContent(derivative.content)}
                      </div>
                      <div className="block-derivative-selector__option-meta">
                        <span className="block-derivative-selector__meta-item">{derivative.derivation?.contextTitle}</span>
                        <span className="block-derivative-selector__meta-item">{formatDate(derivative.metadata.createdAt)}</span>
                      </div>
                      {derivative.derivation?.modifications && (
                        <div className="block-derivative-selector__option-modifications">
                          {derivative.derivation.modifications}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {derivatives.length === 0 && sourceBlock && (
                <div className="empty-state">
                  <div className="empty-state__icon">📝</div>
                  <div className="empty-state__text">暂无派生版本</div>
                  <div className="empty-state__hint">
                    引用此 Block 并修改后会自动创建派生版本
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="block-derivative-selector__footer">
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
