import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            BlockOS
          </CardTitle>
          <CardDescription className="text-base">
            写作优先的知识操作系统
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs value={isLogin ? 'login' : 'signup'} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="login"
                onClick={() => { setIsLogin(true); setLocalError(null) }}
              >
                登录
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                onClick={() => { setIsLogin(false); setLocalError(null) }}
              >
                注册
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                type="text"
                placeholder="输入用户名"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="输入密码"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认密码</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="再次输入密码"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            {displayError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{displayError}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className={cn(
                'w-full bg-gradient-to-r from-purple-600 to-blue-600',
                'hover:from-purple-700 hover:to-blue-700'
              )}
              disabled={loading}
            >
              {isPullingData ? '正在同步云端数据...' : loading ? '处理中...' : isLogin ? '登录' : '注册'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {isLogin ? (
              <>
                还没有账号？
                <Button
                  variant="link"
                  className="p-0 h-auto font-normal"
                  onClick={() => { setIsLogin(false); setLocalError(null) }}
                >
                  立即注册
                </Button>
              </>
            ) : (
              <>
                已有账号？
                <Button
                  variant="link"
                  className="p-0 h-auto font-normal"
                  onClick={() => { setIsLogin(true); setLocalError(null) }}
                >
                  去登录
                </Button>
              </>
            )}
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
