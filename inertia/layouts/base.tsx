import { useEffect, useState, type ReactNode } from 'react'
import { cn } from 'cn'
import { usePage } from '@inertiajs/react'
import { Form, Link } from '@adonisjs/inertia/react'
import { LogOut, Menu, Plus, User, X } from 'lucide-react'
import { urlFor } from '~/client'
import { Wordmark } from '~/components/logo'
import FlashToasts from '~/components/flash_toasts'
import ThemeToggle from '~/components/theme_toggle'
import { Button } from '~/components/ui/button'
import { SiteFooter } from '~/components/site_footer'
import { UserSearchDialog } from '~/components/user_search_dialog'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Dialog, DialogContent, DialogTitle, DialogClose } from '~/components/ui/dialog'

const NAV = [
  { label: 'Latest builds', route: 'home', exact: true },
  { label: 'Explore', route: 'explore', exact: false },
  { label: 'Stats', route: 'stats', exact: false },
] as const

function useIsActive() {
  const { url } = usePage()
  const path = url.split('?')[0]
  return (route: (typeof NAV)[number]['route'], exact: boolean) => {
    const href = urlFor(route)
    return exact ? path === href : path === href || path.startsWith(`${href}/`)
  }
}

export default function BaseLayout({ children }: { children: ReactNode }) {
  const { props } = usePage()
  const isSignedIn = Boolean(props.user)
  const isActive = useIsActive()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="flex min-h-svh flex-col">
      <header
        className={cn(
          'sticky top-0 z-40 bg-background transition-[box-shadow] duration-150',
          scrolled && 'shadow-[0_1px_0_0_var(--rule)]'
        )}
      >
        <div className="column flex h-12 items-center gap-6">
          <Wordmark />

          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = isActive(item.route, item.exact)
              return (
                <Link
                  key={item.route}
                  route={item.route}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'inline-flex h-8 items-center rounded-[2px] px-3 text-sm font-medium transition-colors',
                    active ? 'text-foreground' : 'text-nav-idle hover:text-foreground'
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <UserSearchDialog className="hidden lg:flex" />
            <UserSearchDialog trigger="icon" className="lg:hidden" />
            <ThemeToggle variant="ghost" size="icon" className="hidden md:inline-flex" />
            <div className="hidden md:block">{isSignedIn ? <AccountMenu /> : <SignInLink />}</div>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="size-5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
      <SiteFooter />
      <FlashToasts />

      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent
          showCloseButton={false}
          className="top-0 left-0 h-svh max-w-none translate-x-0 translate-y-0 gap-0 rounded-none p-0 ring-0 sm:max-w-none"
        >
          <DialogTitle className="sr-only">Menu</DialogTitle>
          <div className="column flex h-12 items-center justify-between">
            <Wordmark />
            <DialogClose asChild>
              <Button variant="ghost" size="icon" aria-label="Close menu">
                <X className="size-5" aria-hidden="true" />
              </Button>
            </DialogClose>
          </div>
          <nav aria-label="Main" className="column flex flex-col gap-1 pt-4">
            {NAV.map((item) => (
              <Link
                key={item.route}
                route={item.route}
                onClick={() => setMenuOpen(false)}
                aria-current={isActive(item.route, item.exact) ? 'page' : undefined}
                className="flex h-12 items-center text-xl font-medium text-muted-foreground aria-[current=page]:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="column mt-auto flex flex-col gap-2 pb-8">
            {isSignedIn ? (
              <>
                <Button
                  size="lg"
                  render={<Link route="kits.create" onClick={() => setMenuOpen(false)} />}
                >
                  <Plus aria-hidden="true" />
                  Log a kit
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  render={<Link route="shelf" onClick={() => setMenuOpen(false)} />}
                >
                  My shelf
                </Button>
                <Form route="oauth.logout" className="contents">
                  {({ processing }) => (
                    <Button type="submit" variant="ghost" size="lg" disabled={processing}>
                      {processing ? 'Signing out…' : 'Sign out'}
                    </Button>
                  )}
                </Form>
              </>
            ) : (
              <Button size="lg" render={<Link route="login" onClick={() => setMenuOpen(false)} />}>
                Sign in with Bluesky
              </Button>
            )}
            <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
              Appearance
              <ThemeToggle variant="secondary" size="icon" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SignInLink() {
  return (
    <Button variant="secondary" render={<Link route="login" />}>
      Sign in
    </Button>
  )
}

function AccountMenu() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary" aria-label="Account">
          <User aria-hidden="true" />
          My shelf
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 gap-0 p-1.5">
        <Link
          route="shelf"
          className="flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm hover:bg-hover"
        >
          <User className="size-4 text-muted-foreground" aria-hidden="true" />
          Open my shelf
        </Link>
        <Link
          route="kits.create"
          className="flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm hover:bg-hover"
        >
          <Plus className="size-4 text-muted-foreground" aria-hidden="true" />
          Log a kit
        </Link>
        <div className="my-1 h-px bg-rule" />
        <Form route="oauth.logout">
          {({ processing }) => (
            <button
              type="submit"
              disabled={processing}
              className="flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-sm text-muted-foreground hover:bg-hover hover:text-foreground"
            >
              <LogOut className="size-4" aria-hidden="true" />
              {processing ? 'Signing out…' : 'Sign out'}
            </button>
          )}
        </Form>
      </PopoverContent>
    </Popover>
  )
}
