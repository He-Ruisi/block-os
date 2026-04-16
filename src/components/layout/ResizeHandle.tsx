import { useEffect, useRef } from 'react'

interface ResizeHandleProps {
  onResize: (width: number) => void
  minWidth: number
  maxWidth: number
}

export function ResizeHandle({ onResize, minWidth, maxWidth }: ResizeHandleProps) {
  const isDragging = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return

      const deltaX = e.clientX - startX.current
      const newWidth = startWidth.current + deltaX
      
      // 限制宽度范围
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
      onResize(clampedWidth)
    }

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [onResize, minWidth, maxWidth])

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    startX.current = e.clientX
    
    // 获取当前编辑器宽度
    const editorArea = document.querySelector('.editor-area') as HTMLElement
    if (editorArea) {
      startWidth.current = editorArea.offsetWidth
    }
    
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const handleDoubleClick = () => {
    // 双击恢复默认比例（60%）
    const windowWidth = window.innerWidth
    const sidebarWidth = document.querySelector('.sidebar-panel')?.clientWidth || 0
    const activityBarWidth = document.querySelector('.activity-bar')?.clientWidth || 48
    const defaultWidth = (windowWidth - activityBarWidth - sidebarWidth) * 0.6
    onResize(defaultWidth)
  }

  return (
    <div 
      className="group flex h-full w-2 flex-shrink-0 cursor-col-resize items-center justify-center bg-transparent transition-colors hover:bg-blue-500/10"
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      title="拖拽调整宽度，双击恢复默认"
    >
      <div className="h-10 w-0.5 rounded-sm bg-border transition-all group-hover:h-15 group-hover:bg-blue-500 group-active:bg-blue-600"></div>
    </div>
  )
}
