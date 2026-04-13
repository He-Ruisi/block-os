import { supabase, isSupabaseEnabled } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  username: string
}

// 用户名转为伪邮箱（Supabase 要求邮箱格式，我们用 username@blockos.local）
function usernameToEmail(username: string): string {
  return `${username.toLowerCase()}@blockos.local`
}

// 注册（用户名 + 密码）
export async function signUp(username: string, password: string): Promise<AuthUser> {
  if (!isSupabaseEnabled) {
    throw new Error('云同步功能未启用，请配置 Supabase 或使用本地模式')
  }
  
  const email = usernameToEmail(username)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username }, // 存储用户名到 user_metadata
    },
  })

  if (error) {
    // 已存在的用户
    if (error.message.includes('already registered')) {
      throw new Error('用户名已存在')
    }
    throw new Error(error.message)
  }

  if (!data.user) {
    throw new Error('注册失败')
  }

  return {
    id: data.user.id,
    username,
  }
}

// 登录（用户名 + 密码）
export async function signIn(username: string, password: string): Promise<AuthUser> {
  if (!isSupabaseEnabled) {
    throw new Error('云同步功能未启用，请配置 Supabase 或使用本地模式')
  }
  
  const email = usernameToEmail(username)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      throw new Error('用户名或密码错误')
    }
    throw new Error(error.message)
  }

  if (!data.user) {
    throw new Error('登录失败')
  }

  return {
    id: data.user.id,
    username: data.user.user_metadata?.username || username,
  }
}

// 登出
export async function signOut(): Promise<void> {
  if (!isSupabaseEnabled) return
  
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}

// 获取当前用户
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!isSupabaseEnabled) return null
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  return {
    id: user.id,
    username: user.user_metadata?.username || user.email?.split('@')[0] || 'unknown',
  }
}

// 获取当前 session
export async function getSession(): Promise<Session | null> {
  if (!isSupabaseEnabled) return null
  
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// 监听认证状态变化
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  if (!isSupabaseEnabled) {
    // 返回一个空的取消订阅函数
    return { data: { subscription: { unsubscribe: () => {} } } }
  }
  
  return supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'unknown',
      })
    } else {
      callback(null)
    }
  })
}
