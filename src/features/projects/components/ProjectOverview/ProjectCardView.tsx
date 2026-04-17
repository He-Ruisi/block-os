import { MoreVertical, Folder, FileText, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ProjectViewModel } from './types';

interface Props {
  project: ProjectViewModel;
  isMenuOpen: boolean;
  onProjectClick: (projectId: string) => void;
  onMenuToggle: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

export function ProjectCardView({
  project,
  isMenuOpen,
  onProjectClick,
  onMenuToggle,
  onDeleteProject,
}: Props) {
  return (
    <Card
      className="group relative cursor-pointer transition-all hover:shadow-md"
      onClick={() => onProjectClick(project.id)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {project.icon || <Folder size={20} />}
            </div>
            <CardTitle className="text-lg">{project.name}</CardTitle>
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={e => {
                e.stopPropagation();
                onMenuToggle(project.id);
              }}
            >
              <MoreVertical size={16} />
            </Button>
            
            {isMenuOpen && (
              <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-md border border-border bg-background shadow-lg">
                <button
                  className="w-full px-4 py-2 text-left text-sm hover:bg-accent"
                  onClick={e => {
                    e.stopPropagation();
                    onProjectClick(project.id);
                  }}
                >
                  打开项目
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-accent"
                  onClick={e => {
                    e.stopPropagation();
                    onDeleteProject(project.id);
                  }}
                >
                  删除项目
                </button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      {project.description && (
        <CardContent>
          <CardDescription className="line-clamp-2">{project.description}</CardDescription>
        </CardContent>
      )}

      <CardFooter className="flex flex-col items-start gap-3">
        <div className="flex w-full gap-4">
          <Badge variant="secondary" className="gap-1">
            <FileText size={14} />
            <span>{project.documentCount} 文档</span>
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <LinkIcon size={14} />
            <span>{project.blockReferenceCount} 引用</span>
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          Updated {project.updatedAt}
        </div>
      </CardFooter>
    </Card>
  );
}
