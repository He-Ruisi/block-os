import { ArrowLeft, FileText } from 'lucide-react'
import { EmptyState, PanelHeader, PanelShell } from '@/components/shells'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CurrentContentSection } from './CurrentContentSection'
import { ReleasesSection } from './ReleasesSection'
import { UsagesSection } from './UsagesSection'
import type { BlockDetailViewModel, ReleaseViewModel, UsageViewModel } from './types'

interface Props {
  block: BlockDetailViewModel | null
  releases: ReleaseViewModel[]
  usages: UsageViewModel[]
  isLoading: boolean
  showNewRelease: boolean
  newReleaseTitle: string
  selectedVersion: number | null
  hoveredVersion: number | null
  onClose: () => void
  onCreateRelease: () => void
  onInsert: () => void
  onVersionSelect: (version: number) => void
  onVersionHover: (version: number | null) => void
  onShowNewRelease: () => void
  onCancelNewRelease: () => void
  onNewReleaseTitleChange: (title: string) => void
}

export function BlockDetailPanelView({
  block,
  releases,
  usages,
  isLoading,
  showNewRelease,
  newReleaseTitle,
  selectedVersion,
  hoveredVersion,
  onClose,
  onCreateRelease,
  onInsert,
  onVersionSelect,
  onVersionHover,
  onShowNewRelease,
  onCancelNewRelease,
  onNewReleaseTitleChange,
}: Props) {
  const backAction = (
    <Button variant="ghost" size="sm" onClick={onClose} className="gap-1.5">
      <ArrowLeft className="h-4 w-4" />
      返回
    </Button>
  )

  if (isLoading) {
    return (
      <PanelShell>
        <PanelHeader title="Block 详情" actions={backAction} />
        <div className="flex flex-1 items-center justify-center p-4">
          <EmptyState compact icon={FileText} title="正在加载详情" />
        </div>
      </PanelShell>
    )
  }

  if (!block) {
    return (
      <PanelShell>
        <PanelHeader title="Block 详情" actions={backAction} />
        <div className="flex flex-1 items-center justify-center p-4">
          <EmptyState
            compact
            icon={FileText}
            title="Block 不存在"
            description="当前 Block 可能已被删除或不可访问。"
          />
        </div>
      </PanelShell>
    )
  }

  return (
    <PanelShell>
      <PanelHeader
        title={block.title}
        description="查看当前内容、版本和引用记录"
        leading={<FileText className="h-4 w-4" />}
        actions={backAction}
      />

      <ScrollArea className="flex-1">
        <div className="space-y-6 p-4">
          <CurrentContentSection
            content={block.content}
            type={block.type}
            tags={block.tags}
            createdAt={block.createdAt}
          />
          <ReleasesSection
            releases={releases}
            showNewRelease={showNewRelease}
            newReleaseTitle={newReleaseTitle}
            selectedVersion={selectedVersion}
            hoveredVersion={hoveredVersion}
            onShowNewRelease={onShowNewRelease}
            onCancelNewRelease={onCancelNewRelease}
            onNewReleaseTitleChange={onNewReleaseTitleChange}
            onCreateRelease={onCreateRelease}
            onVersionSelect={onVersionSelect}
            onVersionHover={onVersionHover}
          />
          <UsagesSection usages={usages} />
        </div>
      </ScrollArea>

      {selectedVersion !== null ? (
        <div className="flex items-center justify-between border-t p-4">
          <span className="text-xs text-muted-foreground">已选择版本 v{selectedVersion}</span>
          <Button onClick={onInsert}>插入到编辑器</Button>
        </div>
      ) : null}
    </PanelShell>
  )
}
