import { useState, useCallback } from 'react'

export interface SwipeGestureHandlers {
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: () => void
}

export interface SwipeGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  minSwipeDistance?: number
  preventScroll?: boolean
}

/**
 * 滑动手势检测 Hook
 * 用于侧边栏、面板等组件的滑动开关
 */
export function useSwipeGesture(options: SwipeGestureOptions): SwipeGestureHandlers {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    minSwipeDistance = 50,
    preventScroll = false,
  } = options

  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    })
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    })

    // 可选：阻止滚动（用于全屏滑动手势）
    if (preventScroll && touchStart) {
      const deltaX = Math.abs(e.targetTouches[0].clientX - touchStart.x)
      const deltaY = Math.abs(e.targetTouches[0].clientY - touchStart.y)
      
      // 如果水平滑动距离大于垂直滑动，阻止默认滚动
      if (deltaX > deltaY) {
        e.preventDefault()
      }
    }
  }, [touchStart, preventScroll])

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return

    const deltaX = touchStart.x - touchEnd.x
    const deltaY = touchStart.y - touchEnd.y
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    // 判断是水平滑动还是垂直滑动
    if (absDeltaX > absDeltaY) {
      // 水平滑动
      if (absDeltaX > minSwipeDistance) {
        if (deltaX > 0 && onSwipeLeft) {
          onSwipeLeft()
        } else if (deltaX < 0 && onSwipeRight) {
          onSwipeRight()
        }
      }
    } else {
      // 垂直滑动
      if (absDeltaY > minSwipeDistance) {
        if (deltaY > 0 && onSwipeUp) {
          onSwipeUp()
        } else if (deltaY < 0 && onSwipeDown) {
          onSwipeDown()
        }
      }
    }

    // 重置状态
    setTouchStart(null)
    setTouchEnd(null)
  }, [touchStart, touchEnd, minSwipeDistance, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown])

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  }
}
