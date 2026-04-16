import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onClose: () => void
}

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // 等待动画完成
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  }

  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white'
  }

  return (
    <div 
      className={`fixed top-5 right-5 z-[10000] flex min-w-[200px] max-w-[400px] items-center gap-2.5 rounded-lg px-5 py-3 text-sm font-medium shadow-lg transition-all duration-300 ${
        typeStyles[type]
      } ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'
      }`}
    >
      <span className="text-lg font-bold">{icons[type]}</span>
      <span className="flex-1">{message}</span>
    </div>
  )
}
