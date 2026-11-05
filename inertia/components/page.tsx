import React, { type ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import { ChevronLeft } from 'lucide-react'
import { Link } from '@adonisjs/inertia/react'

/**
 * The title row every screen opens with: a noun as the h1, one sentence about
 * the data under it, and only real actions on the right.
 */
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
          className="-ml-1 mb-3 inline-flex h-8 items-center gap-1 rounded-[2px] pr-2.5 pl-1 text-sm text-muted-foreground transition-colors hover:bg-hover hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          {back.label}
        </Link>
      )}
      {hasHeader && (
        <PageHeader
          title={hideTitle ? undefined : title}
          description={description}
          actions={actions}
        />
      )}
      {children}
    </div>
  )
}

export function PageHeader({
  title,
  description,
  actions,
  id,
}: {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  id?: string
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {title && (
          <h1 id={id} className="text-2xl leading-8 font-semibold tracking-[-0.01em]">
            {title}
          </h1>
        )}
        {description && (
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}
