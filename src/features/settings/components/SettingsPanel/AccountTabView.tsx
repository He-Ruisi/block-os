import { LogOut, ShieldCheck, UserRound, Fingerprint } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface AccountTabViewProps {
  username: string
  userId: string
  onSignOut: () => void
}

export function AccountTabView({ username, userId, onSignOut }: AccountTabViewProps) {
  return (
    <div className="space-y-6">
      <div className="surface-featured rounded-[calc(var(--border-radius-lg)+2px)]">
        <Card className="border-0 bg-card">
          <CardHeader className="gap-4">
            <div className="section-label">
              <span className="section-label__dot" />
              <span className="section-label__text">Account Profile</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--accent-secondary)))] text-primary-foreground shadow-[var(--shadow-accent)]">
                <UserRound className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl">Identity</CardTitle>
                <CardDescription className="max-w-xl">
                  Your primary account identity for syncing, plugin access, and project ownership.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-secondary/50 p-4">
              <div className="mb-3 flex items-center gap-2 text-primary">
                <ShieldCheck className="h-4 w-4" />
                <span className="font-mono text-[11px] uppercase tracking-[0.14em]">Username</span>
              </div>
              <div className="text-lg font-semibold tracking-[-0.01em] text-foreground">
                {username}
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-secondary/50 p-4">
              <div className="mb-3 flex items-center gap-2 text-primary">
                <Fingerprint className="h-4 w-4" />
                <span className="font-mono text-[11px] uppercase tracking-[0.14em]">User ID</span>
              </div>
              <code className="block break-all rounded-xl bg-background px-3 py-2 text-xs leading-6 text-foreground shadow-[var(--shadow-sm)]">
                {userId}
              </code>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="surface-inverted overflow-hidden rounded-[1.75rem]">
        <div className="relative space-y-5 px-6 py-6">
          <div className="section-label border-white/15 bg-white/5">
            <span className="section-label__dot" />
            <span className="section-label__text text-white">Security Actions</span>
          </div>

          <div className="space-y-2">
            <h3 className="font-[var(--font-display)] text-2xl text-white">Danger Zone</h3>
            <p className="max-w-2xl text-sm leading-6 text-white/72">
              Sign out of the current session on this device. Local content stays intact, but syncing and authenticated actions will pause until you sign in again.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Current session</div>
              <div className="text-sm text-white/65">Authenticated as {username}</div>
            </div>

            <Button
              variant="destructive"
              className="sm:min-w-[12rem]"
              onClick={onSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
