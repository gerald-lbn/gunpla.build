import Logo from '~/components/logo'
import { type ReactNode } from 'react'
import { LogOut } from 'lucide-react'
import { Form } from '@adonisjs/inertia/react'
import FlashToasts from '~/components/flash_toasts'
import ThemeToggle from '~/components/theme_toggle'
import { Button } from '~/components/ui/button'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-4">
          <Logo size={26} />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Form route="oauth.logout">
              <Button type="submit" variant="ghost" size="sm">
                <LogOut />
                <span>Log out</span>
              </Button>
            </Form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>

      <FlashToasts />
    </div>
  )
}
