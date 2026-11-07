import { useMemo } from 'react'
import { cn } from 'cn'
import BaseLayout from '~/layouts/base'
import { rise } from '~/hooks/use_rise'
import { Head, usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { PageHeader } from '~/components/page'
import { plural } from '~/lib/kits'
import type { InertiaProps } from '~/types'

type PageProps = InertiaProps<{
  totalKits: number
  totalBuilders: number
  totalPhotos: number
  totalLikes: number
  recentActivity: { month: string; count: number }[]
  gradeBreakdown: { grade: string; count: number }[]
  topBuilders: { handle: string; count: number }[]
}>

const MONTH_YEAR = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' })

/** The last 12 calendar months ending this month, with months nobody logged in kept at zero. */
function lastTwelveMonths(activity: { month: string; count: number }[]) {
  const byMonth = new Map(activity.map((a) => [a.month, a.count]))
  const now = new Date()
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return { key, date: d, count: byMonth.get(key) ?? 0 }
  })
}

const KPI_TONES = [
  'bg-vfin text-on-colour',
  'bg-fed-blue text-on-colour',
  'bg-foreground text-background',
  'bg-shield text-on-colour',
]

const oneDecimal = (n: number) =>
  n.toLocaleString('en', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

export default function Stats() {
  const {
    totalKits,
    totalBuilders,
    totalPhotos,
    totalLikes,
    recentActivity,
    gradeBreakdown,
    topBuilders,
  } = usePage<PageProps>().props

  const months = useMemo(() => lastTwelveMonths(recentActivity), [recentActivity])
  const thisMonth = months.at(-1)!

  const perKit = (n: number) => (totalKits > 0 ? oneDecimal(n / totalKits) : '—')

  const kpis = [
    {
      label: 'Kits logged',
      value: totalKits,
      note: `${plural(thisMonth.count, 'kit')} in ${MONTH_YEAR.format(thisMonth.date)}`,
    },
    {
      label: 'Builders',
      value: totalBuilders,
      note:
        totalBuilders > 0
          ? `${oneDecimal(totalKits / totalBuilders)} kits each on average`
          : 'No shelf indexed yet',
    },
    { label: 'Photos', value: totalPhotos, note: `${perKit(totalPhotos)} per kit` },
    {
      label: 'Likes',
      value: totalLikes,
      note: totalLikes > 0 ? `${perKit(totalLikes)} per kit` : 'No build has been liked yet',
    },
  ]

  const grades = gradeBreakdown.slice(0, 6)
  const topGrade = Math.max(1, ...grades.map((g) => g.count))
  const otherGrades = gradeBreakdown.slice(6)
  const otherGradeKits = otherGrades.reduce((sum, g) => sum + g.count, 0)
  const ungraded = totalKits - gradeBreakdown.reduce((sum, g) => sum + g.count, 0)

  return (
    <div>
      <Head title="Community stats" />
      <div className="column pt-12 md:pt-16">
        <PageHeader title="Community stats" />
      </div>

      <div className="column">
        <dl className="grid grid-cols-2 gap-x-2 gap-y-8 lg:grid-cols-4 lg:gap-y-2">
          {kpis.map((k, i) => (
            <div
              key={k.label}
              {...rise(i)}
              className={cn(
                'flex min-w-0 flex-col justify-between gap-10 rounded-[28px] p-5 md:p-6',
                KPI_TONES[i]
              )}
            >
              <dd className="display num text-head">{k.value.toLocaleString('en')}</dd>
              <div>
                <dt className="text-[17px] font-bold">{k.label}</dt>
                <dd className="num mt-1 text-[15px]">{k.note}</dd>
              </div>
            </div>
          ))}
        </dl>

        <div className="mt-2 grid gap-2 lg:grid-cols-2">
          <Panel
            id="grades"
            title="Kits by grade"
            meta={`${plural(gradeBreakdown.length, 'grade')} recorded`}
          >
            {grades.length === 0 ? (
              <EmptyLine>No kit has a grade recorded yet.</EmptyLine>
            ) : (
              <>
                <ol className="mt-4 flex flex-col gap-3 text-[15px]">
                  {grades.map((g) => (
                    <li
                      key={g.grade}
                      style={{ ['--share' as string]: `${(g.count / topGrade) * 100}%` }}
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="font-semibold">{g.grade}</span>
                        <span className="num">{g.count}</span>
                      </div>
                      <div
                        aria-hidden="true"
                        className="mt-1.5 h-3 overflow-hidden rounded-full bg-raised"
                      >
                        <div className="h-full w-(--share) rounded-full bg-fed-blue" />
                      </div>
                    </li>
                  ))}
                </ol>
                {(otherGrades.length > 0 || ungraded > 0) && (
                  <p className="num mt-4 text-[15px]">
                    {[
                      otherGrades.length > 0 &&
                        `${plural(otherGradeKits, 'kit')} across ${plural(otherGrades.length, 'other grade')}`,
                      ungraded > 0 && `${plural(ungraded, 'kit')} with no grade`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}
              </>
            )}
          </Panel>

          <Panel
            id="builders"
            title="Biggest shelves"
            meta="Kits logged"
            footer={
              <Link
                route="explore"
                className="inline-flex h-10 items-center text-[15px] font-semibold underline underline-offset-4 hover:no-underline"
              >
                Filter finished builds by builder in Explore
              </Link>
            }
          >
            {topBuilders.length === 0 ? (
              <EmptyLine>No builder has logged a kit yet.</EmptyLine>
            ) : (
              <ol className="-mx-2 mt-2">
                {topBuilders.map(({ handle, count }, i) => (
                  <li key={handle}>
                    <Link
                      route="profile"
                      routeParams={[handle]}
                      className="flex h-12 items-center gap-3 rounded-full px-3 transition-colors hover:bg-hover"
                    >
                      <span className="sr-only">{i + 1}.</span>
                      <span className="min-w-0 flex-1 truncate text-[17px] font-semibold">
                        @{handle}
                      </span>
                      <span className="num text-[17px]">
                        {count}
                        <span className="ml-1">{count === 1 ? 'kit' : 'kits'}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}

Stats.layout = [BaseLayout]

function Panel({
  id,
  title,
  meta,
  footer,
  children,
}: {
  id: string
  title: string
  meta?: string
  footer?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section
      aria-labelledby={`${id}-heading`}
      {...rise(0)}
      className="flex min-w-0 flex-col rounded-[28px] bg-surface p-5 md:p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 id={`${id}-heading`} className="text-lead font-bold">
          {title}
        </h2>
        {meta && <span className="num text-[15px]">{meta}</span>}
      </div>
      {children}
      {footer && <div className="mt-auto pt-4">{footer}</div>}
    </section>
  )
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 rounded-[16px] bg-raised px-4 py-3 text-[15px]">{children}</p>
}
