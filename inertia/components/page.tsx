import React, { type ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import { ChevronLeft } from 'lucide-react'
import { Link } from '@adonisjs/inertia/react'

/**
 * The title every screen opens with: a noun as the h1 in the display face, one sentence
 * about the data under it at the lead size, and only real actions on the right.
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
          className="mb-6 inline-flex h-10 items-center gap-1 rounded-full bg-surface pr-4 pl-2.5 text-[15px] font-semibold transition-colors hover:bg-hover"
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
    <header className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {title && (
          <h1 id={id} className="display text-head">
            {title}
          </h1>
        )}
        {description && <p className="mt-5 max-w-[50ch] text-lead/snug">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}
