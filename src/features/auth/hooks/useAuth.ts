import { useState, useEffect, useCallback } from 'react'
import {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  onAuthStateChange,
  type AuthUser,
} from '../services/authService'
import { autoSyncService } from '@/services/integration/autoSyncService'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPullingData, setIsPullingData] = useState(false)

  // 初始化：检查当前登录状态
  useEffect(() => {
    getCurrentUser()
      .then(currentUser => {
        setUser(currentUser)
        // 如果已登录，启动自动同步
        if (currentUser) {
          autoSyncService.startAutoSync(currentUser.id)
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))

    // 监听认证状态变化
    const { data: { subscription } } = onAuthStateChange(authUser => {
      setUser(authUser)
      // 认证状态变化时，启动或停止自动同步
      if (authUser) {
        autoSyncService.startAutoSync(authUser.id)
      } else {
        autoSyncService.stopAutoSync()
      }
    })
    return () => {
      subscription.unsubscribe()
      autoSyncService.stopAutoSync()
    }
  }, [])

  const handleSignUp = useCallback(async (username: string, password: string) => {
    setError(null)
    setLoading(true)
    try {
      const newUser = await signUp(username, password)
      setUser(newUser)
    } catch (e) {
      const msg = e instanceof Error ? e.message : '注册失败'
      setError(msg)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSignIn = useCallback(async (username: string, password: string) => {
    setError(null)
    setLoading(true)
    try {
      const loggedInUser = await signIn(username, password)
      setUser(loggedInUser)
      
      // 登录成功后，从云端拉取数据
      setIsPullingData(true)
      try {
        const result = await autoSyncService.pullFromCloud(loggedInUser.id)
        console.log('[Auth] 云端数据拉取完成:', result)
      } catch (pullError) {
        console.error('[Auth] 云端数据拉取失败:', pullError)
        // 拉取失败不影响登录，继续使用本地数据
      } finally {
        setIsPullingData(false)
      }
      
      // 启动自动同步
      autoSyncService.startAutoSync(loggedInUser.id)
    } catch (e) {
      const msg = e instanceof Error ? e.message : '登录失败'
      setError(msg)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSignOut = useCallback(async () => {
    setError(null)
    try {
      // 停止自动同步
      autoSyncService.stopAutoSync()
      
      await signOut()
      setUser(null)
    } catch (e) {
      const msg = e instanceof Error ? e.message : '登出失败'
      setError(msg)
    }
  }, [])

  return {
    user,
    loading,
    error,
    isPullingData,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    isAuthenticated: !!user,
  }
}
