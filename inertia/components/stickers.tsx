import type React from 'react'
import { cn } from 'cn'
import { statusLabel } from '~/lib/kits'

/** The sticker each status wears, in the runner colours: black text on every one. */
export const STATUS_STICKER: Record<string, string> = {
  'done': 'bg-vfin',
  'in-progress': 'bg-fed-blue',
  'backlog': 'bg-runner',
  'on-hold': 'bg-runner',
  'dropped': 'bg-shield',
}

/**
 * One status sticker per kit, as it comes off the sheet: a finished build is V-fin yellow, a
 * kit on the bench Federation blue, a sealed or paused kit grey runner, a dropped kit red.
 */
export function StatusBadge({
  status,
  className,
  style,
}: {
  status: string
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <span
      className={cn(
        'sticker flex-none text-on-colour',
        STATUS_STICKER[status] ?? 'bg-runner',
        className
      )}
      style={style}
    >
      {statusLabel(status)}
    </span>
  )
}

/** The grade and scale stickers, the way the grade plate sits on the box art. */
export function SpecStickers({
  grade,
  scale,
  className,
}: {
  grade?: string | null
  scale?: string | null
  className?: string
}) {
  if (!grade && !scale) return null
  return (
    <span className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {grade && <span className="sticker bg-[#0b0b0c] text-white">{grade}</span>}
      {scale && <span className="sticker num bg-white text-on-colour">{scale}</span>}
    </span>
  )
}
