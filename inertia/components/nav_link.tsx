import { cn } from 'cn'
import { urlFor } from '~/client'
import { usePage } from '@inertiajs/react'
import { type LucideIcon } from 'lucide-react'
import { type ReactNode } from 'react'
import { Link } from '@adonisjs/inertia/react'

export type NavRoute = Parameters<typeof urlFor>[0]

export type NavItem = {
  label: string
  route: NavRoute
  icon?: LucideIcon
}

export default function NavLink({
  route,
  exact = false,
  className,
  children,
}: {
  route: NavRoute
  exact?: boolean
  className?: string
  children: ReactNode
}) {
  const { url } = usePage()
  const href = urlFor(route)
  const path = url.split('?')[0]
  const isActive = exact ? path === href : path === href || path.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
        isActive
          ? 'border-foreground text-foreground'
          : 'border-transparent text-muted-foreground hover:text-foreground',
        className
      )}
    >
      {children}
    </Link>
  )
}
