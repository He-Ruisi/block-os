import { useState } from 'react'
import type { Tab } from '../types/project'
import { documentStore } from '../storage/documentStore'
import { projectStore } from '../storage/projectStore'

interface TabsState {
  tabs: Tab[]
  activeTabId: string
  currentProjectId: string | null
  selectTab: (tabId: string) => void
  closeTab: (tabId: string) => void
  selectToday: () => void
  selectProject: (projectId: string) => void
  newTab: () => Promise<void>
}

export function useTabs(): TabsState {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'today', type: 'today', title: '今日', isDirty: false },
  ])
  const [activeTabId, setActiveTabId] = useState('today')
  const [currentProjectId, setCurrentProjectId] = useState<string | null>('today')

  const selectToday = () => {
    setCurrentProjectId('today')
    const existing = tabs.find(t => t.type === 'today')
    if (existing) {
      setActiveTabId(existing.id)
    } else {
      const newTab: Tab = { id: 'today-' + Date.now(), type: 'today', title: '今日', isDirty: false }
      setTabs(prev => [...prev, newTab])
      setActiveTabId(newTab.id)
    }
  }

  const selectProject = (projectId: string) => {
    setCurrentProjectId(projectId)
    const existing = tabs.find(t => t.projectId === projectId)
    if (existing) {
      setActiveTabId(existing.id)
    } else {
      projectStore.getProject(projectId).then(project => {
        if (project) {
          const newTab: Tab = {
            id: 'project-' + projectId,
            type: 'project',
            projectId,
            title: project.name,
            isDirty: false,
          }
          setTabs(prev => [...prev, newTab])
          setActiveTabId(newTab.id)
        }
      })
    }
  }

  const closeTab = (tabId: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(t => t.id !== tabId)
      if (tabId === activeTabId && newTabs.length > 0) {
        const closedIndex = prev.findIndex(t => t.id === tabId)
        setActiveTabId(newTabs[Math.max(0, closedIndex - 1)].id)
      }
      return newTabs
    })
  }

  const newTab = async () => {
    const projectId = currentProjectId && currentProjectId !== 'today' ? currentProjectId : undefined
    const doc = await documentStore.createDocument('新文档', projectId)
    if (projectId) await projectStore.addDocumentToProject(projectId, doc.id)
    const newTab: Tab = {
      id: 'doc-' + doc.id,
      type: 'document',
      documentId: doc.id,
      projectId,
      title: doc.title,
      isDirty: false,
    }
    setTabs(prev => [...prev, newTab])
    setActiveTabId(newTab.id)
  }

  return {
    tabs,
    activeTabId,
    currentProjectId,
    selectTab: setActiveTabId,
    closeTab,
    selectToday,
    selectProject,
    newTab,
  }
}
