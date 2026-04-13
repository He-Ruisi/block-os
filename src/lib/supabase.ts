import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// 检查是否配置了有效的 Supabase URL
const isValidUrl = supabaseUrl && supabaseUrl.startsWith('http')

if (!isValidUrl) {
  console.warn('[Supabase] 未配置或配置无效，云同步功能将不可用。应用将以本地模式运行。')
}

// 如果没有有效配置，使用占位符避免初始化错误（功能将不可用）
export const supabase = isValidUrl 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key')

export const isSupabaseEnabled = isValidUrl
