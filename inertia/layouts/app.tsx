import { useState } from 'react'
import Logo from '~/components/logo'
import { type ReactNode } from 'react'
import { LogOut, Menu, X } from 'lucide-react'
import { Form } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import FlashToasts from '~/components/flash_toasts'
import ThemeToggle from '~/components/theme_toggle'
import { Button } from '~/components/ui/button'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'

function UserAvatar({ did }: { did: string }) {
  const initials = did.replace('did:', '').slice(0, 2).toUpperCase()
  return (
    <Avatar>
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const { props } = usePage()
  const user = props.user as { did: string } | undefined
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 h-14 border-b-2 border-black bg-background">
        <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4">
          <Logo size={26} />

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            {user && <UserAvatar did={user.did} />}
            <Form route="oauth.logout">
              <Button type="submit" variant="outline" size="sm">
                <LogOut />
                Log out
              </Button>
            </Form>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {user && <UserAvatar did={user.did} />}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu />
            </Button>
          </div>
        </div>
      </header>

      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <aside className="fixed top-0 right-0 z-50 flex h-full w-72 flex-col border-l-2 border-black bg-background shadow-[-4px_0_0_0_black]">
            <div className="flex items-center justify-between border-b-2 border-black px-4 py-3">
              <Logo size={22} />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Close menu"
                onClick={() => setDrawerOpen(false)}
              >
                <X />
              </Button>
            </div>

            <div className="flex flex-1 flex-col gap-2 p-4">
              {user && (
                <div className="flex items-center gap-3 border-2 border-black bg-muted px-3 py-2">
                  <UserAvatar did={user.did} />
                  <span className="font-head text-sm font-bold truncate">{user.did}</span>
                </div>
              )}
              <ThemeToggle />
              <Form route="oauth.logout">
                <Button type="submit" variant="outline" size="sm" className="w-full justify-start">
                  <LogOut />
                  Log out
                </Button>
              </Form>
            </div>
          </aside>
        </>
      )}

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>

      <FlashToasts />
    </div>
  )
}
