import { useRef, useCallback } from 'react'

export interface LongPressHandlers {
  onMouseDown: (e: React.MouseEvent) => void
  onMouseUp: () => void
  onMouseLeave: () => void
  onTouchStart: (e: React.TouchEvent) => void
  onTouchEnd: () => void
  onTouchMove: (e: React.TouchEvent) => void
}

export interface LongPressOptions {
  onLongPress: () => void
  onClick?: () => void
  delay?: number
  moveThreshold?: number
}

/**
 * 长按检测 Hook
 * 用于替代右键菜单，提供触摸友好的上下文菜单
 */
export function useLongPress(options: LongPressOptions): LongPressHandlers {
  const { onLongPress, onClick, delay = 500, moveThreshold = 10 } = options

  const timerRef = useRef<number>()
  const startPosRef = useRef<{ x: number; y: number } | null>(null)
  const isLongPressRef = useRef(false)

  const start = useCallback((x: number, y: number) => {
    startPosRef.current = { x, y }
    isLongPressRef.current = false

    timerRef.current = window.setTimeout(() => {
      isLongPressRef.current = true
      onLongPress()
    }, delay)
  }, [onLongPress, delay])

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = undefined
    }

    // 如果不是长按，且有 onClick 回调，则触发点击
    if (!isLongPressRef.current && onClick) {
      onClick()
    }

    startPosRef.current = null
    isLongPressRef.current = false
  }, [onClick])

  const checkMove = useCallback((x: number, y: number) => {
    if (!startPosRef.current) return

    const deltaX = Math.abs(x - startPosRef.current.x)
    const deltaY = Math.abs(y - startPosRef.current.y)

    // 如果移动距离超过阈值，取消长按
    if (deltaX > moveThreshold || deltaY > moveThreshold) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = undefined
      }
    }
  }, [moveThreshold])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    // 只响应左键
    if (e.button !== 0) return
    start(e.clientX, e.clientY)
  }, [start])

  const onMouseUp = useCallback(() => {
    cancel()
  }, [cancel])

  const onMouseLeave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = undefined
    }
    startPosRef.current = null
  }, [])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    start(touch.clientX, touch.clientY)
  }, [start])

  const onTouchEnd = useCallback(() => {
    cancel()
  }, [cancel])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    checkMove(touch.clientX, touch.clientY)
  }, [checkMove])

  return {
    onMouseDown,
    onMouseUp,
    onMouseLeave,
    onTouchStart,
    onTouchEnd,
    onTouchMove,
  }
}
