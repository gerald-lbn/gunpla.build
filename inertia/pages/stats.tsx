import BaseLayout from '~/layouts/base'
import { usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import type { InertiaProps } from '~/types'
import { Package, Users, Camera, Heart, Calendar } from 'lucide-react'

type PageProps = InertiaProps<{
  totalKits: number
  totalBuilders: number
  totalPhotos: number
  totalLikes: number
  recentActivity: { month: string; count: number }[]
  gradeBreakdown: { grade: string; count: number }[]
  topBuilders: { handle: string; count: number }[]
}>

export default function Stats() {
  const { totalKits, totalBuilders, totalPhotos, totalLikes, gradeBreakdown, topBuilders } =
    usePage<PageProps>().props

  const metrics = [
    {
      label: 'Kits',
      icon: Package,
      value: totalKits.toLocaleString(),
      badge: { positive: true, text: 'all time' },
      subtext: 'kits logged',
    },
    {
      label: 'Builders',
      icon: Users,
      value: totalBuilders.toLocaleString(),
      badge: { positive: true, text: 'all time' },
      subtext: 'registered',
    },
    {
      label: 'Photos',
      icon: Camera,
      value: totalPhotos.toLocaleString(),
      badge: { positive: true, text: 'all time' },
      subtext: 'uploaded',
    },
    {
      label: 'Likes',
      icon: Heart,
      value: (totalLikes ?? 0).toLocaleString(),
      badge: { positive: true, text: 'all time' },
      subtext: 'received',
    },
  ]

  const maxGrade = gradeBreakdown[0]?.count ?? 1

  return (
    <section aria-labelledby="stats-heading" className="bg-background py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {/* Heading */}
        <div className="mb-10 max-w-2xl">
          <h1 className="mb-3 font-head text-3xl font-semibold lg:text-5xl" id="stats-heading">
            Gunpla stats
          </h1>
          <p className="font-sans text-base text-muted-foreground lg:text-lg">
            Global statistics for the gunpla.build community
          </p>
        </div>

        {/* Key metrics row */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-head text-xl font-medium">Key metrics</h2>
        </div>

        {/* 4 KPI cards */}
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map(({ label, icon: Icon, value, badge, subtext }) => (
            <div
              key={label}
              className="flex w-full flex-col rounded border-2 border-border bg-card p-6 shadow-md transition-[translate,box-shadow] duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <dt className="flex items-center justify-between gap-2 font-head text-lg font-medium">
                {label}
                <span className="flex size-9 shrink-0 items-center justify-center rounded border-2 border-border bg-primary text-primary-foreground shadow-xs">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
              </dt>
              <dd className="mt-4">
                <p className="font-head text-4xl font-black leading-none">{value}</p>
                <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <span
                    className={[
                      'inline-flex items-center gap-1 rounded border-2 border-border px-1.5 py-0.5 font-head font-bold',
                      badge.positive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-destructive text-destructive-foreground',
                    ].join(' ')}
                  >
                    {badge.text}
                  </span>
                  <span className="text-muted-foreground">{subtext}</span>
                </p>
              </dd>
            </div>
          ))}
        </dl>

        {/* Bottom grid */}
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-5">
          {/* Kits by grade — col-span-3 */}
          <div className="inline-block w-full rounded border-2 border-border bg-card shadow-md transition-all hover:shadow-none lg:col-span-3">
            <div className="flex flex-row items-center justify-between gap-3 p-4">
              <h3 className="mb-0 font-head text-2xl font-medium">Kits by grade</h3>
              <span className="inline-flex items-center gap-2 rounded bg-foreground px-2 py-1 text-xs font-semibold text-background">
                <Calendar className="size-4" aria-hidden="true" />
                All time
              </span>
            </div>
            <div className="space-y-6 p-4">
              {gradeBreakdown.map(({ grade, count }) => {
                const pct = Math.round((count / maxGrade) * 100)
                return (
                  <div key={grade}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="font-head text-lg font-medium">{grade}</p>
                      <span className="inline-flex items-center rounded bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground outline-2">
                        {count.toLocaleString()}
                      </span>
                    </div>
                    <div className="relative flex h-4 w-full items-center overflow-hidden rounded border-2 bg-muted">
                      <div
                        className="size-full flex-1 bg-primary transition-all"
                        style={{ transform: `translateX(-${100 - pct}%)` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top builders — col-span-2 */}
          <div className="inline-block w-full rounded border-2 border-border bg-card shadow-md transition-all hover:shadow-none lg:col-span-2">
            <div className="flex flex-row items-center justify-between gap-3 p-4">
              <h3 className="mb-0 font-head text-2xl font-medium">Top builders</h3>
              <span className="inline-flex items-center gap-2 rounded bg-foreground px-2 py-1 text-xs font-semibold text-background">
                <Calendar className="size-4" aria-hidden="true" />
                All time
              </span>
            </div>
            <div className="p-4">
              <ol className="space-y-4">
                {topBuilders.map(({ handle, count }, i) => (
                  <li
                    key={handle}
                    className={[
                      'flex items-center justify-between gap-3 pb-3',
                      i < topBuilders.length - 1 ? 'border-b-2 border-border' : '',
                    ].join(' ')}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="inline-flex size-5 shrink-0 items-center justify-center bg-foreground text-sm text-background"
                      >
                        {i + 1}
                      </span>
                      <Link
                        route="profile"
                        routeParams={[handle]}
                        className="truncate font-mono text-sm hover:underline"
                      >
                        @{handle.split('.')[0]}
                      </Link>
                    </span>
                    <span className="inline-flex shrink-0 items-center rounded bg-foreground px-2 py-1 text-xs font-semibold text-background">
                      {count} kits
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

Stats.layout = [BaseLayout]
