import { MoreVertical, Folder, FileText, Link as LinkIcon, ArrowUpRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ProjectViewModel } from './types'

interface Props {
  project: ProjectViewModel
  isMenuOpen: boolean
  onProjectClick: (projectId: string) => void
  onMenuToggle: (projectId: string) => void
  onDeleteProject: (projectId: string) => void
}

export function ProjectCardView({
  project,
  isMenuOpen,
  onProjectClick,
  onMenuToggle,
  onDeleteProject,
}: Props) {
  const hasKnowledgeGraph = project.documentCount > 0 || project.blockReferenceCount > 0

  return (
    <Card
      className="group relative overflow-visible border-white/70 bg-white/95"
      onClick={() => onProjectClick(project.id)}
    >
      <div className="surface-featured rounded-[calc(var(--border-radius-lg)+2px)]">
        <div className="relative h-full cursor-pointer overflow-visible rounded-2xl bg-card">
          <CardHeader className="gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-4">
                <div className="section-label">
                  <span className="section-label__dot" />
                  <span className="section-label__text">
                    {hasKnowledgeGraph ? 'Active Workspace' : 'New Workspace'}
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--accent-secondary)))] text-primary-foreground shadow-[var(--shadow-accent)]">
                    {project.icon || <Folder size={24} />}
                  </div>

                  <div className="min-w-0 space-y-2">
                    <CardTitle className="line-clamp-2 text-xl md:text-2xl">
                      {project.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-3 max-w-[32ch]">
                      {project.description || 'A focused workspace for notes, references, and linked blocks.'}
                    </CardDescription>
                  </div>
                </div>
              </div>

              <div className="relative shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={e => {
                    e.stopPropagation()
                    onMenuToggle(project.id)
                  }}
                >
                  <MoreVertical size={16} />
                </Button>

                {isMenuOpen && (
                  <div className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-border/80 bg-background/95 shadow-[var(--shadow-panel)] backdrop-blur-sm">
                    <button
                      className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-primary/[0.05]"
                      onClick={e => {
                        e.stopPropagation()
                        onProjectClick(project.id)
                      }}
                    >
                      <span>Open project</span>
                      <ArrowUpRight className="h-4 w-4 text-primary" />
                    </button>
                    <button
                      className="w-full px-4 py-3 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
                      onClick={e => {
                        e.stopPropagation()
                        onDeleteProject(project.id)
                      }}
                    >
                      Delete project
                    </button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pb-0">
            <div className="surface-inverted rounded-[1.5rem] px-5 py-4">
              <div className="relative grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="mb-2 flex items-center gap-2 text-white/70">
                    <FileText size={14} />
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em]">Documents</span>
                  </div>
                  <div className="text-2xl font-semibold text-white">{project.documentCount}</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="mb-2 flex items-center gap-2 text-white/70">
                    <LinkIcon size={14} />
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em]">References</span>
                  </div>
                  <div className="text-2xl font-semibold text-white">{project.blockReferenceCount}</div>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="mt-5 flex items-center justify-between gap-3">
            <Badge
              variant="outline"
              className="border-transparent bg-[rgb(var(--accent-green-rgb)_/_0.08)] text-[var(--accent-green-dark-hex)]"
            >
              knowledge base
            </Badge>
            <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Updated {project.updatedAt}
            </div>
          </CardFooter>
        </div>
      </div>
    </Card>
  )
}
