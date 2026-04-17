import { CalendarDays, ChevronDown, ChevronRight, FileText, Folder, FolderInput, MoreVertical, Pencil, Plus, Star, Trash2, Pin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from '@/components/shells/EmptyState'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useLongPress } from '@/hooks/useLongPress'
import type { ProjectViewModel, StarredItemViewModel, DocumentViewModel } from './types'

interface ExplorerViewProps {
  currentProjectId: string | null
  projects: ProjectViewModel[]
  starredItems: StarredItemViewModel[]
  draggedStarredItemId: string | null
  isTouchDevice: boolean
  showNewProjectDialog: boolean
  newProjectName: string
  newProjectDescription: string
  renamingDocId: string | null
  renameValue: string
  renameInputRef: React.RefObject<HTMLInputElement>
  renamingProjectId: string | null
  renameProjectValue: string
  renameProjectInputRef: React.RefObject<HTMLInputElement>
  movingDocumentTitle: string | null
  movingDocumentProjectId: string | null
  docActionMenuId: string | null
  onSelectToday: () => void
  onToggleProject: (projectId: string) => void
  onCreateProject: () => void
  onDeleteDoc: (docId: string) => void
  onStartRename: (docId: string) => void
  onSubmitRename: (docId: string) => void
  onCancelRename: () => void
  onMoveDoc: (targetProjectId: string) => void
  onStartRenameProject: (projectId: string, currentName: string) => void
  onSubmitRenameProject: (projectId: string) => void
  onCancelRenameProject: () => void
  onDeleteProject: (projectId: string, projectName: string) => void
  onToggleStar: (id: string, type: 'project' | 'document', name: string, projectId?: string) => void
  onNewDocInProject: (projectId: string) => void
  onOpenDocument: (docId: string) => void
  onOpenStarredItem: (item: { id: string; type: 'project' | 'document' }) => void
  onUnstar: (item: StarredItemViewModel) => void
  onDragStarredItem: (item: StarredItemViewModel) => void
  onDragEndStarred: () => void
  onDropStarredItem: (item: StarredItemViewModel) => void
  onSetShowNewProjectDialog: (show: boolean) => void
  onSetNewProjectName: (name: string) => void
  onSetNewProjectDescription: (desc: string) => void
  onSetRenameValue: (value: string) => void
  onSetRenameProjectValue: (value: string) => void
  onSetMovingDocId: (docId: string | null) => void
  onSetDocActionMenuId: (docId: string | null) => void
}

export function ExplorerView({
  currentProjectId,
  projects,
  starredItems,
  draggedStarredItemId,
  isTouchDevice,
  showNewProjectDialog,
  newProjectName,
  newProjectDescription,
  renamingDocId,
  renameValue,
  renameInputRef,
  renamingProjectId,
  renameProjectValue,
  renameProjectInputRef,
  movingDocumentTitle,
  movingDocumentProjectId,
  docActionMenuId,
  onSelectToday,
  onToggleProject,
  onCreateProject,
  onDeleteDoc,
  onStartRename,
  onSubmitRename,
  onCancelRename,
  onMoveDoc,
  onStartRenameProject,
  onSubmitRenameProject,
  onCancelRenameProject,
  onDeleteProject,
  onToggleStar,
  onNewDocInProject,
  onOpenDocument,
  onOpenStarredItem,
  onUnstar,
  onDragStarredItem,
  onDragEndStarred,
  onDropStarredItem,
  onSetShowNewProjectDialog,
  onSetNewProjectName,
  onSetNewProjectDescription,
  onSetRenameValue,
  onSetRenameProjectValue,
  onSetMovingDocId,
  onSetDocActionMenuId,
}: ExplorerViewProps) {
  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        className={cn(
          'w-full justify-start gap-3 rounded-2xl bg-background/80 px-4',
          currentProjectId === 'today' && 'border-primary/20 bg-primary/[0.05] text-primary'
        )}
        onClick={onSelectToday}
      >
        <CalendarDays className="h-4 w-4" />
        <span>今天</span>
      </Button>

      <section className="space-y-3">
        <div className="section-label w-fit">
          <span className="section-label__dot" />
          <span className="section-label__text">置顶</span>
        </div>

        {starredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-secondary/30 px-4 py-5">
            <EmptyState
              compact
              icon={Pin}
              title="还没有置顶项"
              description="在项目或文档上点击星标，即可固定在资源管理器顶部。"
            />
          </div>
        ) : (
          <div className="space-y-2">
            {starredItems.map(item => (
              <div
                key={`${item.type}-${item.id}`}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border border-border/80 bg-background/90 px-3 py-3 transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:bg-primary/[0.03]',
                  draggedStarredItemId === item.id && 'opacity-50'
                )}
                onClick={() => onOpenStarredItem(item)}
                draggable
                onDragStart={() => onDragStarredItem(item)}
                onDragEnd={onDragEndStarred}
                onDragOver={e => {
                  e.preventDefault()
                  e.dataTransfer.dropEffect = 'move'
                }}
                onDrop={e => {
                  e.preventDefault()
                  onDropStarredItem(item)
                }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
                  {item.type === 'project' ? <Folder className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{item.displayName}</div>
                  <div className="text-xs text-muted-foreground">{item.type === 'project' ? '项目' : '文档'}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-600"
                  onClick={e => {
                    e.stopPropagation()
                    onUnstar(item)
                  }}
                >
                  <Star className="h-4 w-4" fill="currentColor" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="section-label w-fit">
            <span className="section-label__dot" />
            <span className="section-label__text">项目</span>
          </div>

          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onSetShowNewProjectDialog(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-secondary/30 px-4 py-6">
            <EmptyState
              compact
              icon={Folder}
              title="还没有项目"
              description="创建一个项目来组织你的文档和 Block。"
              action={{ label: '新建项目', onClick: () => onSetShowNewProjectDialog(true) }}
            />
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map(project => (
              <div key={project.id} className="rounded-2xl border border-border/80 bg-background/90 p-2 shadow-[var(--shadow-sm)]">
                <div
                  className={cn(
                    'group flex items-center gap-2 rounded-xl px-2 py-2 transition-colors hover:bg-primary/[0.04]',
                    currentProjectId === project.id && 'bg-primary/[0.06] text-primary'
                  )}
                  onClick={() => onToggleProject(project.id)}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={e => {
                      e.stopPropagation()
                      onToggleProject(project.id)
                    }}
                  >
                    {project.isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>

                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
                    <Folder className="h-4 w-4" />
                  </div>

                  {renamingProjectId === project.id ? (
                    <Input
                      ref={renameProjectInputRef}
                      className="h-9 flex-1"
                      value={renameProjectValue}
                      onChange={e => onSetRenameProjectValue(e.target.value)}
                      onBlur={() => onSubmitRenameProject(project.id)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') onSubmitRenameProject(project.id)
                        if (e.key === 'Escape') onCancelRenameProject()
                      }}
                      onClick={e => e.stopPropagation()}
                      autoFocus
                    />
                  ) : (
                    <>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-foreground">{project.name}</div>
                        {project.description ? (
                          <div className="truncate text-xs text-muted-foreground">{project.description}</div>
                        ) : null}
                      </div>

                      {project.documentCount > 0 && (
                        <Badge variant="outline" className="shrink-0">
                          {project.documentCount}
                        </Badge>
                      )}

                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn('h-7 w-7', project.isStarred && 'text-yellow-500')}
                          onClick={e => {
                            e.stopPropagation()
                            onToggleStar(project.id, 'project', project.name)
                          }}
                        >
                          <Star className="h-3.5 w-3.5" fill={project.isStarred ? 'currentColor' : 'none'} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={e => {
                            e.stopPropagation()
                            onNewDocInProject(project.id)
                          }}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={e => {
                            e.stopPropagation()
                            onStartRenameProject(project.id, project.name)
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={e => {
                            e.stopPropagation()
                            onDeleteProject(project.id, project.name)
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                {project.isExpanded && (
                  <div className="mt-2 space-y-1 pl-8">
                    {project.documents.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border bg-secondary/20 px-3 py-3 text-xs text-muted-foreground">
                        暂无文档
                      </div>
                    ) : (
                      project.documents.map(doc => (
                        <ExplorerDocumentItem
                          key={doc.id}
                          doc={doc}
                          isRenaming={renamingDocId === doc.id}
                          renameValue={renameValue}
                          renameInputRef={renameInputRef}
                          isTouchDevice={isTouchDevice}
                          isMenuOpen={docActionMenuId === doc.id}
                          onRenameValueChange={onSetRenameValue}
                          onSubmitRename={onSubmitRename}
                          onCancelRename={onCancelRename}
                          onToggleMenu={onSetDocActionMenuId}
                          onOpen={onOpenDocument}
                          onStartRename={onStartRename}
                          onSaveToProject={onSetMovingDocId}
                          onDelete={onDeleteDoc}
                          onToggleStar={onToggleStar}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <Dialog open={showNewProjectDialog} onOpenChange={onSetShowNewProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建项目</DialogTitle>
            <DialogDescription>创建一个新的项目来组织你的文档。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">项目名称</label>
              <Input
                type="text"
                placeholder="输入项目名称..."
                value={newProjectName}
                onChange={e => onSetNewProjectName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onCreateProject()}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">项目描述</label>
              <Textarea
                placeholder="输入项目描述..."
                value={newProjectDescription}
                onChange={e => onSetNewProjectDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onSetShowNewProjectDialog(false)}>
              取消
            </Button>
            <Button onClick={onCreateProject} disabled={!newProjectName.trim()}>
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!movingDocumentTitle} onOpenChange={open => !open && onSetMovingDocId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>移动文档</DialogTitle>
            <DialogDescription>将“{movingDocumentTitle}”移动到目标项目。</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {projects
              .filter(project => project.id !== movingDocumentProjectId)
              .map(project => (
                <Button
                  key={project.id}
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => onMoveDoc(project.id)}
                >
                  <Folder className="h-4 w-4" />
                  <span>{project.name}</span>
                </Button>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ExplorerDocumentItemProps {
  doc: DocumentViewModel
  isRenaming: boolean
  renameValue: string
  renameInputRef: React.RefObject<HTMLInputElement>
  isTouchDevice: boolean
  isMenuOpen: boolean
  onRenameValueChange: (value: string) => void
  onSubmitRename: (docId: string) => void
  onCancelRename: () => void
  onToggleMenu: (docId: string | null) => void
  onOpen: (docId: string) => void
  onStartRename: (docId: string) => void
  onSaveToProject: (docId: string | null) => void
  onDelete: (docId: string) => void
  onToggleStar: (id: string, type: 'project' | 'document', name: string, projectId?: string) => void
}

function ExplorerDocumentItem({
  doc,
  isRenaming,
  renameValue,
  renameInputRef,
  isTouchDevice,
  isMenuOpen,
  onRenameValueChange,
  onSubmitRename,
  onCancelRename,
  onToggleMenu,
  onOpen,
  onStartRename,
  onSaveToProject,
  onDelete,
  onToggleStar,
}: ExplorerDocumentItemProps) {
  const longPressHandlers = useLongPress({
    onLongPress: () => {
      if (isTouchDevice) {
        onToggleMenu(doc.id)
      }
    },
    onClick: () => {
      if (isTouchDevice) {
        onOpen(doc.id)
      }
    },
    delay: 500,
  })

  return (
    <div className="group">
      <div
        className="flex items-center gap-2 rounded-xl px-2 py-2 transition-colors hover:bg-primary/[0.04]"
        onDoubleClick={e => {
          e.stopPropagation()
          onToggleMenu(null)
          onOpen(doc.id)
        }}
        {...longPressHandlers}
      >
        {isRenaming ? (
          <Input
            ref={renameInputRef}
            className="h-9 flex-1"
            value={renameValue}
            onChange={e => onRenameValueChange(e.target.value)}
            onBlur={() => onSubmitRename(doc.id)}
            onKeyDown={e => {
              if (e.key === 'Enter') onSubmitRename(doc.id)
              if (e.key === 'Escape') onCancelRename()
            }}
            onClick={e => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <>
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 truncate text-sm">{doc.title}</span>

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100',
                doc.isStarred && 'opacity-100 text-yellow-500'
              )}
              onClick={e => {
                e.stopPropagation()
                onToggleStar(doc.id, 'document', doc.title, doc.projectId)
              }}
            >
              <Star className="h-3.5 w-3.5" fill={doc.isStarred ? 'currentColor' : 'none'} />
            </Button>

            <DropdownMenu open={isMenuOpen} onOpenChange={open => !open && onToggleMenu(null)}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={e => {
                    e.stopPropagation()
                    onToggleMenu(isMenuOpen ? null : doc.id)
                  }}
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onOpen(doc.id)}>
                  <FileText className="h-3.5 w-3.5" />
                  <span>打开文档</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStartRename(doc.id)}>
                  <Pencil className="h-3.5 w-3.5" />
                  <span>重命名</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSaveToProject(doc.id)}>
                  <FolderInput className="h-3.5 w-3.5" />
                  <span>移动到项目</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => onDelete(doc.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>删除</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </div>
  )
}
