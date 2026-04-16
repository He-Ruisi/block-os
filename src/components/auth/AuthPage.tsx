import { useState } from 'react'
import type { FormEvent } from 'react'
import '../../styles/components/AuthPage.css'

interface AuthPageProps {
  onSignIn: (username: string, password: string) => Promise<void>
  onSignUp: (username: string, password: string) => Promise<void>
  loading: boolean
  error: string | null
  isPullingData?: boolean
}

export function AuthPage({ onSignIn, onSignUp, loading, error, isPullingData }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!username.trim()) {
      setLocalError('请输入用户名')
      return
    }
    if (username.trim().length < 3) {
      setLocalError('用户名至少 3 个字符')
      return
    }
    if (password.length < 6) {
      setLocalError('密码至少 6 个字符')
      return
    }

    if (!isLogin) {
      if (password !== confirmPassword) {
        setLocalError('两次密码不一致')
        return
      }
    }

    try {
      if (isLogin) {
        await onSignIn(username.trim(), password)
      } else {
        await onSignUp(username.trim(), password)
      }
    } catch {
      // error 已经由 useAuth 处理
    }
  }

  const displayError = localError || error

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-logo">BlockOS</h1>
          <p className="auth-subtitle">写作优先的知识操作系统</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setLocalError(null) }}
          >
            登录
          </button>
          <button
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setLocalError(null) }}
          >
            注册
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">用户名</label>
            <input
              type="text"
              className="auth-input"
              placeholder="输入用户名"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">密码</label>
            <input
              type="password"
              className="auth-input"
              placeholder="输入密码"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {!isLogin && (
            <div className="auth-field">
              <label className="auth-label">确认密码</label>
              <input
                type="password"
                className="auth-input"
                placeholder="再次输入密码"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          {displayError && (
            <div className="auth-error">{displayError}</div>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {isPullingData ? '正在同步云端数据...' : loading ? '处理中...' : isLogin ? '登录' : '注册'}
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? (
            <p>还没有账号？<button className="auth-link" onClick={() => setIsLogin(false)}>立即注册</button></p>
          ) : (
            <p>已有账号？<button className="auth-link" onClick={() => setIsLogin(true)}>去登录</button></p>
          )}
        </div>
      </div>
    </div>
  )
}
