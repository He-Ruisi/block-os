import { useState, useEffect } from 'react'

export interface ViewportState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  width: number
  height: number
  orientation: 'portrait' | 'landscape'
}

/**
 * 视口状态检测 Hook
 * 用于响应式布局和设备适配
 */
export function useViewport(): ViewportState {
  const [viewport, setViewport] = useState<ViewportState>(() => {
    const width = window.innerWidth
    const height = window.innerHeight
    return {
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1280,
      isDesktop: width >= 1280,
      width,
      height,
      orientation: width > height ? 'landscape' : 'portrait',
    }
  })

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setViewport({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1280,
        isDesktop: width >= 1280,
        width,
        height,
        orientation: width > height ? 'landscape' : 'portrait',
      })
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  return viewport
}
