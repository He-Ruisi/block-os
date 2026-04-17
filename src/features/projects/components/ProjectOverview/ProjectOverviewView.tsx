import { Search, Plus, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProjectCardView } from './ProjectCardView';
import type { ProjectViewModel, SortBy } from './types';

interface Props {
  projects: ProjectViewModel[];
  loading: boolean;
  searchQuery: string;
  sortBy: SortBy;
  menuOpenId: string | null;
  onSearchChange: (query: string) => void;
  onSortChange: (sortBy: SortBy) => void;
  onProjectClick: (projectId: string) => void;
  onMenuToggle: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onCreateProject: () => void;
}

export function ProjectOverviewView({
  projects,
  loading,
  searchQuery,
  sortBy,
  menuOpenId,
  onSearchChange,
  onSortChange,
  onProjectClick,
  onMenuToggle,
  onDeleteProject,
  onCreateProject,
}: Props) {
  return (
    <div className="flex h-full flex-col bg-background p-8">
      {/* 头部 */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Projects</h1>
        <Button onClick={onCreateProject} className="gap-2">
          <Plus size={18} />
          <span>New project</span>
        </Button>
      </div>

      {/* 搜索栏 */}
      <div className="relative mb-4">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          className="pl-10"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>

      {/* 排序选择器 */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Sort by</span>
        <select
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
          value={sortBy}
          onChange={e => onSortChange(e.target.value as SortBy)}
        >
          <option value="activity">Activity</option>
          <option value="name">Name</option>
          <option value="documents">Documents</option>
        </select>
      </div>

      {/* 项目网格 */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-muted-foreground">加载中...</div>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <Folder size={48} className="text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchQuery ? '未找到匹配的项目' : '还没有项目'}
            </p>
            {!searchQuery && (
              <Button onClick={onCreateProject} className="gap-2">
                <Plus size={16} />
                <span>创建第一个项目</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 pb-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => (
              <ProjectCardView
                key={project.id}
                project={project}
                isMenuOpen={menuOpenId === project.id}
                onProjectClick={onProjectClick}
                onMenuToggle={onMenuToggle}
                onDeleteProject={onDeleteProject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
