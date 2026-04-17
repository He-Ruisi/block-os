import { useState } from 'react';
import { useProjects } from '../../hooks/useProjects';
import { ProjectOverviewView } from './ProjectOverviewView';
import { toProjectViewModels } from './mappers';
import type { SortBy } from './types';

interface Props {
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
}

export function ProjectOverviewContainer({ onSelectProject, onCreateProject }: Props) {
  const { projects, projectStats, loading, deleteProject } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('activity');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // 数据转换为 ViewModel
  const projectViewModels = toProjectViewModels(projects, projectStats);

  // 过滤和排序
  const filteredProjects = projectViewModels
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'documents':
          return b.documentCount - a.documentCount;
        case 'activity':
        default:
          // updatedAt 已经是格式化的字符串，需要用原始数据排序
          const projectA = projects.find(p => p.id === a.id);
          const projectB = projects.find(p => p.id === b.id);
          if (!projectA || !projectB) return 0;
          return new Date(projectB.metadata.updatedAt).getTime() - new Date(projectA.metadata.updatedAt).getTime();
      }
    });

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('确定删除此项目？项目下的文档不会被删除。')) return;
    
    try {
      await deleteProject(projectId);
      setMenuOpenId(null);
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleMenuToggle = (projectId: string) => {
    setMenuOpenId(menuOpenId === projectId ? null : projectId);
  };

  const handleProjectClick = (projectId: string) => {
    onSelectProject(projectId);
  };

  return (
    <ProjectOverviewView
      projects={filteredProjects}
      loading={loading}
      searchQuery={searchQuery}
      sortBy={sortBy}
      menuOpenId={menuOpenId}
      onSearchChange={setSearchQuery}
      onSortChange={setSortBy}
      onProjectClick={handleProjectClick}
      onMenuToggle={handleMenuToggle}
      onDeleteProject={handleDeleteProject}
      onCreateProject={onCreateProject}
    />
  );
}
