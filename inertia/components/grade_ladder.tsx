import { cn } from 'cn'
import { GRADE_LADDER, normalizeGrade, plural } from '~/lib/kits'

type LadderKit = { grade: string | null; status: string }

/**
 * The grade ladder: every Gunpla grade from Entry to Perfect as one strip. A grade
 * lights up in V-fin yellow once a kit of that grade is built; kits still on the
 * shelf show as a grey count. Grades outside the main line (Hi-Resolution, RE/100…)
 * are folded into the sentence under the strip rather than given empty cells.
 */
export function GradeLadder({ kits, className }: { kits: LadderKit[]; className?: string }) {
  const cells = GRADE_LADDER.map(({ code, name }) => {
    const ofGrade = kits.filter((k) => normalizeGrade(k.grade) === code)
    return {
      code,
      name,
      built: ofGrade.filter((k) => k.status === 'done').length,
      total: ofGrade.length,
    }
  })

  const ladderCodes = new Set<string>(GRADE_LADDER.map((g) => g.code))
  const otherBuilt = new Set(
    kits
      .filter((k) => k.status === 'done')
      .map((k) => normalizeGrade(k.grade))
      .filter((g): g is string => Boolean(g && !ladderCodes.has(g)))
  )
  const builtGrades = cells.filter((c) => c.built > 0).length + otherBuilt.size

  return (
    <section aria-labelledby="ladder-heading" className={cn('cut-lg bg-card p-5', className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="ladder-heading" className="text-base font-medium">
          Grade ladder
        </h2>
        <p className="text-sm text-muted-foreground">
          {builtGrades === 0
            ? 'No grade built yet. A grade lights up with its first finished kit.'
            : `${plural(builtGrades, 'grade')} built${
                builtGrades < 6 ? ` · ${6 - builtGrades} more for The Infinity Gauntlet` : ''
              }`}
        </p>
      </div>

      <ol className="mt-4 grid grid-cols-4 gap-px overflow-hidden rounded-lg bg-rule sm:grid-cols-8">
        {cells.map((cell) => {
          const lit = cell.built > 0
          return (
            <li
              key={cell.code}
              className="flex min-w-0 flex-col justify-between gap-3 bg-card px-3 pt-3 pb-0"
              title={`${cell.name}: ${cell.built} built of ${cell.total} logged`}
            >
              <div className="min-w-0">
                <p
                  className={cn(
                    'text-lg leading-6 font-semibold',
                    lit ? 'text-vfin-ink' : cell.total > 0 ? 'text-foreground' : 'text-faint'
                  )}
                >
                  {cell.code}
                </p>
                <p className="truncate text-xs text-muted-foreground num">
                  {cell.total === 0
                    ? '—'
                    : cell.built === cell.total
                      ? `${cell.built} built`
                      : `${cell.built} of ${cell.total} built`}
                </p>
              </div>
              <span
                aria-hidden="true"
                className={cn(
                  '-mx-3 block h-1',
                  lit ? 'bg-vfin' : cell.total > 0 ? 'bg-control' : 'bg-transparent'
                )}
              />
            </li>
          )
        })}
      </ol>

      {otherBuilt.size > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          Also built outside the main line: {[...otherBuilt].join(', ')}
        </p>
      )}
    </section>
  )
}
