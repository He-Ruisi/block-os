import { CalendarDays, ChevronDown, ChevronRight, FileText, Folder, FolderInput, MoreVertical, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import type { Document } from '@/types/models/document'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { EmptyState } from '@/components/shells/EmptyState'
import { Badge } from '@/components/ui/badge'
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
    <div className="flex flex-col gap-2">
      {/* Today Button */}
      <Button
        variant="ghost"
        className={cn(
          'w-full justify-start gap-2 h-9 px-3',
          currentProjectId === 'today' && 'bg-accent text-accent-foreground'
        )}
        onClick={onSelectToday}
      >
        <CalendarDays className="h-4 w-4" />
        <span className="text-sm">今天</span>
      </Button>

      {/* Projects Section */}
      <div className="flex flex-col gap-1">
        <div className="px-3 py-1.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">项目</span>
        </div>

        <div className="flex flex-col gap-0.5">
          {projects.length === 0 ? (
            <div className="px-3 py-8">
              <EmptyState 
                title="还没有项目" 
                description="点击下方按钮创建"
                className="py-4"
              />
            </div>
          ) : (
            projects.map(project => (
              <div key={project.id} className="flex flex-col">
                {/* Project Item */}
                <div
                  className={cn(
                    'group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors',
                    'hover:bg-accent/50',
                    currentProjectId === project.id && 'bg-accent text-accent-foreground'
                  )}
                  onClick={() => onToggleProject(project.id)}
                >
                  {/* Expand Icon */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0 hover:bg-accent"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleProject(project.id)
                    }}
                  >
                    {project.isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                  </Button>

                  {/* Folder Icon */}
                  <Folder className="h-4 w-4 flex-shrink-0 text-muted-foreground" />

                  {/* Project Name or Rename Input */}
                  {renamingProjectId === project.id ? (
                    <Input
                      ref={renameProjectInputRef}
                      className="h-7 text-sm flex-1"
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
                      <span className="flex-1 text-sm truncate">{project.name}</span>
                      
                      {/* Document Count Badge */}
                      {project.documentCount > 0 && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                          {project.documentCount}
                        </Badge>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            'h-6 w-6',
                            project.isStarred && 'text-yellow-500'
                          )}
                          onClick={e => {
                            e.stopPropagation()
                            onToggleStar(project.id, 'project', project.name)
                          }}
                          title={project.isStarred ? '取消置顶' : '置顶'}
                        >
                          <Star className="h-3.5 w-3.5" fill={project.isStarred ? 'currentColor' : 'none'} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={e => {
                            e.stopPropagation()
                            onNewDocInProject(project.id)
                          }}
                          title="新建文档"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={e => {
                            e.stopPropagation()
                            onStartRenameProject(project.id, project.name)
                          }}
                          title="重命名"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={e => {
                            e.stopPropagation()
                            onDeleteProject(project.id, project.name)
                          }}
                          title="删除项目"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                {/* Project Documents */}
                {project.isExpanded && (
                  <div className="ml-6 flex flex-col gap-0.5 mt-0.5">
                    {(projectDocs[project.id] || []).length === 0 ? (
                      <div className="px-3 py-2 text-xs text-muted-foreground">
                        暂无文档
                      </div>
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
        </div>

        {/* New Project Button */}
        <Button 
          className="w-full justify-start gap-2 mt-2" 
          variant="ghost" 
          onClick={() => onSetShowNewProjectDialog(true)}
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm">新建项目</span>
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
    <div className="group">
      <div
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors',
          'hover:bg-accent/50'
        )}
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
            className="h-7 text-sm flex-1"
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
            <FileText className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
            <span className="flex-1 text-sm truncate">{doc.title}</span>
            
            {/* Star Button */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity',
                isStarred && 'opacity-100 text-yellow-500'
              )}
              onClick={e => {
                e.stopPropagation()
                onToggleStar(doc.id, 'document', doc.title, doc.projectId)
              }}
              title={isStarred ? '取消置顶' : '置顶'}
            >
              <Star className="h-3 w-3" fill={isStarred ? 'currentColor' : 'none'} />
            </Button>
            
            {/* More Actions Menu */}
            <DropdownMenu open={isMenuOpen} onOpenChange={open => !open && onToggleMenu(null)}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={e => {
                    e.stopPropagation()
                    onToggleMenu(isMenuOpen ? null : doc)
                  }}
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onOpen(doc)}>
                  <FileText className="h-3.5 w-3.5" />
                  <span>打开文档</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={e => {
                    e.stopPropagation()
                    onStartRename(doc)
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>重命名</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSaveToProject}>
                  <FolderInput className="h-3.5 w-3.5" />
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
