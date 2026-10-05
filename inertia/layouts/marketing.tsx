import Logo from '~/components/logo'
import { type ReactNode } from 'react'
import { usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import FlashToasts from '~/components/flash_toasts'
import ThemeToggle from '~/components/theme_toggle'
import { Button } from '~/components/ui/button'

export default function MarketingLayout({ children }: { children: ReactNode }) {
  const { props } = usePage()
  return (
    <>
      <header className="sticky top-0 z-40 border-b-2 border-black bg-background">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Logo size={28} />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {props.user ? (
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
      <FlashToasts />
    </>
  )
}
