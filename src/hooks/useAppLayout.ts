import { useState, useEffect, useCallback } from 'react'
import type { SidebarView } from '../types/layout'

const STORAGE_KEY = 'blockos-layout'
const ACTIVITY_BAR_WIDTH = 48
const SIDEBAR_PANEL_WIDTH = 240

interface LayoutPrefs {
  sidebarCollapsed: boolean
  editorWidthRatio: number // 0-1，编辑器占可用宽度的比例
  sidebarView: SidebarView
}

function loadPrefs(): LayoutPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as LayoutPrefs
  } catch { /* ignore */ }
  return {
    sidebarCollapsed: false,
    editorWidthRatio: 0.6,
    sidebarView: 'explorer',
  }
}

function savePrefs(prefs: LayoutPrefs): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch { /* ignore */ }
}

interface AppLayoutState {
  sidebarCollapsed: boolean
  sidebarView: SidebarView
  isFullscreen: boolean
  editorWidth: number
  activityBarWidth: number
  toggleSidebar: () => void
  toggleFullscreen: () => void
  setEditorWidth: (width: number) => void
  setSidebarView: (view: SidebarView) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  minEditorWidth: number
  maxEditorWidth: number
}

export function useAppLayout(): AppLayoutState {
  const [prefs, setPrefs] = useState<LayoutPrefs>(loadPrefs)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [editorWidth, setEditorWidthState] = useState(0)

  // ActivityBar(48px) + SidebarPanel(0|240px)
  const sidebarWidth = ACTIVITY_BAR_WIDTH + (prefs.sidebarCollapsed ? 0 : SIDEBAR_PANEL_WIDTH)

  // 根据比例计算实际宽度
  useEffect(() => {
    const calculate = () => {
      const available = window.innerWidth - sidebarWidth
      return available * prefs.editorWidthRatio
    }
    setEditorWidthState(calculate())

    const handleResize = () => setEditorWidthState(calculate())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [prefs.sidebarCollapsed, prefs.editorWidthRatio, sidebarWidth])

  // 持久化偏好
  useEffect(() => {
    savePrefs(prefs)
  }, [prefs])

  const toggleSidebar = useCallback(() => {
    setPrefs(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }))
  }, [])

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setPrefs(prev => ({ ...prev, sidebarCollapsed: collapsed }))
  }, [])

  const setSidebarView = useCallback((view: SidebarView) => {
    setPrefs(prev => ({ ...prev, sidebarView: view }))
  }, [])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(v => !v)
  }, [])

  const setEditorWidth = useCallback((width: number) => {
    setEditorWidthState(width)
    const available = window.innerWidth - sidebarWidth
    if (available > 0) {
      const ratio = Math.max(0.2, Math.min(0.9, width / available))
      setPrefs(prev => ({ ...prev, editorWidthRatio: ratio }))
    }
  }, [sidebarWidth])

  const availableWidth = window.innerWidth - sidebarWidth

  return {
    sidebarCollapsed: prefs.sidebarCollapsed,
    sidebarView: prefs.sidebarView,
    isFullscreen,
    editorWidth,
    activityBarWidth: ACTIVITY_BAR_WIDTH,
    toggleSidebar,
    toggleFullscreen,
    setEditorWidth,
    setSidebarView,
    setSidebarCollapsed,
    minEditorWidth: 400,
    maxEditorWidth: availableWidth * 0.8,
  }
}
