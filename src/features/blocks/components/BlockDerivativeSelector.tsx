import { useState, useEffect } from 'react'
import { X, Star, Sprout } from 'lucide-react'
import type { Block } from '@/types/models/block'
import { blockStore } from '@/storage/blockStore'
import { formatDateTime } from '@/utils/date'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
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

  // Keyboard navigation: Escape to close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel()
      } else if (event.key === 'Enter' && selectedBlockId) {
        handleSelect()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedBlockId, onCancel])

  // Focus trap: Keep focus within modal
  useEffect(() => {
    const modal = document.querySelector('.block-derivative-selector__content')
    if (modal) {
      const firstFocusable = modal.querySelector('button, input, [tabindex]:not([tabindex="-1"])')
      if (firstFocusable instanceof HTMLElement) {
        firstFocusable.focus()
      }
    }
  }, [isLoading])

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

  const formatDate = (date: Date) => formatDateTime(date)

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="derivative-selector-title"
    >
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b shrink-0">
          <h3 id="derivative-selector-title" className="text-lg font-semibold">选择 Block 版本</h3>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onCancel}
            aria-label="关闭对话框"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <ScrollArea className="flex-1 px-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-4xl mb-3">⏳</div>
              <div className="text-sm text-muted-foreground">加载中...</div>
            </div>
          ) : (
            <div className="py-6 space-y-6">
              {/* Source Block Section */}
              {sourceBlock && (
                <section className="space-y-3">
                  <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    源 Block
                  </h4>
                  <Card
                    className={cn(
                      "p-4 cursor-pointer transition-all hover:border-accent-green/50",
                      selectedBlockId === sourceBlock.id && "border-accent-green bg-accent-green/5"
                    )}
                    onClick={() => setSelectedBlockId(sourceBlock.id)}
                    role="radio"
                    aria-checked={selectedBlockId === sourceBlock.id}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelectedBlockId(sourceBlock.id)
                      }
                    }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <input
                        type="radio"
                        checked={selectedBlockId === sourceBlock.id}
                        onChange={() => setSelectedBlockId(sourceBlock.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <h5 className="text-sm font-medium mb-2">
                          {sourceBlock.metadata.title || '无标题'}
                        </h5>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                          {sourceBlock.content}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-6">
                      <Badge variant="outline" className="text-[10px]">
                        {formatDate(sourceBlock.metadata.createdAt)}
                      </Badge>
                      {sourceBlock.metadata.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-[10px] border-accent-green/30 text-accent-green">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                </section>
              )}

              {/* Derivatives Section */}
              {derivatives.length > 0 && (
                <section className="space-y-3">
                  <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Sprout className="h-3 w-3" />
                    派生版本 ({derivatives.length})
                  </h4>
                  <div className="space-y-2">
                    {derivatives.map(derivative => (
                      <Card
                        key={derivative.id}
                        className={cn(
                          "p-4 cursor-pointer transition-all hover:border-accent-green/50",
                          selectedBlockId === derivative.id && "border-accent-green bg-accent-green/5"
                        )}
                        onClick={() => setSelectedBlockId(derivative.id)}
                        role="radio"
                        aria-checked={selectedBlockId === derivative.id}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setSelectedBlockId(derivative.id)
                          }
                        }}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <input
                            type="radio"
                            checked={selectedBlockId === derivative.id}
                            onChange={() => setSelectedBlockId(derivative.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <h5 className="text-sm font-medium mb-2">
                              {derivative.metadata.title || '无标题'}
                            </h5>
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                              {derivative.content}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 ml-6">
                          {derivative.derivation?.contextTitle && (
                            <Badge variant="outline" className="text-[10px]">
                              {derivative.derivation.contextTitle}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-[10px]">
                            {formatDate(derivative.metadata.createdAt)}
                          </Badge>
                        </div>
                        {derivative.derivation?.modifications && (
                          <div className="ml-6 mt-2 text-xs text-muted-foreground italic">
                            {derivative.derivation.modifications}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* Empty State */}
              {derivatives.length === 0 && sourceBlock && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-4xl mb-3">📝</div>
                  <div className="text-sm text-muted-foreground mb-1">暂无派生版本</div>
                  <div className="text-xs text-muted-foreground">
                    引用此 Block 并修改后会自动创建派生版本
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-6 border-t shrink-0">
          <Button variant="secondary" onClick={onCancel} aria-label="取消选择">
            取消
          </Button>
          <Button
            variant="default"
            onClick={handleSelect}
            disabled={!selectedBlockId}
            aria-label="确认选择此版本"
            className="bg-accent-green hover:bg-accent-green/90"
          >
            选择此版本
          </Button>
        </div>
      </Card>
    </div>
  )
}
