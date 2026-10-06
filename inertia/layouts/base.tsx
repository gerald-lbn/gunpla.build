import Logo from '~/components/logo'
import { type ReactNode } from 'react'
import { usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import FlashToasts from '~/components/flash_toasts'
import ThemeToggle from '~/components/theme_toggle'
import { Button } from '~/components/ui/button'
import { SiteFooter } from '~/components/site_footer'
import { UserSearchDialog } from '~/components/user_search_dialog'

export default function BaseLayout({ children }: { children: ReactNode }) {
  const { props } = usePage()
  const isSignedIn = Boolean(props.user)

  return (
    <>
      <header className="sticky top-0 z-40 border-b-2 border-border bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="inline-flex items-center gap-2.5">
            <Logo size={26} />
            <span className="hidden font-head text-base font-bold tracking-tight sm:inline">
              gunpla.build
            </span>
          </div>

          <div className="hidden items-center gap-1 sm:flex">
            <Button variant="ghost" size="sm" render={<Link route="stats" />}>
              Stats
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <UserSearchDialog />
            <ThemeToggle variant="outline" />
            {isSignedIn ? (
              <Button size="sm" render={<Link route="shelf" />}>
                My shelf
              </Button>
            ) : (
              <Button size="sm" render={<Link route="login" />}>
                Sign in
              </Button>
            )}
          </div>
        </div>
      </header>
      {children}
      <SiteFooter />
      <FlashToasts />
    </>
  )
}
