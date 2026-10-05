import { useMemo } from 'react'
import type { InferData } from '@adonisjs/http-transformers/types'
import type KitTransformer from '#kits/transformers/kit_transformer'

type KitRow = InferData<KitTransformer>

interface ActivityTickerProps {
  kits: KitRow[]
}

export function ActivityTicker({ kits }: ActivityTickerProps) {
  const items = useMemo(() => {
    const base = kits.slice(0, 15).map((kit) => {
      const handleStr = kit.handle ? `@${kit.handle}` : 'Builder'
      const statusAction =
        kit.status === 'done' ? 'completed' : kit.status === 'in-progress' ? 'building' : 'logged'
      const gradeStr = kit.grade ? `[${kit.grade}] ` : ''
      return `${handleStr} ${statusAction} ${gradeStr}${kit.name}`
    })

    const result = [...base]
    while (result.length < 6) result.push(...base)
    return result
  }, [kits])

  return (
    <div className="relative z-10 mb-4 overflow-hidden py-5 sm:mb-6 sm:py-6 lg:mb-8 lg:py-8">
      <div className="-mx-[10%] relative w-[120%] origin-center -rotate-2 border-y-[3px] border-border bg-foreground text-background shadow-[0_4px_0_0_var(--border)]">
        <div className="hero-marquee flex w-max py-2.5 will-change-transform [contain:layout_style] sm:py-3">
          <TickerList items={items} />
          <TickerList items={items} aria-hidden />
        </div>
      </div>
    </div>
  )
}

function TickerList({ items, 'aria-hidden': ariaHidden }: { items: string[]; 'aria-hidden'?: true }) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={ariaHidden}>
      {items.map((item, idx) => (
        <li
          key={idx}
          className="flex items-center gap-3 bg-foreground px-4 sm:gap-3.5 sm:px-5"
        >
          <span className="inline-flex size-5 shrink-0 items-center justify-center border-2 border-background bg-primary font-head text-[0.6rem] font-bold text-primary-foreground shadow-[2px_2px_0_0_var(--background)]">
            ★
          </span>
          <span className="font-head text-xs font-bold tracking-[0.14em] text-background sm:text-sm">
            {item}
          </span>
        </li>
      ))}
    </ul>
  )
}
