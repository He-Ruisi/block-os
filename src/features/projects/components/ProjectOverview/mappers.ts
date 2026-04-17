import type { Project } from '@/types/models/project';
import type { ProjectStats } from '../../hooks/useProjects';
import type { ProjectViewModel } from './types';
import { formatDistanceToNow } from '@/utils/date';

/**
 * 将领域模型 Project 转换为 ViewModel
 */
export function toProjectViewModel(
  project: Project,
  stats: ProjectStats
): ProjectViewModel {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    icon: project.icon,
    documentCount: stats.documentCount,
    blockReferenceCount: stats.blockReferenceCount,
    updatedAt: formatDistanceToNow(project.metadata.updatedAt),
  };
}

/**
 * 批量转换
 */
export function toProjectViewModels(
  projects: Project[],
  projectStats: Record<string, ProjectStats>
): ProjectViewModel[] {
  return projects.map(project => 
    toProjectViewModel(
      project,
      projectStats[project.id] || { documentCount: 0, blockReferenceCount: 0 }
    )
  );
}
