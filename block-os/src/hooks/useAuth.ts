import { useState, useEffect, useCallback } from 'react'
import {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  onAuthStateChange,
  type AuthUser,
} from '../services/authService'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 初始化：检查当前登录状态
  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))

    // 监听认证状态变化
    const { data: { subscription } } = onAuthStateChange(setUser)
    return () => subscription.unsubscribe()
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
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    isAuthenticated: !!user,
  }
}
