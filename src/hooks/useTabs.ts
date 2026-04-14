import { useState, useCallback, useRef, useEffect } from 'react'
import type { Tab } from '../types/project'
import { documentStore } from '../storage/documentStore'
import { projectStore } from '../storage/projectStore'
import type { Document } from '../types/document'

const STORAGE_KEY = 'blockos-workspace-tabs'

interface PersistedTabsState {
  tabs: Tab[]
  activeTabId: string
  currentProjectId: string | null
}

const DEFAULT_TABS: Tab[] = [
  { id: 'today', type: 'today', title: '今日', isDirty: false },
]

function loadPersistedState(): PersistedTabsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {
        tabs: DEFAULT_TABS,
        activeTabId: 'today',
        currentProjectId: 'today',
      }
    }

    const parsed = JSON.parse(raw) as Partial<PersistedTabsState>
    const tabs = Array.isArray(parsed.tabs) && parsed.tabs.length > 0
      ? parsed.tabs
      : DEFAULT_TABS
    const activeTabId = typeof parsed.activeTabId === 'string' && tabs.some(tab => tab.id === parsed.activeTabId)
      ? parsed.activeTabId
      : tabs[0].id
    const currentProjectId = typeof parsed.currentProjectId === 'string' || parsed.currentProjectId === null
      ? parsed.currentProjectId
      : 'today'

    return { tabs, activeTabId, currentProjectId }
  } catch {
    return {
      tabs: DEFAULT_TABS,
      activeTabId: 'today',
      currentProjectId: 'today',
    }
  }
}

interface TabsState {
  tabs: Tab[]
  activeTabId: string
  currentProjectId: string | null
  selectTab: (tabId: string) => void
  closeTab: (tabId: string) => void
  closeOtherTabs: (tabId: string) => void
  closeTabsToRight: (tabId: string) => void
  reorderTabs: (fromIndex: number, toIndex: number) => void
  selectToday: () => void
  selectProject: (projectId: string) => void
  openDocument: (doc: Document) => void
  newTab: () => Promise<void>
}

export function useTabs(): TabsState {
  const initialState = loadPersistedState()
  const [tabs, setTabs] = useState<Tab[]>(initialState.tabs)
  const [activeTabId, setActiveTabId] = useState(initialState.activeTabId)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(initialState.currentProjectId)
  // 用 ref 同步跟踪 documentIds，避免 React 批处理导致重复添加
  const documentIdsRef = useRef<Set<string>>(
    new Set(initialState.tabs.filter(tab => tab.documentId).map(tab => tab.documentId as string))
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      tabs,
      activeTabId,
      currentProjectId,
    }))
  }, [tabs, activeTabId, currentProjectId])

  useEffect(() => {
    const handleDocumentDeleted = (e: Event) => {
      const { documentId } = (e as CustomEvent<{ documentId: string }>).detail
      documentIdsRef.current.delete(documentId)

      setTabs(prev => {
        const next = prev.filter(tab => tab.documentId !== documentId)
        if (next.length === 0) {
          setActiveTabId('today')
          return DEFAULT_TABS
        }
        if (!next.some(tab => tab.id === activeTabId)) {
          setActiveTabId(next[0].id)
        }
        return next
      })
    }

    const handleProjectDeleted = (e: Event) => {
      const { projectId } = (e as CustomEvent<{ projectId: string }>).detail

      setTabs(prev => {
        const next = prev.filter(tab => tab.projectId !== projectId)
        documentIdsRef.current.clear()
        next.forEach(tab => {
          if (tab.documentId) documentIdsRef.current.add(tab.documentId)
        })
        if (next.length === 0) {
          setActiveTabId('today')
          setCurrentProjectId('today')
          return DEFAULT_TABS
        }
        if (!next.some(tab => tab.id === activeTabId)) {
          setActiveTabId(next[0].id)
        }
        if (currentProjectId === projectId) {
          setCurrentProjectId('today')
        }
        return next
      })
    }

    window.addEventListener('documentDeleted', handleDocumentDeleted)
    window.addEventListener('projectDeleted', handleProjectDeleted)

    return () => {
      window.removeEventListener('documentDeleted', handleDocumentDeleted)
      window.removeEventListener('projectDeleted', handleProjectDeleted)
    }
  }, [activeTabId, currentProjectId])

  const selectToday = useCallback(() => {
    setCurrentProjectId('today')
    setTabs(prev => {
      const existing = prev.find(t => t.type === 'today')
      if (existing) {
        setActiveTabId(existing.id)
        return prev
      }
      const tab: Tab = { id: 'today-' + Date.now(), type: 'today', title: '今日', isDirty: false }
      setActiveTabId(tab.id)
      return [...prev, tab]
    })
  }, [])

  const selectProject = useCallback((projectId: string) => {
    setCurrentProjectId(projectId)
    setTabs(prev => {
      const existing = prev.find(t => t.projectId === projectId && t.type === 'project')
      if (existing) {
        setActiveTabId(existing.id)
        return prev
      }
      projectStore.getProject(projectId).then(project => {
        if (project) {
          const tab: Tab = {
            id: 'project-' + projectId,
            type: 'project',
            projectId,
            title: project.name,
            isDirty: false,
          }
          setTabs(p => [...p, tab])
          setActiveTabId(tab.id)
        }
      })
      return prev
    })
  }, [])

  const openDocument = useCallback((doc: Document) => {
    const tabId = 'doc-' + doc.id

    // 检查是否已经有该文档的标签页
    setTabs(prev => {
      const existing = prev.find(t => t.documentId === doc.id)
      if (existing) {
        setActiveTabId(existing.id)
        if (doc.projectId) setCurrentProjectId(doc.projectId)
        return prev
      }

      // 添加到 ref 追踪
      documentIdsRef.current.add(doc.id)

      // 创建新标签页
      const newTab: Tab = {
        id: tabId,
        type: 'document',
        documentId: doc.id,
        projectId: doc.projectId,
        title: doc.title,
        isDirty: false,
      }
      
      setActiveTabId(tabId)
      if (doc.projectId) setCurrentProjectId(doc.projectId)
      
      return [...prev, newTab]
    })
  }, [])

  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const closing = prev.find(t => t.id === tabId)
      if (closing?.documentId) documentIdsRef.current.delete(closing.documentId)
      const newTabs = prev.filter(t => t.id !== tabId)
      if (tabId === activeTabId && newTabs.length > 0) {
        const closedIndex = prev.findIndex(t => t.id === tabId)
        setActiveTabId(newTabs[Math.max(0, closedIndex - 1)].id)
      }
      return newTabs
    })
  }, [activeTabId])

  const closeOtherTabs = useCallback((tabId: string) => {
    setTabs(prev => {
      const kept = prev.find(t => t.id === tabId)
      // 清理 ref，只保留当前 tab
      documentIdsRef.current.clear()
      if (kept?.documentId) documentIdsRef.current.add(kept.documentId)
      return kept ? [kept] : prev
    })
    setActiveTabId(tabId)
  }, [])

  const closeTabsToRight = useCallback((tabId: string) => {
    setTabs(prev => {
      const idx = prev.findIndex(t => t.id === tabId)
      if (idx === -1) return prev
      const removed = prev.slice(idx + 1)
      for (const t of removed) {
        if (t.documentId) documentIdsRef.current.delete(t.documentId)
      }
      const kept = prev.slice(0, idx + 1)
      if (activeTabId !== tabId && !kept.find(t => t.id === activeTabId)) {
        setActiveTabId(tabId)
      }
      return kept
    })
  }, [activeTabId])

  const reorderTabs = useCallback((fromIndex: number, toIndex: number) => {
    setTabs(prev => {
      if (fromIndex === toIndex) return prev
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
  }, [])

  const newTab = useCallback(async () => {
    const projectId = currentProjectId && currentProjectId !== 'today' ? currentProjectId : undefined
    const doc = await documentStore.createDocument('新文档', projectId)
    if (projectId) await projectStore.addDocumentToProject(projectId, doc.id)
    const tabId = 'doc-' + doc.id
    documentIdsRef.current.add(doc.id)
    const tab: Tab = {
      id: tabId,
      type: 'document',
      documentId: doc.id,
      projectId,
      title: doc.title,
      isDirty: false,
    }
    setTabs(prev => [...prev, tab])
    setActiveTabId(tabId)
    window.dispatchEvent(new CustomEvent('documentCreated', { detail: { projectId, documentId: doc.id } }))
  }, [currentProjectId])

  return {
    tabs,
    activeTabId,
    currentProjectId,
    selectTab: setActiveTabId,
    closeTab,
    closeOtherTabs,
    closeTabsToRight,
    reorderTabs,
    selectToday,
    selectProject,
    openDocument,
    newTab,
  }
}
