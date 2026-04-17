import { CalendarDays, ChevronDown, ChevronRight, FileText, Folder, FolderInput, MoreVertical, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import type { Document } from '@/types/models/document'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { EmptyState } from '@/components/shells/EmptyState'
import { cn } from '@/lib/utils'
import { useLongPress } from '@/hooks/useLongPress'
import type { ProjectViewModel, DocumentViewModel } from './types'

interface ExplorerViewProps {
  currentProjectId: string | null
  projects: ProjectViewModel[]
  projectDocs: Record<string, Document[]>
  docViewModels: (docs: Document[], isStarred: (id: string, type: 'project' | 'document') => boolean) => DocumentViewModel[]
  isStarred: (id: string, type: 'project' | 'document') => boolean
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
  movingDoc: Document | null
  docActionMenu: Document | null
  onSelectToday: () => void
  onToggleProject: (projectId: string) => void
  onCreateProject: () => void
  onDeleteDoc: (doc: Document) => void
  onStartRename: (doc: Document) => void
  onSubmitRename: (doc: Document) => void
  onCancelRename: () => void
  onMoveDoc: (doc: Document, targetProjectId: string) => void
  onStartRenameProject: (projectId: string, currentName: string) => void
  onSubmitRenameProject: (projectId: string) => void
  onCancelRenameProject: () => void
  onDeleteProject: (projectId: string, projectName: string) => void
  onToggleStar: (id: string, type: 'project' | 'document', name: string, projectId?: string) => void
  onNewDocInProject: (projectId: string) => void
  onOpenDocument: (doc: Document) => void
  onSetShowNewProjectDialog: (show: boolean) => void
  onSetNewProjectName: (name: string) => void
  onSetNewProjectDescription: (desc: string) => void
  onSetRenameValue: (value: string) => void
  onSetRenameProjectValue: (value: string) => void
  onSetMovingDoc: (doc: Document | null) => void
  onSetDocActionMenu: (doc: Document | null) => void
}

export function ExplorerView({
  currentProjectId,
  projects,
  projectDocs,
  docViewModels,
  isStarred,
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
  movingDoc,
  docActionMenu,
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
  onSetShowNewProjectDialog,
  onSetNewProjectName,
  onSetNewProjectDescription,
  onSetRenameValue,
  onSetRenameProjectValue,
  onSetMovingDoc,
  onSetDocActionMenu,
}: ExplorerViewProps) {
  return (
    <div className="explorer-view">
      <div className={`explorer-item ${currentProjectId === 'today' ? 'active' : ''}`} onClick={onSelectToday}>
        <CalendarDays size={18} className="explorer-item-icon" />
        <span className="explorer-item-text">今天</span>
      </div>

      <div className="explorer-section">
        <div className="explorer-section-header">
          <span className="explorer-section-title">项目</span>
        </div>

        <ScrollArea className="explorer-projects">
          {projects.length === 0 ? (
            <EmptyState title="还没有项目" description="点击下方按钮创建" />
          ) : (
            projects.map(project => (
              <div key={project.id} className="explorer-project-group">
                <div
                  className={`explorer-project-item ${currentProjectId === project.id ? 'active' : ''}`}
                  onClick={() => onToggleProject(project.id)}
                >
                  <span className="explorer-project-expand">
                    {project.isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                  <Folder size={16} className="explorer-project-icon" />
                  {renamingProjectId === project.id ? (
                    <Input
                      ref={renameProjectInputRef}
                      className="h-7 text-sm"
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
                      <span className="explorer-project-name">{project.name}</span>
                      {project.documentCount > 0 && <span className="explorer-project-count">{project.documentCount}</span>}
                      <div className="explorer-doc-actions explorer-project-actions">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn('explorer-action-btn explorer-star-btn h-6 w-6', project.isStarred && 'starred')}
                          onClick={e => {
                            e.stopPropagation()
                            onToggleStar(project.id, 'project', project.name)
                          }}
                          title={project.isStarred ? '取消置顶' : '置顶'}
                        >
                          <Star size={14} fill={project.isStarred ? 'currentColor' : 'none'} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="explorer-action-btn h-6 w-6"
                          onClick={e => {
                            e.stopPropagation()
                            onNewDocInProject(project.id)
                          }}
                          title="新建文档"
                        >
                          <Plus size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="explorer-action-btn h-6 w-6"
                          onClick={e => {
                            e.stopPropagation()
                            onStartRenameProject(project.id, project.name)
                          }}
                          title="重命名"
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="explorer-action-btn danger h-6 w-6"
                          onClick={e => {
                            e.stopPropagation()
                            onDeleteProject(project.id, project.name)
                          }}
                          title="删除项目"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                {project.isExpanded && (
                  <div className="explorer-project-docs">
                    {(projectDocs[project.id] || []).length === 0 ? (
                      <div className="explorer-doc-empty">暂无文档。</div>
                    ) : (
                      docViewModels(projectDocs[project.id] || [], isStarred).map(doc => {
                        const fullDoc = (projectDocs[project.id] || []).find(d => d.id === doc.id)!
                        return (
                          <ExplorerDocItem
                            key={doc.id}
                            doc={fullDoc}
                            isRenaming={renamingDocId === doc.id}
                            renameValue={renameValue}
                            renameInputRef={renameInputRef}
                            isStarred={doc.isStarred}
                            isTouchDevice={isTouchDevice}
                            isMenuOpen={docActionMenu?.id === doc.id}
                            onRenameValueChange={onSetRenameValue}
                            onSubmitRename={onSubmitRename}
                            onCancelRename={onCancelRename}
                            onToggleMenu={onSetDocActionMenu}
                            onOpen={onOpenDocument}
                            onStartRename={onStartRename}
                            onSaveToProject={() => onSetMovingDoc(fullDoc)}
                            onDelete={onDeleteDoc}
                            onToggleStar={onToggleStar}
                          />
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </ScrollArea>

        <Button className="explorer-new-project-button w-full justify-start" variant="ghost" onClick={() => onSetShowNewProjectDialog(true)}>
          <Plus size={16} />
          <span className="explorer-button-text">新建项目</span>
        </Button>
      </div>

      <Dialog open={showNewProjectDialog} onOpenChange={onSetShowNewProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建项目</DialogTitle>
            <DialogDescription>创建一个新的项目来组织你的文档</DialogDescription>
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
              <label className="text-sm font-medium">项目描述（可选）</label>
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

      <Dialog open={!!movingDoc} onOpenChange={open => !open && onSetMovingDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>保存到项目</DialogTitle>
            <DialogDescription>将"{movingDoc?.title}"保存到：</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-2">
              {projects
                .filter(project => project.id !== movingDoc?.projectId)
                .map(project => (
                  <Button
                    key={project.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => movingDoc && onMoveDoc(movingDoc, project.id)}
                  >
                    <Folder size={16} />
                    <span>{project.name}</span>
                  </Button>
                ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ExplorerDocItemProps {
  doc: Document
  isRenaming: boolean
  renameValue: string
  renameInputRef: React.RefObject<HTMLInputElement>
  isStarred: boolean
  isTouchDevice: boolean
  isMenuOpen: boolean
  onRenameValueChange: (value: string) => void
  onSubmitRename: (doc: Document) => void
  onCancelRename: () => void
  onToggleMenu: (doc: Document | null) => void
  onOpen: (doc: Document) => void
  onStartRename: (doc: Document) => void
  onSaveToProject: () => void
  onDelete: (doc: Document) => void
  onToggleStar: (id: string, type: 'project' | 'document', name: string, projectId?: string) => void
}

function ExplorerDocItem({
  doc,
  isRenaming,
  renameValue,
  renameInputRef,
  isStarred,
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
}: ExplorerDocItemProps) {
  const longPressHandlers = useLongPress({
    onLongPress: () => {
      if (isTouchDevice) {
        onToggleMenu(doc)
      }
    },
    onClick: () => {
      if (isTouchDevice) {
        onOpen(doc)
      }
    },
    delay: 500,
  })

  return (
    <div className="explorer-doc-item-wrapper group">
      <div
        className="explorer-doc-item"
        onDoubleClick={e => {
          e.stopPropagation()
          onToggleMenu(null)
          onOpen(doc)
        }}
        {...longPressHandlers}
      >
        {isRenaming ? (
          <Input
            ref={renameInputRef}
            className="h-7 text-sm"
            value={renameValue}
            onChange={e => onRenameValueChange(e.target.value)}
            onBlur={() => onSubmitRename(doc)}
            onKeyDown={e => {
              if (e.key === 'Enter') onSubmitRename(doc)
              if (e.key === 'Escape') onCancelRename()
            }}
            onClick={e => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <>
            <FileText size={14} className="explorer-doc-icon" />
            <span className="explorer-doc-title">{doc.title}</span>
            <Button
              variant="ghost"
              size="icon"
              className={cn('explorer-action-btn explorer-star-btn explorer-doc-star h-6 w-6', isStarred && 'starred')}
              onClick={e => {
                e.stopPropagation()
                onToggleStar(doc.id, 'document', doc.title, doc.projectId)
              }}
              title={isStarred ? '取消置顶' : '置顶'}
            >
              <Star size={12} fill={isStarred ? 'currentColor' : 'none'} />
            </Button>
            <DropdownMenu open={isMenuOpen} onOpenChange={open => !open && onToggleMenu(null)}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={e => {
                    e.stopPropagation()
                    onToggleMenu(isMenuOpen ? null : doc)
                  }}
                >
                  <MoreVertical size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onOpen(doc)}>
                  <FileText size={14} />
                  <span>打开文档</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={e => {
                    e.stopPropagation()
                    onStartRename(doc)
                  }}
                >
                  <Pencil size={14} />
                  <span>重命名</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSaveToProject}>
                  <FolderInput size={14} />
                  <span>保存到项目</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={e => {
                    e.stopPropagation()
                    onDelete(doc)
                  }}
                  className="text-destructive"
                >
                  <Trash2 size={14} />
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
