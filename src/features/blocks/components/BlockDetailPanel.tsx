import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Clock, Link2 } from 'lucide-react'
import type { Block, BlockRelease, BlockUsage } from '@/types/models/block'
import { blockStore } from '@/storage/blockStore'
import { usageStore } from '@/storage/usageStore'
import { publishBlockVersion } from '../services/blockReleaseService'
import { formatRelativeTime } from '@/utils/date'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import '@/styles/modules/blocks.css'
import '@/styles/modules/common-patterns.css'

interface BlockDetailPanelProps {
  blockId: string
  onClose: () => void
  onInsertRelease: (block: Block, release: BlockRelease) => void
}

export function BlockDetailPanel({ blockId, onClose, onInsertRelease }: BlockDetailPanelProps) {
  const [block, setBlock] = useState<Block | null>(null)
  const [usages, setUsages] = useState<BlockUsage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewRelease, setShowNewRelease] = useState(false)
  const [newReleaseTitle, setNewReleaseTitle] = useState('')
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [loadedBlock, loadedUsages] = await Promise.all([
        blockStore.getBlock(blockId),
        usageStore.getUsagesByBlock(blockId),
      ])
      setBlock(loadedBlock)
      setUsages(loadedUsages)
    } catch (error) {
      console.error('Failed to load block detail:', error)
    } finally {
      setIsLoading(false)
    }
  }, [blockId])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const handleCreateRelease = async () => {
    if (!block) return

    try {
      await publishBlockVersion({
        blockId,
        title: newReleaseTitle.trim(),
        contentOverride: block.content,
      })
      setNewReleaseTitle('')
      setShowNewRelease(false)
      await loadData()
    } catch (error) {
      console.error('Failed to create release:', error)
    }
  }

  const handleInsert = () => {
    if (!block || selectedVersion === null) return
    const release = block.releases?.find(item => item.version === selectedVersion)
    if (release) {
      onInsertRelease(block, release)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 p-4 border-b shrink-0">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">加载中...</div>
        </div>
      </div>
    )
  }

  if (!block) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 p-4 border-b shrink-0">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Block 不存在</div>
        </div>
      </div>
    )
  }

  const releases = block.releases ?? []

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b shrink-0">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          返回
        </Button>
        <span className="text-sm font-medium">{block.metadata.title || 'Block 详情'}</span>
      </div>

      {/* Body */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Current Content Section */}
          <section className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground">当前内容</h3>
            <Card className="p-3">
              <ScrollArea className="h-[200px]">
                <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap pr-4">
                  {block.content}
                </p>
              </ScrollArea>
            </Card>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                {block.type === 'ai-generated' ? 'AI' : '编辑器'}
              </Badge>
              <Badge variant="outline">
                {formatRelativeTime(block.metadata.createdAt)}
              </Badge>
              {block.metadata.tags.map(tag => (
                <Badge key={tag} variant="outline" className="border-accent-green/30 text-accent-green">
                  #{tag}
                </Badge>
              ))}
            </div>
          </section>

          {/* Releases Section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                版本 ({releases.length})
              </h3>
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowNewRelease(true)}
                className="h-7 text-xs bg-accent-green hover:bg-accent-green/90"
              >
                + 发布新版本
              </Button>
            </div>

            {showNewRelease && (
              <Card className="p-3 space-y-2">
                <Input
                  placeholder="版本标题，例如：偏历史叙述语气"
                  value={newReleaseTitle}
                  onChange={e => setNewReleaseTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && void handleCreateRelease()}
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowNewRelease(false)}
                  >
                    取消
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => void handleCreateRelease()}
                    className="bg-accent-green hover:bg-accent-green/90"
                  >
                    发布
                  </Button>
                </div>
              </Card>
            )}

            {releases.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-4">
                暂无发布版本，点击上方按钮发布
              </div>
            ) : (
              <div className="space-y-2">
                {[...releases].reverse().map(release => (
                  <Popover key={release.version}>
                    <PopoverTrigger asChild>
                      <Card
                        className={cn(
                          "p-3 cursor-pointer transition-all hover:border-accent-green/50",
                          selectedVersion === release.version && "border-accent-green bg-accent-green/5"
                        )}
                        onClick={() => setSelectedVersion(selectedVersion === release.version ? null : release.version)}
                        role="button"
                        tabIndex={0}
                        aria-label={`版本 ${release.version}: ${release.title}`}
                        aria-pressed={selectedVersion === release.version}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setSelectedVersion(selectedVersion === release.version ? null : release.version)
                          }
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-accent-green text-white">v{release.version}</Badge>
                          <span className="text-xs font-medium flex-1">{release.title}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatRelativeTime(release.releasedAt)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {release.content}
                        </p>
                      </Card>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-96 max-h-[400px] overflow-hidden p-0"
                      side="left"
                      align="start"
                      onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                      <div className="p-3 border-b bg-secondary">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-accent-green text-white">v{release.version}</Badge>
                          <span className="text-xs font-medium">{release.title}</span>
                        </div>
                      </div>
                      <ScrollArea className="h-[350px]">
                        <div className="p-4">
                          <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                            {release.content}
                          </p>
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                ))}
              </div>
            )}
          </section>

          {/* Usages Section */}
          <section className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Link2 className="h-3 w-3" />
              引用记录 ({usages.length})
            </h3>
            {usages.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-4">
                暂无引用记录
              </div>
            ) : (
              <div className="space-y-2">
                {usages.map(usage => (
                  <Card key={usage.id} className="p-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex-1 font-medium">{usage.documentTitle}</span>
                      <Badge className="bg-accent-green text-white text-[10px]">
                        v{usage.releaseVersion}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {formatRelativeTime(usage.insertedAt)}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </ScrollArea>

      {/* Footer */}
      {selectedVersion !== null && (
        <div className="flex items-center justify-between p-4 border-t shrink-0">
          <span className="text-xs text-muted-foreground">已选择 v{selectedVersion}</span>
          <Button
            variant="default"
            size="sm"
            onClick={handleInsert}
            className="bg-accent-green hover:bg-accent-green/90"
          >
            插入到编辑器
          </Button>
        </div>
      )}
    </div>
  )
}
