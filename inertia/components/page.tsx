import React, { type ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import { ChevronLeft } from 'lucide-react'
import { Link } from '@adonisjs/inertia/react'

export default function Page({
  title,
  hideTitle = false,
  description,
  actions,
  back,
  children,
}: {
  title: string
  hideTitle?: boolean
  description?: ReactNode
  actions?: ReactNode
  back?: {
    route: Extract<React.ComponentProps<typeof Link>, { route: unknown }>['route']
    label: string
  }
  children?: ReactNode
}) {
  const hasHeader = !hideTitle || description || actions

  return (
    <div>
      <Head title={title} />
      {back && (
        <Link
          route={back.route}
          className="mb-4 flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          {back.label}
        </Link>
      )}
      {hasHeader && (
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            {!hideTitle && <h1 className="text-xl font-semibold tracking-tight">{title}</h1>}
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </div>
  )
}
