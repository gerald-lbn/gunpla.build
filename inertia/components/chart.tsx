import { useEffect, useRef } from 'react'
import { cn } from 'cn'
import '~/lib/charts.js'
import type { ChartsApi } from '~/lib/charts.js'

/**
 * Mounts one charts.js drawing. The helper owns the SVG inside the element and
 * redraws itself on resize and once fonts load; React only hands it the data.
 */
export function Chart({
  draw,
  deps,
  className,
  label,
}: {
  draw: (el: HTMLElement, charts: ChartsApi) => void
  deps: unknown[]
  className?: string
  label: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    draw(ref.current, window.Charts)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return <div ref={ref} className={cn('w-full text-xs', className)} aria-label={label} />
}
