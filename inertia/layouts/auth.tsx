import Logo from '~/components/logo'
import { type ReactNode } from 'react'
import FlashToasts from '~/components/flash_toasts'
import ThemeToggle from '~/components/theme_toggle'
import { Link } from '@adonisjs/inertia/react'
import { Button } from '~/components/ui/button'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <nav aria-label="Main" className="border-b-2 border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            route="home"
            className="inline-flex items-center gap-2.5 rounded font-head text-2xl font-bold tracking-tight text-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Logo size={28} />
            <span>gunpla.build</span>
          </Link>

          <ul className="hidden items-center gap-8 md:flex">
            <li>
              <Link
                route="home"
                className="rounded font-head font-medium text-sm text-foreground decoration-primary decoration-2 underline-offset-4 transition-colors duration-200 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Explore
              </Link>
            </li>
            <li>
              <a
                href="/#stats"
                className="rounded font-head font-medium text-sm text-foreground decoration-primary decoration-2 underline-offset-4 transition-colors duration-200 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Stats
              </a>
            </li>
            <li>
              <a
                href="/#about"
                className="rounded font-head font-medium text-sm text-foreground decoration-primary decoration-2 underline-offset-4 transition-colors duration-200 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                About
              </a>
            </li>
          </ul>

          <div className="flex items-center gap-3">
            <ThemeToggle variant="outline" size="icon" />
            <Button
              variant="outline"
              size="default"
              render={<Link route="home" />}
              className="font-head font-medium text-sm"
            >
              Back to home
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">{children}</main>

      <FlashToasts />
    </div>
  )
}
