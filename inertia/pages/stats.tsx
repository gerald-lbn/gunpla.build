import { useMemo } from 'react'
import { cn } from 'cn'
import BaseLayout from '~/layouts/base'
import { Head, usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { PageHeader } from '~/components/page'
import { Chart } from '~/components/chart'
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

const MONTH = new Intl.DateTimeFormat('en-GB', { month: 'short' })
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
  const inWindow = months.reduce((sum, m) => sum + m.count, 0)
  const before = totalKits - inWindow
  const running = useMemo(
    () =>
      months.map((_, i) => before + months.slice(0, i + 1).reduce((sum, m) => sum + m.count, 0)),
    [months, before]
  )
  const thisMonth = months.at(-1)!
  const busiest = months.reduce((a, b) => (b.count > a.count ? b : a), months[0])

  const labels = months.map((m) =>
    m.date.getMonth() === 0 ? String(m.date.getFullYear()) : MONTH.format(m.date)
  )

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
  const otherGrades = gradeBreakdown.slice(6)
  const otherGradeKits = otherGrades.reduce((sum, g) => sum + g.count, 0)
  const ungraded = totalKits - gradeBreakdown.reduce((sum, g) => sum + g.count, 0)

  return (
    <div className="column pt-8">
      <Head title="Community stats" />
      <PageHeader
        title="Community stats"
        description={
          busiest.count > 0
            ? `Everything gunpla.build has indexed from builders' repositories. The busiest month of the last twelve was ${MONTH_YEAR.format(busiest.date)}, with ${plural(busiest.count, 'kit')} logged.`
            : "Everything gunpla.build has indexed from builders' repositories. Nothing was logged in the last twelve months."
        }
      />

      {/* One container split into equal columns: 4 x 277.5 + 3 x 14 = 1152 */}
      <dl className="grid grid-cols-2 overflow-hidden cut-lg bg-card lg:grid-cols-4">
        {kpis.map((k, i) => (
          <div
            key={k.label}
            className={cn(
              'min-w-0 p-5',
              i % 2 === 1 && 'border-l border-rule',
              i >= 2 && 'border-t border-rule lg:border-t-0',
              i === 2 && 'lg:border-l'
            )}
          >
            <dt className="text-sm text-muted-foreground">{k.label}</dt>
            <dd className="mt-1 text-[28px] leading-9 font-medium num">
              {k.value.toLocaleString('en')}
            </dd>
            <dd className="mt-1 text-xs text-muted-foreground num">{k.note}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-[14px] grid gap-[14px] lg:grid-cols-2">
        <Panel
          id="per-month"
          title="Kits logged per month"
          meta={`${plural(inWindow, 'kit')} in 12 months`}
        >
          <Chart
            className="mt-4"
            label={`Kits logged per month over the last twelve months: ${months.map((m, i) => `${labels[i]} ${m.count}`).join(', ')}`}
            deps={[months]}
            draw={(el, charts) =>
              charts.bars(el, {
                labels,
                values: months.map((m) => m.count),
                height: 200,
              })
            }
          />
        </Panel>
        <Panel id="running" title="Kits on the shared shelf" meta="Running total, end of month">
          <Chart
            className="mt-4"
            label={`Running total of kits at the end of each month, reaching ${totalKits}`}
            deps={[running]}
            draw={(el, charts) =>
              charts.line(el, {
                labels,
                series: [{ name: 'Kits', values: running, colour: 'var(--chart-2)' }],
                height: 200,
                step: true,
                endLabel: true,
              })
            }
          />
        </Panel>
      </div>

      <div className="mt-[14px] grid gap-[14px] lg:grid-cols-2">
        <Panel
          id="grades"
          title="Kits by grade"
          meta={`${plural(gradeBreakdown.length, 'grade')} recorded`}
        >
          {grades.length === 0 ? (
            <EmptyLine>No kit has a grade recorded yet.</EmptyLine>
          ) : (
            <>
              <Chart
                className="mt-4 text-sm"
                label={`Kits by grade: ${grades.map((g) => `${g.grade} ${g.count}`).join(', ')}`}
                deps={[grades]}
                draw={(el, charts) =>
                  charts.barList(
                    el,
                    grades.map((g) => ({ label: g.grade, value: g.count })),
                    { thin: true, colour: 'var(--vfin)' }
                  )
                }
              />
              {(otherGrades.length > 0 || ungraded > 0) && (
                <p className="mt-4 text-xs text-muted-foreground num">
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
              className="inline-flex h-8 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Filter finished builds by builder in Explore
            </Link>
          }
        >
          {topBuilders.length === 0 ? (
            <EmptyLine>No builder has logged a kit yet.</EmptyLine>
          ) : (
            <ol className="mt-2 -mx-2">
              {topBuilders.map(({ handle, count }, i) => (
                <li key={handle}>
                  <Link
                    route="profile"
                    routeParams={[handle]}
                    className="flex h-11 items-center gap-3 rounded-lg px-2 transition-colors hover:bg-hover"
                  >
                    <span className="w-5 text-right text-xs text-faint num">{i + 1}.</span>
                    <span className="min-w-0 flex-1 truncate text-sm">@{handle}</span>
                    <span className="text-sm num">
                      {count}
                      <span className="ml-1 text-xs text-muted-foreground">
                        {count === 1 ? 'kit' : 'kits'}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </Panel>
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
    <section aria-labelledby={`${id}-heading`} className="flex min-w-0 flex-col cut-lg bg-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 id={`${id}-heading`} className="text-base font-medium">
          {title}
        </h2>
        {meta && <span className="text-sm text-muted-foreground num">{meta}</span>}
      </div>
      {children}
      {footer && <div className="mt-auto pt-4">{footer}</div>}
    </section>
  )
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 rounded-lg border border-dashed border-control px-3 py-2.5 text-sm text-muted-foreground">
      {children}
    </p>
  )
}
